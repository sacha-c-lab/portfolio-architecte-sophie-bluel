
const url = "http://localhost:5678/api/works";

const gallery = document.querySelector(".gallery");

fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data); 

        data.forEach(work => {

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
    })
    .catch(error => {
        console.error("Erreur :", error);
    });