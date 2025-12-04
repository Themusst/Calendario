import { today } from "./date.js";

export function initUrl() {
  let selectedView = getUrlView();
  let selectedDate = getUrlDate();

  function updateUrl() {
    const url = new URL(window.location);

    url.searchParams.set("view", selectedView);
    url.searchParams.set("date", selectedDate.toISOString());

    history.replaceState(null, "", url);
  }

  document.addEventListener("view-change", (event) => {
    selectedView = event.detail.view;
    updateUrl();
  });

  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    updateUrl();
  });
}

export function getUrlView() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get("view");
    if (view && ['month', 'week', 'day'].includes(view)) {
      return view;
    }
    return 'month'; // Default to month view
  } catch (error) {
    console.error('Error getting URL view:', error);
    return 'month';
  }
}

export function getUrlDate() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get("date");
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date(); // Default to today
  } catch (error) {
    console.error('Error getting URL date:', error);
    return new Date();
  }
}
