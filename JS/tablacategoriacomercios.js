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

// Inicializar DataTable
const initDataTable = async () => {
    if (dataTableIsInitialized) dataTable.destroy();
    await listCategoriasComercios();
    dataTable = $("#datatable_users").DataTable(dataTableOptions);
    dataTableIsInitialized = true;
};

document.addEventListener("DOMContentLoaded", initDataTable);



// Manejar eventos de botones (editar/eliminar)
document.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const categoriaId = btn.getAttribute("data-id");

    if (btn.classList.contains("btn-edit")) {
        await loadCategoriaData(categoriaId);
    } else if (btn.classList.contains("btn-delete")) {
        console.log("Botón Eliminar clickeado, ID de la categoría:", categoriaId);
        await confirmDelete(categoriaId);
    }
});

// Cargar datos en el modal de edición de categoría
const loadCategoriaData = async (categoriaId) => {
    try {
        console.log("Ejecutando loadCategoriaData con ID:", categoriaId);
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${categoriaId}`);
        const result = await response.json();

        console.log("Respuesta del backend:", result);
        if (!result.success || !result.data || result.data.length === 0) throw new Error("No se encontraron datos para esta categoría.");

        const categoria = result.data[0];

        // Asignar valores al formulario de manera explícita
        document.getElementById("editId").value = categoria.id_categoria;
        document.getElementById("editCategoria").value = categoria.nombre_categoria;

        // Mostrar el modal para editar 
        new bootstrap.Modal(document.getElementById("Categoria_edit")).show();

    } catch (error) {
        console.error("Error al cargar datos de la categoría:", error);
    }
};

// Manejar la edición de categoría (submit del formulario)
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

        if (!response.ok) throw new Error("Error actualizando categoría");

        alert("Categoría actualizada con éxito!");
        document.querySelector("#Categoria_edit .btn-close").click();
        initDataTable();  // Actualiza la tabla si es necesario
    } catch (error) {
        console.error("Error actualizando categoría:", error);
    }
});







const confirmDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
        const response = await fetch(`http://localhost:3000/api/categoriascomercios/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error eliminando categoría");
        alert("✅ " + result.message);
        initDataTable();
    } catch (error) {
        console.error("Error eliminando categoría:", error);
        alert("❌ " + error.message);
    }
};

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
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("❌ Error al obtener los datos");
    }
};

document.getElementById("addForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const datos = { nombre_categoria: document.getElementById("addCategoria").value.trim() };
    try {
        const response = await fetch("http://localhost:3000/api/categoriascomercios/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        const result = await response.json();
        if (result.success) {
            alert("✅ Categoría agregada con éxito!");
            initDataTable();
        } else {
            alert("❌ " + (result.error || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al agregar categoría:", error);
        alert("❌ Error al agregar categoría.");
    }
});
