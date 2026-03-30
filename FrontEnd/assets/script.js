document.addEventListener("DOMContentLoaded", () => {
    const url = "http://localhost:5678/api/works";
    const gallery = document.querySelector(".gallery");
    const filters = document.querySelector(".filters");

    if (!gallery || !filters) {
        console.error("gallery ou filters introuvable");
        return;
    }

    // fonction pour afficher une liste de travaux
    function renderWorks(list) {
        gallery.innerHTML = ""; // vide la galerie avant affichage
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

    // fonction pour créer les boutons de filtre
    function createFilterButtons(categories, data) {
        filters.innerHTML = ""; // vide les filtres avant création

        // bouton "Tous"
        const allButton = document.createElement("button");
        allButton.textContent = "Tous";
        allButton.addEventListener("click", () => renderWorks(data));
        filters.appendChild(allButton);

        // boutons pour chaque catégorie
        categories.forEach(category => {
            const button = document.createElement("button");
            button.textContent = category;
            button.addEventListener("click", () => {
                const filteredWorks = data.filter(work => work.category.name === category);
                renderWorks(filteredWorks);
            });
            filters.appendChild(button);
        });
    }

    // fetch des travaux depuis le backend
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderWorks(data); // affichage initial de tous les travaux

            // récupération des catégories uniques
            const categories = [...new Set(data.map(work => work.category.name))];

            // création des filtres
            createFilterButtons(categories, data);
        })
        .catch(error => console.error("Erreur :", error));
});