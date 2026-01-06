import { Calendar, MapPin, Tag, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Event {
  id: string;
  name: string;
  types: string[];
  description: string;
  address: string;
  // Optional fields that might not be in RDF but were in mock
  date?: string;
  endDate?: string;
  image?: string;
  rating?: number;
  price?: string;
  source?: string;
  attendees?: string;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // Helper to get a random image if none provided (since RDF lacks images)
  const getRandomImage = (id: string) => {
    const images = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'
    ];
    // Simple hash to pick consistent image for same ID
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % images.length;
    return images[index];
  };

  const getDisplayCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'HistoricBuilding': 'Cagar Budaya',
      'LandmarksOrHistoricalBuildings': 'Sejarah',
      'Event': 'Event',
      'Museum': 'Museum'
    };
    return categoryMap[category] || category;
  };

  const displayImage = event.image || getRandomImage(event.id);
  const displayCategory = event.types && event.types.length > 0 ? getDisplayCategory(event.types[0]) : 'Event';

  return (
    <Link
      to={`/event/${event.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-neutral-200 group block"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={displayImage}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.rating && (
          <div className="absolute top-3 right-3 bg-neutral-900/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {event.rating}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-yellow-400 text-neutral-900 px-3 py-1 rounded-full text-xs">
          {displayCategory}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-neutral-900 mb-2 line-clamp-1 font-bold">{event.name}</h3>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {event.description || "No description available."}
        </p>

        <div className="space-y-2 mb-4">
          {event.address && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <MapPin className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="truncate">{event.address}</span>
            </div>
          )}

          {event.types && event.types.length > 0 && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <Tag className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="truncate">{Array.from(new Set(event.types.map(type => getDisplayCategory(type)))).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Action Hint */}
        <div className="pt-3 border-t border-neutral-200 flex justify-end items-center">
          <div className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg group-hover:bg-yellow-600 transition-colors flex items-center gap-2">
            Details
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
