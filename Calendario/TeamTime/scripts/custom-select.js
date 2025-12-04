// Lightweight custom select replacement
// Replaces .select > select.select__select with a fully-stylable dropdown
document.addEventListener('DOMContentLoaded', () => {
  const containers = Array.from(document.querySelectorAll('.select'));
  containers.forEach(initCustomSelect);
});

function initCustomSelect(container) {
  const select = container.querySelector('select.select__select');
  if (!select) return;

  // Do not initialize twice
  if (container.__customSelectInit) return;
  container.__customSelectInit = true;

  // Hide native select but keep it in the DOM for forms/accessibility
  select.style.position = 'absolute';
  select.style.left = '-9999px';
  select.setAttribute('aria-hidden', 'true');

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'custom-select__button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');

  const valueSpan = document.createElement('span');
  valueSpan.className = 'custom-select__value';
  valueSpan.textContent = select.options[select.selectedIndex]?.text || '';

  const icon = container.querySelector('.select__icon')?.cloneNode(true) || null;
  if (icon) icon.classList.add('custom-select__icon');

  button.appendChild(valueSpan);
  if (icon) button.appendChild(icon);

  const list = document.createElement('ul');
  list.className = 'custom-select__list';
  list.setAttribute('role', 'listbox');

  // Builds (or rebuilds) the custom list from the native select options
  function rebuildList() {
    // remove existing items
    while (list.firstChild) list.removeChild(list.firstChild);

    Array.from(select.options).forEach((opt) => {
      const li = document.createElement('li');
      li.className = 'custom-select__item';
      li.setAttribute('role', 'option');
      li.dataset.value = opt.value;
      li.textContent = opt.text;
      li.tabIndex = -1;
      if (opt.disabled) li.setAttribute('aria-disabled', 'true');
      if (opt.selected) li.classList.add('is-selected');
      li.addEventListener('click', (e) => {
        e.preventDefault();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        updateSelection();
        close();
        button.focus();
      });
      list.appendChild(li);
    });
  }

  // Observe changes to the native select's children (options) so dynamic additions are reflected
  const selectObserver = new MutationObserver((mutations) => {
    // when options change, rebuild the custom list and update selection state
    rebuildList();
    updateSelection();
  });
  selectObserver.observe(select, { childList: true });

  // initial build
  rebuildList();

  function updateSelection() {
    const sel = select.options[select.selectedIndex];
    valueSpan.textContent = sel?.text || '';
    const items = list.querySelectorAll('.custom-select__item');
    items.forEach(it => it.classList.toggle('is-selected', it.dataset.value === select.value));
  }

  function open() {
    wrapper.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
  }
  function close() {
    wrapper.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  }

  button.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.contains('is-open') ? close() : open();
  });

  // Keyboard
  button.addEventListener('keydown', (e) => {
    const items = Array.from(list.children);
    const current = items.findIndex(i => i.classList.contains('is-focused'));
    if (e.key === 'ArrowDown') {
      e.preventDefault(); open(); focusItem(current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); open(); focusItem(current - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); wrapper.classList.contains('is-open') ? close() : open();
    }
  });

  list.addEventListener('keydown', (e) => {
    const items = Array.from(list.children);
    let idx = items.findIndex(i => i.classList.contains('is-focused'));
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(idx - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); items[idx]?.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); button.focus(); }
  });

  function focusItem(index) {
    const items = Array.from(list.children);
    items.forEach(i => i.classList.remove('is-focused'));
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const it = items[clamped];
    if (it) { it.classList.add('is-focused'); it.focus(); it.scrollIntoView({ block: 'nearest' }); }
  }

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !container.contains(e.target)) close();
  });

  // Update original select -> custom when changed programmatically
  select.addEventListener('change', updateSelection);

  wrapper.appendChild(button);
  wrapper.appendChild(list);
  container.appendChild(wrapper);

  updateSelection();
}

// Watch document for new .select containers added after initial load (e.g. dynamic dialogs)
const globalObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList' && m.addedNodes.length) {
      m.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        // if a .select container was added
        if (node.classList && node.classList.contains('select')) initCustomSelect(node);
        // also if descendants include selects
        const selects = node.querySelectorAll && node.querySelectorAll('.select');
        if (selects && selects.length) selects.forEach(s => initCustomSelect(s));
      });
    }
  }
});
globalObserver.observe(document.body, { childList: true, subtree: true });

export {};
