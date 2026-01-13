import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaEraser, FaPen, FaUndo, FaRedo, FaHighlighter, FaTrash, FaSave } from 'react-icons/fa';

const HandwritingCanvas = ({ initialData, onSave, color = '#000000' }) => {
    const sigCanvas = useRef({});
    const containerRef = useRef(null);

    // Tools: 'pen', 'marker', 'eraser'
    const [tool, setTool] = useState('pen');
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);

    // History for Undo/Redo
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500'];
    const widths = [2, 5, 10];

    useEffect(() => {
        if (initialData && sigCanvas.current) {
            sigCanvas.current.fromDataURL(initialData);
            // Initialize history with initial data
            setHistory([initialData]);
            setHistoryStep(0);
        } else {
            // Initialize empty history
            setHistory(['']);
            setHistoryStep(0);
        }
    }, []);

    // Helper to save current state to history
    const saveToHistory = () => {
        if (sigCanvas.current) {
            const data = sigCanvas.current.toDataURL();
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(data);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
            onSave(data);
        }
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            const data = history[prevStep];
            sigCanvas.current.clear();
            sigCanvas.current.fromDataURL(data);
            setHistoryStep(prevStep);
            onSave(data);
        } else if (historyStep === 0 && history[0] === '') {
            // If we undo to the very beginning which was empty
            sigCanvas.current.clear();
            onSave('');
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            const data = history[nextStep];
            sigCanvas.current.clear();
            sigCanvas.current.fromDataURL(data);
            setHistoryStep(nextStep);
            onSave(data);
        }
    };

    const handleClear = () => {
        sigCanvas.current.clear();
        saveToHistory();
    };

    const handleEnd = () => {
        saveToHistory();
    };

    // calculate actual props based on tool
    const getCanvasProps = () => {
        let actualColor = penColor;
        let actualWidth = penWidth;

        if (tool === 'eraser') {
            actualColor = '#ffffff';
            actualWidth = 20; // Eraser is bigger
        } else if (tool === 'marker') {
            // Marker logic is tricky with react-signature-canvas as it doesn't support alpha well without custom draw
            // simpler approach: use a wider, semi-transparent color if possible, 
            // OR just standard highlighter colors. 
            // Let's mimic marker by just making it thick and maybe strict color?
            // Actually, opacity requires rgba. Let's convert hex to rgba for marker?
            // For now, let's just make it thick and yellow-ish if picked yellow, 
            // or just trust the selected color but wider.
            actualWidth = 15;
            // If user picked a color, we might want to add transparency, 
            // but 'penColor' prop in sigCanvas accepts any CSS color string.
        }

        return {
            penColor: actualColor,
            minWidth: actualWidth,
            maxWidth: actualWidth,
            dotSize: actualWidth
        };
    };

    const { penColor: activeColor, minWidth, maxWidth, dotSize } = getCanvasProps();

    // Grid Background Style
    const gridStyle = {
        zoom: 1,
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '-1px -1px'
    };

    return (
        <div className="flex flex-col w-full h-full bg-gray-100" ref={containerRef}>
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-4 justify-between shadow-sm z-10">

                {/* Tools Group */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Pen"
                    >
                        <FaPen />
                    </button>
                    <button
                        onClick={() => setTool('marker')}
                        className={`p-2 rounded-md transition-all ${tool === 'marker' ? 'bg-white shadow text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Marker"
                    >
                        <FaHighlighter />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-md transition-all ${tool === 'eraser' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Eraser"
                    >
                        <FaEraser />
                    </button>
                </div>

                {/* Colors Group */}
                {tool !== 'eraser' && (
                    <div className="flex items-center gap-2 px-2 border-l border-r border-gray-200">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setPenColor(c)}
                                className={`w-6 h-6 rounded-full border border-gray-300 transition-transform ${penColor === c ? 'scale-125 ring-2 ring-offset-1 ring-blue-400' : 'hover:scale-110'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                )}

                {/* Width Group */}
                {tool !== 'eraser' && (
                    <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                        {widths.map(w => (
                            <button
                                key={w}
                                onClick={() => setPenWidth(w)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${penWidth === w ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title={`Width ${w}`}
                            >
                                <div
                                    className="bg-gray-800 rounded-full"
                                    style={{ width: w + 2, height: w + 2 }}
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Actions Group */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        className={`p-2 rounded-full hover:bg-gray-100 ${historyStep <= 0 ? 'text-gray-300' : 'text-gray-600'}`}
                        title="Undo"
                    >
                        <FaUndo />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={historyStep >= history.length - 1}
                        className={`p-2 rounded-full hover:bg-gray-100 ${historyStep >= history.length - 1 ? 'text-gray-300' : 'text-gray-600'}`}
                        title="Redo"
                    >
                        <FaRedo />
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Clear All"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 overflow-hidden cursor-crosshair" style={gridStyle}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor={activeColor}
                    minWidth={minWidth}
                    maxWidth={maxWidth}
                    dotSize={dotSize}
                    canvasProps={{
                        className: 'signatureCanvas w-full h-full',
                        style: { width: '100%', height: '100%' }
                    }}
                    onEnd={handleEnd}
                    backgroundColor="transparent"
                />
            </div>
        </div>
    );
};

export default HandwritingCanvas;
