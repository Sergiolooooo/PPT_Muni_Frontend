document.addEventListener("DOMContentLoaded", function () {
    const categoriaSelect = document.getElementById("addCategoria");

    // Llamar a la API para obtener las categorías
    fetch("http://localhost:3000/api/categoriaComercio/")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Recorrer las categorías y agregarlas como opciones en el select
                data.data.forEach(categoria => {
                    let option = document.createElement("option");
                    option.value = categoria.id_categoria; // Enviar el ID
                    option.textContent = categoria.nombre_categoria; // Mostrar el nombre
                    categoriaSelect.appendChild(option);
                });
            } else {
                console.error("Error al obtener categorías");
            }
        })
        .catch(error => console.error("Error en la petición:", error));
});
