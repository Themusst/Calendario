import { initDialog } from "./dialog.js";
import { eventTimeToDate } from "./event.js";

const eventDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const eventTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: 'numeric',
  minute: 'numeric'
});

export function initEventDetailsDialog() {
  const dialog = initDialog("event-details");

  const deleteButtonElemenet = dialog.dialogElement.querySelector("[data-event-details-delete-button]");

  const editButtonElement = dialog.dialogElement.querySelector("[data-event-details-edit-button]");

  let currentEvent = null;

  document.addEventListener("event-click", (event) => {
    currentEvent = event.detail.event;
    fillEventDetailsDialog(dialog.dialogElement, event.detail.event);
    dialog.open();
  });

  deleteButtonElemenet.addEventListener("click", () => {
    dialog
      .close()
      .then(() => {
        console.log('dispatching event-delete-request for', currentEvent);
        document.dispatchEvent(new CustomEvent("event-delete-request", {
          detail: {
            event: currentEvent
          },
          bubbles: true
        }));
      });
  });

  editButtonElement.addEventListener("click", () => {
    dialog
      .close()
      .then(() => {
        console.log('dispatching event-edit-request for', currentEvent);
        document.dispatchEvent(new CustomEvent("event-edit-request", {
          detail: {
            event: currentEvent
          },
          bubbles: true
        }));
      });
  });
}

function fillEventDetailsDialog(parent, event) {
  const eventDetailsElement = parent.querySelector("[data-event-details]");
  const eventDetailsTitleElement = eventDetailsElement.querySelector("[data-event-details-title]");
  const eventDetailsDateElement = eventDetailsElement.querySelector("[data-event-details-date]");
  const eventDetailsStartTimeElement = eventDetailsElement.querySelector("[data-event-details-start-time]");
  const eventDetailsEndTimeElement = eventDetailsElement.querySelector("[data-event-details-end-time]");
  const eventDetailsGroupElement = eventDetailsElement.querySelector("[data-event-details-group]");

  eventDetailsTitleElement.textContent = event.title;
  eventDetailsDateElement.textContent = eventDateFormatter.format(event.date);
  eventDetailsStartTimeElement.textContent = eventTimeFormatter.format(
    eventTimeToDate(event, event.startTime)
  );
  eventDetailsEndTimeElement.textContent = eventTimeFormatter.format(
    eventTimeToDate(event, event.endTime)
  );
  
  // Mostrar la descripción si existe
  const eventDetailsDescriptionElement = eventDetailsElement.querySelector("[data-event-details-description]");
  if (event.description) {
    eventDetailsDescriptionElement.textContent = event.description;
    eventDetailsDescriptionElement.style.display = "block";
  } else {
    eventDetailsDescriptionElement.style.display = "none";
  }

  // Mostrar el grupo si existe
  if (event.groupId) {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const group = groups.find(g => g.id === event.groupId);
    if (group) {
      eventDetailsGroupElement.innerHTML = `
        <div class="event-details__group">
          <span class="event-details__group-color" style="background-color: ${group.color}"></span>
          <span class="event-details__group-name">${group.name}</span>
        </div>
      `;
    } else {
      eventDetailsGroupElement.textContent = '';
    }
  } else {
    eventDetailsGroupElement.textContent = '';
  }

  eventDetailsElement.style.setProperty("--event-color", event.color);
}