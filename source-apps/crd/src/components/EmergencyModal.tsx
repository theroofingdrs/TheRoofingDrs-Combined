import { AddressAutocomplete } from './AddressAutocomplete.tsx';
import { submitInquiry } from '../../../../shared/intake-client.ts';
import React, { useState } from 'react';
import { X, AlertTriangle, Phone, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';
import { PhotoAttachment } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    emergencyType: 'Active leak',
    waterEnteringBuilding: 'Yes',
    buildingOccupied: 'Yes',
    companyName: '',
    propertyName: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '', state: '', zip: '',
    propertyRecord: null as {address:string;city:string;state:string;zip:string}|null,
    description: '',
  });

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
      // Basic client-side check
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        waterEnteringBuilding: formData.waterEnteringBuilding === 'Yes',
        buildingOccupied: formData.buildingOccupied === 'Yes',
        leadType: 'Emergency',
        priority: 'Emergency',
        source: 'Emergency Form',
        photos,
        message: `EMERGENCY ALERT: ${formData.emergencyType}. Water entering: ${formData.waterEnteringBuilding}. Occupied: ${formData.buildingOccupied}. Details: ${formData.description}`,
      };

      await submitInquiry('/commercial/api/emergency', payload);

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
    <div role="dialog" aria-modal="true" aria-label="Commercial emergency request" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0e1422] border-2 border-red-700/80 rounded-xl shadow-2xl max-w-2xl w-full text-slate-100 my-8 overflow-hidden font-sans-crd relative">
        {/* Header */}
        <div className="bg-red-950/90 border-b border-red-800 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded-lg text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
                Report Commercial Roof Emergency
              </h2>
              <p className="text-xs text-red-200 mt-0.5">
                Ark-La-Tex Water Ingress & Storm Disaster Field Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-300 hover:text-white p-1 rounded hover:bg-red-900/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Immediate Call Notice */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-slate-300 text-xs">
            For catastrophic failures or immediate dispatch coordination:
          </div>
          <a
            href={`tel:${BUSINESS_INFO.phoneRaw}`}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold font-mono-crd text-sm bg-slate-800 px-3 py-1.5 rounded border border-slate-700"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>{BUSINESS_INFO.phone}</span>
          </a>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
              Emergency Report Logged
            </h3>
            <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
              Your emergency inquiry has reached Operations. For urgent safety or dispatch coordination, call our team directly. This form does not confirm dispatch.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1 text-slate-300">
              <div className="font-bold text-amber-400 uppercase font-mono-crd mb-1">
                Dispatch Protocol:
              </div>
              <div>• Facility Address: {formData.address || 'Recorded in ticket'}</div>
              <div>• Condition: {formData.emergencyType} (Water entering: {formData.waterEnteringBuilding})</div>
              <div>• If conditions escalate, call direct at {BUSINESS_INFO.phone}.</div>
            </div>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold uppercase px-6 py-2.5 rounded tracking-wider text-sm cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-xs">
                {errorMessage}
              </div>
            )}

            {/* Question 1: What's Happening */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1.5">
                1. What is currently happening on the roof? *
              </label>
              <select
                id="emergency-type-select"
                value={formData.emergencyType}
                onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="Active leak">Active water leak into building</option>
                <option value="Storm damage">Severe storm damage (hail / wind impact)</option>
                <option value="Wind damage">Wind uplift / blow-off / exposed decking</option>
                <option value="Hail damage">Hail punctures / fractured membrane</option>
                <option value="Fallen tree/debris">Fallen tree or structural debris on roof</option>
                <option value="Roof membrane failure">Large-scale membrane detachment or split</option>
                <option value="Drainage/Ponding failure">Clogged commercial drain / overflow ponding</option>
                <option value="Other">Other critical commercial roof emergency</option>
              </select>
            </div>

            {/* Questions 2 & 3: Water entering & Occupied */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1.5">
                  Is water currently entering the building? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setFormData({ ...formData, waterEnteringBuilding: val })}
                      className={`py-2 px-3 text-xs font-bold uppercase rounded border transition-colors ${
                        formData.waterEnteringBuilding === val
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1.5">
                  Is the building currently occupied? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setFormData({ ...formData, buildingOccupied: val })}
                      className={`py-2 px-3 text-xs font-bold uppercase rounded border transition-colors ${
                        formData.buildingOccupied === val
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Address */}
            <div>
              <label htmlFor="emergency-address-input" className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                Commercial Property Address & City *
              </label>
              <AddressAutocomplete autoComplete="address-line1"
                id="emergency-address-input"
                type="text"
                required
                placeholder="e.g. 1200 Commercial Way, Texarkana, TX"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                onPlaceSelected={address => setFormData(current => ({...current, address:address.formatted, city:address.city, state:address.state, zip:address.zip, propertyRecord: {address:address.street,city:address.city,state:address.state,zip:address.zip}}))}
                onSelectionCleared={() => setFormData(current => ({...current, city:'', state:'', zip:'', propertyRecord:null}))}
                theme="dark" format="combined"
              />
            </div>

            {/* Company & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                  Company / Property Name *
                </label>
                <input
                  id="emergency-company-input"
                  type="text"
                  required
                  placeholder="Facility or Business Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                  Contact Name *
                </label>
                <input
                  id="emergency-contact-name-input"
                  type="text"
                  required
                  placeholder="Your Name & Title"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                  Direct Phone (Required for Dispatch) *
                </label>
                <input
                  id="emergency-phone-input"
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
                  id="emergency-email-input"
                  type="email"
                  required
                  placeholder="facility@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                Description of Emergency / Water Intrusion Area
              </label>
              <textarea
                id="emergency-description-textarea"
                rows={3}
                placeholder="Where is water penetrating? Any equipment or inventory at immediate risk?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Photos upload */}
            <div>
              <label className="block text-xs font-mono-crd uppercase tracking-wider text-slate-300 mb-1">
                Upload Emergency Photos (Roof or Interior Water Damage)
              </label>
              <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-slate-500 transition-colors bg-slate-900/50">
                <input
                  id="emergency-photo-file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="emergency-photo-file-input" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-amber-400 font-semibold">Click to select photos</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, HEIC up to 15MB each</span>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((p) => (
                    <div key={p.id} className="relative group w-16 h-16 rounded overflow-hidden border border-slate-700">
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                id="emergency-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-500 text-white font-heading font-black text-sm uppercase tracking-wider px-6 py-2.5 rounded shadow-lg shadow-red-600/30 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Dispatching...' : 'Submit Emergency Alert'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
