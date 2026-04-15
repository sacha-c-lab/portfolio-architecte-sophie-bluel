document.addEventListener("DOMContentLoaded", () => {

    // Récupération du formulaire et de la zone d'affichage des erreurs
    const form = document.getElementById("login-form");
    const errorMessage = document.querySelector(".error-message");

    // Écoute la soumission du formulaire
    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Vérification que les deux champs sont remplis avant d'appeler l'API
        if (!email || !password) {
            errorMessage.textContent = "Veuillez remplir tous les champs";
            return;
        }

        try {
            // Envoi des identifiants à l'API pour authentification
            const response = await fetch(
                "http://localhost:5678/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Stockage du token JWT dans le localStorage pour maintenir la session
                localStorage.setItem("token", data.token);

                // Redirection vers la page d'accueil après connexion réussie
                window.location.href = "index.html";

            } else {
                // Affiche un message d'erreur si les identifiants sont incorrects
                errorMessage.textContent =
                    "Erreur dans l'identifiant ou le mot de passe";
            }

        } catch (error) {
            console.error(error);
        }

    });

});
