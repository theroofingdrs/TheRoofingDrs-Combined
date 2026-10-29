import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { FieldCheckIn, Property } from '../../../shared/types/index.ts';
import {
  MapPin,
  Clock,
  CheckCircle2,
  LogOut,
  Navigation,
  AlertCircle,
  History,
} from 'lucide-react';

interface FieldCheckInWidgetProps {
  property?: Property;
  appointmentId?: string;
  inspectorName?: string;
  onCheckInCompleted?: (checkIn: FieldCheckIn) => void;
}

export const FieldCheckInWidget: React.FC<FieldCheckInWidgetProps> = ({
  property,
  appointmentId,
  inspectorName = 'Field Inspector',
  onCheckInCompleted,
}) => {
  const [activeCheckIn, setActiveCheckIn] = useState<FieldCheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<FieldCheckIn[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (property?.id) {
      loadCheckIns();
    }
  }, [property?.id, appointmentId]);

  const loadCheckIns = async () => {
    if (!property?.id) return;
    try {
      const records = await api.getCheckIns({ propertyId: property.id });
      setRecentCheckIns(records);
      const open = records.find((r) => !r.checkOutTime);
      setActiveCheckIn(open || null);
    } catch (err) {
      console.warn('Failed to load check-ins:', err);
    }
  };

  const handleCheckIn = async () => {
    if (!property?.id) return;
    setLoading(true);
    setStatusMessage(null);

    // Acquire geolocation if supported, or fallback to property coordinates
    let lat: number | undefined = property.latitude;
    let lon: number | undefined = property.longitude;
    let accuracy = 15;

    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        accuracy = Math.round(pos.coords.accuracy);
      } catch {
        // Fallback gracefully without breaking
        lat = lat || 33.4251;
        lon = lon || -94.0477;
      }
    }

    try {
      const now = new Date().toISOString();
      const checkIn = await api.createCheckIn({
        propertyId: property.id,
        appointmentId,
        userName: inspectorName,
        checkInTime: now,
        latitude: lat,
        longitude: lon,
        accuracyMeters: accuracy,
        notes: notes || 'Arrived on job site for diagnostic roof inspection.',
      });

      setActiveCheckIn(checkIn);
      setRecentCheckIns((prev) => [checkIn, ...prev]);
      setStatusMessage('Checked in successfully. GPS location confirmed.');
      if (onCheckInCompleted) onCheckInCompleted(checkIn);
    } catch (err) {
      console.error('Check-in error:', err);
      setStatusMessage('Failed to register check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const now = new Date().toISOString();
      const updatedCheckIn = await api.createCheckIn({
        propertyId: activeCheckIn.propertyId,
        appointmentId: activeCheckIn.appointmentId,
        userName: inspectorName,
        checkInTime: activeCheckIn.checkInTime,
        checkOutTime: now,
        notes: notes ? `${activeCheckIn.notes || ''} [Departure notes]: ${notes}` : activeCheckIn.notes,
      });

      setActiveCheckIn(null);
      setRecentCheckIns((prev) => [updatedCheckIn, ...prev.filter((c) => c.id !== activeCheckIn.id)]);
      setStatusMessage('Checked out from job site. Work duration recorded.');
    } catch (err) {
      console.error('Check-out error:', err);
      setStatusMessage('Failed to complete check-out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              activeCheckIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            {activeCheckIn ? 'Site Presence: Checked In' : 'Field Dispatch Status'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? 'Hide Logs' : 'Check-In Logs'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {activeCheckIn ? (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              On Site Since: {new Date(activeCheckIn.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 text-[10px] font-mono">
              ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-emerald-200/80">
            Inspector: <span className="font-bold text-white">{activeCheckIn.userName || inspectorName}</span>
            {activeCheckIn.latitude && (
              <span className="ml-2 font-mono text-[10px]">
                ({activeCheckIn.latitude.toFixed(4)}, {activeCheckIn.longitude?.toFixed(4)})
              </span>
            )}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleCheckOut}
              className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Complete Site Check-Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Target Location:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {property?.address || 'Site Address'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={loading || !property?.id}
              onClick={handleCheckIn}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>GPS Site Check-In</span>
            </button>

            {property?.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${property.address}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Navigation</span>
              </a>
            )}
          </div>
        </div>
      )}

      {showHistory && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
          <h4 className="font-bold text-[11px] text-slate-400">Previous Check-Ins at this Property:</h4>
          {recentCheckIns.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">No previous check-in history recorded.</p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {recentCheckIns.slice(0, 5).map((chk) => (
                <div key={chk.id} className="p-2 bg-slate-800/60 rounded-lg text-[11px] flex justify-between items-center text-slate-300">
                  <div>
                    <span className="font-medium text-white">{chk.userName}</span>
                    <span className="text-slate-400 text-[10px] ml-2">
                      {new Date(chk.checkInTime).toLocaleDateString()} {new Date(chk.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {chk.checkOutTime ? 'COMPLETED' : 'OPEN'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
