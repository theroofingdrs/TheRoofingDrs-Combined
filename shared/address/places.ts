/** Public Google Maps browser binding only. No server credential belongs here. */
export type Address = { street: string; city: string; state: string; zip: string; formatted: string };
export type Prediction = { label: string; resolve: () => Promise<Address | null> };
export type Places = { token: () => unknown; suggest: (input: string, token: unknown) => Promise<Prediction[]> };
export function parseAddress(place: any): Address | null {
  const parts = Array.isArray(place.addressComponents) ? place.addressComponents : [];
  const text = (type: string, short = false) => {
    const part = parts.find((p: any) => p.types?.includes(type));
    return String((short ? part?.shortText : part?.longText) || '').trim();
  };
  if (text('country', true) !== 'US' || !text('route') || !text('street_number')) return null;
  const unit = text('subpremise');
  const street = `${text('street_number')} ${text('route')}${unit ? ' #' + unit : ''}`;
  const city = text('locality') || text('postal_town') || text('sublocality_level_1');
  const state = /^[A-Z]{2}$/.test(text('administrative_area_level_1', true)) ? text('administrative_area_level_1', true) : '';
  const baseZip = /^\d{5}$/.test(text('postal_code')) ? text('postal_code') : '';
  const suffix = text('postal_code_suffix');
  const zip = baseZip + (baseZip && /^\d{4}$/.test(suffix) ? '-' + suffix : '');
  return { street, city, state, zip, formatted: [street, [city, state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') };
}
export function placesProvider(library: any): Places {
  if (!library?.AutocompleteSuggestion?.fetchAutocompleteSuggestions || !library.AutocompleteSessionToken) throw Error('Places unavailable');
  return {
    token: () => new library.AutocompleteSessionToken(),
    suggest: async (input, sessionToken) => {
      const result = await library.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input, includedRegionCodes: ['us'], sessionToken });
      return (result.suggestions || []).flatMap((s: any) => {
        const prediction = s.placePrediction;
        if (!prediction || !prediction.text || typeof prediction.toPlace !== 'function') return [];
        return [{ label: prediction.text.toString(), resolve: async () => {
          const place = prediction.toPlace();
          await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] });
          return parseAddress(place);
        } }];
      }).slice(0, 5);
    },
  };
}
let ready: Promise<Places> | undefined;
export function loadPlaces(key: string | undefined): Promise<Places> {
  if (ready) return ready;
  const scope = window as any;
  // Reuse an authorized SDK already loaded on this page, without a second script.
  if (scope.google?.maps?.importLibrary) {
    const attempt = Promise.resolve(scope.google.maps.importLibrary('places')).then(placesProvider);
    ready = attempt;
    void attempt.catch(() => { if (ready === attempt) ready = undefined; });
    return attempt;
  }
  if (!key?.trim()) return Promise.reject(Error('Places unavailable'));
  const attempt = new Promise<Places>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://maps.googleapis.com/maps/api/js"]');
    const script = existing || document.createElement('script');
    const cleanup = () => { clearTimeout(timer); script.removeEventListener('load', finish); script.removeEventListener('error', failure); };
    const failure = () => { cleanup(); reject(Error('Places unavailable')); };
    const finish = () => {
      cleanup();
      if (!scope.google?.maps?.importLibrary) { reject(Error('Places unavailable')); return; }
      Promise.resolve(scope.google.maps.importLibrary('places')).then(placesProvider).then(resolve, reject);
    };
    const timer = setTimeout(failure, 12000);
    script.addEventListener('error', failure, { once: true });
    if (existing) { script.addEventListener('load', finish, { once: true }); return; }
    scope.__trdcrdPlacesReady = finish;
    script.id = 'trdcrd-google-places';
    script.src = 'https://maps.googleapis.com/maps/api/js?' + new URLSearchParams({ key: key.trim(), loading: 'async', libraries: 'places', v: 'weekly', callback: '__trdcrdPlacesReady' });
    script.async = true;
    document.head.appendChild(script);
  });
  ready = attempt;
  // A transient network/configuration failure must not poison this page forever.
  void attempt.catch(() => { if (ready === attempt) ready = undefined; });
  return attempt;
}
