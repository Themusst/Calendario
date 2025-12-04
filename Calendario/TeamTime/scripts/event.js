let eventTemplateElement = null;

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "numeric",
  minute: "numeric"
});

function getTemplate() {
    if (!eventTemplateElement) {
        eventTemplateElement = document.querySelector("[data-template='event']");
        if (!eventTemplateElement) {
            throw new Error("No se encontró la plantilla de evento");
        }
    }
}

export function initStaticEvent(parent, event) {
  const eventElement = initEvent(event);

  if (isEventAllDay(event)) {
    eventElement.classList.add("event--filled");
  }

  parent.appendChild(eventElement);
}

export function initDynamicEvent(parent, event, dynamicStyles) {
  const eventElement = initEvent(event);

  eventElement.classList.add("event--filled");
  eventElement.classList.add("event--dynamic");

  eventElement.style.top = dynamicStyles.top;
  eventElement.style.left = dynamicStyles.left;
  eventElement.style.bottom = dynamicStyles.bottom;
  eventElement.style.right = dynamicStyles.right;

  eventElement.dataset.eventDynamic = true;

  parent.appendChild(eventElement);
}

function initEvent(event) {
  try {
    if (!event) {
      throw new Error('Event is required');
    }

    getTemplate();
    
    const eventContent = eventTemplateElement.content.cloneNode(true);
    const eventElement = eventContent.querySelector("[data-event]");
    const eventTitleElement = eventElement.querySelector("[data-event-title]");
    const eventStartTimeElement = eventElement.querySelector("[data-event-start-time]");
    const eventEndTimeElement = eventElement.querySelector("[data-event-end-time]");

    if (!eventElement || !eventTitleElement || !eventStartTimeElement || !eventEndTimeElement) {
      throw new Error('Required event elements not found in template');
    }

    const startDate = eventTimeToDate(event, event.startTime);
    const endDate = eventTimeToDate(event, event.endTime);

    // Obtener el color del grupo si existe
    let eventColor = event.color;
    if (event.group) {
      try {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const group = groups.find(g => g.id === event.group);
        if (group) {
          eventColor = group.color;
        }
      } catch (error) {
        console.error('Error getting group color:', error);
      }
    }

    eventElement.style.setProperty("--event-color", eventColor);
    eventTitleElement.textContent = event.title || 'Sin título';
    eventStartTimeElement.textContent = dateFormatter.format(startDate);
    eventEndTimeElement.textContent = dateFormatter.format(endDate);

    eventElement.addEventListener("click", (e) => {
      e.stopPropagation();
      eventElement.dispatchEvent(new CustomEvent("event-click", {
        detail: { event },
        bubbles: true
      }));
    });

    return eventElement;
  } catch (error) {
    console.error('Error initializing event:', error);
    return null;
  }
}

export function isEventAllDay(event) {
  return event.startTime === 0 && event.endTime === 1440;
}

export function eventStartsBefore(eventA, eventB) {
  return eventA.startTime < eventB.startTime;
}

export function eventEndsBefore(eventA, eventB) {
  return eventA.endTime < eventB.eventTime;
}

export function eventCollidesWith(eventA, eventB) {
  const maxStartTime = Math.max(eventA.startTime, eventB.startTime);
  const minEndTime = Math.min(eventA.endTime, eventB.endTime);

  return minEndTime > maxStartTime;
}

export function eventTimeToDate(event, eventTime) {
  return new Date(
    event.date.getFullYear(),
    event.date.getMonth(),
    event.date.getDate(),
    0,
    eventTime
  );
}

export function validateEvent(event) {
  if (event.startTime >= event.endTime) {
    return "Event end time must be after start time";
  }

  return null;
}

export function adjustDynamicEventMaxLines(dynamicEventElement) {
  const availableHeight = dynamicEventElement.offsetHeight;
  const lineHeight = 16;
  const padding = 8;
  const maxTitleLines = Math.floor((availableHeight - lineHeight - padding) / lineHeight);

  dynamicEventElement.style.setProperty("--event-title-max-lines", maxTitleLines);
}

export function generateEventId() {
  return Date.now();
}