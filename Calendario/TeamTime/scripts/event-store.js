import { isTheSameDay } from "./date.js";

let events = [];

export function initEventStore() {
  console.log('Initializing event store...');
  
  try {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      events = JSON.parse(storedEvents).map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      console.log(`Loaded ${events.length} events from storage`);
    } else {
      console.log('No stored events found');
      events = [];
    }
  } catch (error) {
    console.error('Error loading events from storage:', error);
    events = [];
  }

  return {
    getEventsByDate,
    addEvent,
    deleteEvent,
    updateEvent,
    getAllEvents: () => [...events]
  };
}

function getEventsByDate(date) {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date provided to getEventsByDate:', date);
      return [];
    }
    const matchingEvents = events.filter((event) => isTheSameDay(event.date, date));
    return matchingEvents;
  } catch (error) {
    console.error('Error getting events by date:', error);
    return [];
  }
}

function addEvent(event) {
  try {
    // Asegurarnos de que el evento tenga un ID único
    if (!event.id) {
      event.id = Date.now();
    }
    
    events.push(event);
    saveEvents();
    
    // Notificar primero el cambio en eventos
    notifyChange();
    
    // Si el evento tiene un grupo, actualizar el grupo después
    if (event.groupId) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('add-event-to-group', {
          detail: { 
            groupId: event.groupId,
            eventId: event.id
          },
          bubbles: true
        }));
      }, 0);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding event:', error);
    return false;
  }
}

function deleteEvent(eventId) {
  try {
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events.splice(index, 1);
      saveEvents();
      notifyChange();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

function updateEvent(updatedEvent) {
  try {
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      const oldEvent = events[index];
      
      // Si el grupo cambió, actualizar las referencias
      if (oldEvent.groupId !== updatedEvent.groupId) {
        // Remover del grupo anterior si existía
        if (oldEvent.groupId) {
          document.dispatchEvent(new CustomEvent('remove-event-from-group', {
            detail: {
              groupId: oldEvent.groupId,
              eventId: oldEvent.id
            },
            bubbles: true
          }));
        }
        
        // Agregar al nuevo grupo si existe
        if (updatedEvent.groupId) {
          document.dispatchEvent(new CustomEvent('add-event-to-group', {
            detail: {
              groupId: updatedEvent.groupId,
              eventId: updatedEvent.id
            },
            bubbles: true
          }));
        }
      }
      
      events[index] = updatedEvent;
      saveEvents();
      notifyChange();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating event:', error);
    return false;
  }
}

function saveEvents() {
  try {
    // Save events to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    // Notify change with the complete list of events
    notifyChange();
  } catch (error) {
    console.error('Error saving events:', error);
  }
}

function notifyChange() {
  // Get all events and group them by groupId for the event detail
  const allEvents = [...events];
  const eventsByGroup = {};
  allEvents.forEach(event => {
    if (event.groupId) {
      if (!eventsByGroup[event.groupId]) {
        eventsByGroup[event.groupId] = [];
      }
      eventsByGroup[event.groupId].push(event);
    }
  });

  // Dispatch event with both all events and the grouped events
  document.dispatchEvent(new CustomEvent('events-change', {
    detail: { 
      events: allEvents,
      eventsByGroup: eventsByGroup
    },
    bubbles: true
  }));
}