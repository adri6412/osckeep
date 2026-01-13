import React, { useState, useEffect, useRef } from 'react';
import { FaPalette, FaImage, FaArchive, FaUndo, FaRedo, FaCheck, FaRegBell, FaPen, FaTrash } from 'react-icons/fa';
import HandwritingCanvas from './HandwritingCanvas';

const NoteEditor = ({ onSave, onClose, initialNote }) => {
    const [title, setTitle] = useState(initialNote?.title || '');
    const [content, setContent] = useState(initialNote?.content || '');
    const [color, setColor] = useState(initialNote?.color || '#1e293b');
    const [reminderDate, setReminderDate] = useState(initialNote?.reminder_date ? initialNote.reminder_date.split('T')[0] : '');
    const [reminderTime, setReminderTime] = useState(initialNote?.reminder_date ? initialNote.reminder_date.split('T')[1]?.substring(0, 5) : '');
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [isExpanded, setIsExpanded] = useState(!!initialNote);
    const [drawingData, setDrawingData] = useState(initialNote?.drawing_data || '');
    const [showDrawing, setShowDrawing] = useState(false);
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
    }, [isExpanded, title, content, color, drawingData]);

    const handleClose = () => {
        if (title.trim() || content.trim()) {
            const reminder_date = reminderDate && reminderTime
                ? `${reminderDate}T${reminderTime}:00`
                : reminderDate
                    ? `${reminderDate}T09:00:00`
                    : null;
            onSave({ title, content, color, reminder_date, drawing_data: drawingData, id: initialNote?.id });
        }
        if (!initialNote) {
            setIsExpanded(false);
            setTitle('');
            setContent('');
            setColor('#1e293b');
            setReminderDate('');
            setReminderTime('');
            setDrawingData('');
            setShowDrawing(false);
        }
        if (onClose) onClose();
    };

    const handleDrawingSave = (data) => {
        setDrawingData(data);
        // Do not close drawing mode automatically.
        // The user must click "Done" to close the modal.
    };

    const handleRemoveReminder = () => {
        setReminderDate('');
        setReminderTime('');
        setShowReminderPicker(false);
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
                        <FaPen className="opacity-50" />
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
                        className="w-full bg-transparent text-keep-text text-[clamp(1rem,1.25vw,1.125rem)] placeholder-keep-muted/70 outline-none resize-none min-h-[clamp(4rem,10vw,6rem)] leading-relaxed py-[clamp(0.5rem,1vw,0.75rem)]"
                    />

                    {/* Drawing Preview Area */}
                    {drawingData && (
                        <div className="relative mb-4 group">
                            <img
                                src={drawingData}
                                alt="Drawing"
                                className="w-full h-auto max-h-60 object-contain rounded-lg border border-white/10 bg-white"
                                onClick={() => setShowDrawing(true)}
                            />
                            <button
                                onClick={() => setDrawingData('')}
                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Drawing"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}

                    {/* Fullscreen Drawing Modal */}
                    {showDrawing && (
                        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
                            <div className="w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
                                <div className="p-2 border-b flex justify-between items-center bg-gray-100 dark:bg-gray-800">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Drawing</h3>
                                    <button
                                        onClick={() => setShowDrawing(false)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Done
                                    </button>
                                </div>
                                <div className="flex-1 relative bg-white">
                                    <HandwritingCanvas
                                        initialData={drawingData}
                                        onSave={setDrawingData}
                                        color={color}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)] mt-[clamp(1rem,2vw,1.5rem)] pt-[clamp(0.75rem,1.5vw,1rem)] border-t border-white/10">
                        {/* Reminder Section */}
                        <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
                            <button
                                onClick={() => setShowReminderPicker(!showReminderPicker)}
                                className={`p-[clamp(0.5rem,1vw,0.75rem)] rounded-lg transition-colors ${reminderDate ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-black/20 text-keep-text/70'}`}
                                title="Add reminder"
                            >
                                <FaRegBell />
                            </button>
                            {showReminderPicker && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        type="date"
                                        value={reminderDate}
                                        onChange={(e) => setReminderDate(e.target.value)}
                                        className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vw,0.5rem)] bg-black/20 rounded text-[clamp(0.875rem,1vw,1rem)] text-keep-text border border-white/10"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {reminderDate && (
                                        <input
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vw,0.5rem)] bg-black/20 rounded text-[clamp(0.875rem,1vw,1rem)] text-keep-text border border-white/10"
                                        />
                                    )}
                                    {reminderDate && (
                                        <button
                                            onClick={handleRemoveReminder}
                                            className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.25rem,0.5vw,0.5rem)] bg-red-500/20 text-red-400 rounded text-[clamp(0.875rem,1vw,1rem)] hover:bg-red-500/30"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                            {reminderDate && !showReminderPicker && (
                                <span className="text-[clamp(0.75rem,1vw,0.875rem)] text-keep-muted">
                                    {new Date(reminderDate + (reminderTime ? `T${reminderTime}` : '')).toLocaleString()}
                                </span>
                            )}

                            <button
                                onClick={() => setShowDrawing(true)}
                                className={`p-[clamp(0.5rem,1vw,0.75rem)] rounded-lg transition-colors ${drawingData ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-black/20 text-keep-text/70'}`}
                                title={drawingData ? "Edit Drawing" : "Add Drawing"}
                            >
                                <FaPen />
                            </button>
                        </div>

                        {/* Color Picker and Close Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[clamp(1rem,2vw,1.5rem)]">
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
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
