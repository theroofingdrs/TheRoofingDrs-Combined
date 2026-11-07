import { submitInquiry } from '../../../../shared/intake-client.ts';
import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';
import { PhotoAttachment, PropertyType, RoofSystemType, LeadType } from '../types';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeadType?: LeadType;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen,
  onClose,
  initialLeadType = 'Inspection',
}) => {
  const [leadType, setLeadType] = useState<LeadType>(initialLeadType);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    role: 'Property Owner',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'TX',
    zip: '',
    propertyType: 'Commercial' as PropertyType,
    roofSystem: 'Unknown' as RoofSystemType,
    approximateRoofArea: '',
    message: '',
    // Storm & Insurance fields
    stormDate: '',
    stormDamageType: 'Hail & Wind',
    existingClaim: false,
    claimNumber: '',
    carrier: '',
    adjusterAssigned: false,
    adjusterInspectionScheduled: false,
    needCrdPresent: true,
  });

  const addressInputRef = useRef<HTMLInputElement>(null);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !addressInputRef.current) return;
    const w = window as any;
    const attachAutocomplete = () => {
      if (!addressInputRef.current || !w.google?.maps?.places) return;
      const autocomplete = new w.google.maps.places.Autocomplete(addressInputRef.current, { types: ['address'], fields: ['address_components', 'formatted_address'] });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const components = place.address_components || [];
        const get = (type: string, useShort = false) => {
          const item = components.find((part: any) => part.types.includes(type));
          return item ? (useShort ? item.short_name : item.long_name) : '';
        };
        const street = [get('street_number'), get('route')].filter(Boolean).join(' ');
        setFormData((current) => ({ ...current, address: street || place.formatted_address || current.address, city: get('locality') || get('postal_town') || get('sublocality') || current.city, state: get('administrative_area_level_1', true) || current.state, zip: get('postal_code') || current.zip }));
        setPlacesReady(true);
      });
      setPlacesReady(true);
    };
    if (w.google?.maps?.places) { attachAutocomplete(); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[data-crd-google-places="true"]');
    if (existing) { existing.addEventListener('load', attachAutocomplete, { once: true }); return; }
    const script = document.createElement('script');
    script.dataset.crdGooglePlaces = 'true';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&libraries=places&callback=crdGooglePlacesReady';
    script.async = true; script.defer = true;
    w.crdGooglePlacesReady = attachAutocomplete;
    document.head.appendChild(script);
    return () => { delete w.crdGooglePlacesReady; };
  }, [isOpen]);

  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];

    if(photos.length+files.length>10||photos.reduce((sum,p)=>sum+p.size,0)+files.reduce((sum,file)=>sum+file.size,0)>18*1024*1024){setErrorMessage('Use up to 10 photographs totaling 18 MB. Your form details are preserved.');return;}
    files.forEach((file: File) => {
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setErrorMessage('Use JPEG, PNG or WebP photographs.');return;}
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB size limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [
            ...prev,
            {
              id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: file.name,
              dataUrl: reader.result as string,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const isStormOrInsurance =
    leadType === 'Storm Damage' ||
    leadType === 'Insurance Claim' ||
    leadType === 'Hail Damage' ||
    leadType === 'Wind Damage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        leadType,
        priority: isStormOrInsurance ? 'High' : 'Normal',
        source: 'Inspection Request Modal',
        photos,
        landingPage: window.location.pathname,
        referrer: document.referrer || '',
      };

      await submitInquiry('/commercial/api/leads', payload);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || `We couldn't submit your request. Please retry or call CRD at ${BUSINESS_INFO.phone}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0e1422] border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full text-slate-100 my-8 overflow-hidden font-sans-crd relative">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-lg text-slate-950 font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
                Request Commercial Roof Inspection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical condition evaluation, storm assessment, or asset documentation for the Ark-La-Tex.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
              Inspection Request Received
            </h3>
            <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
              Thank you for contacting Commercial Roof Doctors. Your commercial roof inquiry has been received by our technical estimating department.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-amber-400 font-mono-crd uppercase">Next Steps:</div>
              <div>• A CRD commercial specialist will review the property parameters and aerial geometry.</div>
              <div>• We will coordinate with you to confirm roof access and inspection scheduling.</div>
              <div>• Direct contact: {BUSINESS_INFO.phone} | {BUSINESS_INFO.email}</div>
            </div>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold uppercase px-6 py-2.5 rounded tracking-wider text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-xs">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Intent Selection */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-2">
                What can CRD help you with? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Inspection',
                  'Leak / Repair',
                  'Storm Damage',
                  'Insurance Claim',
                  'Replacement',
                  'Coating/Restoration',
                  'PPP/Maintenance',
                  'Property Management',
                  'New Construction',
                  'Not Sure',
                ].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setLeadType(type as LeadType)}
                    className={`p-2.5 text-xs font-bold rounded border text-left transition-all ${
                      leadType === type
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Storm & Insurance Dynamic Section */}
            {isStormOrInsurance && (
              <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-heading text-sm font-bold uppercase">
                  <AlertCircle className="w-4 h-4" />
                  Storm & Insurance Coordination Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Approximate Storm Date</label>
                    <input
                      type="date"
                      value={formData.stormDate}
                      onChange={(e) => setFormData({ ...formData, stormDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Damage Type</label>
                    <select
                      value={formData.stormDamageType}
                      onChange={(e) => setFormData({ ...formData, stormDamageType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    >
                      <option value="Hail & Wind">Hail & Wind</option>
                      <option value="Hail Impact Only">Hail Impact Only</option>
                      <option value="Wind Blow-off / Uplift">Wind Blow-off / Uplift</option>
                      <option value="Unknown / Need Assessment">Unknown / Need Assessment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Existing Claim Filed?</label>
                    <select
                      value={formData.existingClaim ? 'Yes' : 'No'}
                      onChange={(e) => setFormData({ ...formData, existingClaim: e.target.value === 'Yes' })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    >
                      <option value="No">No (Need inspection first)</option>
                      <option value="Yes">Yes (Claim open)</option>
                    </select>
                  </div>
                </div>

                {formData.existingClaim && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-slate-400 mb-1">Insurance Carrier</label>
                      <input
                        type="text"
                        placeholder="e.g. Travelers, Hartford, Chubb, Cincinnati"
                        value={formData.carrier}
                        onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Claim Number (if assigned)</label>
                      <input
                        type="text"
                        placeholder="e.g. CLM-891042"
                        value={formData.claimNumber}
                        onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Property & Building Information */}
            <div className="space-y-4">
              <div className="font-heading font-bold text-sm tracking-wider uppercase text-amber-400 border-b border-slate-800 pb-1">
                Property & Roof System
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">Street Address *</label>
                  <input ref={addressInputRef} type="text" required autoComplete="street-address" placeholder="Start typing the property street address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <p className="mt-1 text-[11px] text-slate-500">{placesReady ? "Google address suggestions enabled" : "Enter the street address and complete city, state and ZIP below."}</p>
                </div>
                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">City *</label>
                  <input type="text" required autoComplete="address-level2" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">State *</label>
                    <input type="text" required autoComplete="address-level1" maxLength={2} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })} placeholder="TX" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">ZIP *</label>
                    <input type="text" required autoComplete="postal-code" inputMode="numeric" maxLength={10} value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} placeholder="ZIP code" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Commercial">Commercial Building</option>
                    <option value="Industrial">Industrial / Warehouse</option>
                    <option value="Retail">Retail / Shopping Center</option>
                    <option value="Office">Office Complex</option>
                    <option value="Healthcare">Healthcare / Hospital</option>
                    <option value="School">School / Educational Facility</option>
                    <option value="Church">Church / House of Worship</option>
                    <option value="Apartment">Apartments / Multifamily</option>
                    <option value="HOA">HOA / Community</option>
                    <option value="Other">Other Facility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Roof System (if known)
                  </label>
                  <select
                    value={formData.roofSystem}
                    onChange={(e) => setFormData({ ...formData, roofSystem: e.target.value as RoofSystemType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Unknown">Not Sure / Needs Identification</option>
                    <option value="TPO">TPO (Single-Ply Membrane)</option>
                    <option value="EPDM">EPDM (Rubber Membrane)</option>
                    <option value="PVC">PVC (Single-Ply Membrane)</option>
                    <option value="Modified Bitumen">Modified Bitumen (Multi-Ply)</option>
                    <option value="BUR">Built-Up Roofing (BUR / Tar & Gravel)</option>
                    <option value="Metal">Commercial Metal (Standing Seam / R-Panel)</option>
                    <option value="Roof Coating">Existing Roof Coating</option>
                    <option value="Architectural Shingle">Commercial Steep-Slope Shingle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Approximate Square Footage (if known)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15,000 sq ft or 150 squares"
                    value={formData.approximateRoofArea}
                    onChange={(e) => setFormData({ ...formData, approximateRoofArea: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="font-heading font-bold text-sm tracking-wider uppercase text-amber-400 border-b border-slate-800 pb-1">
                Contact & Facility Decision Maker
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First & Last Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Property Owner">Property Owner</option>
                    <option value="Property Manager">Property Manager</option>
                    <option value="Facility / Maintenance Director">Facility / Maintenance Director</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="HOA Board Member">HOA Board Member</option>
                    <option value="General Contractor">General Contractor</option>
                    <option value="Other">Other Representative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(903) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Message & Photos */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                Project Details / Roof History / Specific Concerns
              </label>
              <textarea
                rows={3}
                placeholder="Describe known leak history, building age, upcoming capital budget requirements, or access constraints."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                Attach Roof Photos, Plans or Insurance Docs (Optional)
              </label>
              <div className="border border-dashed border-slate-700 rounded-lg p-3 text-center bg-slate-900/50 hover:border-slate-500 transition-colors">
                <input
                  id="inspection-file-upload"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="inspection-file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-amber-400 font-semibold">Select files to upload</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Images or PDF documents up to 15MB each</span>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((p) => (
                    <div key={p.id} className="relative group w-14 h-14 rounded overflow-hidden border border-slate-700">
                      <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inspection Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
