import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaEraser, FaPen, FaUndo, FaRedo, FaHighlighter, FaTrash, FaSave, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

const HandwritingCanvas = ({ initialData, onSave, color = '#000000' }) => {
    const sigCanvas = useRef({});
    const containerRef = useRef(null);

    // Tools: 'pen', 'marker', 'eraser'
    const [tool, setTool] = useState('pen');
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);

    // Multi-page State
    const [pages, setPages] = useState(['']); // Array of data URLs
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // History for Undo/Redo (Per Page)
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500'];
    const widths = [2, 5, 10];

    useEffect(() => {
        // Parse initialData
        let loadedPages = [''];
        if (initialData) {
            try {
                const parsed = JSON.parse(initialData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    loadedPages = parsed;
                } else {
                    loadedPages = [initialData]; // Legacy single string
                }
            } catch (e) {
                loadedPages = [initialData]; // Legacy single string
            }
        }
        setPages(loadedPages);
        setCurrentPageIndex(0);
    }, []);

    // Load content when page index changes
    useEffect(() => {
        if (sigCanvas.current) {
            const pageContent = pages[currentPageIndex] || '';
            sigCanvas.current.clear();
            if (pageContent) {
                sigCanvas.current.fromDataURL(pageContent);
            }
            // Reset history for the new page
            setHistory([pageContent]);
            setHistoryStep(0);
        }
    }, [currentPageIndex]);

    const saveCurrentPage = () => {
        if (sigCanvas.current) {
            const data = sigCanvas.current.toDataURL();
            const newPages = [...pages];
            newPages[currentPageIndex] = data;
            setPages(newPages);
            onSave(JSON.stringify(newPages));
            return data;
        }
        return null;
    };

    const addToHistory = (data) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(data);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const handleStrokeEnd = () => {
        const data = saveCurrentPage();
        if (data !== null) {
            addToHistory(data);
        }
    };

    const handleStrokeBegin = () => {
        if (tool === 'eraser' && sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-out';
        } else if (sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            const data = history[prevStep];
            sigCanvas.current.clear();
            sigCanvas.current.fromDataURL(data);
            setHistoryStep(prevStep);

            // Sync with pages state
            const newPages = [...pages];
            newPages[currentPageIndex] = data;
            setPages(newPages);
            onSave(JSON.stringify(newPages));
        } else if (historyStep === 0 && history[0] === '') {
            sigCanvas.current.clear();
            const newPages = [...pages];
            newPages[currentPageIndex] = '';
            setPages(newPages);
            onSave(JSON.stringify(newPages));
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            const data = history[nextStep];
            sigCanvas.current.clear();
            sigCanvas.current.fromDataURL(data);
            setHistoryStep(nextStep);

            const newPages = [...pages];
            newPages[currentPageIndex] = data;
            setPages(newPages);
            onSave(JSON.stringify(newPages));
        }
    };

    const handleClear = () => {
        sigCanvas.current.clear();
        saveCurrentPage();
        addToHistory('');
    };

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            saveCurrentPage();
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            saveCurrentPage();
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };

    const handleAddPage = () => {
        saveCurrentPage();
        const newPages = [...pages, ''];
        setPages(newPages);
        onSave(JSON.stringify(newPages));
        setCurrentPageIndex(newPages.length - 1);
    };

    const handleDeletePage = () => {
        if (pages.length <= 1) {
            handleClear();
            return;
        }
        const newPages = pages.filter((_, i) => i !== currentPageIndex);
        setPages(newPages);
        onSave(JSON.stringify(newPages));

        // Adjust index
        if (currentPageIndex >= newPages.length) {
            setCurrentPageIndex(newPages.length - 1);
        } else {
            // Reload current index (which is now the next page content)
            if (sigCanvas.current) {
                const pageContent = newPages[currentPageIndex] || '';
                sigCanvas.current.clear();
                if (pageContent) sigCanvas.current.fromDataURL(pageContent);
                setHistory([pageContent]);
                setHistoryStep(0);
            }
        }
    };

    // Calculate props
    const getCanvasProps = () => {
        let actualColor = penColor;
        let actualWidth = penWidth;

        if (tool === 'eraser') {
            actualColor = '#ffffff'; // Fallback
            actualWidth = 20;
        } else if (tool === 'marker') {
            actualWidth = 15;
        }

        return {
            penColor: actualColor,
            minWidth: actualWidth,
            maxWidth: actualWidth,
            dotSize: actualWidth
        };
    };

    const { penColor: activeColor, minWidth, maxWidth, dotSize } = getCanvasProps();

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

                {/* Tools */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setTool('pen')} className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Pen"><FaPen /></button>
                    <button onClick={() => setTool('marker')} className={`p-2 rounded-md transition-all ${tool === 'marker' ? 'bg-white shadow text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`} title="Marker"><FaHighlighter /></button>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-md transition-all ${tool === 'eraser' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`} title="Eraser"><FaEraser /></button>
                </div>

                {/* Colors */}
                {tool !== 'eraser' && (
                    <div className="flex items-center gap-2 px-2 border-l border-r border-gray-200">
                        {colors.map(c => (
                            <button key={c} onClick={() => setPenColor(c)} className={`w-6 h-6 rounded-full border border-gray-300 transition-transform ${penColor === c ? 'scale-125 ring-2 ring-offset-1 ring-blue-400' : 'hover:scale-110'}`} style={{ backgroundColor: c }} title={c} />
                        ))}
                    </div>
                )}

                {/* Widths */}
                {tool !== 'eraser' && (
                    <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                        {widths.map(w => (
                            <button key={w} onClick={() => setPenWidth(w)} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${penWidth === w ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title={`Width ${w}`}>
                                <div className="bg-gray-800 rounded-full" style={{ width: w + 2, height: w + 2 }} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={handlePrevPage} disabled={currentPageIndex === 0} className="p-2 text-gray-600 disabled:opacity-30 hover:bg-white rounded"><FaChevronLeft /></button>
                    <span className="text-sm font-medium w-16 text-center">{currentPageIndex + 1} / {pages.length}</span>
                    <button onClick={handleNextPage} disabled={currentPageIndex === pages.length - 1} className="p-2 text-gray-600 disabled:opacity-30 hover:bg-white rounded"><FaChevronRight /></button>
                    <button onClick={handleAddPage} className="p-2 text-blue-600 hover:bg-white rounded" title="Add Page"><FaPlus /></button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} disabled={historyStep <= 0} className={`p-2 rounded-full hover:bg-gray-100 ${historyStep <= 0 ? 'text-gray-300' : 'text-gray-600'}`} title="Undo"><FaUndo /></button>
                    <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className={`p-2 rounded-full hover:bg-gray-100 ${historyStep >= history.length - 1 ? 'text-gray-300' : 'text-gray-600'}`} title="Redo"><FaRedo /></button>
                    {pages.length > 1 ? (
                        <button onClick={handleDeletePage} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete Page"><FaTrash /></button>
                    ) : (
                        <button onClick={handleClear} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear Page"><FaTrash /></button>
                    )}
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 overflow-hidden cursor-crosshair" style={gridStyle}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor={tool === 'eraser' ? 'rgba(255,255,255,1)' : activeColor}
                    minWidth={minWidth}
                    maxWidth={maxWidth}
                    dotSize={dotSize}
                    canvasProps={{
                        className: 'signatureCanvas w-full h-full',
                        style: { width: '100%', height: '100%' }
                    }}
                    onBegin={handleStrokeBegin}
                    onEnd={handleStrokeEnd}
                    backgroundColor="transparent"
                />
            </div>
        </div>
    );
};

export default HandwritingCanvas;
