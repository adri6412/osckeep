import React, { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from './api';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import { FaBars, FaSearch, FaRedo, FaList, FaCog } from 'react-icons/fa';

function App() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);

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
    <div className="min-h-screen bg-keep-bg text-keep-text font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-keep-border bg-keep-bg flex items-center px-4 z-50">
        <div className="flex items-center gap-4 w-64">
          <button className="p-3 rounded-full hover:bg-keep-hover"><FaBars /></button>
          <div className="flex items-center gap-2">
            <img src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png" alt="Keep" className="h-10 w-10" />
            <span className="text-xl text-gray-300">OscKeep</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500 group-focus-within:text-white" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-10 pr-3 py-3 bg-gray-700 border-transparent rounded-lg leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition duration-150 ease-in-out"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-64 justify-end">
          <button className="p-3 rounded-full hover:bg-keep-hover"><FaRedo /></button>
          <button className="p-3 rounded-full hover:bg-keep-hover"><FaList /></button>
          <button className="p-3 rounded-full hover:bg-keep-hover"><FaCog /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 md:px-12 lg:px-32">
        <NoteEditor onSave={handleSaveNote} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDeleteNote}
              onEdit={setEditingNote}
            />
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

export default App;
