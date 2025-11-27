import React from 'react';
import { FaTrash, FaEdit, FaPalette, FaImage, FaArchive, FaRegBell, FaUndo } from 'react-icons/fa';

const NoteCard = ({ note, onDelete, onEdit, onArchive, onUnarchive, onRestore, activeSection }) => {
    const formatReminderDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            className="group relative bg-keep-card rounded-2xl border border-keep-border p-5 hover:shadow-xl hover:border-keep-muted transition-all duration-300 flex flex-col h-full"
            style={{ backgroundColor: note.color !== '#ffffff' ? note.color : undefined }}
        >
            {note.reminder_date && (
                <div className="mb-2 flex items-center gap-2 text-xs text-keep-muted">
                    <FaRegBell className="text-yellow-400" />
                    <span>{formatReminderDate(note.reminder_date)}</span>
                </div>
            )}
            {note.title && (
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-keep-text tracking-tight leading-snug">{note.title}</h3>
                </div>
            )}
            <div className="flex-1 mb-4">
                <p className="text-base text-keep-text/90 whitespace-pre-wrap leading-relaxed font-light">{note.content}</p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-between mt-auto pt-2 border-t border-transparent group-hover:border-white/10">
                <div className="flex gap-1">
                    {activeSection === 'trash' ? (
                        <IconButton icon={<FaUndo />} onClick={() => onRestore(note.id)} title="Restore" />
                    ) : activeSection === 'archive' ? (
                        <IconButton icon={<FaUndo />} onClick={() => onUnarchive(note.id)} title="Unarchive" />
                    ) : (
                        <>
                            <IconButton icon={<FaPalette />} />
                            <IconButton icon={<FaImage />} />
                            <IconButton icon={<FaArchive />} onClick={() => onArchive(note.id)} title="Archive" />
                        </>
                    )}
                </div>
                <div className="flex gap-1">
                    {activeSection !== 'trash' && (
                        <IconButton icon={<FaEdit />} onClick={() => onEdit(note)} title="Edit" />
                    )}
                    <IconButton 
                        icon={<FaTrash />} 
                        onClick={() => onDelete(note.id)} 
                        title={activeSection === 'trash' ? 'Delete permanently' : 'Move to trash'} 
                    />
                </div>
            </div>
        </div>
    );
};

const IconButton = ({ icon, onClick, title }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
        }}
        className="p-2 rounded-full hover:bg-black/20 text-keep-text/70 hover:text-keep-text transition-colors"
        title={title}
    >
        {icon}
    </button>
);

export default NoteCard;
