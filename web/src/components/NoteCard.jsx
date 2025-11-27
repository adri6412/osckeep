import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';

const NoteCard = ({ note, onDelete, onEdit }) => {
    return (
        <div
            className="rounded-lg border border-keep-border p-4 hover:shadow-md transition-shadow group relative"
            style={{ backgroundColor: note.color || '#202124' }}
        >
            <div className="mb-2">
                <h3 className="text-lg font-medium text-keep-text">{note.title}</h3>
            </div>
            <div className="mb-8">
                <p className="text-sm text-keep-text whitespace-pre-wrap">{note.content}</p>
            </div>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={() => onEdit(note)}
                    className="p-2 rounded-full hover:bg-keep-hover text-keep-text"
                >
                    <FaEdit />
                </button>
                <button
                    onClick={() => onDelete(note.id)}
                    className="p-2 rounded-full hover:bg-keep-hover text-keep-text"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default NoteCard;
