import { eventStore } from './event-store.js';
import { groupStore } from './group-store.js';

const EVENT_GROUP_CHANGED = 'event-group-changed';

export function addEventToGroup(eventId, groupId) {
  const event = eventStore.getEvent(eventId);
  const oldGroupId = event.groupId;

  if (oldGroupId) {
    groupStore.removeEventFromGroup(oldGroupId, eventId);
  }

  if (groupId) {
    groupStore.addEventToGroup(groupId, eventId);
    event.groupId = groupId;
  } else {
    delete event.groupId;
  }

  eventStore.updateEvent(event);
  document.dispatchEvent(new CustomEvent(EVENT_GROUP_CHANGED, { 
    detail: { eventId, groupId, oldGroupId }
  }));
}

export function getEventGroup(event) {
  if (!event.groupId) return null;
  return groupStore.getGroup(event.groupId);
}