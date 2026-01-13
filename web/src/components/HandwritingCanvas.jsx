import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaEraser, FaPen, FaUndo } from 'react-icons/fa';

const HandwritingCanvas = ({ initialData, onSave, color = '#ffffff' }) => {
    const sigCanvas = useRef({});
    const [penColor, setPenColor] = useState(color);
    const [isErasing, setIsErasing] = useState(false);

    // Resize observer to handle responsiveness
    const containerRef = useRef(null);

    useEffect(() => {
        if (initialData && sigCanvas.current) {
            sigCanvas.current.fromDataURL(initialData);
        }
    }, [initialData]);

    const handleClear = () => {
        sigCanvas.current.clear();
        onSave(''); // Clear data
    };

    const handleSave = () => {
        if (!sigCanvas.current.isEmpty()) {
            onSave(sigCanvas.current.toDataURL());
        } else {
            onSave('');
        }
    };

    // Auto-save on stroke end
    const handleEnd = () => {
        handleSave();
    };

    const toggleEraser = () => {
        setIsErasing(!isErasing);
    };

    return (
        <div className="flex flex-col w-full h-full" ref={containerRef}>
            <div className="flex gap-2 mb-2 items-center flex-shrink-0">
                <button
                    onClick={() => setIsErasing(false)}
                    className={`p-2 rounded ${!isErasing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    title="Pen"
                >
                    <FaPen />
                </button>
                <button
                    onClick={() => setIsErasing(true)}
                    className={`p-2 rounded ${isErasing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    title="Eraser"
                >
                    <FaEraser />
                </button>
                {/* Color pickers could go here */}
                <button
                    onClick={handleClear}
                    className="p-2 rounded bg-red-600 text-white ml-auto"
                    title="Clear"
                >
                    <FaUndo />
                </button>
            </div>

            <div className="border border-gray-600 rounded bg-white overflow-hidden flex-1 relative">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor={isErasing ? '#ffffff' : penColor}
                    canvasProps={{
                        className: 'signatureCanvas w-full h-full',
                        style: { width: '100%', height: '100%' }
                    }}
                    onEnd={handleEnd}
                    backgroundColor="#ffffff"
                />
            </div>
        </div>
    );
};

export default HandwritingCanvas;
