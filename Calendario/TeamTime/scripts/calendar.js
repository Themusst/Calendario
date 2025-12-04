import { initMonthCalendar } from "./month-calendar.js";
import { initWeekCalendar } from "./week-calendar.js";
import { currentDeviceType } from "./responsive.js";
import { getUrlDate, getUrlView } from "./url.js";

export function initCalendar(eventStore) {
  console.log('Initializing calendar...');
  const calendarElement = document.querySelector("[data-calendar]");
  if (!calendarElement) {
    console.error('Calendar element not found: [data-calendar]');
    return;
  }

  if (!eventStore) {
    console.error('Event store not initialized');
    return;
  }

  // Limpiar cualquier contenido previo del calendario
  while (calendarElement.firstChild) {
    calendarElement.removeChild(calendarElement.firstChild);
  }

  // Asegurarse de que el elemento tenga las clases base necesarias
  calendarElement.classList.add('calendar');

  let selectedView = getUrlView() || 'month'; // Default to month view if none specified
  let selectedDate = getUrlDate() || new Date(); // Default to today if no date
  let deviceType = currentDeviceType();
  
  console.log('Calendar initialized with:', {
    view: selectedView,
    date: selectedDate,
    deviceType: deviceType
  });

  function refreshCalendar() {
    const calendarScrollableElement = calendarElement.querySelector("[data-calendar-scrollable]");

    const scrollTop = calendarScrollableElement === null ? 0 : calendarScrollableElement.scrollTop;
      console.log('Refreshing calendar view:', { selectedView, selectedDate });
    calendarElement.replaceChildren();

    if (selectedView === "month") {
        console.log('Initializing month view...');
      initMonthCalendar(calendarElement, selectedDate, eventStore);
    } else if (selectedView === "week") {
        console.log('Initializing week view...');
      initWeekCalendar(calendarElement, selectedDate, eventStore, false, deviceType);
    } else {
        console.log('Initializing day view...');
      initWeekCalendar(calendarElement, selectedDate, eventStore, true, deviceType);
    }

    calendarElement.querySelector("[data-calendar-scrollable]").scrollTo({ top: scrollTop });
  }

  document.addEventListener("view-change", (event) => {
    selectedView = event.detail.view;
    refreshCalendar();
  });

  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    refreshCalendar();
  });

  document.addEventListener("device-type-change", (event) => {
    deviceType = event.detail.deviceType;
    refreshCalendar();
  });

  document.addEventListener("events-change", () => {
    refreshCalendar();
  });

  refreshCalendar();
}