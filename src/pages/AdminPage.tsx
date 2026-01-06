import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Trash2, Plus, LogOut, Calendar, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  description: string;
  address: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({ name: '', description: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const checkLogin = async () => {
      // For simplicity, we'll check session on backend, but since it's session-based,
      // we might need to handle it differently. For now, assume not logged in initially.
    };
    checkLogin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        fetchEvents();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/admin/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setEvents([]);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      setError('Failed to fetch events');
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
      });

      if (response.ok) {
        setNewEvent({ name: '', description: '', address: '' });
        fetchEvents();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add event');
      }
    } catch (err) {
      setError('Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEvents();
      } else {
        setError('Failed to delete event');
      }
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-neutral-900 text-white py-6 px-4 shadow-lg mb-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-yellow-400 text-xl font-bold leading-none">HERITAGE</h1>
                <span className="text-neutral-400 text-xs tracking-widest">JAKARTA</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center px-4">
          <Card className="w-full max-w-md shadow-xl border-neutral-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-900">Admin Access</CardTitle>
              <p className="text-neutral-500 text-sm">Please sign in to manage heritage data</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-neutral-300 focus:ring-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-neutral-300 focus:ring-yellow-500"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-6">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
                <Link to="/" className="flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm transition-colors pt-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Public Site
                </Link>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-900 text-white py-6 px-4 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-yellow-400 text-xl font-bold leading-none">HERITAGE</h1>
              <span className="text-neutral-400 text-xs tracking-widest">JAKARTA</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400 text-sm hidden sm:inline">Admin Mode</span>
            <Button onClick={handleLogout} variant="outline" className="text-white border-neutral-700 hover:bg-neutral-800">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-neutral-900">Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Event Form */}
          <Card className="lg:col-span-1 border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-600" />
                Add New Heritage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Name</label>
                  <Input
                    placeholder="e.g. Museum Fatahillah"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <Textarea
                    placeholder="Enter detailed description..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Address</label>
                  <Input
                    placeholder="Street address, City"
                    value={newEvent.address}
                    onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-bold">
                  {loading ? 'Adding...' : 'Add Resource'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="lg:col-span-2 border-neutral-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Manage Resources</CardTitle>
              <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-medium">
                {events.length} Items
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="group flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-yellow-200 hover:bg-yellow-50/30 transition-all">
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900">{event.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-1">{event.description || 'No description provided'}</p>
                      {event.address && (
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                          {event.address}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteEvent(event.id)}
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <LayoutDashboard className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium">No resources found.</p>
                    <p className="text-neutral-400 text-sm">Add your first heritage resource using the form.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}