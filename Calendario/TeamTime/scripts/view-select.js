import { getUrlView } from "./url.js";

export function initViewSelect() {
  const viewSelectElement = document.querySelector("[data-view-select]");

  if (!viewSelectElement) {
    console.warn('View select element not found: [data-view-select]');
    return;
  }

  const initialView = getUrlView() || 'month';
  try {
    viewSelectElement.value = initialView;
  } catch (e) {
    console.warn('Could not set value on view select element', e);
  }

  viewSelectElement.addEventListener("change", (event) => {
    const view = viewSelectElement.value;
    console.log('view-select changed to', view);
    // Dispatch at document level so listeners always receive it
    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view },
      bubbles: true
    }));
  });

  document.addEventListener("view-change", (event) => {
    try {
      viewSelectElement.value = event.detail.view;
    } catch (e) {
      // ignore
    }
  });
}