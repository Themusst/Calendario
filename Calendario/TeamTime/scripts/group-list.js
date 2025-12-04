import { groupStore } from './group-store.js';
import { initEventStore } from './event-store.js';

const eventStore = initEventStore();

export class GroupList extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="group-list">
                <div class="group-list-header">
                    <h3>Grupos</h3>
                    <button class="create-group-button">+ Nuevo Grupo</button>
                </div>
                <div class="groups-container"></div>
            </div>
        `;

        this.groupsContainer = this.querySelector('.groups-container');
        this.setupListeners();
        this.renderGroups();
    }

    setupListeners() {
        this.querySelector('.create-group-button').addEventListener('click', () => {
            const event = new CustomEvent('create-group-clicked');
            this.dispatchEvent(event);
        });

        this.addEventListener('click', (e) => {
            const editButton = e.target.closest('.edit-group');
            if (editButton) {
                e.preventDefault();
                e.stopPropagation();
                const groupId = editButton.closest('.group-item').dataset.groupId;
                console.log('Edit button clicked for group:', groupId);
                this.editGroup(groupId);
            }
            if (e.target.closest('.group-event')) {
                const eventId = e.target.closest('.group-event').dataset.eventId;
                this.showEventDetails(eventId);
            }
        });

        // Listen for event changes
        document.addEventListener('events-change', (e) => {
            console.log('Event change detected, updating groups...', e.detail);
            this.renderGroups();
            
            // Force a re-render after a short delay to ensure counts are updated
            setTimeout(() => {
                this.renderGroups();
            }, 100);
        });

        // Also update when groups change (e.g. events added to group's internal list)
        document.addEventListener('groups-changed', (e) => {
            console.log('Groups changed, updating groups list...', e.detail);
            this.renderGroups();
        });

        // Listen for any event creation/editing/deletion
        document.addEventListener('event-create', (e) => {
            console.log('Event created, updating groups...', e.detail);
            if (e.detail && e.detail.event && e.detail.event.groupId) {
                this.renderGroups();
            }
        });

        document.addEventListener('event-edit', (e) => {
            console.log('Event edited, updating groups...', e.detail);
            if (e.detail && e.detail.event && e.detail.event.groupId) {
                this.renderGroups();
            }
        });

        document.addEventListener('event-delete', (e) => {
            console.log('Event deleted, updating groups...', e.detail);
            this.renderGroups();
        });
    }

    renderGroups() {
        const groups = groupStore.getAllGroups();
        const allEvents = eventStore.getAllEvents();
        
        console.log('Rendering groups with events:', { groups, allEvents });
        
        this.groupsContainer.innerHTML = groups.map(group => {
            const groupEvents = allEvents.filter(event => {
                const matches = String(event.groupId) === String(group.id);
                if (matches) {
                    console.log(`Event ${event.id} belongs to group ${group.id}`);
                }
                return matches;
            });
            const eventsList = groupEvents.length > 0 
                ? `<div class="group-events">
                    ${groupEvents.map(event => `
                        <button class="group-event" data-event-id="${event.id}">
                            <div class="group-event__dot" style="background-color: ${event.color}"></div>
                            <span class="group-event__title">${event.title}</span>
                            <span class="group-event__date">${this.formatEventDate(event.date)}</span>
                        </button>
                    `).join('')}
                  </div>`
                : '';

            return `
                <div class="group-item" data-group-id="${group.id}">
                    <div class="group-header">
                        <div class="group-color" style="background-color: ${group.color}"></div>
                        <div class="group-info">
                            <span class="group-name">${group.name}</span>
                            <span class="group-event-count">${groupEvents.length} eventos</span>
                        </div>
                        <button class="edit-group button button--icon button--secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button__icon">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                <path d="m15 5 4 4" />
                            </svg>
                            <span class="button__text">Editar</span>
                        </button>
                    </div>
                    <div class="group-content">
                        ${eventsList}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatEventDate(date) {
        return new Intl.DateTimeFormat('es', {
            day: 'numeric',
            month: 'short'
        }).format(date);
    }

    editGroup(groupId) {
        const group = groupStore.getGroup(groupId);
        console.log('Found group to edit:', group); // Debug
        
        if (!group) {
            console.error('No se encontró el grupo con ID:', groupId);
            return;
        }

        const event = new CustomEvent('edit-group', { 
            detail: { group },
            bubbles: true 
        });
        document.dispatchEvent(event); // Cambiar a document.dispatchEvent para asegurar la propagación
    }

    showEventDetails(eventId) {
        const allEvents = eventStore.getAllEvents();
        const event = allEvents.find(e => String(e.id) === String(eventId));
        
        if (event) {
            document.dispatchEvent(new CustomEvent('event-click', {
                detail: { event },
                bubbles: true
            }));
        }
    }

    refresh() {
        this.renderGroups();
    }
}

customElements.define('group-list', GroupList);