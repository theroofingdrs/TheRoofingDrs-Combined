import { loadPlaces, type Address, type Places, type Prediction } from './places.ts';
let nextId = 0;
/** Native input + portal listbox: works inside scrolling/clipped modal containers. */
export function attachAddressAutocomplete(input: HTMLInputElement, options: {
  key?: string; theme?: 'light' | 'dark'; onSelect: (address: Address) => string | void;
  load?: () => Promise<Places>;
}) {
  const id = `address-lookup-${++nextId}`;
  const parent = input.closest('[role="dialog"]') || document.body;
  const list = document.createElement('div');
  list.id = id; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Suggested property addresses');
  const dark = options.theme === 'dark';
  Object.assign(list.style, { position: parent === document.body ? 'fixed' : 'absolute', zIndex: '2147483000', display: 'none', overflowY: 'auto', overscrollBehavior: 'contain', boxSizing: 'border-box', border: '1px solid ' + (dark ? '#475569' : '#cbd5e1'), borderRadius: '8px', background: dark ? '#0f172a' : '#fff', color: dark ? '#f1f5f9' : '#1e293b', boxShadow: '0 8px 24px #0003', font: '14px/1.4 sans-serif' });
  const attribution = document.createElement('div');
  const logo = document.createElement('img');
  logo.alt = 'Powered by Google'; logo.width = 144; logo.height = 18;
  Object.assign(logo.style, { width: '144px', height: '18px', background: '#fff', display: 'inline-block' });
  attribution.appendChild(logo);
  Object.assign(attribution.style, { padding: '7px 12px', fontSize: '12px', textAlign: 'right', borderTop: '1px solid #94a3b844' });
  const status = document.createElement('span');
  status.id = id + '-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  Object.assign(status.style, { display: 'block', font: '12px/1.4 sans-serif', marginTop: '0', color: dark ? '#cbd5e1' : '#64748b' });
  const announce = (message: string) => { status.textContent = message; status.style.marginTop = message ? '4px' : '0'; };
  input.insertAdjacentElement('afterend', status);
  parent.appendChild(list);
  const described = input.getAttribute('aria-describedby');
  const nativeAutocomplete = input.getAttribute('autocomplete');
  input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', id); input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-describedby', [described, status.id].filter(Boolean).join(' '));
  let rows: Prediction[] = [], active = -1, generation = 0, timer: ReturnType<typeof setTimeout>;
  let token: unknown, lastInput = '', focused = document.activeElement === input, disposed = false, failed = false;
  const close = () => { list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; if (nativeAutocomplete) input.setAttribute('autocomplete', nativeAutocomplete); else input.removeAttribute('autocomplete'); };
  const place = () => {
    if (list.style.display === 'none') return;
    const r = input.getBoundingClientRect(), view = window.visualViewport;
    const left = view?.offsetLeft || 0, top = view?.offsetTop || 0;
    const width = view?.width || document.documentElement.clientWidth, height = view?.height || innerHeight;
    if (r.bottom <= top || r.top >= top + height || r.right <= left || r.left >= left + width) { close(); return; }
    const below = top + height - r.bottom - 8, above = r.top - top - 8;
    const up = below < 160 && above > below;
    const maxHeight = Math.max(0, Math.min(280, up ? above : below));
    const boxWidth = Math.min(r.width, width - 16);
    if (maxHeight < 44) { close(); return; }
    const x = Math.max(left + 8, Math.min(r.left, left + width - boxWidth - 8));
    const popupHeight = Math.min(maxHeight, list.scrollHeight);
    const y = up ? r.top - popupHeight - 4 : r.bottom + 4;
    const host = parent === document.body ? null : parent as HTMLElement;
    const hostBox = host?.getBoundingClientRect();
    Object.assign(list.style, { left: `${x - (hostBox?.left || 0) + (host?.scrollLeft || 0)}px`, width: `${boxWidth}px`, maxHeight: `${maxHeight}px`, top: `${y - (hostBox?.top || 0) + (host?.scrollTop || 0)}px`, bottom: 'auto' });
  };
  function highlight(index: number) {
    active = index;
    [...list.querySelectorAll<HTMLElement>('[role=option]')].forEach((el, i) => { el.setAttribute('aria-selected', String(i === active)); el.style.background = i === active ? (dark ? '#334155' : '#e2e8f0') : 'transparent'; });
    input.setAttribute('aria-activedescendant', `${id}-${active}`);
    list.querySelector(`[id="${id}-${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }
  async function select(index: number) {
    const row = rows[index]; if (!row) return;
    const epoch = ++generation; clearTimeout(timer); close(); token = undefined; announce('Looking up address details…');
    try {
      const address = await row.resolve();
      if (disposed || epoch !== generation) return;
      token = undefined;
      if (!address) { announce('That location has no complete street address. Please enter it manually.'); return; }
      const selectedValue = options.onSelect(address);
      lastInput = typeof selectedValue === 'string' ? selectedValue.trim() : input.value.trim();
      announce(address.zip && address.city && address.state ? 'Address selected. You can edit any details.' : 'Some address details are missing. Please check or complete them manually.');
    } catch { if (!disposed && epoch === generation) announce('Address details are unavailable. Please enter the address manually.'); }

  }
  const render = (items: Prediction[]) => {
    rows = items; active = -1; list.replaceChildren();
    items.forEach((row, index) => {
      const item = document.createElement('div'); item.id = `${id}-${index}`; item.setAttribute('role', 'option'); item.setAttribute('aria-selected', 'false'); item.textContent = row.label;
      Object.assign(item.style, { padding: '11px 12px', minHeight: '44px', boxSizing: 'border-box', cursor: 'pointer', whiteSpace: 'normal', overflowWrap: 'anywhere', borderBottom: '1px solid #94a3b833' });
      item.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') e.preventDefault(); });
      item.addEventListener('click', () => { void select(index); input.focus({ preventScroll: true }); });
      list.appendChild(item);
    });
    if (items.length) { if (!logo.getAttribute('src')) logo.src = 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png'; list.appendChild(attribution); list.style.display = 'block'; input.setAttribute('aria-expanded', 'true'); place(); }
    else close();
  };
  const changed = (event: Event) => {
    if ((event as InputEvent).isComposing) { ++generation; clearTimeout(timer); close(); return; }
    const query = input.value.trim();
    if (query === lastInput) return;
    lastInput = query;
    const epoch = ++generation; clearTimeout(timer); close(); rows = [];
    if (!focused || input.disabled || query.length < 4) { announce(''); return; }
    if (failed) return;
    timer = setTimeout(async () => {
      announce('Searching for addresses…');
      try {
        const provider = await (options.load?.() || loadPlaces(options.key));
        if (disposed || epoch !== generation || !focused) return;
        token ||= provider.token();
        const items = await provider.suggest(query, token);
        if (disposed || epoch !== generation || !focused) return;
        render(items); announce(items.length ? `${items.length} address suggestions available. Use arrow keys to review.` : 'No suggestions found. You can enter the address manually.');
        if (items.length) input.setAttribute('autocomplete', 'off');
      } catch { if (!disposed && epoch === generation) { failed = true; announce('Address suggestions are unavailable. You can enter the address manually.'); } }
    }, 300);
  };
  const keydown = (e: KeyboardEvent) => {
    if (e.isComposing) return;
    if (e.key === 'Escape') { if (list.style.display !== 'none') { e.preventDefault(); e.stopPropagation(); } ++generation; clearTimeout(timer); close(); announce(''); }
    else if (e.key === 'Tab') { ++generation; clearTimeout(timer); close(); }
    else if (rows.length && list.style.display !== 'none') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); highlight(active < 0 ? (e.key === 'ArrowDown' ? 0 : rows.length - 1) : (active + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length); }
      else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); void select(active); }
    }
  };
  const focus = () => { focused = true; failed = false; lastInput = ''; };
  const outside = (e: Event) => { if (e.target !== input && !list.contains(e.target as Node)) { focused = false; ++generation; clearTimeout(timer); token = undefined; close(); } };
  input.addEventListener('input', changed); input.addEventListener('keydown', keydown); input.addEventListener('focus', focus);
  document.addEventListener('pointerdown', outside, true); document.addEventListener('focusin', outside, true);
  window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
  window.visualViewport?.addEventListener('resize', place); window.visualViewport?.addEventListener('scroll', place);
  return () => {
    disposed = true; ++generation; clearTimeout(timer); list.remove(); status.remove();
    input.removeEventListener('input', changed); input.removeEventListener('keydown', keydown); input.removeEventListener('focus', focus);
    document.removeEventListener('pointerdown', outside, true); document.removeEventListener('focusin', outside, true);
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);
    window.visualViewport?.removeEventListener('resize', place); window.visualViewport?.removeEventListener('scroll', place);
    for (const name of ['role','aria-autocomplete','aria-controls','aria-expanded','aria-activedescendant']) input.removeAttribute(name);
    if (described) input.setAttribute('aria-describedby', described); else input.removeAttribute('aria-describedby');
    if (nativeAutocomplete) input.setAttribute('autocomplete', nativeAutocomplete); else input.removeAttribute('autocomplete');
  };
}
