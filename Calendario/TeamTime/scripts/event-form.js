import { validateEvent, generateEventId } from "./event.js";

export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  
  // Llenar el selector de grupos cuando se abre el formulario
  document.addEventListener('dialog-open', (e) => {
    if (e.target.dataset.dialog === 'event-form') {
      fillGroupSelect(formElement);
    }
  });

  let mode = "create";

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const formEvent = formIntoEvent(formElement);
    const validationError = validateEvent(formEvent);
    if (validationError !== null) {
      toaster.error(validationError);
      return;
    }

    if (mode === "create") {
      formElement.dispatchEvent(new CustomEvent("event-create", {
        detail: {
          event: formEvent
        },
        bubbles: true
      }));
    }

    if (mode === "edit") {
      formElement.dispatchEvent(new CustomEvent("event-edit", {
        detail: {
          event: formEvent
        },
        bubbles: true
      }));
    }
  });

  return {
    formElement,
    switchToCreateMode(date, startTime, endTime) {
      mode = "create";
      fillFormWithDate(formElement, date, startTime, endTime);
    },
    switchToEditMode(event) {
      mode = "edit";
      fillFormWithEvent(formElement, event);
    },
    reset() {
      formElement.querySelector("#id").value = null;
      formElement.reset();
    }
  };
}

function fillFormWithDate(formElement, date, startTime, endTime) {
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");

  dateInputElement.value = date.toISOString().substr(0, 10);
  startTimeSelectElement.value = startTime;
  endTimeSelectElement.value = endTime;
}

function fillFormWithEvent(formElement, event) {
  const idInputElement = formElement.querySelector("#id");
  const titleInputElement = formElement.querySelector("#title");
  const descriptionInputElement = formElement.querySelector("#description");
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");
  const colorInputElement = formElement.querySelector(`[value='${event.color}']`);
  const groupSelectElement = formElement.querySelector("#group");

  // Actualizar el selector de grupos
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  groupSelectElement.innerHTML = '<option value="">Sin grupo</option>';
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = group.name;
    option.style.backgroundColor = group.color;
    groupSelectElement.appendChild(option);
  });

  idInputElement.value = event.id;
  titleInputElement.value = event.title;
  descriptionInputElement.value = event.description || "";
  dateInputElement.value = event.date.toISOString().substr(0, 10);
  startTimeSelectElement.value = event.startTime;
  endTimeSelectElement.value = event.endTime;
  colorInputElement.checked = true;
  groupSelectElement.value = event.groupId || "";
}

function fillGroupSelect(formElement) {
  const groupSelect = formElement.querySelector("#group");
  const groups = JSON.parse(localStorage.getItem('groups') || '[]');
  
  // Mantener la opción "Sin grupo"
  groupSelect.innerHTML = '<option value="">Sin grupo</option>';
  
  // Agregar las opciones de grupos
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = group.name;
    groupSelect.appendChild(option);
  });
}

function formIntoEvent(formElement) {
  const formData = new FormData(formElement);
  const id = formData.get("id");
  const title = formData.get("title");
  const description = formData.get("description");
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const color = formData.get("color");
  const groupId = formData.get("group");

  const event = {
    id: id ? Number.parseInt(id, 10) : generateEventId(),
    title,
    description: description || "",
    date: new Date(date + 'T12:00:00'),
    startTime: Number.parseInt(startTime, 10),
    endTime: Number.parseInt(endTime, 10),
    color,
    groupId: groupId || null
  };

  return event;
}