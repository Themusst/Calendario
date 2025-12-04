// Simulation helper to run from the browser console. Paste and run `simulateCreateEvent()`.
(function () {
  function log(title, obj) {
    try { console.log(title, JSON.stringify(obj, null, 2)); }
    catch (e) { console.log(title, obj); }
  }

  window.simulateCreateEvent = function simulateCreateEvent() {
    console.log('--- simulateCreateEvent START ---');

    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const events = JSON.parse(localStorage.getItem('events') || '[]');

    log('groups (before)', groups);
    log('events (before)', events);

    if (!groups || groups.length === 0) {
      console.warn('No groups found in localStorage. Create a group first.');
      return;
    }

    // Use the first group for the test
    const targetGroup = groups[0];
    const newEvent = {
      id: Date.now(),
      title: 'TEST evento (simulado)',
      date: new Date().toISOString(),
      startTime: 540,
      endTime: 600,
      color: targetGroup.color || '#000',
      groupId: targetGroup.id
    };

    console.log('Dispatching event-create with:', newEvent);
    document.dispatchEvent(new CustomEvent('event-create', { detail: { event: newEvent }, bubbles: true }));

    // Wait a bit for listeners to process
    setTimeout(() => {
      const eventsAfter = JSON.parse(localStorage.getItem('events') || '[]');
      const groupsAfter = JSON.parse(localStorage.getItem('groups') || '[]');
      log('events (after)', eventsAfter);
      log('groups (after)', groupsAfter);

      // Try to force UI updates if components are present
      try {
        const groupListEl = document.querySelector('group-list');
        if (groupListEl && typeof groupListEl.refresh === 'function') {
          console.log('Calling group-list.refresh()');
          groupListEl.refresh();
        }

        const eventGroupsEl = document.querySelector('[data-event-groups-list]');
        if (eventGroupsEl) {
          console.log('Found event groups list element; dispatching events-change to force re-render');
          document.dispatchEvent(new CustomEvent('events-change', { detail: { events: eventsAfter }, bubbles: true }));
        }
      } catch (err) {
        console.warn('Error forcing UI refresh:', err);
      }

      console.log('--- simulateCreateEvent END ---');
    }, 300);
  };
})();
