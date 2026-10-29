import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import type { Measurement, Property } from '../../../shared/types/index.ts';
import {
  Ruler,
  Satellite,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface MeasurementSatelliteCardProps {
  property?: Property;
  inspectionId?: string;
  projectId?: string;
  measurements: Measurement[];
  onMeasurementRequested?: (meas: Measurement) => void;
}

export const MeasurementSatelliteCard: React.FC<MeasurementSatelliteCardProps> = ({
  property,
  inspectionId,
  projectId,
  measurements,
  onMeasurementRequested,
}) => {
  const [roofrStatus, setRoofrStatus] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      const status = await api.getRoofrStatus();
      setRoofrStatus(status);
    } catch (err) {
      console.warn('ROOFR status check note:', err);
      setRoofrStatus({ connected: false, status: 'NOT_CONFIGURED' });
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.testRoofrConnection();
      setTestResult(res.message || (res.success ? 'Connected successfully.' : 'Integration not connected.'));
      await checkIntegrationStatus();
    } catch (err: any) {
      setTestResult(err.message || 'Connection test failed.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRequestMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?.id) {
      setStatusMessage('Property ID is required to order a measurement.');
      return;
    }

    setRequesting(true);
    setStatusMessage(null);

    try {
      const meas = await api.requestMeasurement(
        property.id,
        'ROOFR',
        orderNotes || 'Standard residential diagnostic roof measurement order.',
        projectId,
        inspectionId
      );
      if (onMeasurementRequested) onMeasurementRequested(meas);
      setShowOrderForm(false);
      setOrderNotes('');
      setStatusMessage('Measurement order dispatched. Status: ' + meas.status);
    } catch (err: any) {
      console.error('Measurement request error:', err);
      setStatusMessage(err.message || 'ROOFR integration is not connected. API key required on server.');
    } finally {
      setRequesting(false);
    }
  };

  const completedMeasurement = measurements.find((m) => m.status === 'COMPLETED');
  const activeMeasurement = completedMeasurement || measurements[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-red-500 shrink-0" />
            <h3 className="font-bold text-sm text-white">Aerial &amp; Satellite Measurements</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ROOFR aerial dimensions engine for precise pitches, squares, ridges, and valleys.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase border ${
              roofrStatus?.connected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}
          >
            ROOFR: {roofrStatus?.status || 'NOT_CONFIGURED'}
          </span>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
            title="Test ROOFR Connection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
          <span className="text-[11px]">{testResult}</span>
          <button
            onClick={() => setTestResult(null)}
            className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Integration Status Notice */}
      {!roofrStatus?.connected && (
        <div className="p-3 bg-slate-950/80 border border-amber-800/80 rounded-xl space-y-1.5 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Zero-Fake Provider Policy: Real API Required</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            The aerial measurement provider is marked <strong className="font-mono text-white">NOT_CONNECTED</strong>.
            Measurement data will not be fabricated. Add <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">ROOFR_API_KEY</code> to the server environment settings to generate automated satellite reports.
          </p>
        </div>
      )}

      {/* Active Measurement Data Display */}
      {activeMeasurement?.normalizedData ? (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {activeMeasurement.provider} Measurement Report
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                {activeMeasurement.provenance || 'VERIFIED_MEASUREMENT'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              v{activeMeasurement.version || 1} &bull; {new Date(activeMeasurement.requestedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Total Squares:</span>
              <span className="text-lg font-bold text-white font-mono">
                {activeMeasurement.normalizedData.totalSquares} SQ
              </span>
              <span className="text-[10px] text-slate-500 block">
                {activeMeasurement.normalizedData.totalAreaSqFt?.toLocaleString() || activeMeasurement.normalizedData.totalSquares * 100} sq ft
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Predominant Pitch:</span>
              <span className="text-lg font-bold text-white font-mono">
                {activeMeasurement.normalizedData.predominantPitch}
              </span>
              <span className="text-[10px] text-slate-500 block">Slope Rating</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Ridges &amp; Hips:</span>
              <span className="text-lg font-bold text-white font-mono">
                {activeMeasurement.normalizedData.ridgesLengthFt} LF
              </span>
              <span className="text-[10px] text-slate-500 block">Linear Feet</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Valleys:</span>
              <span className="text-lg font-bold text-white font-mono">
                {activeMeasurement.normalizedData.valleysLengthFt} LF
              </span>
              <span className="text-[10px] text-slate-500 block">Linear Feet</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Eaves:</span>
              <span className="font-semibold text-white font-mono">{activeMeasurement.normalizedData.eavesLengthFt || 0} LF</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Rakes:</span>
              <span className="font-semibold text-white font-mono">{activeMeasurement.normalizedData.rakesLengthFt || 0} LF</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Step Flashing:</span>
              <span className="font-semibold text-white font-mono">{activeMeasurement.normalizedData.stepFlashingLengthFt || 0} LF</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold">Roof Dimensions Status:</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {property?.roofAreaSqFt
                ? `${(property.roofAreaSqFt / 100).toFixed(1)} SQ (On-file Estimate)`
                : 'Awaiting Satellite Order'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dispatch aerial drone or satellite measurement report to automatically populate line items, flashing cuts, and material square order requirements.
          </p>
        </div>
      )}

      {/* Order ROOFR Measurement Button & Drawer */}
      <div>
        {!showOrderForm ? (
          <button
            type="button"
            onClick={() => setShowOrderForm(true)}
            className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Ruler className="w-4 h-4" />
            <span>Order Satellite Aerial Measurement</span>
          </button>
        ) : (
          <form
            onSubmit={handleRequestMeasurement}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs"
          >
            <div className="font-bold text-white uppercase tracking-wider text-xs">
              Dispatch Measurement Order
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Property Address:
              </label>
              <input
                type="text"
                disabled
                value={property ? `${property.address}, ${property.city} ${property.zip}` : 'No property selected'}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Special Instructions for Drafters / AI:
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Include detached garage, verify rear dormer pitch, etc."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requesting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>{requesting ? 'Dispatching...' : 'Confirm Order'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
