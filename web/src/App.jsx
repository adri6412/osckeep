import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getNotes, createNote, updateNote, deleteNote } from './api';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider, useAuth } from './AuthContext';
import { FaBars, FaSearch, FaLightbulb, FaRegBell, FaArchive, FaTrash, FaCog, FaSignOutAlt, FaUserShield } from 'react-icons/fa';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function Home() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await getNotes();
      setNotes(response.data.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleSaveNote = async (note) => {
    try {
      if (note.id) {
        await updateNote(note.id, note);
      } else {
        await createNote(note);
      }
      fetchNotes();
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-keep-bg text-keep-text font-sans flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-keep-bg/90 backdrop-blur-md border-b border-keep-border flex items-center px-4 z-50 transition-all duration-300">
        <div className="flex items-center gap-4 w-64">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 rounded-full hover:bg-keep-hover transition-colors"
          >
            <FaBars className="text-keep-muted" />
          </button>
          <div className="flex items-center gap-2 select-none">
            <div className="bg-yellow-500 p-1.5 rounded-lg">
              <FaLightbulb className="text-keep-bg text-lg" />
            </div>
            <span className="text-xl font-semibold text-keep-text tracking-tight">OscKeep</span>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto px-4">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-keep-muted group-focus-within:text-keep-text transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-11 pr-4 py-3 bg-keep-sidebar border border-transparent focus:border-keep-border rounded-xl leading-5 text-keep-text placeholder-keep-muted focus:outline-none focus:bg-keep-card focus:shadow-lg transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-64 justify-end">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="p-3 rounded-full hover:bg-keep-hover transition-colors text-blue-400" title="Admin Dashboard">
              <FaUserShield />
            </button>
          )}
          <button onClick={logout} className="p-3 rounded-full hover:bg-keep-hover transition-colors text-red-400" title="Logout">
            <FaSignOutAlt />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 ml-2 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0].toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-keep-bg transition-transform duration-300 ease-in-out z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <nav className="p-2 space-y-1">
            <SidebarItem icon={<FaLightbulb />} label="Notes" active />
            <SidebarItem icon={<FaRegBell />} label="Reminders" />
            <SidebarItem icon={<FaArchive />} label="Archive" />
            <SidebarItem icon={<FaTrash />} label="Trash" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-6xl mx-auto">
            <NoteEditor onSave={handleSaveNote} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 auto-rows-max">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onEdit={setEditingNote}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <NoteEditor
            initialNote={editingNote}
            onSave={handleSaveNote}
            onClose={() => setEditingNote(null)}
          />
        </div>
      )}
    </div>
  );
}

const SidebarItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 px-6 py-3 rounded-r-full cursor-pointer transition-colors ${active ? 'bg-keep-hover text-keep-text font-medium' : 'text-keep-muted hover:bg-keep-hover hover:text-keep-text'}`}>
    <span className="text-lg">{icon}</span>
    <span className="text-sm tracking-wide">{label}</span>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
