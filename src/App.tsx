import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { EventCard, Event } from './components/EventCard';
import { EventDetailPage } from './pages/EventDetailPage';
import AdminPage from './pages/AdminPage';
import { Calendar, TrendingUp } from 'lucide-react';

const categories = ['All', 'Event', 'HistoricBuilding', 'Museum', 'LandmarksOrHistoricalBuildings'];

const getDisplayCategory = (category: string) => {
  const categoryMap: Record<string, string> = {
    'HistoricBuilding': 'Cagar Budaya',
    'LandmarksOrHistoricalBuildings': 'Sejarah',
    'Event': 'Event',
    'Museum': 'Museum',
    'All': 'All'
  };
  return categoryMap[category] || category;
};

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        // Map API data to Event interface
        const mappedEvents: Event[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          types: item.types || [],
          description: item.description,
          address: item.address,
          // Default values for missing fields to keep UI working
          date: new Date().toISOString(),
          endDate: new Date().toISOString(),
          image: '',
          rating: 0,
          price: 'Free',
          source: 'heritage.jakarta.go.id',
          attendees: '-'
        }));
        setEvents(mappedEvents);
        setFilteredEvents(mappedEvents);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterEvents(searchQuery, selectedCategory, sortBy);
  }, [events, searchQuery, selectedCategory, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const filterEvents = (query: string, category: string, sort: string) => {
    let filtered = events;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(query.toLowerCase()) ||
        (event.address && event.address.toLowerCase().includes(query.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(event => event.types.includes(category));
    }

    // Sort events
    if (sort === 'date') {
      // Date sorting might not be effective as we don't have real dates yet
      // filtered = [...filtered].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    } else if (sort === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-yellow-400" />
              <h1 className="text-yellow-400">HERITAGE</h1>
              <span className="text-neutral-400 text-sm">JAKARTA</span>
            </div>
            <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              Admin
            </Link>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <h2 className="text-neutral-900">Explore Heritage</h2>
            <span className="text-neutral-500 text-sm">({filteredEvents.length} items)</span>
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          categories={categories.map(cat => getDisplayCategory(cat))}
          selectedCategory={getDisplayCategory(selectedCategory)}
          onCategoryChange={(displayCategory) => {
            const reverseMap: Record<string, string> = {
              'Cagar Budaya': 'HistoricBuilding',
              'Sejarah': 'LandmarksOrHistoricalBuildings',
              'Event': 'Event',
              'Museum': 'Museum',
              'All': 'All'
            };
            setSelectedCategory(reverseMap[displayCategory] || displayCategory);
          }}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading heritage data...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">No items found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">Heritage Jakarta - Discover the City's History</p>
          <p className="text-xs mt-2">Data provided by Jakarta Smart City</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}