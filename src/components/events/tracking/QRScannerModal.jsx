
import React, { useState, useCallback, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { 
    QrCode, 
    X, 
    CheckCircle, 
    RefreshCw,
    SwitchCamera,
    AlertCircle,
    Loader,
    Maximize2,
    Minimize2
} from 'lucide-react';

const QRScanner = ({
    isOpen,
    onClose,
    onScan,
    selectedCheckpoint,
    isProcessingScan,
    setIsProcessingScan
}) => {
    const [cameraError, setCameraError] = useState(null);
    const [scannerInput, setScannerInput] = useState('');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasPermission, setHasPermission] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [currentCamera, setCurrentCamera] = useState(null);
    
    const videoRef = useRef(null);
    const modalRef = useRef(null);
    const scannerRef = useRef(null);
    const mountedRef = useRef(true);
    const initTimeoutRef = useRef(null);

    // Get checkpoint color based on type
    const getCheckpointColor = () => {
        if (!selectedCheckpoint) return '#8b5cf6';
        switch(selectedCheckpoint?.type) {
            case 'REGISTRATION': return '#8b5cf6';
            case 'FOOD': return '#f59e0b';
            case 'KIT': return '#10b981';
            case 'HALL': return '#3b82f6';
            case 'CUSTOM': return '#6b7280';
            default: return '#8b5cf6';
        }
    };

    const checkpointColor = getCheckpointColor();

    // Clean up everything
    const cleanup = useCallback(() => {
        if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
        }
        
        if (scannerRef.current) {
            try {
                scannerRef.current.stop();
                scannerRef.current.destroy();
            } catch (e) {
                // Ignore cleanup errors
            }
            scannerRef.current = null;
        }
        
        setIsCameraReady(false);
    }, []);

    // Initialize scanner
    const initScanner = useCallback(async () => {
        if (!mountedRef.current || !videoRef.current) return;

        try {
            // Get available cameras
            const devices = await QrScanner.listCameras();
            if (!mountedRef.current) return;
            
            setCameras(devices);
            
            if (devices.length === 0) {
                setCameraError('No camera found on this device');
                return;
            }
            
            // Prefer back camera
            const backCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment') ||
                device.label.toLowerCase().includes('rear')
            ) || devices[0];
            
            setCurrentCamera(backCamera.id);
            
            // Small delay to ensure video element is ready
            initTimeoutRef.current = setTimeout(async () => {
                if (!mountedRef.current || !videoRef.current) return;
                
                try {
                    // Create scanner instance
                    const scanner = new QrScanner(
                        videoRef.current,
                        (result) => {
                            if (!isProcessingScan && result && mountedRef.current) {
                                setIsProcessingScan(true);
                                if (navigator.vibrate) navigator.vibrate(50);
                                onScan(result.data);
                            }
                        },
                        {
                            preferredCamera: backCamera.id,
                            highlightScanRegion: true,
                            highlightCodeOutline: true,
                            returnDetailedScanResult: true,
                            maxScansPerSecond: 10,
                        }
                    );
                    
                    scannerRef.current = scanner;
                    
                    // Start scanning
                    await scanner.start();
                    
                    if (mountedRef.current) {
                        setIsCameraReady(true);
                        setCameraError(null);
                        setHasPermission(true);
                    }
                } catch (startError) {
                    console.error('Start error:', startError);
                    if (mountedRef.current) {
                        setCameraError('Failed to start camera: ' + startError.message);
                        setIsCameraReady(false);
                    }
                }
            }, 300);
            
        } catch (error) {
            console.error('Camera error:', error);
            if (!mountedRef.current) return;
            
            if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
                setCameraError('Camera permission denied. Please allow camera access.');
                setHasPermission(false);
            } else if (error.name === 'NotFoundError') {
                setCameraError('No camera found on this device.');
            } else {
                setCameraError('Failed to start camera: ' + error.message);
            }
            
            setIsCameraReady(false);
        }
    }, [isProcessingScan, onScan, setIsProcessingScan]);

    // Handle modal open/close
    useEffect(() => {
        mountedRef.current = true;
        
        if (!isOpen) {
            cleanup();
            return;
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (mountedRef.current) {
                initScanner();
            }
        }, 100);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            cleanup();
        };
    }, [isOpen, initScanner, cleanup]);

    // Switch camera
    const switchCamera = useCallback(async () => {
        if (!scannerRef.current || cameras.length < 2) return;
        
        try {
            setIsCameraReady(false);
            
            const currentIndex = cameras.findIndex(c => c.id === currentCamera);
            const nextIndex = (currentIndex + 1) % cameras.length;
            const nextCamera = cameras[nextIndex];
            
            await scannerRef.current.setCamera(nextCamera.id);
            setCurrentCamera(nextCamera.id);
            setIsCameraReady(true);
        } catch (error) {
            console.error('Camera switch error:', error);
            setCameraError('Failed to switch camera');
        }
    }, [cameras, currentCamera]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            modalRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Handle manual entry
    const handleManualSubmit = () => {
        if (scannerInput.trim()) {
            onScan(scannerInput.trim());
            setScannerInput('');
            onClose();
        }
    };

    // Handle paste
    const handlePaste = useCallback((e) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            setScannerInput(pastedText);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setCameraError(null);
        setHasPermission(true);
        setIsCameraReady(false);
        cleanup();
        mountedRef.current = true;
        
        setTimeout(() => {
            if (isOpen) {
                initScanner();
            }
        }, 500);
    }, [isOpen, initScanner, cleanup]);

    if (!isOpen) return null;

    const isMobile = window.innerWidth < 640;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <div 
                ref={modalRef}
                className="bg-white w-full sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
                style={{
                    maxWidth: isFullscreen ? '100%' : '500px',
                    height: isFullscreen ? '100%' : 'auto',
                    maxHeight: isFullscreen ? '100%' : '90vh',
                    borderTopLeftRadius: isMobile ? '1.5rem' : '1rem',
                    borderTopRightRadius: isMobile ? '1.5rem' : '1rem',
                    borderBottomLeftRadius: isMobile ? 0 : '1rem',
                    borderBottomRightRadius: isMobile ? 0 : '1rem',
                }}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${checkpointColor}20` }}
                        >
                            <QrCode size={20} style={{ color: checkpointColor }} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-gray-800 truncate">
                                Scan {selectedCheckpoint?.type === 'REGISTRATION' ? 'Badge' : 'QR Code'}
                            </h2>
                            {selectedCheckpoint && (
                                <p className="text-xs text-gray-500 font-medium truncate">
                                    Checkpoint: <span style={{ color: checkpointColor }}>{selectedCheckpoint.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scanner Viewport */}
                <div 
                    className="relative bg-black flex-1 flex items-center justify-center overflow-hidden"
                    style={{ minHeight: isFullscreen ? 'auto' : isMobile ? '350px' : '400px' }}
                >
                    {!cameraError && hasPermission ? (
                        <>
                            {/* Video element for scanner */}
                            <video 
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            
                            {/* Scanner Overlay */}
                            {isCameraReady && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Dark overlay with cutout */}
                                    <div className="absolute inset-0 bg-black/30" />
                                    
                                    {/* Scan Frame */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <div 
                                                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg border-2"
                                                style={{ borderColor: checkpointColor }}
                                            />
                                            
                                            {/* Corner decorations */}
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 -mt-1 -ml-1 rounded-tl-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 -mt-1 -mr-1 rounded-tr-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 -mb-1 -ml-1 rounded-bl-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 -mb-1 -mr-1 rounded-br-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            
                                            {/* Scan line animation */}
                                            <div className="absolute inset-x-0 h-0.5 animate-scan"
                                                style={{ 
                                                    background: `linear-gradient(90deg, transparent, ${checkpointColor}, transparent)`,
                                                    boxShadow: `0 0 10px ${checkpointColor}`
                                                }} />
                                        </div>
                                    </div>
                                    
                                    {/* Status text */}
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-white text-xs font-medium">
                                                {isProcessingScan ? 'Processing...' : 'Ready to scan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Camera not ready overlay */}
                            {!isCameraReady && !cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                                    <Loader size={32} className="text-purple-500 animate-spin mb-3" />
                                    <p className="text-white text-sm">Initializing camera...</p>
                                </div>
                            )}
                        </>
                    ) : (
                        // Error state
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <p className="text-white text-sm font-medium mb-4 max-w-[80%]">
                                {cameraError || 'Camera access denied'}
                            </p>
                            {!hasPermission && (
                                <p className="text-gray-400 text-xs mb-4 max-w-[80%]">
                                    Please enable camera access in your browser settings.
                                </p>
                            )}
                            <button 
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-all"
                            >
                                <RefreshCw size={16} /> Retry Camera
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {cameras.length > 1 && (
                        <div className="mb-3">
                            <button
                                onClick={switchCamera}
                                disabled={!isCameraReady || cameraError}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                            >
                                <SwitchCamera size={16} />
                                Switch Camera
                            </button>
                        </div>
                    )}

                    {/* Manual Entry */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Manual Entry
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={scannerInput}
                                onChange={(e) => setScannerInput(e.target.value)}
                                placeholder="Enter badge code manually"
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                disabled={isProcessingScan}
                                autoFocus={isOpen}
                            />
                            <button
                                onClick={handleManualSubmit}
                                disabled={!scannerInput.trim() || isProcessingScan}
                                className="px-5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                style={{ backgroundColor: checkpointColor }}
                            >
                                <CheckCircle size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📋 Paste from clipboard</span>
                            <span className="text-gray-400">•</span>
                            <span>Case-sensitive</span>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100px); }
                    50% { transform: translateY(100px); }
                    100% { transform: translateY(-100px); }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default QRScanner;