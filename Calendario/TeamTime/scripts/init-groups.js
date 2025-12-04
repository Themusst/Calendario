import { groupStore } from "./group-store.js";
import { renderGroupList, updateEventFormGroupSelect } from "./group-utils.js";

export function initGroups() {
  try {
    console.log('Initializing groups...');
    const groupDialog = document.getElementById("group-dialog");
    const addGroupButton = document.querySelector("[data-create-group-button]");
    const form = document.getElementById("group-form");
    
    if (!groupDialog) {
      console.error('Group dialog not found');
    }
    if (!addGroupButton) {
      console.error('Add group button not found');
    }
    if (!form) {
      console.error('Group form not found');
    }

    // Do not create default groups automatically. Groups will be empty until the user creates them.

    // Renderizar lista inicial
    try {
      renderGroupList();
      console.log('Initial group list rendered');
    } catch (error) {
      console.error('Error rendering initial group list:', error);
    }

    // Escuchar cambios en grupos: actualizar lista y el select del formulario de eventos
    document.addEventListener('groups-changed', () => {
      try {
        renderGroupList();
        try { updateEventFormGroupSelect(); } catch (err) { console.error('Error updating event form select on groups-changed:', err); }
        console.log('Group list and event form select updated after change');
      } catch (error) {
        console.error('Error updating group list:', error);
      }
    });

    // Show group dialog when add button is clicked
    if (addGroupButton && groupDialog) {
      addGroupButton.addEventListener("click", () => {
        try {
          groupDialog.showModal();
        } catch (error) {
          console.error('Error showing group dialog:', error);
        }
      });
    }

    // Also listen for custom events dispatched by the <group-list> custom element
    // so the "+ Nuevo Grupo" inside that component also opens the dialog.
    document.addEventListener('create-group-clicked', () => {
      try {
        if (groupDialog) groupDialog.showModal();
      } catch (error) {
        console.error('Error showing group dialog via create-group-clicked:', error);
      }
    });

    // The group form is handled inside group-dialog.js. We still keep a reference to the form for logging above.

    console.log('Groups initialization completed');
  } catch (error) {
    console.error('Error in groups initialization:', error);
  }
}
