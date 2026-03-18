// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useNotification } from '../../../contestAPI/NotificationProvider';
// import {
//     ChevronLeft,
//     QrCode,
//     Camera,
//     MapPin,
//     CheckCircle,
//     XCircle,
//     User,
//     Printer,
//     RefreshCw,
//     AlertCircle,
//     Loader,
//     SwitchCamera,
//     Maximize2,
//     Minimize2,
//     List,
//     X,
//     Eye,
//     Download
// } from 'lucide-react';
// import QrScanner from 'qr-scanner';
// import jsPDF from 'jspdf';
// import QRCode from 'qrcode';
// import axiosInstance from '../../../helper/AxiosInstance';

// // Checkpoint types for icons
// const CHECKPOINT_TYPES = [
//     { value: 'REGISTRATION', label: 'REGISTRATION' },
//     { value: 'FOOD', label: 'FOOD' },
//     { value: 'KIT', label: 'KIT' },
//     { value: 'HALL', label: 'HALL' },
//     { value: 'CUSTOM', label: 'CUSTOM' }
// ];

// // Maximum fields to display on badge
// const MAX_FIELDS = 2;

// // Default fields that are always available
// const DEFAULT_FIELDS = [
//     { key: "email", label: "Email" },
//     { key: "phone", label: "Phone" },
// ];

// const QRScanPage = () => {
//     const { eventId } = useParams();
//     const navigate = useNavigate();
//     const { success, error } = useNotification();

//     // State
//     const [checkpoints, setCheckpoints] = useState([]);
//     const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
//     const [showCheckpointsList, setShowCheckpointsList] = useState(true);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isScanning, setIsScanning] = useState(false);
//     const [scanResult, setScanResult] = useState(null);
//     const [badgeCode, setBadgeCode] = useState('');
    
//     // Badge preview states
//     const [showBadgePreview, setShowBadgePreview] = useState(false);
//     const [badgeData, setBadgeData] = useState(null);
//     const [qrImage, setQrImage] = useState(null);
//     const [generatingPDF, setGeneratingPDF] = useState(false);
//     const [selectedFields, setSelectedFields] = useState([]);
//     const [availableFields, setAvailableFields] = useState([]);

//     // Camera states
//     const [cameraError, setCameraError] = useState(null);
//     const [isCameraReady, setIsCameraReady] = useState(false);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [hasPermission, setHasPermission] = useState(true);
//     const [cameras, setCameras] = useState([]);
//     const [currentCamera, setCurrentCamera] = useState(null);

//     // Refs
//     const videoRef = useRef(null);
//     const scannerRef = useRef(null);
//     const mountedRef = useRef(true);
//     const isProcessingScan = useRef(false);
//     const initTimeoutRef = useRef(null);
//     const previewRef = useRef(null);

//     // Get checkpoint color
//     const getCheckpointColor = () => {
//         if (!selectedCheckpoint) return '#8b5cf6';
//         switch (selectedCheckpoint?.type) {
//             case 'REGISTRATION': return '#8b5cf6';
//             case 'FOOD': return '#f59e0b';
//             case 'KIT': return '#10b981';
//             case 'HALL': return '#3b82f6';
//             case 'CUSTOM': return '#6b7280';
//             default: return '#8b5cf6';
//         }
//     };

//     const checkpointColor = getCheckpointColor();

//     // Extract available fields from badge data
//     const extractAvailableFields = (data) => {
//         const fieldSet = new Set();
//         const fieldsArray = [];

//         // Add default fields first
//         DEFAULT_FIELDS.forEach(field => {
//             fieldSet.add(field.key);
//             fieldsArray.push(field);
//         });

//         // Extract all keys from the data object
//         if (data && typeof data === 'object') {
//             Object.keys(data).forEach(key => {
//                 if (!fieldSet.has(key) && !['name', 'badgeCode', 'entryId', 'event'].includes(key)) {
//                     fieldSet.add(key);
//                     // Format the label: replace underscores with spaces and capitalize
//                     const label = key
//                         .split('_')
//                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//                         .join(' ');
//                     fieldsArray.push({ key, label });
//                 }
//             });
//         }

//         // Sort fields alphabetically by label
//         return fieldsArray.sort((a, b) => a.label.localeCompare(b.label));
//     };

//     // Get field value from badge data
//     const getFieldValue = (data, fieldKey) => {
//         if (!data) return "";
//         if (fieldKey === "email") return data.email || data.Email || "";
//         if (fieldKey === "phone") return data.phone || data.Phone || data.phone_number || "";
//         return data[fieldKey] || data[fieldKey.toLowerCase()] || data[fieldKey.toUpperCase()] || "";
//     };

//     // Get display name
//     const getDisplayName = (data) => {
//         return data?.name || data?.Name || "Attendee";
//     };

//     // Generate QR code for badge
//     const generateBadgeQR = async (badgeData) => {
//         try {
//             const payloadMap = {
//                 name: getDisplayName(badgeData),
//                 email: badgeData.email || badgeData.Email || "",
//                 badge: badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`,
//                 entryId: badgeData.entryId || "",
//                 event: badgeData.event || "Event"
//             };

//             const qrPayload = JSON.stringify(payloadMap);

//             const qrBase64 = await QRCode.toDataURL(qrPayload, {
//                 width: 300,
//                 margin: 1,
//                 errorCorrectionLevel: 'H',
//                 color: {
//                     dark: '#000000',
//                     light: '#ffffff'
//                 }
//             });

//             return qrBase64;
//         } catch (err) {
//             console.error('Failed to generate QR:', err);
//             return null;
//         }
//     };

//     // Toggle field selection for badge
//     const toggleField = (field) => {
//         setSelectedFields((prev) => {
//             if (prev.includes(field)) {
//                 return prev.filter((f) => f !== field);
//             }
//             if (prev.length >= MAX_FIELDS) return prev;
//             return [...prev, field];
//         });
//     };

//     // Handle print badge PDF
//     const handlePrintBadge = async () => {
//         if (!badgeData) return;

//         setGeneratingPDF(true);

//         try {
//             const pdf = new jsPDF({
//                 orientation: "portrait",
//                 unit: "mm",
//                 format: [76, 102], // Badge size
//             });

//             const centerX = 38;
//             const displayName = getDisplayName(badgeData);

//             // Add name
//             pdf.setFontSize(16);
//             pdf.setFont("helvetica", "bold");
//             pdf.text(displayName, centerX, 20, { align: "center" });

//             // Add selected fields
//             pdf.setFontSize(9);
//             pdf.setFont("helvetica", "normal");
//             let y = 28;

//             selectedFields.forEach((field) => {
//                 const value = getFieldValue(badgeData, field);
//                 if (!value) return;
//                 pdf.text(String(value), centerX, y, { align: "center" });
//                 y += 6;
//             });

//             // Generate and add QR code
//             try {
//                 const payloadMap = {
//                     name: displayName,
//                     email: badgeData.email || badgeData.Email || "",
//                     badge: badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`,
//                     entryId: badgeData.entryId || "",
//                     event: badgeData.event || "Event"
//                 };

//                 const qrPayload = JSON.stringify(payloadMap);
//                 const qrBase64 = await QRCode.toDataURL(qrPayload, {
//                     width: 300,
//                     margin: 1,
//                     errorCorrectionLevel: 'H'
//                 });

//                 const qrSize = 40;
//                 const qrX = (76 - qrSize) / 2;
//                 const qrY = 45;

//                 pdf.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
//             } catch (err) {
//                 console.error("QR generation failed:", err);
//             }

//             // Add badge code
//             pdf.setFontSize(7);
//             pdf.setFont("helvetica", "bold");
//             pdf.text(badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`, centerX, 92, { align: "center" });

//             // Save or print based on user preference
//             const fileName = `${displayName}_Badge.pdf`;
            
//             // Open in new window for printing
//             const pdfBlob = pdf.output('blob');
//             const pdfUrl = URL.createObjectURL(pdfBlob);
            
//             // Open print dialog
//             const printWindow = window.open(pdfUrl);
//             if (printWindow) {
//                 printWindow.onload = () => {
//                     printWindow.print();
//                 };
//             } else {
//                 // Fallback to download if popup blocked
//                 pdf.save(fileName);
//                 success('Badge PDF downloaded successfully');
//             }

//             // Close preview after print
//             setShowBadgePreview(false);
//             success('Badge ready for printing');

//         } catch (err) {
//             console.error('PDF generation failed:', err);
//             error('Failed to generate badge PDF');
//         } finally {
//             setGeneratingPDF(false);
//         }
//     };

//     // Handle view badge preview
//     const handleViewBadge = async (data) => {
//         const fields = extractAvailableFields(data);
//         setAvailableFields(fields);
//         setSelectedFields([]); // Reset selected fields
//         setBadgeData(data);
        
//         // Generate QR for preview
//         const qr = await generateBadgeQR(data);
//         setQrImage(qr);
        
//         setShowBadgePreview(true);
//     };

//     // Parse QR code value
//     const parseQRValue = (qrValue) => {
//         try {
//             const trimmedValue = qrValue.trim();
            
//             if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
//                 const parsedJson = JSON.parse(trimmedValue);
//                 if (Array.isArray(parsedJson)) {
//                     return parsedJson.length > 0 ? parsedJson[0] : null;
//                 }
//                 return parsedJson;
//             }
            
//             const lines = trimmedValue.split('\n');
//             const parsedData = {};
            
//             lines.forEach(line => {
//                 const colonIndex = line.indexOf(':');
//                 if (colonIndex !== -1) {
//                     const key = line.substring(0, colonIndex).trim().toLowerCase();
//                     const value = line.substring(colonIndex + 1).trim();
                    
//                     if (value) {
//                         if (key.includes('name')) {
//                             parsedData.name = value;
//                         } else if (key.includes('email')) {
//                             parsedData.email = value;
//                         } else if (key.includes('badge') || key.includes('code')) {
//                             if (key.includes('badge') || key.includes('qr')) {
//                                 parsedData.badgeCode = value;
//                             }
//                         } else if (key.includes('phone') || key.includes('mobile')) {
//                             parsedData.phone = value;
//                         } else if (key.includes('date') || key.includes('dob')) {
//                             parsedData.dateOfBirth = value;
//                         } else if (key.includes('paragraph') || key.includes('description')) {
//                             parsedData.description = value;
//                         } else if (key.includes('city')) {
//                             parsedData.city = value;
//                         } else if (key.includes('department')) {
//                             parsedData.department = value;
//                         } else {
//                             parsedData[key.replace(/\s+/g, '')] = value;
//                         }
//                     }
//                 }
//             });
            
//             return parsedData;
//         } catch (error) {
//             console.error('Error parsing QR value:', error);
//             return { raw: qrValue };
//         }
//     };

//     // Extract badge code
//     const extractBadgeCode = (parsedData) => {
//         if (!parsedData) return null;
        
//         const possibleBadgeFields = [
//             'badge',
//             'badgeCode',
//             'code',
//             'qrCode',
//             'qr',
//             'badgecode',
//             'badge_code',
//             'qr-code'
//         ];
        
//         for (const field of possibleBadgeFields) {
//             if (parsedData[field]) {
//                 return parsedData[field];
//             }
//             const lowerField = field.toLowerCase();
//             for (const key in parsedData) {
//                 if (key.toLowerCase() === lowerField && parsedData[key]) {
//                     return parsedData[key];
//                 }
//             }
//         }
        
//         return null;
//     };

//     // Cleanup camera
//     const cleanup = () => {
//         if (initTimeoutRef.current) {
//             clearTimeout(initTimeoutRef.current);
//             initTimeoutRef.current = null;
//         }
        
//         if (scannerRef.current) {
//             try {
//                 scannerRef.current.stop();
//                 scannerRef.current.destroy();
//             } catch (e) {
//                 // Ignore cleanup errors
//             }
//             scannerRef.current = null;
//         }
//         setIsCameraReady(false);
//     };

//     // Initialize scanner
//     const initScanner = async () => {
//         if (!mountedRef.current || !videoRef.current || !selectedCheckpoint) return;

//         try {
//             const devices = await QrScanner.listCameras();
//             if (!mountedRef.current) return;
            
//             setCameras(devices);
            
//             if (devices.length === 0) {
//                 setCameraError('No camera found on this device');
//                 return;
//             }
            
//             const backCamera = devices.find(device => 
//                 device.label.toLowerCase().includes('back') || 
//                 device.label.toLowerCase().includes('environment') ||
//                 device.label.toLowerCase().includes('rear')
//             ) || devices[0];
            
//             setCurrentCamera(backCamera.id);
            
//             const scanner = new QrScanner(
//                 videoRef.current,
//                 (result) => {
//                     if (!isProcessingScan.current && result && mountedRef.current) {
//                         handleQRScan(result.data);
//                     }
//                 },
//                 {
//                     preferredCamera: backCamera.id,
//                     highlightScanRegion: true,
//                     highlightCodeOutline: true,
//                     returnDetailedScanResult: true,
//                     maxScansPerSecond: 5,
//                 }
//             );
            
//             scannerRef.current = scanner;
//             await scanner.start();
            
//             if (mountedRef.current) {
//                 setIsCameraReady(true);
//                 setCameraError(null);
//                 setHasPermission(true);
//             }
//         } catch (error) {
//             console.error('Camera error:', error);
//             if (!mountedRef.current) return;
            
//             if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
//                 setCameraError('Camera permission denied. Please allow camera access.');
//                 setHasPermission(false);
//             } else if (error.name === 'NotFoundError') {
//                 setCameraError('No camera found on this device.');
//             } else {
//                 setCameraError('Failed to start camera: ' + error.message);
//             }
            
//             setIsCameraReady(false);
//         }
//     };

//     // Initialize scanner when checkpoint is selected
//     useEffect(() => {
//         if (!selectedCheckpoint) {
//             cleanup();
//             return;
//         }

//         mountedRef.current = true;
        
//         initTimeoutRef.current = setTimeout(() => {
//             if (mountedRef.current && selectedCheckpoint) {
//                 initScanner();
//             }
//         }, 300);

//         return () => {
//             mountedRef.current = false;
//             if (initTimeoutRef.current) {
//                 clearTimeout(initTimeoutRef.current);
//             }
//             cleanup();
//         };
//     }, [selectedCheckpoint]);

//     // Handle QR scan
//     const handleQRScan = async (qrValue) => {
//         if (isProcessingScan.current || !selectedCheckpoint) return;
        
//         isProcessingScan.current = true;
        
//         try {
//             const parsedData = parseQRValue(qrValue);
//             const extractedBadgeCode = extractBadgeCode(parsedData) || qrValue;
//             setBadgeCode(extractedBadgeCode);
            
//             if (navigator.vibrate) navigator.vibrate(50);
            
//             await handleScanBadge(extractedBadgeCode, parsedData);
            
//         } catch (error) {
//             console.error('Error processing QR scan:', error);
//             error('Failed to process QR code');
//         } finally {
//             setTimeout(() => {
//                 isProcessingScan.current = false;
//             }, 2000);
//         }
//     };

//     // Handle manual entry
//     const handleManualSubmit = () => {
//         if (badgeCode.trim() && selectedCheckpoint) {
//             handleQRScan(badgeCode);
//         }
//     };

//     // Scan badge API call
//     const handleScanBadge = async (code, parsedData = null) => {
//         if (!selectedCheckpoint) {
//             error('Please select a checkpoint first');
//             return;
//         }

//         if (!code.trim()) {
//             error('Please enter or scan a badge code');
//             return;
//         }

//         const checkpointId = selectedCheckpoint.id || selectedCheckpoint.checkpointId;
        
//         try {
//             setIsScanning(true);
//             setScanResult(null);

//             const url = `/events/${eventId}/scan?badgeCode=${encodeURIComponent(code)}&checkpointId=${checkpointId}`;
//             const response = await axiosInstance.post(url);

//             if (response.data && response.data.status === 'SUCCESS') {
//                 const attendeeData = response.data.data || {};
                
//                 // Merge with parsed data if available
//                 const mergedData = {
//                     ...attendeeData,
//                     ...parsedData,
//                     badgeCode: code
//                 };

//                 setScanResult({
//                     success: true,
//                     message: 'Badge scanned successfully',
//                     data: mergedData
//                 });

//                 success('Badge scanned successfully');
//                 setBadgeCode('');

//                 // For registration checkpoint, show badge preview
//                 if (selectedCheckpoint.type === 'REGISTRATION') {
//                     // Small delay to show success message first
//                     setTimeout(() => {
//                         handleViewBadge(mergedData);
//                     }, 500);
//                 }
//             } else {
//                 setScanResult({
//                     success: false,
//                     message: response.data.message || 'Failed to scan badge',
//                     data: response.data
//                 });
//                 error(response.data.message || 'Failed to scan badge');
//             }
//         } catch (err) {
//             console.error('Error scanning badge:', err);
//             const errorMessage = err.response?.data?.message || 'Failed to scan badge';
//             setScanResult({
//                 success: false,
//                 message: errorMessage,
//                 data: err.response?.data
//             });
//             error(errorMessage);
//         } finally {
//             setIsScanning(false);
//         }
//     };

//     // Fetch checkpoints
//     const fetchCheckpoints = async () => {
//         try {
//             const response = await axiosInstance.get(`/events/${eventId}/checkpoints`);
//             if (response.data && response.data.status === 'success') {
//                 const transformedData = response.data.data.map(cp => ({
//                     ...cp,
//                     id: cp.checkpointId || cp.id
//                 }));
//                 setCheckpoints(transformedData || []);
//             } else if (Array.isArray(response.data)) {
//                 const transformedData = response.data.map(cp => ({
//                     ...cp,
//                     id: cp.checkpointId || cp.id
//                 }));
//                 setCheckpoints(transformedData);
//             }
//         } catch (err) {
//             console.error('Error fetching checkpoints:', err);
//             error('Failed to load checkpoints');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Initial fetch
//     useEffect(() => {
//         fetchCheckpoints();
//         return () => {
//             mountedRef.current = false;
//             cleanup();
//         };
//     }, [eventId]);

//     // Handle checkpoint selection
//     const handleCheckpointSelect = (checkpoint) => {
//         const selectedCp = {
//             ...checkpoint,
//             id: checkpoint.id || checkpoint.checkpointId
//         };
//         setSelectedCheckpoint(selectedCp);
//         setBadgeCode('');
//         setScanResult(null);
//         setCameraError(null);
//         setShowCheckpointsList(false);
//     };

//     // Switch camera
//     const switchCamera = async () => {
//         if (!scannerRef.current || cameras.length < 2) return;
        
//         try {
//             setIsCameraReady(false);
            
//             const currentIndex = cameras.findIndex(c => c.id === currentCamera);
//             const nextIndex = (currentIndex + 1) % cameras.length;
//             const nextCamera = cameras[nextIndex];
            
//             await scannerRef.current.setCamera(nextCamera.id);
//             setCurrentCamera(nextCamera.id);
//             setIsCameraReady(true);
//         } catch (error) {
//             console.error('Camera switch error:', error);
//             setCameraError('Failed to switch camera');
//         }
//     };

//     // Toggle fullscreen
//     const toggleFullscreen = () => {
//         const container = document.getElementById('scanner-container');
//         if (!document.fullscreenElement) {
//             container?.requestFullscreen();
//             setIsFullscreen(true);
//         } else {
//             document.exitFullscreen();
//             setIsFullscreen(false);
//         }
//     };

//     // Handle retry camera
//     const handleRetryCamera = () => {
//         setCameraError(null);
//         setHasPermission(true);
//         setIsCameraReady(false);
//         cleanup();
//         mountedRef.current = true;
        
//         setTimeout(() => {
//             if (selectedCheckpoint) {
//                 initScanner();
//             }
//         }, 500);
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
//                 <span className="ml-3 text-gray-600">Loading checkpoints...</span>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="max-w-7xl mx-auto px-4 py-6">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-6">
//                     <button
//                         onClick={() => navigate(`/manage-event/${eventId}`)}
//                         className="flex items-center text-gray-600 hover:text-gray-800"
//                     >
//                         <ChevronLeft className="w-5 h-5 mr-1" />
//                         <span>Back to Event</span>
//                     </button>
//                 </div>

//                 {/* Checkpoints Selection */}
//                 {showCheckpointsList && (
//                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                         <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Checkpoint to Start Scanning</h2>
                        
//                         {checkpoints.length === 0 ? (
//                             <div className="text-center py-8 text-gray-500">
//                                 No checkpoints found. Please create a checkpoint first.
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {checkpoints.map((checkpoint) => (
//                                     <button
//                                         key={checkpoint.id}
//                                         onClick={() => handleCheckpointSelect(checkpoint)}
//                                         className="p-4 border rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left"
//                                     >
//                                         <div className="flex items-center gap-3 mb-2">
//                                             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                                                 <MapPin size={20} className="text-purple-600" />
//                                             </div>
//                                             <div>
//                                                 <h3 className="font-semibold text-gray-800">{checkpoint.name}</h3>
//                                                 <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
//                                                     {checkpoint.type}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <p className="text-sm text-gray-500 mt-2">
//                                             Click to start scanning at this checkpoint
//                                         </p>
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Scanner Section */}
//                 {selectedCheckpoint && (
//                     <div className="space-y-4">
//                         {/* Scanner Header */}
//                         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-3">
//                                     <div 
//                                         className="w-10 h-10 rounded-full flex items-center justify-center"
//                                         style={{ backgroundColor: `${checkpointColor}20` }}
//                                     >
//                                         <Camera size={20} style={{ color: checkpointColor }} />
//                                     </div>
//                                     <div>
//                                         <h2 className="text-lg font-semibold text-gray-800">
//                                             Scanning at: {selectedCheckpoint.name}
//                                         </h2>
//                                         <div className="flex items-center gap-2 mt-1">
//                                             <span 
//                                                 className="text-xs px-2 py-0.5 rounded-full"
//                                                 style={{ 
//                                                     backgroundColor: `${checkpointColor}20`,
//                                                     color: checkpointColor 
//                                                 }}
//                                             >
//                                                 {selectedCheckpoint.type}
//                                             </span>
//                                             {selectedCheckpoint.type === 'REGISTRATION' && (
//                                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
//                                                     <Printer size={12} />
//                                                     Prints badge on scan
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         setSelectedCheckpoint(null);
//                                         setShowCheckpointsList(true);
//                                         cleanup();
//                                     }}
//                                     className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                                 >
//                                     <X size={20} className="text-gray-500" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Scanner View */}
//                         <div 
//                             id="scanner-container"
//                             className="bg-black rounded-xl overflow-hidden relative"
//                             style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
//                         >
//                             <video 
//                                 ref={videoRef}
//                                 className="absolute inset-0 w-full h-full object-cover"
//                                 playsInline
//                                 muted
//                             />

//                             {/* Scanner Overlay */}
//                             {isCameraReady && !cameraError && (
//                                 <div className="absolute inset-0 pointer-events-none">
//                                     <div className="absolute inset-0 bg-black/30" />
                                    
//                                     <div className="absolute inset-0 flex items-center justify-center">
//                                         <div className="relative">
//                                             <div 
//                                                 className="w-64 h-64 rounded-lg border-2"
//                                                 style={{ borderColor: checkpointColor }}
//                                             />
                                            
//                                             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 rounded-tl-lg"
//                                                 style={{ borderColor: checkpointColor }} />
//                                             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 rounded-tr-lg"
//                                                 style={{ borderColor: checkpointColor }} />
//                                             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 rounded-bl-lg"
//                                                 style={{ borderColor: checkpointColor }} />
//                                             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 rounded-br-lg"
//                                                 style={{ borderColor: checkpointColor }} />
                                            
//                                             <div className="absolute inset-x-0 h-0.5 animate-scan"
//                                                 style={{ 
//                                                     background: `linear-gradient(90deg, transparent, ${checkpointColor}, transparent)`,
//                                                     boxShadow: `0 0 10px ${checkpointColor}`
//                                                 }} />
//                                         </div>
//                                     </div>

//                                     <div className="absolute bottom-6 left-0 right-0 flex justify-center">
//                                         <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
//                                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                                             <span className="text-white text-sm">
//                                                 {isProcessingScan.current ? 'Processing...' : 'Ready to scan'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Camera not ready */}
//                             {!isCameraReady && !cameraError && (
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
//                                     <Loader size={40} className="text-purple-500 animate-spin mb-4" />
//                                     <p className="text-white">Initializing camera...</p>
//                                 </div>
//                             )}

//                             {/* Camera error */}
//                             {cameraError && (
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
//                                     <AlertCircle size={48} className="text-red-500 mb-4" />
//                                     <p className="text-white text-center mb-4">{cameraError}</p>
//                                     {!hasPermission && (
//                                         <p className="text-gray-400 text-sm text-center mb-4">
//                                             Please enable camera access in your browser settings.
//                                         </p>
//                                     )}
//                                     <button
//                                         onClick={handleRetryCamera}
//                                         className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                                     >
//                                         <RefreshCw size={18} />
//                                         Retry Camera
//                                     </button>
//                                 </div>
//                             )}

//                             {/* Camera Controls */}
//                             {isCameraReady && !cameraError && (
//                                 <div className="absolute top-4 right-4 flex gap-2">
//                                     {cameras.length > 1 && (
//                                         <button
//                                             onClick={switchCamera}
//                                             className="p-3 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
//                                             title="Switch Camera"
//                                         >
//                                             <SwitchCamera size={20} />
//                                         </button>
//                                     )}
//                                     <button
//                                         onClick={toggleFullscreen}
//                                         className="p-3 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
//                                         title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//                                     >
//                                         {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Manual Entry */}
//                         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Manual Badge Entry
//                             </label>
//                             <div className="flex gap-2">
//                                 <input
//                                     type="text"
//                                     value={badgeCode}
//                                     onChange={(e) => setBadgeCode(e.target.value)}
//                                     placeholder="Enter badge code manually"
//                                     className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
//                                     disabled={isScanning}
//                                 />
//                                 <button
//                                     onClick={handleManualSubmit}
//                                     disabled={!badgeCode.trim() || isScanning}
//                                     className="px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     style={{ backgroundColor: checkpointColor }}
//                                 >
//                                     Submit
//                                 </button>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-2">
//                                 Tip: You can also paste (Ctrl+V) the QR code content directly
//                             </p>
//                         </div>

//                         {/* Scan Result */}
//                         {scanResult && (
//                             <div className={`p-4 rounded-lg border ${
//                                 scanResult.success 
//                                     ? 'bg-green-50 border-green-200' 
//                                     : 'bg-red-50 border-red-200'
//                             }`}>
//                                 <div className="flex items-start gap-3">
//                                     {scanResult.success ? (
//                                         <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
//                                     ) : (
//                                         <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
//                                     )}
//                                     <div className="flex-1">
//                                         <p className={`font-medium ${
//                                             scanResult.success ? 'text-green-800' : 'text-red-800'
//                                         }`}>
//                                             {scanResult.message}
//                                         </p>
//                                         {scanResult.success && scanResult.data && (
//                                             <div className="mt-3 space-y-2 text-sm">
//                                                 {scanResult.data.name && (
//                                                     <p><span className="text-gray-600">Name:</span> {scanResult.data.name}</p>
//                                                 )}
//                                                 {scanResult.data.email && (
//                                                     <p><span className="text-gray-600">Email:</span> {scanResult.data.email}</p>
//                                                 )}
//                                                 {scanResult.data.badgeCode && (
//                                                     <p><span className="text-gray-600">Badge Code:</span> {scanResult.data.badgeCode}</p>
//                                                 )}
//                                                 {scanResult.data.phone && (
//                                                     <p><span className="text-gray-600">Phone:</span> {scanResult.data.phone}</p>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Badge Preview Modal */}
//             {showBadgePreview && badgeData && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                                     <Eye size={20} className="text-purple-600" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-xl font-semibold text-gray-800">Badge Preview</h2>
//                                     <p className="text-sm text-gray-500">Review and print badge for {getDisplayName(badgeData)}</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setShowBadgePreview(false)}
//                                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                             >
//                                 <X size={20} className="text-gray-500" />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             {/* Field Selection */}
//                             {availableFields.length > 0 && (
//                                 <div className="mb-6">
//                                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                                         Select up to {MAX_FIELDS} fields to display on badge:
//                                     </label>
//                                     <div className="flex flex-wrap gap-2">
//                                         {availableFields.map((field) => {
//                                             const isSelected = selectedFields.includes(field.key);
//                                             const disabled = selectedFields.length >= MAX_FIELDS && !isSelected;
//                                             const hasValue = getFieldValue(badgeData, field.key);

//                                             return (
//                                                 <button
//                                                     key={field.key}
//                                                     onClick={() => toggleField(field.key)}
//                                                     disabled={disabled || !hasValue}
//                                                     className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
//                                                         isSelected
//                                                             ? 'bg-purple-600 text-white shadow-md'
//                                                             : disabled || !hasValue
//                                                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                                     }`}
//                                                 >
//                                                     {field.label}
//                                                     {!hasValue && (
//                                                         <span className="ml-1 text-xs opacity-50">(no data)</span>
//                                                     )}
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>
//                                     {selectedFields.length === 0 && (
//                                         <p className="text-xs text-amber-600 mt-2">
//                                             No fields selected. Only name and QR code will be displayed.
//                                         </p>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Badge Preview Card */}
//                             <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-6">
//                                 <div className="max-w-[400px] mx-auto">
//                                     {/* Name */}
//                                     <div className="text-center mb-4">
//                                         <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                                             {getDisplayName(badgeData)}
//                                         </h3>
//                                     </div>

//                                     {/* Selected Fields */}
//                                     {selectedFields.length > 0 && (
//                                         <div className="space-y-2 mb-4">
//                                             {selectedFields.map((field) => {
//                                                 const value = getFieldValue(badgeData, field);
//                                                 if (!value) return null;
//                                                 return (
//                                                     <div key={field} className="text-center">
//                                                         <p className="text-base font-semibold text-gray-800">
//                                                             {String(value)}
//                                                         </p>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     )}

//                                     {/* QR Code */}
//                                     <div className="flex flex-col items-center">
//                                         <div className="relative">
//                                             <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl blur-lg opacity-50"></div>
//                                             <div className="relative bg-white p-3 rounded-2xl border border-gray-200 shadow-inner">
//                                                 {qrImage ? (
//                                                     <img
//                                                         src={qrImage}
//                                                         alt="Badge QR Code"
//                                                         className="w-32 h-32 object-contain"
//                                                     />
//                                                 ) : (
//                                                     <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
//                                                         <Loader className="w-6 h-6 animate-spin text-purple-600" />
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         {/* Badge Code */}
//                                         <div className="mt-3 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
//                                             <p className="text-sm font-mono font-bold text-gray-800">
//                                                 {badgeData.badgeCode || `BDG-${badgeData.entryId || 'N/A'}`}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setShowBadgePreview(false)}
//                                     className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handlePrintBadge}
//                                     disabled={generatingPDF}
//                                     className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                                 >
//                                     {generatingPDF ? (
//                                         <>
//                                             <Loader size={18} className="animate-spin" />
//                                             Generating...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Printer size={18} />
//                                             Print Badge
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <style>{`
//                 @keyframes scan {
//                     0% { transform: translateY(-100px); }
//                     50% { transform: translateY(100px); }
//                     100% { transform: translateY(-100px); }
//                 }
//                 .animate-scan {
//                     animation: scan 2s ease-in-out infinite;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default QRScanPage;



import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contestAPI/NotificationProvider';
import {
    ChevronLeft,
    Camera,
    MapPin,
    CheckCircle,
    XCircle,
    RefreshCw,
    Loader,
    SwitchCamera,
    Maximize2,
    Minimize2,
    X,
    Printer,
    Download
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import axiosInstance from '../../../helper/AxiosInstance';

const QRScanPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { success, error } = useNotification();

    // State
    const [checkpoints, setCheckpoints] = useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [showCheckpointsList, setShowCheckpointsList] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [badgeCode, setBadgeCode] = useState('');
    
    // Badge config state
    const [badgeConfig, setBadgeConfig] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(false);
    
    // Badge preview states
    const [showBadgePreview, setShowBadgePreview] = useState(false);
    const [badgeData, setBadgeData] = useState(null);
    const [qrImage, setQrImage] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    
    // Store field labels for display
    const [fieldLabels, setFieldLabels] = useState({});

    // Camera states
    const [cameraError, setCameraError] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasPermission, setHasPermission] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [currentCamera, setCurrentCamera] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const mountedRef = useRef(true);
    const isProcessingScan = useRef(false);
    const initTimeoutRef = useRef(null);

    // Get checkpoint color
    const getCheckpointColor = () => {
        if (!selectedCheckpoint) return '#8b5cf6';
        switch (selectedCheckpoint?.type) {
            case 'REGISTRATION': return '#8b5cf6';
            case 'FOOD': return '#f59e0b';
            case 'KIT': return '#10b981';
            case 'HALL': return '#3b82f6';
            case 'CUSTOM': return '#6b7280';
            default: return '#8b5cf6';
        }
    };

    const checkpointColor = getCheckpointColor();

    // Fetch badge configuration on mount
    useEffect(() => {
        fetchBadgeConfig();
    }, [eventId]);

    // Fetch badge configuration
    const fetchBadgeConfig = async () => {
        try {
            setLoadingConfig(true);
            const response = await axiosInstance.get(`/events/${eventId}/config`);
            if (response.data?.status === "success" && response.data?.data) {
                setBadgeConfig(response.data.data);
                
                // Create field labels mapping (you might want to fetch these from form fields)
                const labels = {};
                response.data.data.selectedFieldKeys.forEach(key => {
                    // Convert snake_case to Title Case for display
                    labels[key] = key
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                });
                setFieldLabels(labels);
            }
        } catch (err) {
            console.error("Error fetching badge config:", err);
            // If 404, no config exists yet - that's fine
            if (err.response?.status !== 404) {
                console.error("Unexpected error:", err);
            }
        } finally {
            setLoadingConfig(false);
        }
    };

    // Get display name
    const getDisplayName = (data) => {
        return data?.name || data?.Name || data?.responses?.name || "Attendee";
    };

    // Get field value from the scan response data
    const getFieldValue = (data, fieldKey) => {
        if (!data) return "";
        
        // Check in responses first (as per your API response structure)
        if (data.responses && data.responses[fieldKey] !== undefined) {
            return data.responses[fieldKey];
        }
        
        // Then check in root data
        if (data[fieldKey] !== undefined) {
            return data[fieldKey];
        }
        
        // Check in data.data if it exists
        if (data.data && data.data[fieldKey] !== undefined) {
            return data.data[fieldKey];
        }
        
        return "";
    };

    // Generate QR code for badge
    const generateBadgeQR = async (badgeData) => {
        try {
            const displayName = getDisplayName(badgeData);
            
            const payloadMap = {
                name: displayName,
                email: badgeData.email || badgeData.Email || badgeData.responses?.email || "",
                badge: badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`,
                entryId: badgeData.entryId || "",
                event: badgeData.eventName || badgeData.event || "Event"
            };

            const qrPayload = JSON.stringify(payloadMap);

            const qrBase64 = await QRCode.toDataURL(qrPayload, {
                width: 300,
                margin: 1,
                errorCorrectionLevel: 'H',
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            return qrBase64;
        } catch (err) {
            console.error('Failed to generate QR:', err);
            return null;
        }
    };

    // Handle print badge PDF
    const handlePrintBadge = async () => {
        if (!badgeData) return;

        setGeneratingPDF(true);

        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [76, 102], // Badge size
            });

            const centerX = 38;
            const displayName = getDisplayName(badgeData);

            // Add name
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(displayName, centerX, 20, { align: "center" });

            // Add configured fields from badge config
            if (badgeConfig?.selectedFieldKeys && badgeConfig.selectedFieldKeys.length > 0) {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                let y = 28;

                badgeConfig.selectedFieldKeys.forEach((fieldKey) => {
                    const value = getFieldValue(badgeData, fieldKey);
                    if (!value && value !== 0) return; // Skip empty values
                    pdf.text(String(value), centerX, y, { align: "center" });
                    y += 6;
                });
            }

            // Generate and add QR code
            try {
                const payloadMap = {
                    name: displayName,
                    email: badgeData.email || badgeData.Email || badgeData.responses?.email || "",
                    badge: badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`,
                    entryId: badgeData.entryId || "",
                    event: badgeData.eventName || badgeData.event || "Event"
                };

                const qrPayload = JSON.stringify(payloadMap);
                const qrBase64 = await QRCode.toDataURL(qrPayload, {
                    width: 300,
                    margin: 1,
                    errorCorrectionLevel: 'H'
                });

                const qrSize = 40;
                const qrX = (76 - qrSize) / 2;
                // Position QR code based on number of configured fields
                const fieldCount = badgeConfig?.selectedFieldKeys?.filter(key => getFieldValue(badgeData, key)).length || 0;
                const qrY = 30 + (fieldCount * 6);

                pdf.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
            } catch (err) {
                console.error("QR generation failed:", err);
            }

            // Add badge code
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "bold");
            const fieldCount = badgeConfig?.selectedFieldKeys?.filter(key => getFieldValue(badgeData, key)).length || 0;
            const badgeCodeY = 75 + (fieldCount * 6);
            pdf.text(badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`, centerX, badgeCodeY, { align: "center" });

            // Open in new window for printing
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Open print dialog
            const printWindow = window.open(pdfUrl);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            } else {
                // Fallback to download if popup blocked
                const fileName = `${displayName}_Badge.pdf`;
                pdf.save(fileName);
                success('Badge PDF downloaded successfully');
            }

            // Close preview after print
            setShowBadgePreview(false);
            success('Badge ready for printing');

        } catch (err) {
            console.error('PDF generation failed:', err);
            error('Failed to generate badge PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Handle download PDF
    const handleDownloadPDF = async () => {
        if (!badgeData) return;

        setGeneratingPDF(true);

        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [76, 102],
            });

            const centerX = 38;
            const displayName = getDisplayName(badgeData);

            // Name
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(displayName, centerX, 20, { align: "center" });

            // Add configured fields from badge config
            if (badgeConfig?.selectedFieldKeys && badgeConfig.selectedFieldKeys.length > 0) {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                let y = 28;

                badgeConfig.selectedFieldKeys.forEach((fieldKey) => {
                    const value = getFieldValue(badgeData, fieldKey);
                    if (!value && value !== 0) return; // Skip empty values
                    pdf.text(String(value), centerX, y, { align: "center" });
                    y += 6;
                });
            }

            // Generate QR Code
            try {
                const payloadMap = {
                    name: displayName,
                    email: badgeData.email || badgeData.Email || badgeData.responses?.email || "",
                    badge: badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`,
                    entryId: badgeData.entryId || "",
                    event: badgeData.eventName || badgeData.event || "Event"
                };

                const qrPayload = JSON.stringify(payloadMap);
                
                const qrBase64 = await QRCode.toDataURL(qrPayload, {
                    width: 300,
                    margin: 1,
                    errorCorrectionLevel: 'H',
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });

                const qrSize = 40;
                const qrX = (76 - qrSize) / 2;
                // Position QR code based on number of configured fields
                const fieldCount = badgeConfig?.selectedFieldKeys?.filter(key => getFieldValue(badgeData, key)).length || 0;
                const qrY = 30 + (fieldCount * 6);

                pdf.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
            } catch (err) {
                console.error("QR generation failed:", err);
            }

            // Badge Code
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "bold");
            const fieldCount = badgeConfig?.selectedFieldKeys?.filter(key => getFieldValue(badgeData, key)).length || 0;
            const badgeCodeY = 75 + (fieldCount * 6);
            pdf.text(badgeData.badgeCode || `BDG-${badgeData.entryId || Date.now()}`, centerX, badgeCodeY, { align: "center" });

            const fileName = `${displayName}_Badge.pdf`;
            pdf.save(fileName);
            
            // Close preview after download
            setShowBadgePreview(false);
            success('Badge downloaded successfully');

        } catch (err) {
            console.error("PDF generation failed:", err);
            error('Failed to generate PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Parse QR code value
    const parseQRValue = (qrValue) => {
        try {
            const trimmedValue = qrValue.trim();
            
            if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
                const parsedJson = JSON.parse(trimmedValue);
                if (Array.isArray(parsedJson)) {
                    return parsedJson.length > 0 ? parsedJson[0] : null;
                }
                return parsedJson;
            }
            
            const lines = trimmedValue.split('\n');
            const parsedData = {};
            
            lines.forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    const key = line.substring(0, colonIndex).trim().toLowerCase();
                    const value = line.substring(colonIndex + 1).trim();
                    
                    if (value) {
                        if (key.includes('name')) {
                            parsedData.name = value;
                        } else if (key.includes('email')) {
                            parsedData.email = value;
                        } else if (key.includes('badge') || key.includes('code')) {
                            if (key.includes('badge') || key.includes('qr')) {
                                parsedData.badgeCode = value;
                            }
                        } else if (key.includes('phone') || key.includes('mobile')) {
                            parsedData.phone = value;
                        } else {
                            parsedData[key.replace(/\s+/g, '')] = value;
                        }
                    }
                }
            });
            
            return parsedData;
        } catch (error) {
            console.error('Error parsing QR value:', error);
            return { raw: qrValue };
        }
    };

    // Extract badge code
    const extractBadgeCode = (parsedData) => {
        if (!parsedData) return null;
        
        const possibleBadgeFields = [
            'badge',
            'badgeCode',
            'code',
            'qrCode',
            'qr',
            'badgecode',
            'badge_code',
            'qr-code'
        ];
        
        for (const field of possibleBadgeFields) {
            if (parsedData[field]) {
                return parsedData[field];
            }
            const lowerField = field.toLowerCase();
            for (const key in parsedData) {
                if (key.toLowerCase() === lowerField && parsedData[key]) {
                    return parsedData[key];
                }
            }
        }
        
        return null;
    };

    // Cleanup camera
    const cleanup = () => {
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
    };

    // Initialize scanner
    const initScanner = async () => {
        if (!mountedRef.current || !videoRef.current || !selectedCheckpoint) return;

        try {
            const devices = await QrScanner.listCameras();
            if (!mountedRef.current) return;
            
            setCameras(devices);
            
            if (devices.length === 0) {
                setCameraError('No camera found on this device');
                return;
            }
            
            const backCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment') ||
                device.label.toLowerCase().includes('rear')
            ) || devices[0];
            
            setCurrentCamera(backCamera.id);
            
            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    if (!isProcessingScan.current && result && mountedRef.current) {
                        handleQRScan(result.data);
                    }
                },
                {
                    preferredCamera: backCamera.id,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    returnDetailedScanResult: true,
                    maxScansPerSecond: 5,
                }
            );
            
            scannerRef.current = scanner;
            await scanner.start();
            
            if (mountedRef.current) {
                setIsCameraReady(true);
                setCameraError(null);
                setHasPermission(true);
            }
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
    };

    // Initialize scanner when checkpoint is selected
    useEffect(() => {
        if (!selectedCheckpoint) {
            cleanup();
            return;
        }

        mountedRef.current = true;
        
        initTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && selectedCheckpoint) {
                initScanner();
            }
        }, 300);

        return () => {
            mountedRef.current = false;
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
            }
            cleanup();
        };
    }, [selectedCheckpoint]);

    // Handle QR scan
    const handleQRScan = async (qrValue) => {
        if (isProcessingScan.current || !selectedCheckpoint) return;
        
        isProcessingScan.current = true;
        
        try {
            const parsedData = parseQRValue(qrValue);
            const extractedBadgeCode = extractBadgeCode(parsedData) || qrValue;
            setBadgeCode(extractedBadgeCode);
            
            if (navigator.vibrate) navigator.vibrate(50);
            
            await handleScanBadge(extractedBadgeCode, parsedData);
            
        } catch (error) {
            console.error('Error processing QR scan:', error);
            error('Failed to process QR code');
        } finally {
            setTimeout(() => {
                isProcessingScan.current = false;
            }, 2000);
        }
    };

    // Handle manual entry
    const handleManualSubmit = () => {
        if (badgeCode.trim() && selectedCheckpoint) {
            handleQRScan(badgeCode);
        }
    };

    // Scan badge API call
    const handleScanBadge = async (code, parsedData = null) => {
        if (!selectedCheckpoint) {
            error('Please select a checkpoint first');
            return;
        }

        if (!code.trim()) {
            error('Please enter or scan a badge code');
            return;
        }

        const checkpointId = selectedCheckpoint.id || selectedCheckpoint.checkpointId;
        
        try {
            setIsScanning(true);
            setScanResult(null);

            const url = `/events/${eventId}/scan?badgeCode=${encodeURIComponent(code)}&checkpointId=${checkpointId}`;
            const response = await axiosInstance.post(url);

            // The response structure matches your example:
            // {
            //     "action": "PRINT_BADGE",
            //     "status": "SUCCESS",
            //     "name": "kk",
            //     "data": {
            //         "badgeCode": "BDG-8373F75D",
            //         "email": "ka@gmail.com",
            //         "entryId": 16,
            //         "name": "kk",
            //         "phone": "0987654323",
            //         "responses": { ... }
            //     }
            // }

            if (response.data && response.data.status === 'SUCCESS') {
                // The actual badge data is in response.data.data
                const attendeeData = response.data.data || {};
                
                // Also include top-level fields if needed
                const mergedData = {
                    ...attendeeData,
                    ...parsedData,
                    badgeCode: code,
                    action: response.data.action,
                    status: response.data.status
                };

                setScanResult({
                    success: true,
                    message: 'Badge scanned successfully',
                    data: mergedData
                });

                success('Badge scanned successfully');
                setBadgeCode('');

                // For registration checkpoint, show badge preview
                if (selectedCheckpoint.type === 'REGISTRATION') {
                    setBadgeData(mergedData);
                    
                    // Generate QR for preview
                    const qr = await generateBadgeQR(mergedData);
                    setQrImage(qr);
                    
                    // Small delay to show success message first
                    setTimeout(() => {
                        setShowBadgePreview(true);
                    }, 500);
                }
            } else {
                setScanResult({
                    success: false,
                    message: response.data.message || 'Failed to scan badge',
                    data: response.data
                });
                error(response.data.message || 'Failed to scan badge');
            }
        } catch (err) {
            console.error('Error scanning badge:', err);
            const errorMessage = err.response?.data?.message || 'Failed to scan badge';
            setScanResult({
                success: false,
                message: errorMessage,
                data: err.response?.data
            });
            error(errorMessage);
        } finally {
            setIsScanning(false);
        }
    };

    // Fetch checkpoints
    const fetchCheckpoints = async () => {
        try {
            const response = await axiosInstance.get(`/events/${eventId}/checkpoints`);
            if (response.data && response.data.status === 'success') {
                const transformedData = response.data.data.map(cp => ({
                    ...cp,
                    id: cp.checkpointId || cp.id
                }));
                setCheckpoints(transformedData || []);
            } else if (Array.isArray(response.data)) {
                const transformedData = response.data.map(cp => ({
                    ...cp,
                    id: cp.checkpointId || cp.id
                }));
                setCheckpoints(transformedData);
            }
        } catch (err) {
            console.error('Error fetching checkpoints:', err);
            error('Failed to load checkpoints');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchCheckpoints();
        return () => {
            mountedRef.current = false;
            cleanup();
        };
    }, [eventId]);

    // Handle checkpoint selection
    const handleCheckpointSelect = (checkpoint) => {
        const selectedCp = {
            ...checkpoint,
            id: checkpoint.id || checkpoint.checkpointId
        };
        setSelectedCheckpoint(selectedCp);
        setBadgeCode('');
        setScanResult(null);
        setCameraError(null);
        setShowCheckpointsList(false);
    };

    // Switch camera
    const switchCamera = async () => {
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
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        const container = document.getElementById('scanner-container');
        if (!document.fullscreenElement) {
            container?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Handle retry camera
    const handleRetryCamera = () => {
        setCameraError(null);
        setHasPermission(true);
        setIsCameraReady(false);
        cleanup();
        mountedRef.current = true;
        
        setTimeout(() => {
            if (selectedCheckpoint) {
                initScanner();
            }
        }, 500);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading checkpoints...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(`/manage-event/${eventId}`)}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        <span>Back to Event</span>
                    </button>
                </div>

                {/* Checkpoints Selection */}
                {showCheckpointsList && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Checkpoint to Start Scanning</h2>
                        
                        {checkpoints.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No checkpoints found. Please create a checkpoint first.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {checkpoints.map((checkpoint) => (
                                    <button
                                        key={checkpoint.id}
                                        onClick={() => handleCheckpointSelect(checkpoint)}
                                        className="p-4 border rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <MapPin size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{checkpoint.name}</h3>
                                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                                    {checkpoint.type}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Click to start scanning at this checkpoint
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Scanner Section */}
                {selectedCheckpoint && (
                    <div className="space-y-4">
                        {/* Scanner Header */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${checkpointColor}20` }}
                                    >
                                        <Camera size={20} style={{ color: checkpointColor }} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Scanning at: {selectedCheckpoint.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span 
                                                className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ 
                                                    backgroundColor: `${checkpointColor}20`,
                                                    color: checkpointColor 
                                                }}
                                            >
                                                {selectedCheckpoint.type}
                                            </span>
                                            {selectedCheckpoint.type === 'REGISTRATION' && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <span>Shows badge on scan</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCheckpoint(null);
                                        setShowCheckpointsList(true);
                                        cleanup();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Scanner View */}
                        <div 
                            id="scanner-container"
                            className="bg-black rounded-xl overflow-hidden relative"
                            style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
                        >
                            <video 
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                playsInline
                                muted
                            />

                            {/* Scanner Overlay */}
                            {isCameraReady && !cameraError && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 bg-black/30" />
                                    
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <div 
                                                className="w-64 h-64 rounded-lg border-2"
                                                style={{ borderColor: checkpointColor }}
                                            />
                                            
                                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 rounded-tl-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 rounded-tr-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 rounded-bl-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 rounded-br-lg"
                                                style={{ borderColor: checkpointColor }} />
                                            
                                            <div className="absolute inset-x-0 h-0.5 animate-scan"
                                                style={{ 
                                                    background: `linear-gradient(90deg, transparent, ${checkpointColor}, transparent)`,
                                                    boxShadow: `0 0 10px ${checkpointColor}`
                                                }} />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-white text-sm">
                                                {isProcessingScan.current ? 'Processing...' : 'Ready to scan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Camera not ready */}
                            {!isCameraReady && !cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                                    <Loader size={40} className="text-purple-500 animate-spin mb-4" />
                                    <p className="text-white">Initializing camera...</p>
                                </div>
                            )}

                            {/* Camera error */}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-3xl">⚠️</span>
                                    </div>
                                    <p className="text-white text-center mb-4">{cameraError}</p>
                                    {!hasPermission && (
                                        <p className="text-gray-400 text-sm text-center mb-4">
                                            Please enable camera access in your browser settings.
                                        </p>
                                    )}
                                    <button
                                        onClick={handleRetryCamera}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        <RefreshCw size={18} />
                                        Retry Camera
                                    </button>
                                </div>
                            )}

                            {/* Camera Controls */}
                            {isCameraReady && !cameraError && (
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {cameras.length > 1 && (
                                        <button
                                            onClick={switchCamera}
                                            className="p-3 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                                            title="Switch Camera"
                                        >
                                            <SwitchCamera size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="p-3 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                    >
                                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Manual Entry */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manual Badge Entry
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={badgeCode}
                                    onChange={(e) => setBadgeCode(e.target.value)}
                                    placeholder="Enter badge code manually"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                    disabled={isScanning}
                                />
                                <button
                                    onClick={handleManualSubmit}
                                    disabled={!badgeCode.trim() || isScanning}
                                    className="px-6 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: checkpointColor }}
                                >
                                    Submit
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Tip: You can also paste (Ctrl+V) the QR code content directly
                            </p>
                        </div>

                        {/* Scan Result */}
                        {scanResult && (
                            <div className={`p-4 rounded-lg border ${
                                scanResult.success 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {scanResult.success ? (
                                        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-medium ${
                                            scanResult.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {scanResult.message}
                                        </p>
                                        {scanResult.success && scanResult.data && (
                                            <div className="mt-3 space-y-2 text-sm">
                                                <p><span className="text-gray-600">Name:</span> {scanResult.data.name}</p>
                                                <p><span className="text-gray-600">Email:</span> {scanResult.data.email}</p>
                                                <p><span className="text-gray-600">Badge Code:</span> {scanResult.data.badgeCode}</p>
                                                {/* Show configured fields in scan result */}
                                                {badgeConfig?.selectedFieldKeys?.map(key => {
                                                    const value = getFieldValue(scanResult.data, key);
                                                    if (!value) return null;
                                                    return (
                                                        <p key={key}>
                                                            <span className="text-gray-600">{fieldLabels[key] || key}:</span> {value}
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Badge Preview Modal - Shows configured fields with values from scan response */}
            {showBadgePreview && badgeData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xl">🏷️</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Badge Preview</h2>
                                    <p className="text-sm text-gray-500">
                                        Badge for {getDisplayName(badgeData)}
                                    </p>
                                    {badgeConfig?.selectedFieldKeys && (
                                        <p className="text-xs text-purple-600 mt-1">
                                            Showing {badgeConfig.selectedFieldKeys.filter(key => getFieldValue(badgeData, key)).length} of {badgeConfig.selectedFieldKeys.length} configured fields
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBadgePreview(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Badge Card - Shows values from scan response based on config keys */}
                        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden w-full max-w-[400px] mx-auto mb-6">
                            {/* Decorative top bar */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                            
                            <div className="p-6">
                                {/* Name - Always shown */}
                                <div className="text-center mb-4">
                                    <h4 className="text-xl font-bold text-gray-800 truncate">
                                        {getDisplayName(badgeData)}
                                    </h4>
                                </div>

                                {/* Configured Fields - Show values using keys from badge config */}
                                {badgeConfig?.selectedFieldKeys && badgeConfig.selectedFieldKeys.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {badgeConfig.selectedFieldKeys.map((fieldKey) => {
                                            const value = getFieldValue(badgeData, fieldKey);
                                            if (!value && value !== 0) return null; // Skip empty values
                                            
                                            return (
                                                <div key={fieldKey} className="text-center">
                                                    <p className="text-sm font-semibold text-gray-800 truncate px-2">
                                                        {String(value)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* QR Code */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur-lg opacity-50"></div>
                                        <div className="relative bg-white p-3 rounded-2xl border border-gray-100 shadow-inner">
                                            {qrImage ? (
                                                <img
                                                    src={qrImage}
                                                    alt={`QR Code for ${getDisplayName(badgeData)}`}
                                                    className="w-32 h-32 object-contain"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                                                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge Code */}
                                    <div className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
                                        <p className="text-sm font-mono font-bold text-gray-800">
                                            {badgeData.badgeCode || `BDG-${badgeData.entryId}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrintBadge}
                                disabled={generatingPDF}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2 transition-all"
                            >
                                {generatingPDF ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Printer className="w-4 h-4" />
                                )}
                                <span>Print Badge</span>
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={generatingPDF}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2 transition-all"
                            >
                                {generatingPDF ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default QRScanPage;