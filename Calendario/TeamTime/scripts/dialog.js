import { waitUntilAnimationsFinish } from "./animation.js";

export function initDialog(name) {
  const dialogElement = document.querySelector(`[data-dialog=${name}]`);
  // Buscar botones de cerrar solo dentro de este diálogo
  const closeButtonElements = dialogElement.querySelectorAll("[data-dialog-close-button]");

  function close() {
    dialogElement.classList.add("dialog--closing");

    return waitUntilAnimationsFinish(dialogElement)
      .then(() => {
        dialogElement.classList.remove("dialog--closing");
        dialogElement.close();
        // Disparar evento de cierre
        dialogElement.dispatchEvent(new Event('dialog-closed', { bubbles: true }));
      })
      .catch((error) => {
        console.error("Finish dialog animation promise failed", error);
      });
  }

  // Asegurarse de que cada botón de cerrar funcione
  closeButtonElements.forEach(closeButtonElement => {
    closeButtonElement.addEventListener("click", () => {
      close();
    });
  });

  dialogElement.addEventListener("click", (event) => {
    if (event.target === dialogElement) {
      close();
    }
  });

  dialogElement.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  return {
    dialogElement,
    open() {
      // Show the dialog and dispatch events so other modules can react
      dialogElement.showModal();
      try {
        // Custom event for modules listening specifically to dialog show
        dialogElement.dispatchEvent(new Event('show', { bubbles: true }));
      } catch (e) {
        console.warn('Could not dispatch show event on dialog', e);
      }

      try {
        // Dispatch a bubbling custom event named 'dialog-open' from the dialog element
        // so listeners attached to document can inspect e.target (the dialog)
        dialogElement.dispatchEvent(new CustomEvent('dialog-open', { bubbles: true }));
      } catch (e) {
        console.warn('Could not dispatch dialog-open event', e);
      }
    },
    close() {
      return close();
    }
  };
}