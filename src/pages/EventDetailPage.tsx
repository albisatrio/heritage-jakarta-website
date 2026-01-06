import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, Info, Calendar } from 'lucide-react';

interface EventDetail {
  id: string;
  uri: string;
  name: string;
  description?: string;
  address?: string;
  types?: string[];
  properties?: Record<string, string[]>;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
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
    if (id) {
      setLoading(true);
      fetch(`http://localhost:5000/api/data/${id}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch details", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading heritage details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">Event not found.</p>
          <Link to="/" className="text-yellow-600 hover:text-yellow-700 font-medium">
            ← Back to Heritage Jakarta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Heritage Jakarta
          </Link>
          <h1 className="text-2xl font-bold text-yellow-400">{data.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Description */}
              {data.description && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">About</h2>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <p className="text-neutral-700 leading-relaxed text-lg">
                      {data.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-lg mb-2">Location</h3>
                      <p className="text-neutral-600">{data.address}</p>
                    </div>
                  </div>
                )}

                {data.types && data.types.length > 0 && (
                  <div className="flex items-start gap-4">
                    <Tag className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-lg mb-2">Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(data.types.map(type => getDisplayCategory(type)))).map((displayType, idx) => (
                          <span key={idx} className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                            {displayType}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Properties */}
              {data.properties && Object.keys(data.properties).length > 0 && (
                <div className="pt-8 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Info className="w-5 h-5 text-neutral-400" />
                    <h3 className="text-lg font-semibold text-neutral-900">Additional Details</h3>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {Object.entries(data.properties).map(([key, values]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:gap-4">
                          <span className="font-semibold text-neutral-700 shrink-0 min-w-0 break-words">
                            {key.split('/').pop()?.split('#').pop()}:
                          </span>
                          <span className="text-neutral-600 break-words">{values.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}