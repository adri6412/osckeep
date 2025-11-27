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
        <div ref={wrapperRef} className="w-full max-w-2xl mx-auto mb-[clamp(1.5rem,3vw,2.5rem)] transition-all duration-300 px-[clamp(0.5rem,2vw,1rem)]">
            {!isExpanded ? (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="bg-keep-card border border-keep-border rounded-xl shadow-lg p-[clamp(1rem,2.5vw,1.25rem)] text-keep-muted cursor-text flex justify-between items-center hover:shadow-xl transition-shadow"
                >
                    <span className="font-medium text-[clamp(1rem,1.5vw,1.125rem)]">Take a note...</span>
                    <div className="flex gap-[clamp(1rem,2vw,1.5rem)] text-[clamp(1.25rem,2vw,1.5rem)]">
                        <FaCheck className="opacity-50" />
                        <FaImage className="opacity-50" />
                    </div>
                </div>
            ) : (
                <div
                    className="bg-keep-card border border-keep-border rounded-xl shadow-2xl p-[clamp(1rem,2.5vw,1.25rem)] relative transition-colors duration-300"
                    style={{ backgroundColor: color !== '#1e293b' ? color : undefined }}
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-[clamp(1.125rem,1.75vw,1.5rem)] font-bold placeholder-keep-muted/70 outline-none mb-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.25rem,0.5vw,0.5rem)]"
                    />
                    <textarea
                        placeholder="Take a note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-[clamp(1rem,1.25vw,1.125rem)] placeholder-keep-muted/70 outline-none resize-none min-h-[clamp(8rem,20vw,12rem)] leading-relaxed py-[clamp(0.5rem,1vw,0.75rem)]"
                    />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[clamp(1rem,2vw,1.5rem)] mt-[clamp(1rem,2vw,1.5rem)] pt-[clamp(0.75rem,1.5vw,1rem)] border-t border-white/10">
                        <div className="flex gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-[clamp(1.75rem,3.5vw,2rem)] h-[clamp(1.75rem,3.5vw,2rem)] rounded-full border border-white/20 hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-white' : ''}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vw,1rem)] text-[clamp(0.875rem,1.25vw,1rem)] font-semibold text-keep-bg bg-keep-text hover:bg-white rounded-lg transition-colors shadow-md w-full sm:w-auto"
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
