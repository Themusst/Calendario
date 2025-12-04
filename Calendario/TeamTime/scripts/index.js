import { initCalendar } from "./calendar.js";
import { initEventCreateButtons } from "./event-create-button.js";
import { initEventDeleteDialog } from "./event-delete-dialog.js";
import { initEventDetailsDialog } from "./event-details-dialog.js";
import { initEventFormDialog } from "./event-form-dialog.js";
import { initEventStore } from "./event-store.js";
import { initHamburger } from "./hamburger.js";
import { initMiniCalendars } from "./mini-calendar.js";
import { initMobileSidebar } from "./mobile-sidebar.js";
import { initNav } from "./nav.js";
import { initNotifications } from "./notifications.js";
import { initViewSelect } from "./view-select.js";
import { initResponsive } from "./responsive.js";
import { initUrl } from "./url.js";
import { initSync } from "./sync.js";
import { initGroups } from "./init-groups.js";
import { initGroupDialog } from "./group-dialog.js";

// Esperar a que el DOM esté completamente cargado
function initializeApp() {
  console.log('Iniciando la aplicación...');
  try {
    // Inicializar store primero
    console.log('Inicializando event store...');
    const eventStore = initEventStore();
    if (!eventStore) {
      throw new Error('Fallo al inicializar event store');
    }

    // Inicializar componentes UI básicos
    console.log('Inicializando componentes UI básicos...');
    initUrl();
    initResponsive();
    initNav();
    initViewSelect();
    
    // Inicializar calendario y componentes relacionados
    console.log('Inicializando calendario y componentes...');
    initCalendar(eventStore);
    initMiniCalendars();
    
    // Inicializar diálogos y formularios
    console.log('Inicializando diálogos y formularios...');
    initEventFormDialog();
    initEventDetailsDialog();
    initEventDeleteDialog();
    initEventCreateButtons();
    
    // Inicializar grupos
    console.log('Inicializando grupos...');
    initGroups();
    initGroupDialog();
    // `event-groups` UI removed per user request; not initializing it

    // Wire global event handlers so created/edited/deleted events are saved to the store
    document.addEventListener('event-create', (e) => {
      try {
        const event = e.detail.event;
          console.log('Handling event-create, event detail:', e.detail && e.detail.event);
          const created = eventStore.addEvent(event);
          console.log('Event create handled, result:', created);
        
        // Update group event count if event has a group
        if (event.groupId) {
          const allEvents = eventStore.getAllEvents();
          const groupEvents = allEvents.filter(e => e.groupId === event.groupId);
          document.dispatchEvent(new CustomEvent('events-change', {
            detail: { events: allEvents },
            bubbles: true
          }));
        }
      } catch (err) {
        console.error('Error handling event-create:', err);
      }
    });

    document.addEventListener('event-edit', (e) => {
      try {
        const updatedEvent = e.detail.event;
        // Retrieve previous event state from the store
        const allEventsBefore = eventStore.getAllEvents();
        const oldEvent = allEventsBefore.find(ev => String(ev.id) === String(updatedEvent.id));
        console.log('Handling event-edit, event detail:', e.detail && e.detail.event);
        const updated = eventStore.updateEvent(updatedEvent);
        console.log('Event edit handled, result:', updated);
        
        // If group changed, we need to update both old and new group counts
        if (oldEvent && String(oldEvent.groupId) !== String(updatedEvent.groupId)) {
          const allEvents = eventStore.getAllEvents();
          document.dispatchEvent(new CustomEvent('events-change', {
            detail: { events: allEvents },
            bubbles: true
          }));
        }
      } catch (err) {
        console.error('Error handling event-edit:', err);
      }
    });

    document.addEventListener('event-delete', (e) => {
      try {
        const deleted = eventStore.deleteEvent(e.detail.event.id || e.detail.event);
        console.log('Event delete handled, result:', deleted);
      } catch (err) {
        console.error('Error handling event-delete:', err);
      }
    });
    
    // Inicializar componentes adicionales
    console.log('Inicializando componentes adicionales...');
    initHamburger();
    initMobileSidebar();
    initNotifications();
    initSync();
    
    console.log('Aplicación inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    // Mostrar un mensaje de error al usuario
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border: 1px solid #ff0000; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    errorMessage.textContent = 'Error al cargar la aplicación. Por favor, recarga la página.';
    document.body.appendChild(errorMessage);
  }
}

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
