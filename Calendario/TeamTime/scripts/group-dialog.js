import { initDialog } from "./dialog.js";
import { groupStore } from "./group-store.js";
import { showToast } from "./toaster.js";

export function initGroupDialog() {
    const dialog = initDialog("group-dialog");
    const form = document.getElementById("group-form");
    const dialogTitle = dialog.dialogElement.querySelector(".dialog__title");
    const submitButton = form.querySelector("button[type='submit']");
    let editingGroupId = null;

    if (!form) return;

    // Escuchar el evento de edición de grupo
    document.addEventListener("edit-group", (e) => {
        const group = e.detail.group;
        console.log('Editing group:', group); // Debug
        editingGroupId = group.id;
        
        // Actualizar el formulario con los datos del grupo
        const nameInput = form.querySelector("#group-name");
        nameInput.value = group.name;
        
        // Buscar y seleccionar el radio button del color correspondiente
        const colorInputs = form.querySelectorAll('input[name="group-color"]');
        colorInputs.forEach(input => {
            if (input.value === group.color) {
                input.checked = true;
            }
        });
        
        // Actualizar la UI para modo edición
        dialogTitle.textContent = "Editar Grupo";
        submitButton.textContent = "Guardar Cambios";
        
        // Actualizar el botón de editar
        const editButton = dialog.dialogElement.querySelector('[data-dialog-edit-button]');
        if (editButton) {
            editButton.querySelector('.button__text').textContent = "Guardar";
        }
        
        // Abrir el diálogo
        dialog.open();
    });

    // Configurar los botones del diálogo
    const editButton = dialog.dialogElement.querySelector('[data-dialog-edit-button]');
    if (editButton) {
        editButton.addEventListener('click', () => {
            if (editingGroupId) {
                // Ya estamos en modo edición, guardamos los cambios
                form.dispatchEvent(new Event('submit'));
            } else {
                // Mostrar mensaje de que no hay nada para editar
                showToast("No hay grupo seleccionado para editar", "info");
            }
        });
    }

    // Resetear el formulario cuando se cierra
    dialog.dialogElement.addEventListener("close", () => {
        form.reset();
        editingGroupId = null;
        dialogTitle.textContent = "Crear Grupo";
        submitButton.textContent = "Crear";
        
        // Actualizar el texto del botón de editar
        if (editButton) {
            editButton.querySelector('.button__text').textContent = "Editar";
        }
    });

    // Manejar el evento cuando se presiona Escape
    dialog.dialogElement.addEventListener("cancel", (e) => {
        e.preventDefault();
        dialog.close();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = form.querySelector("#group-name").value.trim();
        const colorInput = form.querySelector('input[name="group-color"]');
        const color = colorInput.value;
        
        console.log('Selected color:', color); // Debug

        if (!name) {
            showToast("Por favor ingrese un nombre para el grupo", "error");
            return;
        }

        if (!color) {
            showToast("Por favor seleccione un color para el grupo", "error");
            return;
        }

        // Validar que el color sea un valor hexadecimal válido
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            showToast("Error: Color inválido seleccionado", "error");
            return;
        }

        if (editingGroupId) {
            // Modo edición
            groupStore.updateGroup({
                id: editingGroupId,
                name,
                color
            });
            showToast("Grupo actualizado exitosamente", "success");
        } else {
            // Modo creación
            groupStore.createGroup(name, color);
            showToast("Grupo creado exitosamente", "success");
        }

        dialog.close();
        form.reset();
    });
}