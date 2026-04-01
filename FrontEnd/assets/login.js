document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");
    const errorMessage = document.querySelector(".error-message");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {

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

                localStorage.setItem("token", data.token);

                window.location.href = "index.html";

            } else {

                errorMessage.textContent =
                    "Erreur dans l'identifiant ou le mot de passe";

            }

        } catch (error) {

            console.error(error);

        }

    });

});