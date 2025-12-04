import { groupStore } from './group-store.js';

export function updateEventFormGroupSelect() {
    try {
        const groupSelect = document.querySelector('#group');
        if (!groupSelect) {
            console.error('Group select element not found');
            return;
        }

        const groups = groupStore.getAllGroups();
        if (!groups) {
            console.error('Failed to get groups from store');
            return;
        }
        
        // Mantener la opción "Sin grupo"
        groupSelect.innerHTML = '<option value="">Sin grupo</option>';

        // Agregar las opciones de grupos
        groups.forEach(group => {
            try {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name || 'Grupo sin nombre';
                option.style.backgroundColor = group.color || '#808080';
                groupSelect.appendChild(option);
            } catch (error) {
                console.error('Error adding group option:', error, group);
            }
        });

        console.log('Group select updated successfully');
    } catch (error) {
        console.error('Error updating group select:', error);
    }
}

export function getGroupById(groupId) {
    try {
        if (!groupId) return null;
        return groupStore.getGroup(groupId);
    } catch (error) {
        console.error('Error getting group by id:', error);
        return null;
    }
}

function renderGroupEvents(events, groupId) {
    try {
        const groupEvents = events.filter(event => event.group === groupId);
        if (groupEvents.length === 0) return '';
        
        return `
            <div class="group-events">
                ${groupEvents.map(event => `
                    <div class="group-event">
                        <div class="group-event__dot"></div>
                        <span class="group-event__title">${event.title || 'Sin título'}</span>
                        <span class="group-event__date">${event.date.toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error rendering group events:', error);
        return '';
    }
}

function attachDeleteHandlers(container) {
    try {
        container.querySelectorAll('[data-delete-group]').forEach(button => {
            button.addEventListener('click', (e) => {
                try {
                    e.stopPropagation();
                    const groupItem = e.target.closest('.group-item');
                    if (!groupItem) return;

                    const groupId = groupItem.dataset.groupId;
                    if (!groupId) return;

                    // Eliminar grupo
                    groupStore.deleteGroup(groupId);

                    // Actualizar eventos cuando se elimina un grupo
                    const events = JSON.parse(localStorage.getItem('events') || '[]');
                    const updatedEvents = events.map(event => {
                        if (event.group === groupId) {
                            return { ...event, group: null };
                        }
                        return event;
                    });
                    localStorage.setItem('events', JSON.stringify(updatedEvents));
                    
                    // Actualizar interfaz
                    renderGroupList();
                    updateEventFormGroupSelect();
                    
                    // Disparar evento de cambio
                    document.dispatchEvent(new CustomEvent('events-change', {
                        bubbles: true
                    }));
                } catch (error) {
                    console.error('Error handling group deletion:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error attaching delete handlers:', error);
    }
}

export function renderGroupList() {
    try {
        console.log('Rendering group list...');
        const container = document.querySelector('[data-groups-container]');
        if (!container) {
            console.error('Groups container not found');
            return;
        }

        const groups = groupStore.getAllGroups();
        if (!Array.isArray(groups)) {
            console.error('Invalid groups data:', groups);
            return;
        }
        console.log('Retrieved groups:', groups.length);
        
        // Cargar eventos
        let events = [];
        try {
            const storedEvents = localStorage.getItem('events');
            if (storedEvents) {
                const parsedEvents = JSON.parse(storedEvents);
                if (Array.isArray(parsedEvents)) {
                    events = parsedEvents.map(event => ({
                        ...event,
                        date: new Date(event.date)
                    }));
                    console.log('Retrieved events:', events.length);
                } else {
                    console.error('Stored events is not an array');
                }
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }

        // Renderizar grupos
        container.innerHTML = groups.map(group => {
            try {
                return `
                    <div class="group-item" data-group-id="${group.id}">
                        <div class="group-header">
                            <div class="group-color" style="background-color: ${group.color || '#808080'}"></div>
                            <span class="group-name">${group.name || 'Grupo sin nombre'}</span>
                            <button class="delete-group" data-delete-group>×</button>
                        </div>
                        ${renderGroupEvents(events, group.id)}
                    </div>
                `;
            } catch (error) {
                console.error('Error rendering group:', error, group);
                return '';
            }
        }).join('');

        // Adjuntar manejadores de eventos
        attachDeleteHandlers(container);
        
        console.log('Groups rendered successfully');
    } catch (error) {
        console.error('Error in renderGroupList:', error);
    }
}