import React, { useEffect, useRef } from 'react';
import { attachAddressAutocomplete } from '../../../../../shared/address/controller.ts';
import type { Address } from '../../../../../shared/address/places.ts';
type Props = {
  value: string; onChange: (event: any) => void; onPlaceSelected: (address: Address) => void;
  onSelectionCleared?: () => void; theme?: 'light' | 'dark'; format?: 'street' | 'combined';
  [name: string]: any;
};
export function AddressAutocomplete({ onPlaceSelected, onSelectionCleared, theme = 'light', format = 'street', onChange, ...props }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const selected = useRef('');
  const callbacks = useRef({ onPlaceSelected, onSelectionCleared, onChange });
  callbacks.current = { onPlaceSelected, onSelectionCleared, onChange };
  useEffect(() => {
    if (!input.current) return;
    return attachAddressAutocomplete(input.current, {
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, theme,
      onSelect: address => {
        selected.current = format === 'street' ? address.street : address.formatted;
        callbacks.current.onPlaceSelected(address);
        return selected.current;
      },
    });
  }, [theme, format]);
  return <span style={{ display: 'block', minWidth: 0 }}><input {...props} ref={input} onChange={event => {
    const clear = selected.current && event.target.value.trim() !== selected.current.trim();
    if (clear) selected.current = '';
    callbacks.current.onChange(event);
    if (clear) callbacks.current.onSelectionCleared?.();
  }} /></span>;
}
