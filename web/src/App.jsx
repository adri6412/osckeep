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
      <header className="fixed top-0 left-0 right-0 h-16 md:h-14 bg-keep-bg/90 backdrop-blur-md border-b border-keep-border flex items-center px-2 md:px-4 z-50 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-4 w-auto md:w-64">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 md:p-3 rounded-full hover:bg-keep-hover transition-colors"
          >
            <FaBars className="text-keep-muted text-lg md:text-base" />
          </button>
          <div className="flex items-center gap-2 select-none">
            <div className="bg-yellow-500 p-1.5 md:p-1 rounded-lg">
              <FaLightbulb className="text-keep-bg text-lg md:text-base" />
            </div>
            <span className="text-lg md:text-xl font-semibold text-keep-text tracking-tight hidden sm:inline">OscKeep</span>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto px-2 md:px-4">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-keep-muted group-focus-within:text-keep-text transition-colors text-lg md:text-base" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-10 md:pl-11 pr-4 py-4 md:py-3 bg-keep-sidebar border border-transparent focus:border-keep-border rounded-xl leading-6 md:leading-5 text-base md:text-sm text-keep-text placeholder-keep-muted focus:outline-none focus:bg-keep-card focus:shadow-lg transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 w-auto md:w-64 justify-end">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="p-2.5 md:p-3 rounded-full hover:bg-keep-hover transition-colors text-blue-400" title="Admin Dashboard">
              <FaUserShield className="text-lg md:text-base" />
            </button>
          )}
          <button onClick={logout} className="p-2.5 md:p-3 rounded-full hover:bg-keep-hover transition-colors text-red-400" title="Logout">
            <FaSignOutAlt className="text-lg md:text-base" />
          </button>
          <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 ml-1 md:ml-2 flex items-center justify-center text-sm md:text-xs font-bold">
            {user?.username?.[0].toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-keep-bg transition-transform duration-300 ease-in-out z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <nav className="p-2 space-y-1">
            <SidebarItem icon={<FaLightbulb />} label="Notes" active />
            <SidebarItem icon={<FaRegBell />} label="Reminders" />
            <SidebarItem icon={<FaArchive />} label="Archive" />
            <SidebarItem icon={<FaTrash />} label="Trash" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 p-3 md:p-4 lg:p-8 ${isSidebarOpen ? 'md:ml-64 ml-0' : 'ml-0'}`}>
          <div className="max-w-6xl mx-auto w-full">
            <NoteEditor onSave={handleSaveNote} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8 auto-rows-max">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-4">
            <NoteEditor
              initialNote={editingNote}
              onSave={handleSaveNote}
              onClose={() => setEditingNote(null)}
            />
          </div>
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
