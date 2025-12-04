import { waitUntilAnimationsFinish } from "./animation.js";

export function initToaster(parent) {
  const toasterElement = document.createElement("div");

  toasterElement.classList.add("toaster");
  parent.appendChild(toasterElement);

  return {
    success(message) {
      _showToast(toasterElement, message, "success");
    },
    error(message) {
      _showToast(toasterElement, message, "error");
    }
  };
}

// Internal implementation that accepts an element
function _showToast(toasterElement, message, type) {
  const toastElement = createToast(message, type);
  animateToast(toasterElement, toastElement);
}

// Exported convenience function used by other modules. It will find or create
// a global `.toaster` container and show the toast there.
export function showToast(message, type = "success") {
  try {
    let toasterElement = document.querySelector('.toaster');
    if (!toasterElement) {
      toasterElement = document.createElement('div');
      toasterElement.classList.add('toaster');
      document.body.appendChild(toasterElement);
    }

    _showToast(toasterElement, message, type);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}

function createToast(message, type) {
  const toastElement = document.createElement("div");
  toastElement.textContent = message;
  toastElement.classList.add("toast");
  toastElement.classList.add(`toast--${type}`);

  return toastElement;
}

function animateToast(toasterElement, toastElement) {
  const heightBefore = toasterElement.offsetHeight;
  toasterElement.appendChild(toastElement);
  const heightAfter = toasterElement.offsetHeight;
  const heightDiff = heightAfter - heightBefore;

  const toasterAnimation = toasterElement.animate([
    { transform: `translate(0, ${heightDiff}px)` },
    { transform: "translate(0, 0)" }
  ], {
    duration: 150,
    easing: "ease-out"
  });

  toasterAnimation.startTime = document.timeline.currentTime;

  waitUntilAnimationsFinish(toastElement)
    .then(() => {
      toasterElement.removeChild(toastElement);
    })
    .catch((error) => {
      console.error("Finish toast animation promise failed", error);
    });
}