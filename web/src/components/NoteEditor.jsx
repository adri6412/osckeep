import React, { useState, useEffect, useRef } from 'react';
import { FaPalette, FaImage, FaArchive, FaUndo, FaRedo, FaCheck } from 'react-icons/fa';

const NoteEditor = ({ onSave, onClose, initialNote }) => {
    const [title, setTitle] = useState(initialNote?.title || '');
    const [content, setContent] = useState(initialNote?.content || '');
    const [color, setColor] = useState(initialNote?.color || '#1e293b');
    const [isExpanded, setIsExpanded] = useState(!!initialNote);
    const wrapperRef = useRef(null);

    // Premium Dark Mode Palette
    const colors = [
        '#1e293b', // Default Slate
        '#77172e', // Red
        '#692b17', // Orange
        '#7c4a03', // Yellow
        '#264d3b', // Green
        '#0c625d', // Teal
        '#256377', // Blue
        '#284255', // Dark Blue
        '#472e5b', // Purple
        '#6c394f', // Pink
        '#4b443a', // Brown
        '#3c3f43', // Gray
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (isExpanded && !initialNote) {
                    handleClose();
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded, title, content, color]);

    const handleClose = () => {
        if (title.trim() || content.trim()) {
            onSave({ title, content, color, id: initialNote?.id });
        }
        if (!initialNote) {
            setIsExpanded(false);
            setTitle('');
            setContent('');
            setColor('#1e293b');
        }
        if (onClose) onClose();
    };

    return (
        <div ref={wrapperRef} className="w-full max-w-2xl mx-auto mb-10 transition-all duration-300">
            {!isExpanded ? (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="bg-keep-card border border-keep-border rounded-xl shadow-lg p-4 text-keep-muted cursor-text flex justify-between items-center hover:shadow-xl transition-shadow"
                >
                    <span className="font-medium text-lg">Take a note...</span>
                    <div className="flex gap-4 text-2xl">
                        <FaCheck className="opacity-50" />
                        <FaImage className="opacity-50" />
                    </div>
                </div>
            ) : (
                <div
                    className="bg-keep-card border border-keep-border rounded-xl shadow-2xl p-4 relative transition-colors duration-300"
                    style={{ backgroundColor: color !== '#1e293b' ? color : undefined }}
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-xl font-bold placeholder-keep-muted/70 outline-none mb-3"
                    />
                    <textarea
                        placeholder="Take a note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-base placeholder-keep-muted/70 outline-none resize-none min-h-[120px] leading-relaxed"
                    />

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/10">
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-white' : ''}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 text-sm font-semibold text-keep-bg bg-keep-text hover:bg-white rounded-lg transition-colors shadow-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
