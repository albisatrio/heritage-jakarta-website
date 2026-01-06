import { X, MapPin, Tag, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EventDetail {
  id: string;
  uri: string;
  name: string;
  description?: string;
  address?: string;
  types?: string[];
  properties?: Record<string, string[]>;
}

interface EventDetailModalProps {
  eventId: string | null;
  onClose: () => void;
}

export function EventDetailModal({ eventId, onClose }: EventDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EventDetail | null>(null);

  const getDisplayCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'HistoricBuilding': 'Cagar Budaya',
      'LandmarksOrHistoricalBuildings': 'Sejarah',
      'Event': 'Event',
      'Museum': 'Museum'
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      fetch(`http://localhost:5000/api/data/${eventId}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch details", err);
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900 pr-8">
              {loading ? 'Loading...' : data?.name}
            </h2>
            {!loading && data?.types && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(new Set(data.types.map(type => getDisplayCategory(type)))).map((displayType, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {displayType}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-neutral-100 border-t-yellow-500 animate-spin"></div>
              </div>
              <p className="text-neutral-400 text-sm font-medium">Fetching details...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Description */}
              {data.description && (
                <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-yellow-400 rounded-full opacity-50" />
                  <p className="text-neutral-700 leading-relaxed text-lg">
                    {data.description}
                  </p>
                </div>
              )}

              {/* Info Sections */}
              <div className="grid grid-cols-1 gap-8">
                {data.address && (
                  <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                      <MapPin className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 text-sm mb-1 uppercase tracking-tight">Location / Address</h3>
                      <p className="text-neutral-600 leading-snug">{data.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Properties */}
              {data.properties && (
                <div className="mt-8 pt-8 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-neutral-100 rounded-md">
                      <Info className="w-4 h-4 text-neutral-600" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Metadata Info</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs font-mono bg-neutral-50 p-5 rounded-xl border border-neutral-100">
                    {Object.entries(data.properties).map(([key, values]) => {
                      const label = key.split('/').pop()?.split('#').pop() || key;
                      // Skip redundant top-level info
                      if (['comment', 'address', 'type', 'label'].includes(label.toLowerCase())) return null;

                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:gap-3 py-1 border-b border-neutral-200/50 last:border-0">
                          <span className="font-bold text-neutral-500 sm:w-1/3 truncate">{label}:</span>
                          <span className="text-neutral-800 break-words flex-1">{values.map(v => v.split('/').pop()).join(', ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-neutral-900 font-bold">Failed to load details</p>
              <p className="text-neutral-500 text-sm mt-1">Please try again later or check your connection.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-medium italic">
            ID: {data?.id || eventId}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95 text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
