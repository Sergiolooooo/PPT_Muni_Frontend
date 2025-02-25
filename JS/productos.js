let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3] },
        { orderable: false, targets: [4] },
        { searchable: true, targets: [1, 2] },
        { width: "50%", targets: [1, 2] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ningún producto encontrado",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ningún producto encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listProductos();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

// Cargar la tabla al iniciar
document.addEventListener("DOMContentLoaded", () => {
    initDataTable();
});

document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const productoId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadProductoData(productoId);
    } else if (btn.classList.contains("btn-delete")) {
        await confirmDelete(productoId);
    }
});


const loadProductoData = async (productoId) => {
    try {
        console.log("Ejecutando loadProductoData con ID:", productoId);

        // Obtener los datos del producto
        const response = await fetch(`http://localhost:3000/api/productos/${productoId}`);
        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para este producto.");
        
        const producto = result.data[0];

        console.log("Producto recibido:", producto); // Verificar los datos en la consola

        // Obtener los comercios disponibles
        const catResponse = await fetch("http://localhost:3000/api/comercios/");
        const catResult = await catResponse.json();
        if (!catResult.success) throw new Error("Error obteniendo comercios");

        console.log("Lista de comercios:", catResult.data); // Verificar datos de los comercios

        // Referencia al select de comercios
        const comercioSelect = document.getElementById("editIdComercio");
        comercioSelect.innerHTML = ""; // Limpiar opciones previas



        // Agregar opciones con los comercios existentes
        catResult.data.forEach(comercio => {
            let option = document.createElement("option");
            option.value = comercio.id_comercio;
            option.textContent = comercio.nombre_comercio;

            // Verificar si el comercio del producto coincide con este comercio
            if (producto.id_comercio && comercio.id_comercio === producto.id_comercio) {
                option.selected = true; // Seleccionar el comercio actual del producto
                console.log("Comercio seleccionado:", comercio.nombre_comercio);
            }

            comercioSelect.appendChild(option);
        });

        // Asignar valores al formulario
        document.getElementById("editId").value = producto.id_producto;
        document.getElementById("editProducto").value = producto.nombre_producto;
        document.getElementById("editDescripcion").value = producto.descripcion_producto;
        document.getElementById("editPrecio").value = producto.precio;

        // Verificar si el modal existe antes de abrirlo
        const modalElement = document.getElementById("Producto_edit");
        if (!modalElement) throw new Error("El modal 'Producto_edit' no existe en el DOM.");

        console.log("Abriendo el modal...");

        // Mostrar el modal de edición
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();

    } catch (error) {
        console.error("Error al cargar datos del producto:", error);
    }
};

// Manejar la edición (submit del formulario) para producto
document.getElementById("producto_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const productoActualizado = {
        id_producto: parseInt(document.getElementById("editId").value, 10),
        nombre_producto: document.getElementById("editProducto").value.trim(),
        descripcion_producto: document.getElementById("editDescripcion").value.trim(),
        precio: parseFloat(document.getElementById("editPrecio").value.trim()), // Convertir precio a número flotante
        id_comercio: parseInt(document.getElementById("editIdComercio").value, 10)
    };

    try {
        // Realizar la actualización del producto a través de la API
        const response = await fetch(`http://localhost:3000/api/productos/${productoActualizado.id_producto}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) {
            // Si la respuesta no es exitosa, lanzar un error
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar el producto.");
        }

        alert("Producto actualizado con éxito!");

        // Cerrar el modal
        const modalElement = document.getElementById("Producto_edit");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        // Recargar la tabla de productos
        initDataTable();

    } catch (error) {
        console.error("Error actualizando producto:", error);
        alert(`Error: ${error.message}`);
    }
});








const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
        const response = await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error eliminando producto");
        alert("✅ " + result.message);
        initDataTable();
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("❌ " + error.message);
    }
};


// Post para agregar Producto
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Capturar datos del formulario
        const datos = {
            nombre_producto: document.getElementById("addProducto").value.trim(),
            descripcion_producto: document.getElementById("addDescripcion").value.trim(),
            precio: document.getElementById("addPrecio").value.trim(),
            id_comercio: parseInt(document.getElementById("idComercio").value, 10) // Convertir a entero

        };

        try {
            const response = await fetch("http://localhost:3000/api/productos/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            let result;
            try {
                result = await response.json();
            } catch (error) {
                throw new Error("El servidor no devolvió un JSON válido.");
            }

            if (result.success) {
                alert(result.message);
                form.reset(); // Limpia el formulario
                initDataTable(); // Recarga la tabla para mortrar el nuevo registro
            } else if (result.error) {
                alert("❌ " + result.error);
            } else {
                alert("⚠️ Respuesta inesperada del servidor.");
            }

        } catch (error) {
            console.error("❌ Error al agregar el producto:", error);
            alert("❌ Error desconocido al agregar el producto.");
        }
    });
});


const listProductos = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/productos/");
        const data = await response.json();

        document.getElementById("tableBody_users").innerHTML = data.data.map((producto, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>${producto.nombre_producto}</td>
        <td>${producto.descripcion_producto}</td>
        <td>${producto.precio}</td>
        <td>${producto.comercio || 'No asignado'}</td> <!-- Aquí usamos 'comercio' en lugar de 'id_comercio' -->
        <td>
            <button class="btn btn-sm btn-primary btn-edit" data-id="${producto.id_producto}">
                <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${producto.id_producto}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </td>
    </tr>
`).join("");


    } catch (ex) {
        console.error("Error:", ex);
        alert("Error al obtener los datos");
    }
};
fetch("http://localhost:3000/api/productos/")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error en la API:", error));




// BTN SELECCIONAR COMERCIO
document.addEventListener("DOMContentLoaded", function () {
    const comerciosSelect = document.getElementById("idComercio");

    // Llamar a la API para obtener las categorías
    fetch("http://localhost:3000/api/comercios/")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Recorrer los comercios y agregarlos como opciones en el select
                data.data.forEach(comercio => {
                    let option = document.createElement("option");
                    option.value = comercio.id_comercio; // Enviar el ID
                    option.textContent = comercio.nombre_comercio; // Mostrar el nombre
                    comerciosSelect.appendChild(option);
                });
            } else {
                console.error("Error al obtener comercios");
            }
        })
        .catch(error => console.error("Error en la petición:", error));
});