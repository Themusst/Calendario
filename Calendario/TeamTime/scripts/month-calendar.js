import { generateMonthCalendarDays, today, isTheSameDay } from "./date.js";
import { isEventAllDay, eventStartsBefore } from "./event.js";
import { initEventList } from "./event-list.js";

let calendarTemplateElemenent = null;
let calendarDayTemplateElement = null;

const calendarWeekClasses = {
  4: "four-week",
  5: "five-week",
  6: "six-week"
};

function getTemplates() {
  try {
    if (!calendarTemplateElemenent) {
      calendarTemplateElemenent = document.querySelector("[data-template='month-calendar']");
      if (!calendarTemplateElemenent) {
        console.error("Template not found: [data-template='month-calendar']", {
          templates: document.querySelectorAll('template'),
          monthTemplate: document.querySelector("[data-template='month-calendar']"),
          allTemplates: Array.from(document.querySelectorAll('template')).map(t => t.getAttribute('data-template'))
        });
        throw new Error("No se encontró la plantilla del calendario mensual");
      }
      console.log('Month calendar template found');
    }
    if (!calendarDayTemplateElement) {
      calendarDayTemplateElement = document.querySelector("[data-template='month-calendar-day']");
      if (!calendarDayTemplateElement) {
        console.error("Template not found: [data-template='month-calendar-day']", {
          templates: document.querySelectorAll('template'),
          dayTemplate: document.querySelector("[data-template='month-calendar-day']"),
          allTemplates: Array.from(document.querySelectorAll('template')).map(t => t.getAttribute('data-template'))
        });
        throw new Error("No se encontró la plantilla del día del calendario");
      }
      console.log('Month calendar day template found');
    }
    return true;
  } catch (error) {
    console.error('Error cargando plantillas del calendario:', error);
    return false;
  }
}

export function initMonthCalendar(parent, selectedDate, eventStore) {
  try {
    console.log('Initializing month calendar...', { parent, selectedDate });

    if (!getTemplates()) {
      console.error('Failed to load calendar templates');
      return;
    }

    if (!parent) {
      console.error('Parent element is null');
      return;
    }

    // Limpiar el contenedor padre antes de agregar el nuevo calendario
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    const calendarContent = calendarTemplateElemenent.content.cloneNode(true);
    if (!calendarContent) {
      console.error('Failed to clone calendar template');
      return;
    }

    const calendarElement = calendarContent.querySelector("[data-month-calendar]");
    if (!calendarElement) {
      console.error('Calendar element not found in template');
      return;
    }

    const calendarDayListElement = calendarElement.querySelector("[data-month-calendar-day-list]");
    if (!calendarDayListElement) {
      console.error('Calendar day list element not found');
      return;
    }
    
    console.log('Month calendar elements initialized successfully');

    const calendarDays = generateMonthCalendarDays(selectedDate);
    const calendarWeeks = Math.ceil(calendarDays.length / 7);
      console.log('Generated calendar days:', { days: calendarDays.length, weeks: calendarWeeks });

    const calendarWeekClass = calendarWeekClasses[calendarWeeks];
    if (calendarWeekClass) {
      calendarElement.classList.add(calendarWeekClass);
        console.log('Added week class:', calendarWeekClass);
    }

    for (const calendarDay of calendarDays) {
      const events = eventStore.getEventsByDate(calendarDay);
        if (events && events.length > 0) {
          console.log('Found events for day:', { day: calendarDay, eventCount: events.length });
        }
      sortCalendarDayEvents(events);
      initCalendarDay(calendarDayListElement, calendarDay, events);
    }

    parent.appendChild(calendarElement);
      console.log('Month calendar initialized and appended to parent');
  } catch (error) {
    console.error('Error inicializando el calendario mensual:', error);
  }
}

function initCalendarDay(parent, calendarDay, events) {
  try {
    const calendarDayContent = calendarDayTemplateElement.content.cloneNode(true);
    const calendarDayElemenent = calendarDayContent.querySelector("[data-month-calendar-day]");
    const calendarDayLabelElemenent = calendarDayContent.querySelector("[data-month-calendar-day-label]");
    const calendarEventListWrapper = calendarDayElemenent.querySelector("[data-month-calendar-event-list-wrapper]");

    if (isTheSameDay(today(), calendarDay)) {
      calendarDayElemenent.classList.add("month-calendar__day--highlight");
    }

    calendarDayLabelElemenent.textContent = calendarDay.getDate();

    calendarDayLabelElemenent.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("date-change", {
        detail: {
          date: calendarDay
        },
        bubbles: true
      }));

      document.dispatchEvent(new CustomEvent("view-change", {
        detail: {
          view: 'day'
        },
        bubbles: true
      }));
    });

    calendarEventListWrapper.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("event-create-request", {
        detail: {
          date: calendarDay,
          startTime: 600,
          endTime: 960
        },
        bubbles: true
      }));
    });

    initEventList(calendarDayElemenent, events);
    parent.appendChild(calendarDayElemenent);
  } catch (error) {
    console.error('Error inicializando el día del calendario:', error);
  }
}

function sortCalendarDayEvents(events) {
  if (!Array.isArray(events)) return;
  
  events.sort((eventA, eventB) => {
    if (isEventAllDay(eventA)) {
      return -1;
    }

    if (isEventAllDay(eventB)) {
      return 1;
    }

    return eventStartsBefore(eventA, eventB) ? -1 : 1;
  });
}