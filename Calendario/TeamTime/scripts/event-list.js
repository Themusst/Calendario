import { initStaticEvent } from "./event.js";

let eventListItemTemplateElement = null;

function getTemplate() {
    if (!eventListItemTemplateElement) {
        eventListItemTemplateElement = document.querySelector("[data-template='event-list-item']");
        if (!eventListItemTemplateElement) {
            throw new Error("No se encontró la plantilla de item de lista de eventos");
        }
    }
}

export function initEventList(parent, events) {
    try {
        getTemplate();
        
        const eventListElement = parent.querySelector("[data-event-list]");
        if (!eventListElement) return;

        eventListElement.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        for (const event of events) {
            const eventListItemContent = eventListItemTemplateElement.content.cloneNode(true);
            const eventListItemElement = eventListItemContent.querySelector("[data-event-list-item]");

            initStaticEvent(eventListItemElement, event);

            eventListElement.appendChild(eventListItemElement);
        }
    } catch (error) {
        console.error('Error inicializando la lista de eventos:', error);
    }
}