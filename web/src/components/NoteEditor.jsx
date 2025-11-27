import React, { useState, useEffect, useRef } from 'react';

const NoteEditor = ({ onSave, onClose, initialNote }) => {
    const [title, setTitle] = useState(initialNote?.title || '');
    const [content, setContent] = useState(initialNote?.content || '');
    const [color, setColor] = useState(initialNote?.color || '#202124');
    const [isExpanded, setIsExpanded] = useState(!!initialNote);
    const wrapperRef = useRef(null);

    const colors = [
        '#202124', // Default
        '#5c2b29', // Red
        '#614a19', // Orange
        '#635d19', // Yellow
        '#345920', // Green
        '#16504b', // Teal
        '#2d555e', // Blue
        '#42275e', // Dark Blue
        '#5b2245', // Purple
        '#442f19', // Brown
        '#3c3f43', // Gray
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (isExpanded) {
                    handleClose();
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isExpanded, title, content, color]);

    const handleClose = () => {
        if (title || content) {
            onSave({ title, content, color, id: initialNote?.id });
        }
        setIsExpanded(false);
        setTitle('');
        setContent('');
        setColor('#202124');
        if (onClose) onClose();
    };

    return (
        <div ref={wrapperRef} className="w-full max-w-2xl mx-auto mb-8">
            {!isExpanded ? (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="bg-keep-card border border-keep-border rounded-lg shadow-sm p-3 text-keep-text cursor-text"
                >
                    Take a note...
                </div>
            ) : (
                <div
                    className="bg-keep-card border border-keep-border rounded-lg shadow-md p-4 relative"
                    style={{ backgroundColor: color }}
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-lg font-medium placeholder-gray-500 outline-none mb-2"
                    />
                    <textarea
                        placeholder="Take a note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-transparent text-keep-text text-sm placeholder-gray-500 outline-none resize-none min-h-[100px]"
                    />

                    <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-1">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full border border-gray-600 ${color === c ? 'ring-2 ring-white' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-keep-text hover:bg-keep-hover rounded"
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
