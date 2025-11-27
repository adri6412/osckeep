import React from 'react';
import { FaTrash, FaEdit, FaPalette, FaImage, FaArchive } from 'react-icons/fa';

const NoteCard = ({ note, onDelete, onEdit }) => {
    return (
        <div
            className="group relative bg-keep-card rounded-2xl border border-keep-border p-5 hover:shadow-xl hover:border-keep-muted transition-all duration-300 flex flex-col h-full"
            style={{ backgroundColor: note.color !== '#ffffff' ? note.color : undefined }}
        >
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
                    <IconButton icon={<FaPalette />} />
                    <IconButton icon={<FaImage />} />
                    <IconButton icon={<FaArchive />} />
                </div>
                <div className="flex gap-1">
                    <IconButton icon={<FaEdit />} onClick={() => onEdit(note)} />
                    <IconButton icon={<FaTrash />} onClick={() => onDelete(note.id)} />
                </div>
            </div>
        </div>
    );
};

const IconButton = ({ icon, onClick }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
        }}
        className="p-2 rounded-full hover:bg-black/20 text-keep-text/70 hover:text-keep-text transition-colors"
    >
        {icon}
    </button>
);

export default NoteCard;
