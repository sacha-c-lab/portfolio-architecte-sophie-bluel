document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // SÉLECTION DES ÉLÉMENTS DU DOM
    // =========================================================

    const url = "http://localhost:5678/api/works";

    // Galerie et filtres affichés sur la page d'accueil
    const gallery = document.querySelector(".gallery");
    const filters = document.querySelector(".filters");

    // Token JWT récupéré depuis le localStorage (stocké lors de la connexion)
    const token = localStorage.getItem("token");

    // Barre noire "Mode édition" et bouton "Modifier" (masqués par défaut)
    const editBar = document.getElementById("edit-bar");
    const modifierBtn = document.getElementById("edit-button");

    // Lien login/logout dans la navigation
    const navAuthLink = document.getElementById("nav-auth-link");

    // Éléments de la modale principale
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("close-modal");
    const addPhotoBtn = document.getElementById("add-photo-btn");
    const galleryView = document.getElementById("gallery-view");
    const formView = document.getElementById("form-view");
    const backArrow = document.getElementById("back-arrow");
    const modalGallery = document.getElementById("modal-gallery");

    // Éléments du formulaire d'ajout de photo
    const categorySelect = document.getElementById("photo-category");
    const addPhotoForm = document.getElementById("add-photo-form");
    const photoFile = document.getElementById("photo-file");
    const photoTitle = document.getElementById("photo-title");
    const submitPhoto = document.getElementById("submit-photo");
    const fileUploadArea = document.getElementById("file-upload-area");
    const titleError = document.getElementById("title-error");

    // Tableau global contenant tous les travaux récupérés depuis l'API
    let allWorks = [];


    // =========================================================
    // GESTION DE LA CONNEXION / DÉCONNEXION
    // =========================================================

    // Si un token est présent dans le localStorage, l'utilisateur est connecté :
    // on affiche la barre d'édition et le bouton "Modifier"
    // et on remplace le lien "login" par "logout" dans la nav
    if (token) {
        editBar.classList.remove("hidden");
        modifierBtn.classList.remove("hidden");
        filters.classList.add("hidden");
        navAuthLink.textContent = "logout";
        navAuthLink.href = "#";

        // Au clic sur "logout" : suppression du token + rechargement de la page
        navAuthLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.reload();
        });
    }


    // =========================================================
    // GALERIE PRINCIPALE
    // =========================================================

    // Sécurité : on stoppe l'exécution si les éléments nécessaires sont absents
    if (!gallery || !filters) {
        console.error("gallery ou filters introuvable");
        return;
    }

    // Génère et affiche les cartes de la galerie depuis une liste de travaux
    function renderWorks(list) {
        gallery.innerHTML = "";
        list.forEach(work => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;
            const caption = document.createElement("figcaption");
            caption.textContent = work.title;
            figure.appendChild(img);
            figure.appendChild(caption);
            gallery.appendChild(figure);
        });
    }

    // Crée les boutons de filtre par catégorie
    // "Tous" réaffiche l'ensemble, les autres filtrent par nom de catégorie
    function createFilterButtons(categories, data) {
        filters.innerHTML = "";

        const allButton = document.createElement("button");
        allButton.textContent = "Tous";
        allButton.addEventListener("click", () => renderWorks(data));
        filters.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement("button");
            button.textContent = category;
            button.addEventListener("click", () => {
                const filtered = data.filter(work => work.category.name === category);
                renderWorks(filtered);
            });
            filters.appendChild(button);
        });
    }


    // =========================================================
    // MODALE — VUE GALERIE
    // =========================================================

    // Clic sur "Modifier" : ouvre la modale sur la vue galerie (pas le formulaire)
    modifierBtn.addEventListener("click", () => {
        renderModalGallery(allWorks);
        galleryView.classList.remove("hidden");
        formView.classList.add("hidden");
        modal.classList.remove("hidden");
    });

    // Ferme la modale via le bouton croix
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    // Ferme la modale en cliquant sur le fond sombre (en dehors du contenu)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    });

    // Affiche toutes les photos dans la modale avec un bouton poubelle sur chacune
    function renderModalGallery(list) {
        modalGallery.innerHTML = "";
        list.forEach(work => {
            const figure = document.createElement("figure");

            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => deleteWork(work.id));

            figure.appendChild(img);
            figure.appendChild(deleteBtn);
            modalGallery.appendChild(figure);
        });
    }

    // Envoie une requête DELETE à l'API pour supprimer un travail
    // Met à jour les deux galeries (page + modale) après suppression
    async function deleteWork(id) {
        const response = await fetch(url + "/" + id, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 204) {
            allWorks = allWorks.filter(w => w.id !== id);
            renderWorks(allWorks);
            renderModalGallery(allWorks);
        } else {
            console.error("Erreur suppression");
        }
    }


    // =========================================================
    // MODALE — FORMULAIRE D'AJOUT DE PHOTO
    // =========================================================

    // Bouton "Ajouter une photo" : passe de la vue galerie au formulaire
    addPhotoBtn.addEventListener("click", () => {
        galleryView.classList.add("hidden");
        formView.classList.remove("hidden");
    });

    // Flèche retour : revient à la vue galerie sans soumettre le formulaire
    backArrow.addEventListener("click", () => {
        formView.classList.add("hidden");
        galleryView.classList.remove("hidden");
    });

    // Clic sur la zone d'upload → ouvre la fenêtre de sélection de fichier
    fileUploadArea.addEventListener("click", () => photoFile.click());

    // Quand un fichier est sélectionné : affiche une prévisualisation de l'image
    photoFile.addEventListener("change", () => {
        const file = photoFile.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            fileUploadArea.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:4px;">`;
        };
        reader.readAsDataURL(file);
        validateForm();
    });

    // Active le bouton "Valider" uniquement si image + titre + catégorie sont remplis
    // Affiche un message si le titre est vide après avoir été rempli
    function validateForm() {
        const titleEmpty = photoTitle.value.trim() === "";

        // On montre l'erreur seulement si l'utilisateur a commencé à taper puis tout effacé
        if (photoTitle.value.length > 0 && titleEmpty) {
            titleError.classList.remove("hidden");
        } else {
            titleError.classList.add("hidden");
        }

        const isValid = photoFile.files.length > 0 && !titleEmpty && categorySelect.value !== "";
        submitPhoto.disabled = !isValid;
        if (isValid) {
            submitPhoto.classList.add("active");
        } else {
            submitPhoto.classList.remove("active");
        }
    }

    // Revalide le formulaire à chaque saisie dans le titre ou changement de catégorie
    photoTitle.addEventListener("input", validateForm);
    categorySelect.addEventListener("change", validateForm);

    // Soumission du formulaire : envoie image + titre + catégorie à l'API (POST)
    // Si succès : met à jour les deux galeries, remet le formulaire à zéro et
    // revient automatiquement à la vue galerie de la modale
    addPhotoForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", photoFile.files[0]);
        formData.append("title", photoTitle.value);
        formData.append("category", parseInt(categorySelect.value));

        const response = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            const newWork = await response.json();
            allWorks.push(newWork);
            renderWorks(allWorks);
            renderModalGallery(allWorks);

            // Réinitialisation du formulaire et remise à zéro de la zone d'upload
            addPhotoForm.reset();
            fileUploadArea.innerHTML = `
                <i class="fa-regular fa-image"></i>
                <span>+ Ajouter photo</span>
                <span class="file-hint">jpg, png : 4mo max</span>
            `;
            submitPhoto.disabled = true;
            submitPhoto.classList.remove("active");

            formView.classList.add("hidden");
            galleryView.classList.remove("hidden");
        } else {
            console.error("Erreur ajout photo");
        }
    });


    // =========================================================
    // CHARGEMENT INITIAL DES DONNÉES (appels API au démarrage)
    // =========================================================

    // Récupère les catégories disponibles et peuple le <select> du formulaire
    fetch("http://localhost:5678/api/categories")
        .then(res => res.json())
        .then(categories => {
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(err => console.error("Erreur catégories :", err));

    // Récupère tous les travaux, les affiche et génère les boutons de filtre
    // On déduplique les noms de catégories avec Set avant de créer les boutons
    fetch(url)
        .then(res => res.json())
        .then(data => {
            allWorks = data;
            renderWorks(allWorks);
            const categories = [];
            data.forEach(w => {
                if (!categories.includes(w.category.name)) {
                    categories.push(w.category.name);
                }
            });
            createFilterButtons(categories, data);
        })
        .catch(err => console.error("Erreur works :", err));
});
