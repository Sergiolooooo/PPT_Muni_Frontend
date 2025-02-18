// Agregar la clase "hovered" al elemento seleccionado en la navegación
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu toggle
let activarmenu = document.querySelector(".toggle"); // Asegúrate de que el botón de menú tenga la clase "toggle"
let navigationn = document.querySelector(".navigation");
let mainn = document.querySelector(".main");

activarmenu.onclick = function () {
  navigationn.classList.toggle("active");
  mainn.classList.toggle("active");
};
