import React, { useState, useRef } from 'react';
import { api } from '../../lib/api.ts';
import type { Photo, RoofArea } from '../../../shared/types/index.ts';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface PhotoCaptureUploaderProps {
  propertyId: string;
  inspectionId?: string;
  projectId?: string;
  photos: Photo[];
  onPhotoUploaded: (photo: Photo) => void;
  onPhotoDeleted?: (photoId: string) => void;
}

export const PhotoCaptureUploader: React.FC<PhotoCaptureUploaderProps> = ({
  propertyId,
  inspectionId,
  projectId,
  photos,
  onPhotoUploaded,
  onPhotoDeleted,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState<string>('OVERVIEW');
  const [area, setArea] = useState<RoofArea>('SOUTH_SLOPE');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'CUSTOMER_PORTAL'>('PRIVATE');
  const [previewModalPhoto, setPreviewModalPhoto] = useState<Photo | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated list of realistic field photo assets for instant field testing
  const samplePhotoAssets = [
    {
      url: '/assets/images/new_roof_install.jpg',
      label: 'South Roof Plane Overview (Architectural Shingles)',
      cat: 'OVERVIEW',
      ar: 'SOUTH_SLOPE',
    },
    {
      url: '/assets/images/pipe_boot_roof.jpg',
      label: 'Plumbing Soil Stack Boot Detail (Gasket Check)',
      cat: 'PIPE_BOOT',
      ar: 'WEST_SLOPE',
    },
    {
      url: '/assets/images/chimney_flashing_roof.jpg',
      label: 'Chimney Step & Counter-Flashing Intersection',
      cat: 'FLASHING',
      ar: 'CHIMNEY',
    },
    {
      url: '/assets/images/hail_damage_shingles.jpg',
      label: 'Hail Impact Bruise 10x10 Chalk Test Square',
      cat: 'SHINGLE',
      ar: 'NORTH_SLOPE',
    },
    {
      url: '/assets/images/wind_damage_shingles.jpg',
      label: 'Wind Uplift Horizontal Crease Observation',
      cat: 'SHINGLE',
      ar: 'EAST_SLOPE',
    },
    {
      url: '/assets/images/valley_flashing_roof.jpg',
      label: 'Valley Metal Flashing Drainage Inspection',
      cat: 'VALLEY',
      ar: 'VALLEY',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const photoDataUrl = reader.result as string;
        try {
          const photo = await api.uploadPhoto({
            propertyId,
            inspectionId,
            projectId,
            photoUrl: photoDataUrl,
            category,
            area,
            description: description || `Field photo: ${category}`,
            visibility,
          });

          onPhotoUploaded(photo);
          setDescription('');
          setStatusMessage('Photo uploaded and registered with privacy metadata.');
        } catch (uploadErr) {
          console.error('Photo API upload error:', uploadErr);
          setStatusMessage('Failed to upload photo to server.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading failed:', err);
      setIsUploading(false);
      setStatusMessage('Failed to read image file.');
    }
  };

  const handleAddSamplePhoto = async (sample: typeof samplePhotoAssets[0]) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const photo = await api.uploadPhoto({
        propertyId,
        inspectionId,
        projectId,
        photoUrl: sample.url,
        category: sample.cat,
        area: sample.ar as any,
        description: sample.label,
        visibility: 'PRIVATE',
      });
      onPhotoUploaded(photo);
      setStatusMessage(`Attached test sample: ${sample.cat}`);
    } catch (err) {
      console.error('Failed to attach sample photo:', err);
      setStatusMessage('Error attaching photo sample.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-500 shrink-0" />
            <h3 className="font-bold text-sm text-white">Diagnostic Photo Records</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tagged by roof plane, category, and privacy level. Private by default.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-red-400 font-mono">
            {photos.length}
          </span>
          <span className="text-[10px] text-slate-400 block">Photos Logged</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Upload Controls & Metadata Selectors */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Inspection Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
            >
              <option value="OVERVIEW">Overview / Elevation</option>
              <option value="DAMAGE_HAIL">Hail Impact Test Square</option>
              <option value="DAMAGE_WIND">Wind Crease / Lifted Tab</option>
              <option value="FLASHING">Chimney / Valley Flashing</option>
              <option value="PIPE_BOOT">Plumbing Pipe Boot Collar</option>
              <option value="ATTIC">Attic Decking / Underside</option>
              <option value="DECKING">Spongy Decking Exterior</option>
              <option value="COMPLETED_WORK">Completed Repair Work</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Plane / Location:
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
            >
              <option value="SOUTH_SLOPE">South Slope</option>
              <option value="NORTH_SLOPE">North Slope</option>
              <option value="EAST_SLOPE">East Slope</option>
              <option value="WEST_SLOPE">West Slope</option>
              <option value="FRONT_VALLEY">Front Valley</option>
              <option value="REAR_RIDGE">Main Ridge Line</option>
              <option value="CHIMNEY">Chimney Saddle</option>
              <option value="EAVES">Eave Perimeter</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Privacy Visibility:
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
            >
              <option value="PRIVATE">Private (Staff Internal Only)</option>
              <option value="CUSTOMER_PORTAL">Customer Portal Visible</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Photo Caption / Context:
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. South valley flashing seal failure, active water wicking"
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Upload Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Take or Choose Photo'}</span>
          </button>

          {/* Quick-add sample photos for rapid field testing */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Quick Test Samples:</span>
            {samplePhotoAssets.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSamplePhoto(s)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] cursor-pointer transition-colors"
              >
                +{s.cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-2">
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No Inspection Photos Captured Yet</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Take photos of roof planes, test squares, flashing details, and attic underside. All images are securely stored.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => {
            const isPrivate = photo.visibility !== 'CUSTOMER_PORTAL';

            return (
              <div
                key={photo.id}
                className="group relative bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xs hover:border-slate-700 transition-all flex flex-col"
              >
                <div
                  className="h-32 w-full overflow-hidden bg-slate-900 cursor-pointer relative"
                  onClick={() => setPreviewModalPhoto(photo)}
                >
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || photo.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Privacy Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 shadow-sm ${
                        isPrivate
                          ? 'bg-slate-900/90 text-slate-300 border border-slate-700'
                          : 'bg-emerald-900/90 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      {isPrivate ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                      <span>{isPrivate ? 'Private' : 'Portal'}</span>
                    </span>
                  </div>

                  {/* AI Status tag (Honest, strictly no faking) */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-slate-400 font-mono">
                      AI: {photo.aiAnalysisStatus || 'NOT_CONFIGURED'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 space-y-1 text-xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span className="truncate">{photo.category.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {photo.area?.replace('_', ' ') || 'ROOF'}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
                        {photo.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
                    <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                    {onPhotoDeleted && (
                      <button
                        type="button"
                        onClick={() => onPhotoDeleted(photo.id)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Zoom Modal */}
      {previewModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                {previewModalPhoto.category.replace('_', ' ')} &mdash; {previewModalPhoto.area || 'Roof Plane'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalPhoto(null)}
                className="text-slate-400 hover:text-white font-bold px-2 py-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={previewModalPhoto.photoUrl}
                alt={previewModalPhoto.caption || 'Inspection detail'}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-xs space-y-1 text-slate-300 pt-1">
              <p className="font-medium text-white">{previewModalPhoto.description || 'No caption entered.'}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                <span>Privacy: {previewModalPhoto.visibility || 'PRIVATE'}</span>
                <span>AI Screening: {previewModalPhoto.aiAnalysisStatus || 'NOT_CONFIGURED'}</span>
                <span>Photo ID: {previewModalPhoto.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
