class GroupStore {
    constructor() {
        try {
            const storedGroups = localStorage.getItem('groups');
            if (storedGroups) {
                this.groups = JSON.parse(storedGroups);
                console.log('Groups loaded from localStorage:', this.groups.length);
            } else {
                this.groups = [];
                console.log('No groups found in localStorage');
            }
        } catch (error) {
            console.error('Error loading groups from localStorage:', error);
            this.groups = [];
        }
    }

    createGroup(name, color) {
        if (!name) {
            console.error('Group name is required');
            throw new Error('Group name is required');
        }

        console.log('Creating group with color:', color);

        if (!color) {
            console.error('Color is required');
            throw new Error('Color is required');
        }

        const group = {
            id: Date.now().toString(),
            name,
            color,
            events: []
        };
        
        try {
            this.groups.push(group);
            
            // Guardar inmediatamente en localStorage
            localStorage.setItem('groups', JSON.stringify(this.groups));
            
            // Notificar la creación del grupo
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('groups-changed', {
                    detail: { groups: this.groups },
                    bubbles: true
                }));
                // Forzar actualización de la interfaz
                document.dispatchEvent(new Event('force-update', { bubbles: true }));
            }, 0);
            
            console.log('Group created successfully:', group);
            return group;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    addGroup(group) {
        this.groups.push(group);
        this.save();
        return group;
    }

    deleteGroup(groupId) {
        this.groups = this.groups.filter(group => group.id !== groupId);
        this.save();
    }

    getGroup(groupId) {
        return this.groups.find(group => String(group.id) === String(groupId));
    }

    getAllGroups() {
        return this.groups;
    }

    addEventToGroup(groupId, eventId) {
        const group = this.getGroup(groupId);
        if (group) {
            // ensure eventId not already present (compare as string)
            const exists = (group.events || []).some(id => String(id) === String(eventId));
            if (!exists) {
                group.events = group.events || [];
                group.events.push(eventId);
                this.save();
            }
        }
    }

    removeEventFromGroup(groupId, eventId) {
        const group = this.getGroup(groupId);
        if (group) {
            group.events = (group.events || []).filter(id => String(id) !== String(eventId));
            this.save();
        }
    }

    updateGroup(updatedGroup) {
        const index = this.groups.findIndex(g => g.id === updatedGroup.id);
        if (index !== -1) {
            // Mantener los eventos del grupo al actualizar
            const currentEvents = this.groups[index].events || [];
            this.groups[index] = {
                ...updatedGroup,
                events: currentEvents
            };
            this.save();
            return this.groups[index];
        }
        throw new Error('Grupo no encontrado');
    }

    save() {
        try {
            localStorage.setItem('groups', JSON.stringify(this.groups));
            // Asegurar que la notificación se envíe después de que localStorage se actualice
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('groups-changed', {
                    detail: { groups: this.groups },
                    bubbles: true
                }));
                // Forzar actualización de la vista
                document.dispatchEvent(new Event('events-change', { bubbles: true }));
            }, 0);
            console.log('Groups saved successfully');
        } catch (error) {
            console.error('Error saving groups:', error);
            throw error;
        }
    }

    reloadFromStorage() {
        try {
            const storedGroups = localStorage.getItem('groups');
            if (storedGroups) {
                this.groups = JSON.parse(storedGroups);
                console.log('Groups reloaded from storage:', this.groups.length);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error reloading groups:', error);
            return false;
        }
    }
}

// Create and export singleton instance
export const groupStore = new GroupStore();

// Listen for event-group related events
document.addEventListener('add-event-to-group', (e) => {
    console.log('Adding event to group:', e.detail);
    groupStore.addEventToGroup(e.detail.groupId, e.detail.eventId);
});

document.addEventListener('remove-event-from-group', (e) => {
    console.log('Removing event from group:', e.detail);
    groupStore.removeEventFromGroup(e.detail.groupId, e.detail.eventId);
});

// Reload data when the page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        groupStore.reloadFromStorage();
    }
});