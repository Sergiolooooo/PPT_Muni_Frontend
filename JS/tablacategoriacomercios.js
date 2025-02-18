let dataTable;
let dataTableIsInitialized = false;

// Opciones de DataTable
const dataTableOptions = {
    lengthMenu: [10, 20, 50, 100, 200],
    columnDefs: [
        { className: "centered", targets: [0, 1, 2] },
        { orderable: false, targets: [2] },
        { searchable: true, targets: [1] },
        { width: "70%", targets: [1] }
    ],
    pageLength: 10,
    destroy: true,
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "Ninguna categoría encontrada",
        info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Ninguna categoría encontrada",
        infoFiltered: "(filtrados desde _MAX_ registros totales)",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: { next: "Siguiente", previous: "Anterior" }
    }
};

// Inicializar la tabla con datos
const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listCategoriasComercios();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

// Cargar la tabla al iniciar
document.addEventListener("DOMContentLoaded", () => {
    initDataTable();
});

// Manejar eventos de botones (editar/eliminar)
document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const id_categoria = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadCategoriaData(id_categoria);
    } else if (btn.classList.contains("btn-delete")) {
        console.log("Botón Eliminar clickeado, ID de la categoría:", id_categoria);
        await confirmDelete(id_categoria);
    }
});





// Cargar datos en el modal de edición
const loadCategoriaData = async (categoriaId) => {
    try {
        console.log("Ejecutando loadCategoriaData con ID:", categoriaId);
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${categoriaId}`);
        const result = await response.json();

        console.log("Respuesta del backend:", result);
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para esta categoria.");

        const categoria = result.data[0];

        // Asignar valores al formulario de manera explícita
        document.getElementById("editId").value = categoria.id_categoria;
        document.getElementById("editCategoria").value = categoria.nombre_categoria;

        // Mostrar el modal para editar
        const modal = new bootstrap.Modal(document.getElementById("Categoria_edit"));
        modal.show();

    } catch (error) {
        console.error("Error al cargar datos de la categoria:", error);
    }
};

// Manejar la edición (submit del formulario)
document.getElementById("categoria_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const categoriaActualizada = {
        id_categoria: document.getElementById("editId").value,
        nombre_categoria: document.getElementById("editCategoria").value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${categoriaActualizada.id_categoria}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoriaActualizada)
        });

        if (!response.ok) throw new Error("Error actualizando categoria");

        alert("Categoria actualizada con éxito!");
        document.querySelector("#Categoria_edit .btn-close").click();
        // Puedes agregar aquí una función para actualizar la vista si es necesario
    } catch (error) {
        console.error("Error actualizando categoria:", error);
    }
});









// Confirmar y eliminar categoría
const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Error eliminando categoría");

        alert("✅ " + result.message);
        window.location.reload(); // 🔄 Recargar la página después de eliminar

    } catch (error) {
        console.error("Error eliminando categoría:", error);
        alert("❌ " + error.message);
    }
};

// Obtener lista de categorías y poblar la tabla
const listCategoriasComercios = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/categoriascomercios/");
        const data = await response.json();

        document.getElementById("tableBody_users").innerHTML = data.data.map((categoria, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${categoria.nombre_categoria}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit" data-id="${categoria.id_categoria}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${categoria.id_categoria}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (ex) {
        console.error("Error:", ex);
        alert("❌ Error al obtener los datos");
    }
};

// Agregar nueva categoría y recargar página
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Capturar datos del formulario
        const datos = {
            nombre_categoria: document.getElementById("addCategoria").value.trim(),
        };

        try {
            const response = await fetch("http://localhost:3000/api/categoriascomercios/", {
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
                alert("✅ Categoría agregada con éxito!");
                window.location.reload(); // 🔄 Recarga la página después de agregar
            } else if (result.error) {
                alert("❌ " + result.error);
            } else {
                alert("⚠️ Respuesta inesperada del servidor.");
            }

        } catch (error) {
            console.error("❌ Error al agregar categoría:", error);
            alert("❌ Error desconocido al agregar categoría.");
        }
    });
});
// Cargar datos desde el modal de edición para categorías de comercios
const loadCategoriaComercioData = async (categoriaId) => {
    try {
        console.log("Ejecutando loadCategoriaComercioData con ID:", categoriaId);

        // Obtener los datos de la categoría
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${categoriaId}`);
        const result = await response.json();
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para esta categoría.");

        const categoria = result.data[0];

        // Asignar valores al formulario
        document.getElementById("editId").value = categoria.id_categoria;
        document.getElementById("editCategoria").value = categoria.nombre_categoria;

        // Mostrar el modal de edición
        new bootstrap.Modal(document.getElementById("Categoria_edit")).show();

    } catch (error) {
        console.error("Error al cargar datos de la categoría:", error);
    }
};


// Manejar la edición (submit del formulario)
document.getElementById("categoria_frm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const categoriaActualizada = {
        id_categoria: parseInt(document.getElementById("editId").value, 10),
        nombre_categoria: document.getElementById("editCategoria").value.trim(),
    };

    try {
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${categoriaActualizada.id_categoria}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoriaActualizada)
        });

        if (!response.ok) throw new Error("Error actualizando categoría");

        alert("✅ Categoría actualizada con éxito!");

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("Categoria_edit"));
        modal.hide();

        // Recargar la tabla de datos
        window.location.reload();
    } catch (error) {
        console.error("Error actualizando categoría:", error);
        alert("❌ No se pudo actualizar la categoría.");
    }
});

// Cargar la tabla al iniciar
window.addEventListener("load", initDataTable);
