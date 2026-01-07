import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import {
  Trash2,
  Plus,
  LogOut,
  Calendar,
  LayoutDashboard,
  ArrowLeft,
  Search,
  Settings,
  Users,
  MapPin,
  History,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({ name: '', type: 'Event', description: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(true);
        fetchEvents();
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggedIn(false);
      setEvents([]);
    }
  };

  const fetchEvents = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/events', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setSuccess('Data refreshed successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to fetch resources' }));
        setError(data.error || 'Failed to fetch resources');
      }
    } catch (err) {
      setError('Connection error: Make sure the backend is running on port 5000');
    } finally {
      setFetching(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
        credentials: 'include',
      });

      if (response.ok) {
        setNewEvent({ name: '', type: 'Event', description: '', address: '' });
        setIsAddModalOpen(false);
        setSuccess('Resource added successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchEvents();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add resource');
      }
    } catch (err) {
      setError('Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Resource deleted');
        setTimeout(() => setSuccess(''), 3000);
        fetchEvents();
      } else {
        setError('Failed to delete resource');
      }
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getRandomImage = (id: string, type: string) => {
    const images: Record<string, string[]> = {
      'Museum': [
        'https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=600&auto=format&fit=crop'
      ],
      'Event': [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop'
      ],
      'HistoricBuilding': [
        'https://images.unsplash.com/photo-1596422846543-75c6fc18a5ce?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=600&auto=format&fit=crop'
      ],
      'LandmarksOrHistoricalBuildings': [
        'https://images.unsplash.com/photo-1590059132213-9ec3484f971b?w=600&auto=format&fit=crop'
      ]
    };
    const collection = images[type] || images['Event'];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % collection.length;
    return collection[index];
  };

  const AdminHeader = () => (
    <header className="bg-neutral-900 text-white py-6 px-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Calendar className="w-10 h-10 text-yellow-400 transition-transform group-hover:scale-110" />
          <div>
            <h1 className="text-yellow-400 text-xl font-black leading-none tracking-tight">HERITAGE</h1>
            <span className="text-neutral-400 text-xs tracking-[0.2em] font-medium uppercase">JAKARTA</span>
          </div>
        </Link>
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-neutral-400 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              Admin Portal
            </span>
            <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/10 gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl overflow-hidden bg-white">
              <div className="bg-yellow-400 h-2 w-full"></div>
              <CardHeader className="text-center pt-10 pb-6">
                <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neutral-100 shadow-sm">
                  <Settings className="w-10 h-10 text-neutral-900" />
                </div>
                <CardTitle className="text-3xl font-bold text-neutral-900">Admin Access</CardTitle>
                <CardDescription className="text-neutral-500">Enter your credentials to manage records</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-12">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Username</label>
                      <Input
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-neutral-50 border-neutral-200 h-12 rounded-xl focus:ring-yellow-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-neutral-50 border-neutral-200 h-12 rounded-xl focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-14 rounded-xl shadow-lg">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In Now'}
                  </Button>
                  <Link to="/" className="flex items-center justify-center gap-2 text-neutral-400 hover:text-neutral-900 text-sm transition-colors pt-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Public Site
                  </Link>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="py-8 text-center text-neutral-400 text-xs">
          &copy; 2026 Heritage Jakarta Portal. Administrator Dashboard.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <AdminHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-700 text-[10px] font-bold uppercase tracking-wider mb-4 border border-yellow-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              Live Database
            </div>
            <h2 className="text-4xl font-black text-neutral-900 tracking-tight leading-tight">Administrative Dashboard</h2>
            <p className="text-neutral-500 mt-2 max-w-lg">Easily manage, verify, and monitor historic heritage records. All changes reflect instantly on the public site.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchEvents}
              disabled={fetching}
              variant="outline"
              className="bg-white border-neutral-200 hover:bg-neutral-50 rounded-2xl px-5 h-12 font-bold group shadow-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 text-neutral-500 group-hover:text-neutral-900 transition-transform ${fetching ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-black rounded-2xl px-6 h-12 shadow-xl shadow-yellow-400/20 active:scale-95 transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-3xl p-0 overflow-hidden rounded-3xl">
                <div className="bg-neutral-900 px-8 py-10 text-white relative">
                  <DialogHeader>
                    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-neutral-900" />
                    </div>
                    <DialogTitle className="text-3xl font-bold">New Registry Item</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                      Fill in the details to add a new historic landmark or event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                </div>

                <form onSubmit={handleAddEvent} className="p-8 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Resource Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 h-12 rounded-xl px-4 focus:ring-yellow-400 focus:outline-none font-bold text-sm"
                    >
                      <option value="Event">Event</option>
                      <option value="Museum">Museum</option>
                      <option value="HistoricBuilding">Historic Building</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Entity Name</label>
                    <Input
                      placeholder="e.g. Museum Bahari"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      required
                      className="bg-neutral-50 border-neutral-200 h-12 rounded-xl focus:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Detailed Description</label>
                    <Textarea
                      placeholder="A historical overview of this resource..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={4}
                      className="bg-neutral-50 border-neutral-200 rounded-xl focus:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        placeholder="Location in Jakarta..."
                        value={newEvent.address}
                        onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                        className="bg-neutral-50 border-neutral-200 h-12 rounded-xl pl-11 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-6 sm:justify-start">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-12 px-10 rounded-xl">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Heritage'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-neutral-500 font-medium">Cancel</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Action Notifications */}
        {success && (
          <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="font-bold text-sm tracking-tight">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-bold text-sm tracking-tight">{error}</p>
            </div>
          </div>
        )}

        {/* Stats & Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-end">
          <Card className="border-none shadow-md bg-white rounded-3xl p-1 overflow-hidden relative lg:col-span-1 h-32 flex flex-col justify-center">
            <div className="flex items-center gap-4 p-5">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Total Items</p>
                <p className="text-4xl font-black text-neutral-900">{events.length}</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-blue-500/20"></div>
          </Card>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] shadow-xl border border-neutral-100 p-2 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 flex items-center gap-4 px-6 py-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Search Registry</p>
                  <input
                    type="text"
                    placeholder="Search by name, address, type, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none p-0 py-1 text-base font-bold text-neutral-900 focus:outline-none placeholder:text-neutral-300 transition-all"
                  />
                </div>
              </div>
              <div className="hidden md:block h-10 w-px bg-neutral-100"></div>
              <div className="px-6 py-2 flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Database Secure
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Area */}
        {/* Management Area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <ListItemsIcon className="w-5 h-5 text-yellow-600" />
                Heritage Registry
              </h3>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-black">Browse and manage all verified archival records</p>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-xl bg-white border-neutral-200"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <div className="bg-white border border-neutral-200 px-4 h-10 flex items-center justify-center rounded-xl font-black text-xs text-neutral-500 min-w-[80px]">
                  PAGE {currentPage} OF {totalPages}
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-xl bg-white border-neutral-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {paginatedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border border-neutral-100 group flex flex-col relative overflow-hidden h-full">
                {/* Image Section - Smaller height */}
                <div className="relative h-32 overflow-hidden bg-neutral-100">
                  <img
                    src={getRandomImage(event.id, event.type)}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-transparent transition-colors duration-500"></div>

                  {/* Category Badge - Smaller & Better Positioned */}
                  <div className="absolute top-3 left-3 flex gap-1 items-center bg-white/95 backdrop-blur shadow-sm rounded-lg px-2 py-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${event.type === 'HistoricBuilding' ? 'bg-amber-500' :
                      event.type === 'LandmarksOrHistoricalBuildings' ? 'bg-orange-500' :
                        event.type === 'Museum' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}></div>
                    <span className="text-[9px] font-black text-neutral-800 uppercase tracking-tighter">
                      {event.type === 'HistoricBuilding' ? 'Cagar Budaya' :
                        event.type === 'LandmarksOrHistoricalBuildings' ? 'Sejarah' :
                          event.type}
                    </span>
                  </div>

                  {/* Actions - Modern Floating Toggle */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <Button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      variant="destructive"
                      size="icon"
                      className="w-8 h-8 rounded-lg shadow-xl bg-red-600 hover:bg-red-700 border-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Section - Compact Spacing */}
                <div className="p-3 flex-1 flex flex-col bg-white">
                  <div className="mb-2">
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">{event.id}</p>
                    <h3 className="text-sm font-black text-neutral-900 line-clamp-2 leading-tight group-hover:text-yellow-600 transition-colors">
                      {event.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-neutral-500 mb-4 line-clamp-2 leading-relaxed italic">
                    {event.description || 'Arsip cagar budaya sedang dalam verifikasi sistem...'}
                  </p>

                  <div className="mt-auto space-y-2 pt-3 border-t border-neutral-50">
                    <div className="flex items-start gap-2 text-neutral-600 text-[10px] leading-tight">
                      <MapPin className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                      <span className="line-clamp-2 font-medium">{event.address || 'DKI Jakarta'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400 text-[9px] font-black uppercase tracking-widest pt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="opacity-70 text-neutral-500">Verified System Record</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="py-24 text-center bg-white rounded-[3rem] shadow-sm">
              <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-100 text-neutral-200">
                <Search className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-bold text-neutral-900">No matching records</h4>
              <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
                {searchQuery
                  ? `We couldn't find any resource matching "${searchQuery}". Please refine your search.`
                  : 'The heritage database is currently empty. Start by adding a new historic resource.'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-8 bg-neutral-900 text-white rounded-xl px-8 h-12 font-bold"
                >
                  Create First Record
                </Button>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold px-6 h-12 rounded-2xl shadow-sm disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2 text-neutral-500 font-bold items-center">
                  Page <span className="text-neutral-900 font-black ml-1 mr-1">{currentPage}</span> of {totalPages}
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold px-6 h-12 rounded-2xl shadow-sm disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="px-6 py-2 bg-neutral-100/50 rounded-full border border-neutral-200 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  <span className="text-neutral-900">{filteredEvents.length}</span> Total Records Found
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registry Online
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-neutral-900 text-neutral-400 py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4 grayscale opacity-50">
            <Calendar className="w-6 h-6 text-yellow-400" />
            <h4 className="text-white text-sm font-bold tracking-tight">HERITAGE JAKARTA</h4>
          </div>
          <p className="text-xs">Secure Admin Access Portal • &copy; 2026 Jakarta IT Solutions</p>
        </div>
      </footer>
    </div>
  );
}

// Helper icon component
function ListItemsIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}