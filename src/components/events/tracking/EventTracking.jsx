
// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useNotification } from '../../../contestAPI/NotificationProvider';
// import {
//     ChevronLeft,
//     ChevronRight,
//     Calendar,
//     MapPin,
//     User,
//     Clock,
//     Filter,
//     Download,
//     RefreshCw,
//     Activity,
//     Users,
//     FileText,
//     CheckCircle,
//     XCircle,
//     AlertCircle,
//     BarChart3,
//     QrCode,
//     Camera,
//     Map,
//     Plus,
//     List,
//     Utensils,
//     Package,
//     Home,
//     Settings,
//     ChevronDown,
//     CameraOff,
//     FileSpreadsheet,
//     Printer,
//     X,
//     Menu,
//     ChevronUp,
//     Eye,
//     EyeOff
// } from 'lucide-react';
// import axiosInstance from '../../../helper/AxiosInstance';
// import * as XLSX from 'xlsx';
// import QRScanner from './QRScannerModal';

// // Checkpoint types for dropdown
// const CHECKPOINT_TYPES = [
//     { value: 'REGISTRATION', label: 'REGISTRATION', icon: 'CheckCircle' },
//     { value: 'FOOD', label: 'FOOD', icon: 'Utensils' },
//     { value: 'KIT', label: 'KIT', icon: 'Package' },
//     { value: 'HALL', label: 'HALL', icon: 'Home' },
//     { value: 'CUSTOM', label: 'CUSTOM', icon: 'Settings' }
// ];

// const EventTracking = () => {
//     try {
//         const { eventId } = useParams();
//         const navigate = useNavigate();
//         const { success, error } = useNotification();
//         const [isMobileView, setIsMobileView] = useState(false);
//         const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//         const [expandedLogs, setExpandedLogs] = useState(new Set());

//         const [logs, setLogs] = useState([]);
//         const [logsCount, setLogsCount] = useState(0);
//         const [isLoading, setIsLoading] = useState(true);
//         const [isExporting, setIsExporting] = useState(false);
//         const [event, setEvent] = useState(null);

//         // Filter states for backend API
//         const [filterType, setFilterType] = useState('all');
//         const [checkpointFilter, setCheckpointFilter] = useState('all');
//         const [fromDate, setFromDate] = useState('');
//         const [toDate, setToDate] = useState('');

//         // Pagination states
//         const [currentPage, setCurrentPage] = useState(0);
//         const [pageSize] = useState(20);
//         const [totalPages, setTotalPages] = useState(0);

//         // Checkpoint states
//         const [checkpoints, setCheckpoints] = useState([]);
//         const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
//         const [badgeCode, setBadgeCode] = useState('');
//         const [scanResult, setScanResult] = useState(null);
//         const [isScanning, setIsScanning] = useState(false);
//         const [showCheckpointsList, setShowCheckpointsList] = useState(true);
//         const [showCreateCheckpoint, setShowCreateCheckpoint] = useState(false);
//         const [showScannerModal, setShowScannerModal] = useState(false);
//         const [newCheckpoint, setNewCheckpoint] = useState({
//             name: '',
//             type: 'REGISTRATION'
//         });
//         const [showTypeDropdown, setShowTypeDropdown] = useState(false);
//         const [showPrintModal, setShowPrintModal] = useState(false);
//         const [printData, setPrintData] = useState(null);

//         // QR Scanner processing state
//         const isProcessingScan = useRef(false);

//         // Check for mobile view
//         useEffect(() => {
//             const checkMobile = () => {
//                 setIsMobileView(window.innerWidth < 768);
//             };
//             checkMobile();
//             window.addEventListener('resize', checkMobile);
//             return () => window.removeEventListener('resize', checkMobile);
//         }, []);

//         // Toggle log expansion
//         const toggleLogExpansion = (logIndex) => {
//             setExpandedLogs(prev => {
//                 const newSet = new Set(prev);
//                 if (newSet.has(logIndex)) {
//                     newSet.delete(logIndex);
//                 } else {
//                     newSet.add(logIndex);
//                 }
//                 return newSet;
//             });
//         };

//         // Get icon component based on checkpoint type
//         const getIconComponent = (type, size = 16, className = "text-purple-600") => {
//             switch (type) {
//                 case 'REGISTRATION':
//                     return <CheckCircle size={size} className={className} />;
//                 case 'FOOD':
//                     return <Utensils size={size} className={className} />;
//                 case 'KIT':
//                     return <Package size={size} className={className} />;
//                 case 'HALL':
//                     return <Home size={size} className={className} />;
//                 case 'CUSTOM':
//                     return <Settings size={size} className={className} />;
//                 default:
//                     return <MapPin size={size} className={className} />;
//             }
//         };

//         // Fetch event logs with filters from backend
//         const fetchEventLogs = async (page = currentPage) => {
//             try {
//                 setIsLoading(true);

//                 // Build query parameters
//                 const params = new URLSearchParams();

//                 if (filterType !== 'all') {
//                     params.append('type', filterType);
//                 }

//                 if (checkpointFilter !== 'all') {
//                     params.append('checkpointId', checkpointFilter);
//                 }

//                 if (fromDate) {
//                     params.append('fromDate', fromDate);
//                 }
//                 if (toDate) {
//                     params.append('toDate', toDate);
//                 }

//                 params.append('page', page);
//                 params.append('size', pageSize);

//                 const url = `/events/${eventId}/logs${params.toString() ? '?' + params.toString() : ''}`;

//                 const response = await axiosInstance.get(url);

//                 if (response.data && response.data.status === 'SUCCESS') {
//                     setLogs(response.data.data || []);
//                     setLogsCount(response.data.totalElements || 0);
//                     setTotalPages(response.data.totalPages || 0);
//                 } else if (Array.isArray(response.data)) {
//                     setLogs(response.data);
//                     setLogsCount(response.data.length);
//                     setTotalPages(1);
//                 } else {
//                     setLogs([]);
//                     setLogsCount(0);
//                     setTotalPages(0);
//                 }
//             } catch (err) {
//                 console.error('Error fetching event logs:', err);
//                 error('Failed to load event logs');
//                 setLogs([]);
//                 setLogsCount(0);
//                 setTotalPages(0);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         // Fetch all logs for export (without pagination)
//         const fetchAllLogsForExport = async () => {
//             try {
//                 const params = new URLSearchParams();

//                 if (filterType !== 'all') {
//                     params.append('type', filterType);
//                 }

//                 if (checkpointFilter !== 'all') {
//                     params.append('checkpointId', checkpointFilter);
//                 }

//                 if (fromDate) {
//                     params.append('fromDate', fromDate);
//                 }
//                 if (toDate) {
//                     params.append('toDate', toDate);
//                 }

//                 params.append('page', '0');
//                 params.append('size', '1000');

//                 const url = `/events/${eventId}/logs${params.toString() ? '?' + params.toString() : ''}`;
//                 const response = await axiosInstance.get(url);

//                 if (response.data && response.data.status === 'SUCCESS') {
//                     return response.data.data || [];
//                 } else if (Array.isArray(response.data)) {
//                     return response.data;
//                 }
//                 return [];
//             } catch (err) {
//                 console.error('Error fetching logs for export:', err);
//                 throw err;
//             }
//         };

//         // Export to Excel
//         const handleExportToExcel = async () => {
//             try {
//                 setIsExporting(true);

//                 const allLogs = await fetchAllLogsForExport();

//                 if (!allLogs || allLogs.length === 0) {
//                     error('No logs to export');
//                     setIsExporting(false);
//                     return;
//                 }

//                 const excelData = allLogs.map((log, index) => ({
//                     'S.No': index + 1,
//                     'Attendee Name': log.attendeeName || 'N/A',
//                     'Attendee Email': log.attendeeEmail || 'N/A',
//                     'Badge Code': log.badgeCode || 'N/A',
//                     'Checkpoint Name': log.checkpointName || 'N/A',
//                     'Checkpoint Type': log.checkpointType || 'N/A',
//                     'Scanned By': log.scannedBy || 'N/A',
//                     'Scanned At': log.scannedAt ? new Date(log.scannedAt).toLocaleString('en-US', {
//                         year: 'numeric',
//                         month: '2-digit',
//                         day: '2-digit',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         second: '2-digit',
//                         hour12: false
//                     }) : 'N/A'
//                 }));

//                 const ws = XLSX.utils.json_to_sheet(excelData);

//                 const colWidths = [
//                     { wch: 5 },   // S.No
//                     { wch: 25 },  // Attendee Name
//                     { wch: 35 },  // Attendee Email
//                     { wch: 20 },  // Badge Code
//                     { wch: 25 },  // Checkpoint Name
//                     { wch: 15 },  // Checkpoint Type
//                     { wch: 20 },  // Scanned By
//                     { wch: 25 }   // Scanned At
//                 ];
//                 ws['!cols'] = colWidths;

//                 const wb = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(wb, ws, 'Event Logs');

//                 const summaryData = [
//                     ['Export Information'],
//                     [''],
//                     ['Event Name', getEventName()],
//                     ['Event ID', eventId],
//                     ['Export Date', new Date().toLocaleString()],
//                     ['Total Logs', allLogs.length],
//                     [''],
//                     ['Applied Filters'],
//                     ['Type Filter', filterType !== 'all' ? filterType : 'No filter'],
//                     ['Checkpoint Filter', checkpointFilter !== 'all' ?
//                         (checkpoints.find(cp => cp.id === checkpointFilter)?.name || checkpointFilter) : 'No filter'],
//                     ['From Date', fromDate || 'No filter'],
//                     ['To Date', toDate || 'No filter']
//                 ];

//                 const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
//                 XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

//                 const eventName = getEventName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
//                 const dateStr = new Date().toISOString().split('T')[0];
//                 const fileName = `${eventName}_logs_${dateStr}.xlsx`;

//                 XLSX.writeFile(wb, fileName);

//                 success(`Successfully exported ${allLogs.length} logs to Excel`);
//             } catch (err) {
//                 console.error('Error exporting to Excel:', err);
//                 error('Failed to export logs to Excel');
//             } finally {
//                 setIsExporting(false);
//             }
//         };

//         // Fetch all checkpoints
//         const fetchAllCheckpoints = async () => {
//             try {
//                 const response = await axiosInstance.get(`/events/${eventId}/checkpoints`);

//                 if (response.data && response.data.status === 'success') {
//                     const transformedData = response.data.data.map(cp => ({
//                         ...cp,
//                         id: cp.checkpointId
//                     }));
//                     setCheckpoints(transformedData || []);
//                 } else if (Array.isArray(response.data)) {
//                     const transformedData = response.data.map(cp => ({
//                         ...cp,
//                         id: cp.checkpointId
//                     }));
//                     setCheckpoints(transformedData);
//                 } else {
//                     setCheckpoints([]);
//                 }
//             } catch (err) {
//                 console.error('Error fetching checkpoints:', err);
//                 setCheckpoints([]);
//             }
//         };

//         // Create checkpoint
//         const handleCreateCheckpoint = async () => {
//             if (!newCheckpoint.name.trim()) {
//                 error('Checkpoint name is required');
//                 return;
//             }

//             try {
//                 setIsScanning(true);
//                 const response = await axiosInstance.post(`/events/${eventId}/checkpoints`, {
//                     type: newCheckpoint.type,
//                     name: newCheckpoint.name
//                 });

//                 success(`${newCheckpoint.type} checkpoint created successfully`);
//                 setShowCreateCheckpoint(false);
//                 setNewCheckpoint({ name: '', type: 'REGISTRATION' });
//                 setShowTypeDropdown(false);
//                 fetchAllCheckpoints();
//             } catch (err) {
//                 console.error('Error creating checkpoint:', err);
//                 error(err.response?.data?.message || 'Failed to create checkpoint');
//             } finally {
//                 setIsScanning(false);
//             }
//         };

//         // Handle checkpoint selection
//         const handleCheckpointSelect = (checkpoint) => {
//             const selectedCp = {
//                 ...checkpoint,
//                 id: checkpoint.id || checkpoint.checkpointId
//             };
//             setSelectedCheckpoint(selectedCp);
//             setBadgeCode('');
//             setScanResult(null);
//             if (isMobileView) {
//                 setIsMobileMenuOpen(false);
//             }
//         };

//         // Format the scan result data based on response type
//         const formatScanResultData = (responseData) => {
//             if (responseData.name && responseData.email && responseData.phone) {
//                 return {
//                     type: 'detailed',
//                     name: responseData.name,
//                     email: responseData.email,
//                     badgeCode: responseData.badgeCode,
//                     phone: responseData.phone,
//                     city: responseData.city,
//                     dateOfBirth: responseData.dateOfBirth,
//                     department: responseData.selectDepartment
//                 };
//             }
//             else if (responseData.badge && responseData.name && responseData.email && responseData.entryId) {
//                 return {
//                     type: 'simple',
//                     badgeCode: responseData.badge,
//                     name: responseData.name,
//                     event: responseData.event,
//                     email: responseData.email,
//                     entryId: responseData.entryId
//                 };
//             }
//             else {
//                 return {
//                     type: 'unknown',
//                     ...responseData
//                 };
//             }
//         };

//         // Handle print badge
//         const handlePrintBadge = () => {
//             if (!printData) return;

//             const printWindow = window.open('', '_blank');
//             if (!printWindow) {
//                 error('Please allow pop-ups to print badge');
//                 return;
//             }

//             let badgeContent = '';
//             if (printData.type === 'detailed') {
//                 badgeContent = `
//                 <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #000; border-radius: 10px;">
//                     <h1 style="text-align: center; color: #4a5568; margin-bottom: 20px;">Event Badge</h1>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Name:</strong> ${printData.name || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Email:</strong> ${printData.email || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Badge Code:</strong> ${printData.badgeCode || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Phone:</strong> ${printData.phone || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">City:</strong> ${printData.city || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Department:</strong> ${printData.department || 'N/A'}
//                     </div>
//                     <div style="margin-top: 20px; text-align: center; color: #718096; font-size: 12px;">
//                         Scanned at: ${new Date().toLocaleString()}
//                     </div>
//                 </div>
//             `;
//             } else if (printData.type === 'simple') {
//                 badgeContent = `
//                 <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #000; border-radius: 10px;">
//                     <h1 style="text-align: center; color: #4a5568; margin-bottom: 20px;">Event Badge</h1>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Name:</strong> ${printData.name || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Email:</strong> ${printData.email || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Badge Code:</strong> ${printData.badgeCode || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Event:</strong> ${printData.event || 'N/A'}
//                     </div>
//                     <div style="margin-bottom: 15px;">
//                         <strong style="color: #2d3748;">Entry ID:</strong> ${printData.entryId || 'N/A'}
//                     </div>
//                     <div style="margin-top: 20px; text-align: center; color: #718096; font-size: 12px;">
//                         Scanned at: ${new Date().toLocaleString()}
//                     </div>
//                 </div>
//             `;
//             }

//             printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Print Badge - ${printData.name}</title>
//                     <style>
//                         @media print {
//                             body { margin: 0; padding: 20px; }
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     ${badgeContent}
//                     <script>
//                         window.onload = function() {
//                             window.print();
//                             window.onafterprint = function() {
//                                 window.close();
//                             }
//                         }
//                     </script>
//                 </body>
//             </html>
//         `);
//             printWindow.document.close();
//         };

//         // Scan Badge
//         const handleScanBadge = async (code = badgeCode) => {
//             if (!selectedCheckpoint) {
//                 error('Please select a checkpoint first');
//                 return;
//             }

//             if (!code.trim()) {
//                 error('Please enter or scan a badge code');
//                 return;
//             }

//             const checkpointId = selectedCheckpoint.id || selectedCheckpoint.checkpointId;
//             if (!checkpointId) {
//                 error('Invalid checkpoint selected');
//                 return;
//             }

//             try {
//                 setIsScanning(true);
//                 setScanResult(null);
//                 setPrintData(null);

//                 const url = `/events/${eventId}/scan?badgeCode=${encodeURIComponent(code)}&checkpointId=${checkpointId}`;
//                 console.log('Scanning with URL:', url);

//                 const response = await axiosInstance.post(url);

//                 console.log('Scan response:', response.data);

//                 if (response.data && response.data.status === 'SUCCESS') {
//                     const attendeeData = response.data.data || {};

//                     const formattedData = formatScanResultData(attendeeData);

//                     setScanResult({
//                         success: true,
//                         message: 'Badge scanned successfully',
//                         data: formattedData
//                     });

//                     if (selectedCheckpoint.type === 'REGISTRATION') {
//                         setPrintData(formattedData);
//                         setShowPrintModal(true);
//                     }

//                     success('Badge scanned successfully');
//                     setBadgeCode('');
//                     await fetchEventLogs();
//                 } else {
//                     setScanResult({
//                         success: false,
//                         message: response.data.message || 'Failed to scan badge',
//                         data: response.data
//                     });
//                     error(response.data.message || 'Failed to scan badge');
//                 }
//             } catch (err) {
//                 console.error('Error scanning badge:', err);
//                 const errorMessage = err.response?.data?.message || 'Failed to scan badge';
//                 setScanResult({
//                     success: false,
//                     message: errorMessage,
//                     data: err.response?.data
//                 });
//                 error(errorMessage);
//             } finally {
//                 setIsScanning(false);
//                 isProcessingScan.current = false;
//             }
//         };

//         // Handle QR code scan result from scanner component
//         const handleQRScan = (scannedCode) => {
//             setBadgeCode(scannedCode);
//             setShowScannerModal(false);
//             success('QR code scanned successfully');

//             if (selectedCheckpoint) {
//                 setTimeout(() => {
//                     handleScanBadge(scannedCode);
//                     isProcessingScan.current = false;
//                 }, 300);
//             } else {
//                 error('Please select a checkpoint first');
//                 isProcessingScan.current = false;
//             }
//         };

//         const handleOpenScanner = () => {
//             if (!selectedCheckpoint) {
//                 error('Please select a checkpoint first before scanning');
//                 return;
//             }

//             isProcessingScan.current = false;
//             setShowScannerModal(true);
//         };

//         // Handle filter changes
//         const handleFilterChange = (type, value) => {
//             setCurrentPage(0);

//             if (type === 'type') {
//                 setFilterType(value);
//             } else if (type === 'checkpoint') {
//                 setCheckpointFilter(value);
//             } else if (type === 'fromDate') {
//                 setFromDate(value);
//             } else if (type === 'toDate') {
//                 setToDate(value);
//             }
//         };

//         // Handle pagination
//         const handlePageChange = (newPage) => {
//             setCurrentPage(newPage);
//             fetchEventLogs(newPage);
//         };

//         // Clear all filters
//         const clearFilters = () => {
//             setFilterType('all');
//             setCheckpointFilter('all');
//             setFromDate('');
//             setToDate('');
//             setCurrentPage(0);
//         };

//         // Fetch data when filters or page change
//         useEffect(() => {
//             if (eventId) {
//                 fetchEventLogs(currentPage);
//             }
//         }, [eventId, filterType, checkpointFilter, fromDate, toDate, currentPage]);

//         // Initial fetch of checkpoints and event details
//         useEffect(() => {
//             if (eventId) {
//                 fetchEventDetails();
//                 fetchAllCheckpoints();
//             }
//         }, [eventId]);

//         // Fetch event details
//         const fetchEventDetails = async () => {
//             try {
//                 const response = await axiosInstance.get("/admin/events");
//                 let eventsList = [];

//                 if (response.data && Array.isArray(response.data.data)) {
//                     eventsList = response.data.data;
//                 } else if (Array.isArray(response.data)) {
//                     eventsList = response.data;
//                 } else if (response.data && response.data.events) {
//                     eventsList = response.data.events;
//                 }

//                 const foundEvent = eventsList.find(e =>
//                     (e.eventId && e.eventId.toString() === eventId) ||
//                     (e.id && e.id.toString() === eventId)
//                 );

//                 if (foundEvent) {
//                     setEvent(foundEvent);
//                 }
//             } catch (err) {
//                 console.error('Error fetching event details:', err);
//             }
//         };

//         // Handle refresh
//         const handleRefresh = () => {
//             fetchEventLogs(currentPage);
//             fetchAllCheckpoints();
//             success('Data refreshed');
//         };

//         // Get event name
//         const getEventName = () => {
//             return event?.name || event?.eventName || `Event #${eventId}`;
//         };

//         // Format timestamp
//         const formatTimestamp = (timestamp) => {
//             if (!timestamp) return 'N/A';
//             try {
//                 return new Date(timestamp).toLocaleString('en-US', {
//                     year: 'numeric',
//                     month: 'short',
//                     day: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     second: '2-digit'
//                 });
//             } catch {
//                 return timestamp;
//             }
//         };

//         // Format time only
//         const formatTimeOnly = (timestamp) => {
//             if (!timestamp) return 'N/A';
//             try {
//                 return new Date(timestamp).toLocaleString('en-US', {
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 });
//             } catch {
//                 return timestamp;
//             }
//         };

//         // Mobile compact card view for logs
//         const renderMobileCompactLogCard = (log, index) => {
//             const isExpanded = expandedLogs.has(index);

//             return (
//                 <div key={index} className="bg-white rounded-lg border border-gray-200 mb-2 w-full overflow-hidden">
//                     {/* Compact View - Always Visible */}
//                     <div className="p-3">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2 min-w-0 flex-1">
//                                 <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                     <User size={14} className="text-green-600" />
//                                 </div>
//                                 <div className="min-w-0 flex-1">
//                                     <h3 className="text-sm font-semibold text-gray-900 truncate">{log.attendeeName}</h3>
//                                     <p className="text-xs text-gray-500 flex items-center gap-1">
//                                         <Clock size={10} className="text-gray-400 flex-shrink-0" />
//                                         <span className="truncate">{formatTimeOnly(log.scannedAt)}</span>
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center gap-2 flex-shrink-0">
//                                 <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
//                                     {log.checkpointType}
//                                 </span>
//                                 <button
//                                     onClick={() => toggleLogExpansion(index)}
//                                     className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
//                                 >
//                                     {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Quick Info - Always Visible */}
//                         <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
//                             <span className="truncate flex-1">{log.checkpointName}</span>
//                             <span className="text-gray-400 flex-shrink-0">•</span>
//                             <span className="truncate">{log.scannedBy}</span>
//                         </div>
//                     </div>

//                     {/* Expanded Details - Only visible when expanded */}
//                     {isExpanded && (
//                         <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50">
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                                 <div className="col-span-2 overflow-hidden">
//                                     <p className="text-gray-500">Email</p>
//                                     <p className="text-gray-900 break-words">{log.attendeeEmail}</p>
//                                 </div>
//                                 <div className="overflow-hidden">
//                                     <p className="text-gray-500">Badge Code</p>
//                                     <p className="font-mono text-gray-900 break-all">{log.badgeCode}</p>
//                                 </div>
//                                 <div className="overflow-hidden">
//                                     <p className="text-gray-500">Checkpoint</p>
//                                     <p className="text-gray-900 truncate">{log.checkpointName}</p>
//                                 </div>
//                                 <div className="overflow-hidden">
//                                     <p className="text-gray-500">Scanned By</p>
//                                     <p className="text-gray-900 truncate">{log.scannedBy}</p>
//                                 </div>
//                                 <div className="col-span-2 overflow-hidden">
//                                     <p className="text-gray-500">Scanned At</p>
//                                     <p className="text-gray-900 truncate">{formatTimestamp(log.scannedAt)}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             );
//         };

//         if (isLoading && !logs.length && !checkpoints.length) {
//             return (
//                 <div className="flex justify-center items-center min-h-screen p-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 flex-shrink-0"></div>
//                     <span className="ml-3 text-gray-600">Loading event tracking...</span>
//                 </div>
//             );
//         }

//         return (
//             <>
//                 {/* Global style to prevent horizontal scroll - Only for mobile */}
//                 <style jsx global>{`
//                     @media (max-width: 768px) {
//                         html, body {
//                             overflow-x: hidden !important;
//                             max-width: 100vw !important;
//                             position: relative !important;
//                         }
//                         #root, #__next {
//                             overflow-x: hidden !important;
//                             max-width: 100vw !important;
//                         }
//                         .mobile-container {
//                             max-width: 100vw;
//                             overflow-x: hidden;
//                         }
//                     }
//                 `}</style>

//                 <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
//                     <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-7 w-full">
//                         {/* Header */}
//                         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
//                             <div className="min-w-0 flex-1">
//                                 <button
//                                     onClick={() => navigate(`/manage-event/${eventId}`)}
//                                     className="flex items-center text-gray-600 hover:text-gray-800 mb-2 cursor-pointer text-sm"
//                                 >
//                                     <ChevronLeft className="w-4 h-4 mr-1 flex-shrink-0" />
//                                     <span className="truncate">Back to Manage Event</span>
//                                 </button>
//                                 <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
//                                     <BarChart3 size={isMobileView ? 20 : 24} className="text-blue-600 flex-shrink-0" />
//                                     <span className="truncate">Event Tracking</span>
//                                 </h1>
//                                 <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate max-w-full">
//                                     Create checkpoints and scan badges for {getEventName()}
//                                 </p>
//                             </div>

//                             {/* Desktop Actions - Now properly aligned */}
//                             {!isMobileView && (
//                                 <div className="flex gap-2 flex-shrink-0 ml-auto">
//                                     <button
//                                         onClick={handleRefresh}
//                                         className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
//                                     >
//                                         <RefreshCw size={16} />
//                                         Refresh
//                                     </button>
//                                     <button
//                                         onClick={() => setShowCheckpointsList(!showCheckpointsList)}
//                                         className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-3xl hover:bg-purple-50 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
//                                     >
//                                         <List size={16} />
//                                         {showCheckpointsList ? 'Hide Checkpoints' : 'View Checkpoints'}
//                                     </button>
//                                     <button
//                                         onClick={handleExportToExcel}
//                                         disabled={logs.length === 0 || isExporting}
//                                         className="px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//                                     >
//                                         {isExporting ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
//                                                 Exporting...
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <FileSpreadsheet size={16} />
//                                                 Export
//                                             </>
//                                         )}
//                                     </button>
//                                 </div>
//                             )}

//                             {/* Mobile Menu Button */}
//                             {isMobileView && (
//                                 <button
//                                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                                     className="self-end p-2 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0"
//                                 >
//                                     <Menu className="w-5 h-5 text-gray-600" />
//                                 </button>
//                             )}
//                         </div>

//                         {/* Mobile Actions Menu */}
//                         {isMobileView && isMobileMenuOpen && (
//                             <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm w-full mobile-container">
//                                 <div className="flex flex-col space-y-2">
//                                     <button
//                                         onClick={handleRefresh}
//                                         className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium"
//                                     >
//                                         <RefreshCw size={16} />
//                                         Refresh
//                                     </button>
//                                     <button
//                                         onClick={() => {
//                                             setShowCheckpointsList(!showCheckpointsList);
//                                             setIsMobileMenuOpen(false);
//                                         }}
//                                         className="w-full px-4 py-2.5 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 text-sm font-medium"
//                                     >
//                                         <List size={16} />
//                                         {showCheckpointsList ? 'Hide Checkpoints' : 'View Checkpoints'}
//                                     </button>
//                                     <button
//                                         onClick={() => {
//                                             handleExportToExcel();
//                                             setIsMobileMenuOpen(false);
//                                         }}
//                                         disabled={logs.length === 0 || isExporting}
//                                         className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
//                                     >
//                                         {isExporting ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                 Exporting...
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <FileSpreadsheet size={16} />
//                                                 Export to Excel
//                                             </>
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Event Summary Card */}
//                         {event && (
//                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 mb-4 sm:mb-6 w-full overflow-hidden">
//                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
//                                     <div className="flex items-center gap-3 min-w-0">
//                                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                             <Calendar size={isMobileView ? 16 : 20} className="text-blue-600" />
//                                         </div>
//                                         <div className="min-w-0">
//                                             <p className="text-xs text-gray-500">Event Date</p>
//                                             <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
//                                                 {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
//                                                     year: 'numeric',
//                                                     month: 'short',
//                                                     day: 'numeric'
//                                                 }) : 'Not set'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3 min-w-0">
//                                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                             <MapPin size={isMobileView ? 16 : 20} className="text-purple-600" />
//                                         </div>
//                                         <div className="min-w-0">
//                                             <p className="text-xs text-gray-500">Location</p>
//                                             <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
//                                                 {event.location || 'Not specified'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3 min-w-0">
//                                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                             <Map size={isMobileView ? 16 : 20} className="text-green-600" />
//                                         </div>
//                                         <div className="min-w-0">
//                                             <p className="text-xs text-gray-500">Total Checkpoints</p>
//                                             <p className="text-sm sm:text-base font-medium text-gray-800">
//                                                 {checkpoints.length} {checkpoints.length === 1 ? 'checkpoint' : 'checkpoints'}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Checkpoints Section */}
//                         {showCheckpointsList && (
//                             <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6 overflow-hidden w-full">
//                                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                                     <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
//                                         <Map size={isMobileView ? 18 : 20} className="text-purple-600 flex-shrink-0" />
//                                         <span className="truncate">Event Checkpoints</span>
//                                     </h2>
//                                     <button
//                                         onClick={() => setShowCreateCheckpoint(true)}
//                                         className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
//                                     >
//                                         <Plus size={16} />
//                                         Add Checkpoint
//                                     </button>
//                                 </div>

//                                 <div className="p-4 sm:p-6">
//                                     {checkpoints.length === 0 ? (
//                                         <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
//                                             No checkpoints added yet. Click "Add Checkpoint" to create your first checkpoint.
//                                         </div>
//                                     ) : (
//                                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
//                                             {checkpoints.map((checkpoint) => (
//                                                 <div
//                                                     key={checkpoint.id}
//                                                     className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer overflow-hidden ${selectedCheckpoint?.id === checkpoint.id
//                                                         ? 'border-purple-500 bg-purple-50 shadow-md'
//                                                         : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
//                                                         }`}
//                                                     onClick={() => handleCheckpointSelect(checkpoint)}
//                                                 >
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                             {getIconComponent(checkpoint.type, isMobileView ? 16 : 20)}
//                                                         </div>
//                                                         <div className="flex-1 min-w-0">
//                                                             <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{checkpoint.name}</h3>
//                                                             <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
//                                                                 {checkpoint.type}
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                     {selectedCheckpoint?.id === checkpoint.id && (
//                                                         <div className="mt-2 sm:mt-3 pt-2 border-t border-purple-200">
//                                                             <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap">
//                                                                 Selected for scanning
//                                                             </span>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* QR Scanner Modal */}
//                         <QRScanner
//                             isOpen={showScannerModal}
//                             onClose={() => setShowScannerModal(false)}
//                             onScan={handleQRScan}
//                             selectedCheckpoint={selectedCheckpoint}
//                             isProcessingScan={isProcessingScan.current}
//                             setIsProcessingScan={(value) => { isProcessingScan.current = value; }}
//                         />

//                         {/* Create Checkpoint Modal */}
//                         {showCreateCheckpoint && (
//                             <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
//                                 <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
//                                     <div className="p-4 sm:p-6">
//                                         <div className="flex items-center gap-2 mb-4">
//                                             <Plus className="text-purple-600 flex-shrink-0" size={20} />
//                                             <h2 className="text-lg font-semibold text-gray-800 truncate">Create Checkpoint</h2>
//                                         </div>

//                                         <div className="space-y-4">
//                                             {/* Checkpoint Type Dropdown */}
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                     Checkpoint Type *
//                                                 </label>
//                                                 <div className="relative">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setShowTypeDropdown(!showTypeDropdown)}
//                                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between bg-white text-sm"
//                                                     >
//                                                         <div className="flex items-center gap-2 min-w-0">
//                                                             {getIconComponent(newCheckpoint.type, 18, "text-purple-600")}
//                                                             <span className="truncate">{newCheckpoint.type}</span>
//                                                         </div>
//                                                         <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
//                                                     </button>

//                                                     {showTypeDropdown && (
//                                                         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                                             {CHECKPOINT_TYPES.map((type) => (
//                                                                 <button
//                                                                     key={type.value}
//                                                                     className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-50 first:rounded-t-lg last:rounded-b-lg text-sm"
//                                                                     onClick={() => {
//                                                                         setNewCheckpoint({ ...newCheckpoint, type: type.value });
//                                                                         setShowTypeDropdown(false);
//                                                                     }}
//                                                                 >
//                                                                     {getIconComponent(type.value, 18, "text-purple-600")}
//                                                                     <span className="truncate">{type.label}</span>
//                                                                 </button>
//                                                             ))}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </div>

//                                             {/* Checkpoint Name */}
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                     Checkpoint Name *
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={newCheckpoint.name}
//                                                     onChange={(e) => setNewCheckpoint({ ...newCheckpoint, name: e.target.value })}
//                                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
//                                                     placeholder="e.g., Main Entrance, Workshop Room 1"
//                                                     autoFocus
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
//                                             <button
//                                                 onClick={() => {
//                                                     setShowCreateCheckpoint(false);
//                                                     setNewCheckpoint({ name: '', type: 'REGISTRATION' });
//                                                     setShowTypeDropdown(false);
//                                                 }}
//                                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 cursor-pointer text-sm order-2 sm:order-1"
//                                             >
//                                                 Cancel
//                                             </button>
//                                             <button
//                                                 onClick={handleCreateCheckpoint}
//                                                 disabled={isScanning}
//                                                 className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm order-1 sm:order-2 whitespace-nowrap"
//                                             >
//                                                 {isScanning ? 'Creating...' : 'Create Checkpoint'}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Print Badge Modal */}
//                         {showPrintModal && printData && (
//                             <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
//                                 <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden">
//                                     <div className="p-4 sm:p-6">
//                                         <div className="flex items-center gap-3 mb-4">
//                                             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                 <Printer size={isMobileView ? 20 : 24} className="text-purple-600" />
//                                             </div>
//                                             <div className="min-w-0">
//                                                 <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Print Badge</h2>
//                                                 <p className="text-xs sm:text-sm text-gray-500">Registration checkpoint detected</p>
//                                             </div>
//                                         </div>

//                                         <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
//                                             <h3 className="font-medium text-purple-800 mb-2 sm:mb-3 text-sm">Attendee Information:</h3>
//                                             <div className="space-y-2 text-sm">
//                                                 <p className="text-sm overflow-hidden">
//                                                     <span className="text-gray-600 font-medium">Name:</span>{' '}
//                                                     <span className="text-gray-900 truncate">{printData.name}</span>
//                                                 </p>
//                                                 <p className="text-sm overflow-hidden">
//                                                     <span className="text-gray-600 font-medium">Email:</span>{' '}
//                                                     <span className="text-gray-900 break-words">{printData.email}</span>
//                                                 </p>
//                                                 <p className="text-sm overflow-hidden">
//                                                     <span className="text-gray-600 font-medium">Badge Code:</span>{' '}
//                                                     <span className="font-mono text-gray-900 text-xs break-all">{printData.badgeCode}</span>
//                                                 </p>
//                                                 {printData.phone && (
//                                                     <p className="text-sm overflow-hidden">
//                                                         <span className="text-gray-600 font-medium">Phone:</span>{' '}
//                                                         <span className="text-gray-900 truncate">{printData.phone}</span>
//                                                     </p>
//                                                 )}
//                                                 {printData.city && (
//                                                     <p className="text-sm overflow-hidden">
//                                                         <span className="text-gray-600 font-medium">City:</span>{' '}
//                                                         <span className="text-gray-900 truncate">{printData.city}</span>
//                                                     </p>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div className="flex flex-col sm:flex-row justify-end gap-2">
//                                             <button
//                                                 onClick={() => setShowPrintModal(false)}
//                                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 font-medium text-sm order-2 sm:order-1"
//                                             >
//                                                 Close
//                                             </button>
//                                             <button
//                                                 onClick={() => {
//                                                     handlePrintBadge();
//                                                     setShowPrintModal(false);
//                                                 }}
//                                                 className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 text-sm order-1 sm:order-2 whitespace-nowrap"
//                                             >
//                                                 <Printer size={16} />
//                                                 Print Badge
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Scan Badge Section */}
//                         {selectedCheckpoint && (
//                             <div className="bg-white rounded-xl border border-purple-300 shadow-md mb-4 sm:mb-6 overflow-hidden w-full">
//                                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white">
//                                     <div className="flex items-center justify-between">
//                                         <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
//                                             <Camera size={isMobileView ? 18 : 20} className="text-purple-600 flex-shrink-0" />
//                                             <span className="truncate">Scan at: {selectedCheckpoint.name}</span>
//                                             <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
//                                                 {selectedCheckpoint.type}
//                                             </span>
//                                             {selectedCheckpoint.type === 'REGISTRATION' && (
//                                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
//                                                     Prints badge
//                                                 </span>
//                                             )}
//                                         </h2>
//                                         <button
//                                             onClick={() => setSelectedCheckpoint(null)}
//                                             className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
//                                         >
//                                             <XCircle size={isMobileView ? 18 : 20} />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="p-4 sm:p-6">
//                                     <div className="space-y-4">
//                                         {/* Scan Input */}
//                                         <div>
//                                             <div className="flex flex-col sm:flex-row gap-2">
//                                                 <div className="flex-1 min-w-0">
//                                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                         Badge Code / QR Code
//                                                     </label>
//                                                     <div className="flex flex-col sm:flex-row gap-2">
//                                                         <input
//                                                             type="text"
//                                                             value={badgeCode}
//                                                             onChange={(e) => setBadgeCode(e.target.value)}
//                                                             placeholder="Scan or enter badge code"
//                                                             className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-full"
//                                                             onKeyPress={(e) => {
//                                                                 if (e.key === 'Enter') {
//                                                                     handleScanBadge();
//                                                                 }
//                                                             }}
//                                                         />
//                                                         <button
//                                                             onClick={() => handleScanBadge()}
//                                                             disabled={isScanning || !badgeCode}
//                                                             className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
//                                                         >
//                                                             {isScanning ? (
//                                                                 <>
//                                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
//                                                                     <span className="truncate">Scanning...</span>
//                                                                 </>
//                                                             ) : (
//                                                                 <>
//                                                                     <QrCode size={18} />
//                                                                     <span>Scan</span>
//                                                                 </>
//                                                             )}
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                                 <div className="sm:flex sm:items-end">
//                                                     <button
//                                                         onClick={handleOpenScanner}
//                                                         disabled={!selectedCheckpoint}
//                                                         className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-3xl hover:bg-gray-200 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//                                                     >
//                                                         <Camera size={16} />
//                                                         Open Camera
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             {/* QR Scanner Modal */}
//                                             <QRScanner
//                                                 isOpen={showScannerModal}
//                                                 onClose={() => setShowScannerModal(false)}
//                                                 onScan={handleQRScan}
//                                                 selectedCheckpoint={selectedCheckpoint}
//                                                 isProcessingScan={isProcessingScan.current}
//                                                 setIsProcessingScan={(value) => { isProcessingScan.current = value; }}
//                                             />

//                                             {/* Scan Result - Success */}
//                                             {scanResult && scanResult.success && scanResult.data && (
//                                                 <div className="mt-4 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200 w-full overflow-hidden">
//                                                     <div className="flex items-start gap-3">
//                                                         <CheckCircle size={isMobileView ? 18 : 20} className="text-green-600 flex-shrink-0 mt-0.5" />
//                                                         <div className="flex-1 min-w-0">
//                                                             <p className="font-medium text-green-800 text-sm">
//                                                                 {scanResult.message}
//                                                             </p>
//                                                             <div className="mt-3">
//                                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
//                                                                     {scanResult.data.badgeCode && (
//                                                                         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
//                                                                             <span className="text-gray-500 font-medium text-xs flex-shrink-0">Badge Code:</span>
//                                                                             <span className="font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-green-200 text-xs break-all">
//                                                                                 {scanResult.data.badgeCode}
//                                                                             </span>
//                                                                         </div>
//                                                                     )}
//                                                                     {scanResult.data.name && (
//                                                                         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
//                                                                             <span className="text-gray-500 font-medium text-xs flex-shrink-0">Name:</span>
//                                                                             <span className="font-medium text-gray-900 text-sm truncate">{scanResult.data.name}</span>
//                                                                         </div>
//                                                                     )}
//                                                                     {scanResult.data.email && (
//                                                                         <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 col-span-2 min-w-0 overflow-hidden">
//                                                                             <span className="text-gray-500 font-medium text-xs flex-shrink-0">Email:</span>
//                                                                             <span className="font-medium text-gray-900 text-sm break-words">{scanResult.data.email}</span>
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )}

//                                             {/* Scan Result - Error */}
//                                             {scanResult && !scanResult.success && (
//                                                 <div className="mt-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 w-full">
//                                                     <div className="flex items-start gap-3">
//                                                         <XCircle size={isMobileView ? 18 : 20} className="text-red-600 flex-shrink-0 mt-0.5" />
//                                                         <div className="flex-1 min-w-0">
//                                                             <p className="font-medium text-red-800 text-sm break-words">
//                                                                 {scanResult.message}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Advanced Filters */}
//                         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 w-full overflow-hidden">
//                             <div className="flex items-center gap-2 mb-3 sm:mb-4">
//                                 <Filter size={isMobileView ? 16 : 18} className="text-gray-500 flex-shrink-0" />
//                                 <span className="text-xs sm:text-sm font-medium text-gray-700">Filter Logs</span>
//                                 {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
//                                     <button
//                                         onClick={clearFilters}
//                                         className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-medium flex-shrink-0"
//                                     >
//                                         Clear all
//                                     </button>
//                                 )}
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//                                 {/* Type Filter */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                                         Checkpoint Type
//                                     </label>
//                                     <select
//                                         value={filterType}
//                                         onChange={(e) => handleFilterChange('type', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
//                                     >
//                                         <option value="all">All Types</option>
//                                         {CHECKPOINT_TYPES.map(type => (
//                                             <option key={type.value} value={type.value}>
//                                                 {type.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 {/* Checkpoint Filter */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                                         Specific Checkpoint
//                                     </label>
//                                     <select
//                                         value={checkpointFilter}
//                                         onChange={(e) => handleFilterChange('checkpoint', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
//                                         disabled={checkpoints.length === 0}
//                                     >
//                                         <option value="all">All Checkpoints</option>
//                                         {checkpoints.map(cp => (
//                                             <option key={cp.id} value={cp.id}>
//                                                 {cp.name} ({cp.type})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 {/* From Date */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                                         From Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={fromDate}
//                                         onChange={(e) => handleFilterChange('fromDate', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
//                                     />
//                                 </div>

//                                 {/* To Date */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">
//                                         To Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={toDate}
//                                         onChange={(e) => handleFilterChange('toDate', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Active Filters Display */}
//                             {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
//                                 <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 overflow-hidden">
//                                     <span className="text-xs text-gray-500 flex-shrink-0">Active:</span>
//                                     {filterType !== 'all' && (
//                                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
//                                             <span className="truncate max-w-[80px]">Type: {filterType}</span>
//                                             <button onClick={() => handleFilterChange('type', 'all')} className="hover:text-purple-900 flex-shrink-0">
//                                                 ×
//                                             </button>
//                                         </span>
//                                     )}
//                                     {checkpointFilter !== 'all' && (
//                                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
//                                             <span className="truncate max-w-[80px]">Checkpoint: {checkpoints.find(cp => cp.id === checkpointFilter)?.name || checkpointFilter}</span>
//                                             <button onClick={() => handleFilterChange('checkpoint', 'all')} className="hover:text-purple-900 flex-shrink-0">
//                                                 ×
//                                             </button>
//                                         </span>
//                                     )}
//                                     {fromDate && (
//                                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
//                                             <span className="truncate max-w-[80px]">From: {fromDate}</span>
//                                             <button onClick={() => handleFilterChange('fromDate', '')} className="hover:text-purple-900 flex-shrink-0">
//                                                 ×
//                                             </button>
//                                         </span>
//                                     )}
//                                     {toDate && (
//                                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
//                                             <span className="truncate max-w-[80px]">To: {toDate}</span>
//                                             <button onClick={() => handleFilterChange('toDate', '')} className="hover:text-purple-900 flex-shrink-0">
//                                                 ×
//                                             </button>
//                                         </span>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Logs Display */}
//                         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
//                             <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                                 <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
//                                     <Clock size={isMobileView ? 18 : 20} className="text-gray-600 flex-shrink-0" />
//                                     Activity Logs
//                                     <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2 whitespace-nowrap">
//                                         {logs.length} of {logsCount}
//                                     </span>
//                                 </h2>
//                                 {logs.length > 0 && !isMobileView && (
//                                     <button
//                                         onClick={handleExportToExcel}
//                                         disabled={isExporting}
//                                         className="px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
//                                     >
//                                         {isExporting ? (
//                                             <>
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
//                                                 Exporting...
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <FileSpreadsheet size={16} />
//                                                 Export to Excel
//                                             </>
//                                         )}
//                                     </button>
//                                 )}
//                             </div>

//                             {isLoading ? (
//                                 <div className="text-center py-8 sm:py-12">
//                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
//                                     <p className="text-gray-500 mt-4 text-sm">Loading logs...</p>
//                                 </div>
//                             ) : logs.length === 0 ? (
//                                 <div className="text-center py-8 sm:py-12 px-4">
//                                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                         <Activity size={isMobileView ? 24 : 32} className="text-gray-400" />
//                                     </div>
//                                     <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No logs found</h3>
//                                     <p className="text-sm text-gray-500">
//                                         {filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate
//                                             ? 'No logs match your filter criteria.'
//                                             : 'No activity logs available for this event yet.'}
//                                     </p>
//                                     {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
//                                         <button
//                                             onClick={clearFilters}
//                                             className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-3xl hover:bg-purple-200 text-sm font-medium"
//                                         >
//                                             Clear all filters
//                                         </button>
//                                     )}
//                                 </div>
//                             ) : (
//                                 <>
//                                     {/* Desktop Table View */}
//                                     {!isMobileView && (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full min-w-full divide-y divide-gray-200">
//                                                 <thead className="bg-gray-50">
//                                                     <tr>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Scanned At
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Attendee
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Email
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Badge Code
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Checkpoint
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Type
//                                                         </th>
//                                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                                             Scanned By
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="bg-white divide-y divide-gray-200">
//                                                     {logs.map((log, index) => (
//                                                         <tr key={index} className="hover:bg-gray-50 transition-colors">
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                                                                 {formatTimestamp(log.scannedAt)}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                                         <User size={12} className="text-green-600" />
//                                                                     </div>
//                                                                     <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
//                                                                         {log.attendeeName}
//                                                                     </span>
//                                                                 </div>
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[200px]">
//                                                                 {log.attendeeEmail}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 truncate max-w-[150px]">
//                                                                 {log.badgeCode}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[150px]">
//                                                                 {log.checkpointName}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
//                                                                     {log.checkpointType}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[150px]">
//                                                                 {log.scannedBy}
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}

//                                     {/* Mobile Compact Card View */}
//                                     {isMobileView && (
//                                         <div className="p-3 space-y-2 mobile-container">
//                                             {logs.map((log, index) => renderMobileCompactLogCard(log, index))}
//                                         </div>
//                                     )}
//                                 </>
//                             )}

//                             {/* Pagination */}
//                             {totalPages > 0 && (
//                                 <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 w-full">
//                                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                                         <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left whitespace-nowrap">
//                                             {isMobileView ? (
//                                                 <>Page {currentPage + 1} of {totalPages}</>
//                                             ) : (
//                                                 <>Page {currentPage + 1} of {totalPages}</>
//                                             )}
//                                         </div>
//                                         <div className="flex items-center justify-center sm:justify-end gap-2">
//                                             <button
//                                                 onClick={() => handlePageChange(currentPage - 1)}
//                                                 disabled={currentPage === 0}
//                                                 className="px-3 py-1.5 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap"
//                                             >
//                                                 <ChevronLeft size={16} />
//                                                 <span className="hidden sm:inline">Previous</span>
//                                             </button>
//                                             <button
//                                                 onClick={() => handlePageChange(currentPage + 1)}
//                                                 disabled={currentPage >= totalPages - 1}
//                                                 className="px-3 py-1.5 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap"
//                                             >
//                                                 <span className="hidden sm:inline">Next</span>
//                                                 <ChevronRight size={16} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </>
//         );
//     } catch (err) {
//         console.error('=== COMPONENT ERROR ===', err);
//         return (
//             <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg m-4 overflow-hidden">
//                 <h2 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Component Error</h2>
//                 <pre className="text-xs sm:text-sm text-red-600 whitespace-pre-wrap break-words">
//                     {err.toString()}
//                 </pre>
//                 <pre className="text-xs text-gray-600 mt-4 bg-gray-100 p-2 rounded overflow-auto">
//                     {err.stack}
//                 </pre>
//             </div>
//         );
//     }
// };

// export default EventTracking;

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contestAPI/NotificationProvider';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
    User,
    Clock,
    Filter,
    Download,
    RefreshCw,
    Activity,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    QrCode,
    Camera,
    Map,
    Plus,
    List,
    Utensils,
    Package,
    Home,
    Settings,
    ChevronDown,
    CameraOff,
    FileSpreadsheet,
    Printer,
    X,
    Menu,
    ChevronUp,
    Eye,
    EyeOff
} from 'lucide-react';
import axiosInstance from '../../../helper/AxiosInstance';
import * as XLSX from 'xlsx';

// Checkpoint types for dropdown
const CHECKPOINT_TYPES = [
    { value: 'REGISTRATION', label: 'REGISTRATION', icon: 'CheckCircle' },
    { value: 'FOOD', label: 'FOOD', icon: 'Utensils' },
    { value: 'KIT', label: 'KIT', icon: 'Package' },
    { value: 'HALL', label: 'HALL', icon: 'Home' },
    { value: 'CUSTOM', label: 'CUSTOM', icon: 'Settings' }
];

const EventTracking = () => {
    try {
        const { eventId } = useParams();
        const navigate = useNavigate();
        const { success, error } = useNotification();
        const [isMobileView, setIsMobileView] = useState(false);
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
        const [expandedLogs, setExpandedLogs] = useState(new Set());

        const [logs, setLogs] = useState([]);
        const [logsCount, setLogsCount] = useState(0);
        const [isLoading, setIsLoading] = useState(true);
        const [isExporting, setIsExporting] = useState(false);
        const [event, setEvent] = useState(null);

        // Filter states for backend API
        const [filterType, setFilterType] = useState('all');
        const [checkpointFilter, setCheckpointFilter] = useState('all');
        const [fromDate, setFromDate] = useState('');
        const [toDate, setToDate] = useState('');

        // Pagination states
        const [currentPage, setCurrentPage] = useState(0);
        const [pageSize] = useState(20);
        const [totalPages, setTotalPages] = useState(0);

        // Checkpoint states
        const [checkpoints, setCheckpoints] = useState([]);
        const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
        const [badgeCode, setBadgeCode] = useState('');
        const [scanResult, setScanResult] = useState(null);
        const [isScanning, setIsScanning] = useState(false);
        const [showCheckpointsList, setShowCheckpointsList] = useState(true);
        const [showCreateCheckpoint, setShowCreateCheckpoint] = useState(false);
        const [newCheckpoint, setNewCheckpoint] = useState({
            name: '',
            type: 'REGISTRATION'
        });
        const [showTypeDropdown, setShowTypeDropdown] = useState(false);
        const [showPrintModal, setShowPrintModal] = useState(false);
        const [printData, setPrintData] = useState(null);

        // Check for mobile view
        useEffect(() => {
            const checkMobile = () => {
                setIsMobileView(window.innerWidth < 768);
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Toggle log expansion
        const toggleLogExpansion = (logIndex) => {
            setExpandedLogs(prev => {
                const newSet = new Set(prev);
                if (newSet.has(logIndex)) {
                    newSet.delete(logIndex);
                } else {
                    newSet.add(logIndex);
                }
                return newSet;
            });
        };

        // Get icon component based on checkpoint type
        const getIconComponent = (type, size = 16, className = "text-purple-600") => {
            switch (type) {
                case 'REGISTRATION':
                    return <CheckCircle size={size} className={className} />;
                case 'FOOD':
                    return <Utensils size={size} className={className} />;
                case 'KIT':
                    return <Package size={size} className={className} />;
                case 'HALL':
                    return <Home size={size} className={className} />;
                case 'CUSTOM':
                    return <Settings size={size} className={className} />;
                default:
                    return <MapPin size={size} className={className} />;
            }
        };

        // Fetch event logs with filters from backend
        const fetchEventLogs = async (page = currentPage) => {
            try {
                setIsLoading(true);

                // Build query parameters
                const params = new URLSearchParams();

                if (filterType !== 'all') {
                    params.append('type', filterType);
                }

                if (checkpointFilter !== 'all') {
                    params.append('checkpointId', checkpointFilter);
                }

                if (fromDate) {
                    params.append('fromDate', fromDate);
                }
                if (toDate) {
                    params.append('toDate', toDate);
                }

                params.append('page', page);
                params.append('size', pageSize);

                const url = `/events/${eventId}/logs${params.toString() ? '?' + params.toString() : ''}`;

                const response = await axiosInstance.get(url);

                if (response.data && response.data.status === 'SUCCESS') {
                    setLogs(response.data.data || []);
                    setLogsCount(response.data.totalElements || 0);
                    setTotalPages(response.data.totalPages || 0);
                } else if (Array.isArray(response.data)) {
                    setLogs(response.data);
                    setLogsCount(response.data.length);
                    setTotalPages(1);
                } else {
                    setLogs([]);
                    setLogsCount(0);
                    setTotalPages(0);
                }
            } catch (err) {
                console.error('Error fetching event logs:', err);
                error('Failed to load event logs');
                setLogs([]);
                setLogsCount(0);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch all logs for export (without pagination)
        const fetchAllLogsForExport = async () => {
            try {
                const params = new URLSearchParams();

                if (filterType !== 'all') {
                    params.append('type', filterType);
                }

                if (checkpointFilter !== 'all') {
                    params.append('checkpointId', checkpointFilter);
                }

                if (fromDate) {
                    params.append('fromDate', fromDate);
                }
                if (toDate) {
                    params.append('toDate', toDate);
                }

                params.append('page', '0');
                params.append('size', '1000');

                const url = `/events/${eventId}/logs${params.toString() ? '?' + params.toString() : ''}`;
                const response = await axiosInstance.get(url);

                if (response.data && response.data.status === 'SUCCESS') {
                    return response.data.data || [];
                } else if (Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            } catch (err) {
                console.error('Error fetching logs for export:', err);
                throw err;
            }
        };

        // Export to Excel
        const handleExportToExcel = async () => {
            try {
                setIsExporting(true);

                const allLogs = await fetchAllLogsForExport();

                if (!allLogs || allLogs.length === 0) {
                    error('No logs to export');
                    setIsExporting(false);
                    return;
                }

                const excelData = allLogs.map((log, index) => ({
                    'S.No': index + 1,
                    'Attendee Name': log.attendeeName || 'N/A',
                    'Attendee Email': log.attendeeEmail || 'N/A',
                    'Badge Code': log.badgeCode || 'N/A',
                    'Checkpoint Name': log.checkpointName || 'N/A',
                    'Checkpoint Type': log.checkpointType || 'N/A',
                    'Scanned By': log.scannedBy || 'N/A',
                    'Scanned At': log.scannedAt ? new Date(log.scannedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }) : 'N/A'
                }));

                const ws = XLSX.utils.json_to_sheet(excelData);

                const colWidths = [
                    { wch: 5 },   // S.No
                    { wch: 25 },  // Attendee Name
                    { wch: 35 },  // Attendee Email
                    { wch: 20 },  // Badge Code
                    { wch: 25 },  // Checkpoint Name
                    { wch: 15 },  // Checkpoint Type
                    { wch: 20 },  // Scanned By
                    { wch: 25 }   // Scanned At
                ];
                ws['!cols'] = colWidths;

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Event Logs');

                const summaryData = [
                    ['Export Information'],
                    [''],
                    ['Event Name', getEventName()],
                    ['Event ID', eventId],
                    ['Export Date', new Date().toLocaleString()],
                    ['Total Logs', allLogs.length],
                    [''],
                    ['Applied Filters'],
                    ['Type Filter', filterType !== 'all' ? filterType : 'No filter'],
                    ['Checkpoint Filter', checkpointFilter !== 'all' ?
                        (checkpoints.find(cp => cp.id === checkpointFilter)?.name || checkpointFilter) : 'No filter'],
                    ['From Date', fromDate || 'No filter'],
                    ['To Date', toDate || 'No filter']
                ];

                const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

                const eventName = getEventName().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `${eventName}_logs_${dateStr}.xlsx`;

                XLSX.writeFile(wb, fileName);

                success(`Successfully exported ${allLogs.length} logs to Excel`);
            } catch (err) {
                console.error('Error exporting to Excel:', err);
                error('Failed to export logs to Excel');
            } finally {
                setIsExporting(false);
            }
        };

        // Fetch all checkpoints
        const fetchAllCheckpoints = async () => {
            try {
                const response = await axiosInstance.get(`/events/${eventId}/checkpoints`);

                if (response.data && response.data.status === 'success') {
                    const transformedData = response.data.data.map(cp => ({
                        ...cp,
                        id: cp.checkpointId
                    }));
                    setCheckpoints(transformedData || []);
                } else if (Array.isArray(response.data)) {
                    const transformedData = response.data.map(cp => ({
                        ...cp,
                        id: cp.checkpointId
                    }));
                    setCheckpoints(transformedData);
                } else {
                    setCheckpoints([]);
                }
            } catch (err) {
                console.error('Error fetching checkpoints:', err);
                setCheckpoints([]);
            }
        };

        // Create checkpoint
        const handleCreateCheckpoint = async () => {
            if (!newCheckpoint.name.trim()) {
                error('Checkpoint name is required');
                return;
            }

            try {
                setIsScanning(true);
                const response = await axiosInstance.post(`/events/${eventId}/checkpoints`, {
                    type: newCheckpoint.type,
                    name: newCheckpoint.name
                });

                success(`${newCheckpoint.type} checkpoint created successfully`);
                setShowCreateCheckpoint(false);
                setNewCheckpoint({ name: '', type: 'REGISTRATION' });
                setShowTypeDropdown(false);
                fetchAllCheckpoints();
            } catch (err) {
                console.error('Error creating checkpoint:', err);
                error(err.response?.data?.message || 'Failed to create checkpoint');
            } finally {
                setIsScanning(false);
            }
        };

        // Handle checkpoint selection
        const handleCheckpointSelect = (checkpoint) => {
            const selectedCp = {
                ...checkpoint,
                id: checkpoint.id || checkpoint.checkpointId
            };
            setSelectedCheckpoint(selectedCp);
            setBadgeCode('');
            setScanResult(null);
            if (isMobileView) {
                setIsMobileMenuOpen(false);
            }
        };

        // Format the scan result data based on response type
        const formatScanResultData = (responseData) => {
            if (responseData.name && responseData.email && responseData.phone) {
                return {
                    type: 'detailed',
                    name: responseData.name,
                    email: responseData.email,
                    badgeCode: responseData.badgeCode,
                    phone: responseData.phone,
                    city: responseData.city,
                    dateOfBirth: responseData.dateOfBirth,
                    department: responseData.selectDepartment
                };
            }
            else if (responseData.badge && responseData.name && responseData.email && responseData.entryId) {
                return {
                    type: 'simple',
                    badgeCode: responseData.badge,
                    name: responseData.name,
                    event: responseData.event,
                    email: responseData.email,
                    entryId: responseData.entryId
                };
            }
            else {
                return {
                    type: 'unknown',
                    ...responseData
                };
            }
        };

        // Handle print badge
        const handlePrintBadge = () => {
            if (!printData) return;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                error('Please allow pop-ups to print badge');
                return;
            }

            let badgeContent = '';
            if (printData.type === 'detailed') {
                badgeContent = `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #000; border-radius: 10px;">
                    <h1 style="text-align: center; color: #4a5568; margin-bottom: 20px;">Event Badge</h1>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Name:</strong> ${printData.name || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Email:</strong> ${printData.email || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Badge Code:</strong> ${printData.badgeCode || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Phone:</strong> ${printData.phone || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">City:</strong> ${printData.city || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Department:</strong> ${printData.department || 'N/A'}
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #718096; font-size: 12px;">
                        Scanned at: ${new Date().toLocaleString()}
                    </div>
                </div>
            `;
            } else if (printData.type === 'simple') {
                badgeContent = `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #000; border-radius: 10px;">
                    <h1 style="text-align: center; color: #4a5568; margin-bottom: 20px;">Event Badge</h1>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Name:</strong> ${printData.name || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Email:</strong> ${printData.email || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Badge Code:</strong> ${printData.badgeCode || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Event:</strong> ${printData.event || 'N/A'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #2d3748;">Entry ID:</strong> ${printData.entryId || 'N/A'}
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #718096; font-size: 12px;">
                        Scanned at: ${new Date().toLocaleString()}
                    </div>
                </div>
            `;
            }

            printWindow.document.write(`
            <html>
                <head>
                    <title>Print Badge - ${printData.name}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    ${badgeContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            }
                        }
                    </script>
                </body>
            </html>
        `);
            printWindow.document.close();
        };

        // Scan Badge
        const handleScanBadge = async (code = badgeCode) => {
            if (!selectedCheckpoint) {
                error('Please select a checkpoint first');
                return;
            }

            if (!code.trim()) {
                error('Please enter or scan a badge code');
                return;
            }

            const checkpointId = selectedCheckpoint.id || selectedCheckpoint.checkpointId;
            if (!checkpointId) {
                error('Invalid checkpoint selected');
                return;
            }

            try {
                setIsScanning(true);
                setScanResult(null);
                setPrintData(null);

                const url = `/events/${eventId}/scan?badgeCode=${encodeURIComponent(code)}&checkpointId=${checkpointId}`;
                console.log('Scanning with URL:', url);

                const response = await axiosInstance.post(url);

                console.log('Scan response:', response.data);

                if (response.data && response.data.status === 'SUCCESS') {
                    const attendeeData = response.data.data || {};

                    const formattedData = formatScanResultData(attendeeData);

                    setScanResult({
                        success: true,
                        message: 'Badge scanned successfully',
                        data: formattedData
                    });

                    if (selectedCheckpoint.type === 'REGISTRATION') {
                        setPrintData(formattedData);
                        setShowPrintModal(true);
                    }

                    success('Badge scanned successfully');
                    setBadgeCode('');
                    await fetchEventLogs();
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

        // Navigate to QR scan page (always enabled)
        const handleOpenScanner = () => {
            navigate(`/qr-scan/${eventId}`);
        };

        // Handle filter changes
        const handleFilterChange = (type, value) => {
            setCurrentPage(0);

            if (type === 'type') {
                setFilterType(value);
            } else if (type === 'checkpoint') {
                setCheckpointFilter(value);
            } else if (type === 'fromDate') {
                setFromDate(value);
            } else if (type === 'toDate') {
                setToDate(value);
            }
        };

        // Handle pagination
        const handlePageChange = (newPage) => {
            setCurrentPage(newPage);
            fetchEventLogs(newPage);
        };

        // Clear all filters
        const clearFilters = () => {
            setFilterType('all');
            setCheckpointFilter('all');
            setFromDate('');
            setToDate('');
            setCurrentPage(0);
        };

        // Fetch data when filters or page change
        useEffect(() => {
            if (eventId) {
                fetchEventLogs(currentPage);
            }
        }, [eventId, filterType, checkpointFilter, fromDate, toDate, currentPage]);

        // Initial fetch of checkpoints and event details
        useEffect(() => {
            if (eventId) {
                fetchEventDetails();
                fetchAllCheckpoints();
            }
        }, [eventId]);

        // Fetch event details
        const fetchEventDetails = async () => {
            try {
                const response = await axiosInstance.get("/admin/events");
                let eventsList = [];

                if (response.data && Array.isArray(response.data.data)) {
                    eventsList = response.data.data;
                } else if (Array.isArray(response.data)) {
                    eventsList = response.data;
                } else if (response.data && response.data.events) {
                    eventsList = response.data.events;
                }

                const foundEvent = eventsList.find(e =>
                    (e.eventId && e.eventId.toString() === eventId) ||
                    (e.id && e.id.toString() === eventId)
                );

                if (foundEvent) {
                    setEvent(foundEvent);
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
            }
        };

        // Handle refresh
        const handleRefresh = () => {
            fetchEventLogs(currentPage);
            fetchAllCheckpoints();
            success('Data refreshed');
        };

        // Get event name
        const getEventName = () => {
            return event?.name || event?.eventName || `Event #${eventId}`;
        };

        // Format timestamp
        const formatTimestamp = (timestamp) => {
            if (!timestamp) return 'N/A';
            try {
                return new Date(timestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } catch {
                return timestamp;
            }
        };

        // Format time only
        const formatTimeOnly = (timestamp) => {
            if (!timestamp) return 'N/A';
            try {
                return new Date(timestamp).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return timestamp;
            }
        };

        // Mobile compact card view for logs
        const renderMobileCompactLogCard = (log, index) => {
            const isExpanded = expandedLogs.has(index);

            return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 mb-2 w-full overflow-hidden">
                    {/* Compact View - Always Visible */}
                    <div className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User size={14} className="text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{log.attendeeName}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={10} className="text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{formatTimeOnly(log.scannedAt)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                                    {log.checkpointType}
                                </span>
                                <button
                                    onClick={() => toggleLogExpansion(index)}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                    {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Quick Info - Always Visible */}
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                            <span className="truncate flex-1">{log.checkpointName}</span>
                            <span className="text-gray-400 flex-shrink-0">•</span>
                            <span className="truncate">{log.scannedBy}</span>
                        </div>
                    </div>

                    {/* Expanded Details - Only visible when expanded */}
                    {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="col-span-2 overflow-hidden">
                                    <p className="text-gray-500">Email</p>
                                    <p className="text-gray-900 break-words">{log.attendeeEmail}</p>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-gray-500">Badge Code</p>
                                    <p className="font-mono text-gray-900 break-all">{log.badgeCode}</p>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-gray-500">Checkpoint</p>
                                    <p className="text-gray-900 truncate">{log.checkpointName}</p>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-gray-500">Scanned By</p>
                                    <p className="text-gray-900 truncate">{log.scannedBy}</p>
                                </div>
                                <div className="col-span-2 overflow-hidden">
                                    <p className="text-gray-500">Scanned At</p>
                                    <p className="text-gray-900 truncate">{formatTimestamp(log.scannedAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        if (isLoading && !logs.length && !checkpoints.length) {
            return (
                <div className="flex justify-center items-center min-h-screen p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 flex-shrink-0"></div>
                    <span className="ml-3 text-gray-600">Loading event tracking...</span>
                </div>
            );
        }

        return (
            <>
                {/* Global style to prevent horizontal scroll - Only for mobile */}
                <style jsx global>{`
                    @media (max-width: 768px) {
                        html, body {
                            overflow-x: hidden !important;
                            max-width: 100vw !important;
                            position: relative !important;
                        }
                        #root, #__next {
                            overflow-x: hidden !important;
                            max-width: 100vw !important;
                        }
                        .mobile-container {
                            max-width: 100vw;
                            overflow-x: hidden;
                        }
                    }
                `}</style>

                <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-7 w-full">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
                            <div className="min-w-0 flex-1">
                                <button
                                    onClick={() => navigate(`/manage-event/${eventId}`)}
                                    className="flex items-center text-gray-600 hover:text-gray-800 mb-2 cursor-pointer text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">Back to Manage Event</span>
                                </button>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <BarChart3 size={isMobileView ? 20 : 24} className="text-blue-600 flex-shrink-0" />
                                    <span className="truncate">Event Tracking</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate max-w-full">
                                    Create checkpoints and scan badges for {getEventName()}
                                </p>
                            </div>

                            {/* Desktop Actions - Now properly aligned */}
                            {!isMobileView && (
                                <div className="flex gap-2 flex-shrink-0 ml-auto">
                                    <button
                                        onClick={handleRefresh}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => setShowCheckpointsList(!showCheckpointsList)}
                                        className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-3xl hover:bg-purple-50 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <List size={16} />
                                        {showCheckpointsList ? 'Hide Checkpoints' : 'View Checkpoints'}
                                    </button>
                                    <button
                                        onClick={handleOpenScanner}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-3xl hover:bg-purple-700 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        <Camera size={16} />
                                        Open Scanner
                                    </button>
                                    <button
                                        onClick={handleExportToExcel}
                                        disabled={logs.length === 0 || isExporting}
                                        className="px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <FileSpreadsheet size={16} />
                                                Export
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            {isMobileView && (
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="self-end p-2 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0"
                                >
                                    <Menu className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Actions Menu */}
                        {isMobileView && isMobileMenuOpen && (
                            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm w-full mobile-container">
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={handleRefresh}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCheckpointsList(!showCheckpointsList);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <List size={16} />
                                        {showCheckpointsList ? 'Hide Checkpoints' : 'View Checkpoints'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleOpenScanner();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Camera size={16} />
                                        Open Scanner
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleExportToExcel();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        disabled={logs.length === 0 || isExporting}
                                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <FileSpreadsheet size={16} />
                                                Export to Excel
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Event Summary Card */}
                        {event && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 mb-4 sm:mb-6 w-full overflow-hidden">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar size={isMobileView ? 16 : 20} className="text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Event Date</p>
                                            <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                                                {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin size={isMobileView ? 16 : 20} className="text-purple-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                                                {event.location || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Map size={isMobileView ? 16 : 20} className="text-green-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Total Checkpoints</p>
                                            <p className="text-sm sm:text-base font-medium text-gray-800">
                                                {checkpoints.length} {checkpoints.length === 1 ? 'checkpoint' : 'checkpoints'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checkpoints Section */}
                        {showCheckpointsList && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6 overflow-hidden w-full">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Map size={isMobileView ? 18 : 20} className="text-purple-600 flex-shrink-0" />
                                        <span className="truncate">Event Checkpoints</span>
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateCheckpoint(true)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
                                    >
                                        <Plus size={16} />
                                        Add Checkpoint
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6">
                                    {checkpoints.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                                            No checkpoints added yet. Click "Add Checkpoint" to create your first checkpoint.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {checkpoints.map((checkpoint) => (
                                                <div
                                                    key={checkpoint.id}
                                                    className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer overflow-hidden ${selectedCheckpoint?.id === checkpoint.id
                                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => handleCheckpointSelect(checkpoint)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            {getIconComponent(checkpoint.type, isMobileView ? 16 : 20)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{checkpoint.name}</h3>
                                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
                                                                {checkpoint.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedCheckpoint?.id === checkpoint.id && (
                                                        <div className="mt-2 sm:mt-3 pt-2 border-t border-purple-200">
                                                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap">
                                                                Selected for scanning
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create Checkpoint Modal */}
                        {showCreateCheckpoint && (
                            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
                                <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Plus className="text-purple-600 flex-shrink-0" size={20} />
                                            <h2 className="text-lg font-semibold text-gray-800 truncate">Create Checkpoint</h2>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Checkpoint Type Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Checkpoint Type *
                                                </label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between bg-white text-sm"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {getIconComponent(newCheckpoint.type, 18, "text-purple-600")}
                                                            <span className="truncate">{newCheckpoint.type}</span>
                                                        </div>
                                                        <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
                                                    </button>

                                                    {showTypeDropdown && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                            {CHECKPOINT_TYPES.map((type) => (
                                                                <button
                                                                    key={type.value}
                                                                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                                                                    onClick={() => {
                                                                        setNewCheckpoint({ ...newCheckpoint, type: type.value });
                                                                        setShowTypeDropdown(false);
                                                                    }}
                                                                >
                                                                    {getIconComponent(type.value, 18, "text-purple-600")}
                                                                    <span className="truncate">{type.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Checkpoint Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Checkpoint Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCheckpoint.name}
                                                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                    placeholder="e.g., Main Entrance, Workshop Room 1"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                                            <button
                                                onClick={() => {
                                                    setShowCreateCheckpoint(false);
                                                    setNewCheckpoint({ name: '', type: 'REGISTRATION' });
                                                    setShowTypeDropdown(false);
                                                }}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 cursor-pointer text-sm order-2 sm:order-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreateCheckpoint}
                                                disabled={isScanning}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm order-1 sm:order-2 whitespace-nowrap"
                                            >
                                                {isScanning ? 'Creating...' : 'Create Checkpoint'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Print Badge Modal */}
                        {showPrintModal && printData && (
                            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
                                <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Printer size={isMobileView ? 20 : 24} className="text-purple-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Print Badge</h2>
                                                <p className="text-xs sm:text-sm text-gray-500">Registration checkpoint detected</p>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
                                            <h3 className="font-medium text-purple-800 mb-2 sm:mb-3 text-sm">Attendee Information:</h3>
                                            <div className="space-y-2 text-sm">
                                                <p className="text-sm overflow-hidden">
                                                    <span className="text-gray-600 font-medium">Name:</span>{' '}
                                                    <span className="text-gray-900 truncate">{printData.name}</span>
                                                </p>
                                                <p className="text-sm overflow-hidden">
                                                    <span className="text-gray-600 font-medium">Email:</span>{' '}
                                                    <span className="text-gray-900 break-words">{printData.email}</span>
                                                </p>
                                                <p className="text-sm overflow-hidden">
                                                    <span className="text-gray-600 font-medium">Badge Code:</span>{' '}
                                                    <span className="font-mono text-gray-900 text-xs break-all">{printData.badgeCode}</span>
                                                </p>
                                                {printData.phone && (
                                                    <p className="text-sm overflow-hidden">
                                                        <span className="text-gray-600 font-medium">Phone:</span>{' '}
                                                        <span className="text-gray-900 truncate">{printData.phone}</span>
                                                    </p>
                                                )}
                                                {printData.city && (
                                                    <p className="text-sm overflow-hidden">
                                                        <span className="text-gray-600 font-medium">City:</span>{' '}
                                                        <span className="text-gray-900 truncate">{printData.city}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                                            <button
                                                onClick={() => setShowPrintModal(false)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 font-medium text-sm order-2 sm:order-1"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handlePrintBadge();
                                                    setShowPrintModal(false);
                                                }}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 text-sm order-1 sm:order-2 whitespace-nowrap"
                                            >
                                                <Printer size={16} />
                                                Print Badge
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scan Badge Section */}
                        {selectedCheckpoint && (
                            <div className="bg-white rounded-xl border border-purple-300 shadow-md mb-4 sm:mb-6 overflow-hidden w-full">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                                            <Camera size={isMobileView ? 18 : 20} className="text-purple-600 flex-shrink-0" />
                                            <span className="truncate">Scan at: {selectedCheckpoint.name}</span>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                                {selectedCheckpoint.type}
                                            </span>
                                            {selectedCheckpoint.type === 'REGISTRATION' && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                                                    Prints badge
                                                </span>
                                            )}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedCheckpoint(null)}
                                            className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
                                        >
                                            <XCircle size={isMobileView ? 18 : 20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        {/* Scan Input */}
                                        <div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Badge Code / QR Code
                                                    </label>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <input
                                                            type="text"
                                                            value={badgeCode}
                                                            onChange={(e) => setBadgeCode(e.target.value)}
                                                            placeholder="Scan or enter badge code"
                                                            className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-full"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleScanBadge();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleScanBadge()}
                                                            disabled={isScanning || !badgeCode}
                                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
                                                        >
                                                            {isScanning ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                                                    <span className="truncate">Scanning...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <QrCode size={18} />
                                                                    <span>Scan</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scan Result - Success */}
                                            {scanResult && scanResult.success && scanResult.data && (
                                                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200 w-full overflow-hidden">
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle size={isMobileView ? 18 : 20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-green-800 text-sm">
                                                                {scanResult.message}
                                                            </p>
                                                            <div className="mt-3">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                                                                    {scanResult.data.badgeCode && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                                                                            <span className="text-gray-500 font-medium text-xs flex-shrink-0">Badge Code:</span>
                                                                            <span className="font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-green-200 text-xs break-all">
                                                                                {scanResult.data.badgeCode}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {scanResult.data.name && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
                                                                            <span className="text-gray-500 font-medium text-xs flex-shrink-0">Name:</span>
                                                                            <span className="font-medium text-gray-900 text-sm truncate">{scanResult.data.name}</span>
                                                                        </div>
                                                                    )}
                                                                    {scanResult.data.email && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 col-span-2 min-w-0 overflow-hidden">
                                                                            <span className="text-gray-500 font-medium text-xs flex-shrink-0">Email:</span>
                                                                            <span className="font-medium text-gray-900 text-sm break-words">{scanResult.data.email}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scan Result - Error */}
                                            {scanResult && !scanResult.success && (
                                                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 w-full">
                                                    <div className="flex items-start gap-3">
                                                        <XCircle size={isMobileView ? 18 : 20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-red-800 text-sm break-words">
                                                                {scanResult.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Advanced Filters */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 w-full overflow-hidden">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <Filter size={isMobileView ? 16 : 18} className="text-gray-500 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Filter Logs</span>
                                {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
                                    <button
                                        onClick={clearFilters}
                                        className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-medium flex-shrink-0"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {/* Type Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Checkpoint Type
                                    </label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        {CHECKPOINT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Checkpoint Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Specific Checkpoint
                                    </label>
                                    <select
                                        value={checkpointFilter}
                                        onChange={(e) => handleFilterChange('checkpoint', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        disabled={checkpoints.length === 0}
                                    >
                                        <option value="all">All Checkpoints</option>
                                        {checkpoints.map(cp => (
                                            <option key={cp.id} value={cp.id}>
                                                {cp.name} ({cp.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* From Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
                                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 overflow-hidden">
                                    <span className="text-xs text-gray-500 flex-shrink-0">Active:</span>
                                    {filterType !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
                                            <span className="truncate max-w-[80px]">Type: {filterType}</span>
                                            <button onClick={() => handleFilterChange('type', 'all')} className="hover:text-purple-900 flex-shrink-0">
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {checkpointFilter !== 'all' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
                                            <span className="truncate max-w-[80px]">Checkpoint: {checkpoints.find(cp => cp.id === checkpointFilter)?.name || checkpointFilter}</span>
                                            <button onClick={() => handleFilterChange('checkpoint', 'all')} className="hover:text-purple-900 flex-shrink-0">
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {fromDate && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
                                            <span className="truncate max-w-[80px]">From: {fromDate}</span>
                                            <button onClick={() => handleFilterChange('fromDate', '')} className="hover:text-purple-900 flex-shrink-0">
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {toDate && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs overflow-hidden">
                                            <span className="truncate max-w-[80px]">To: {toDate}</span>
                                            <button onClick={() => handleFilterChange('toDate', '')} className="hover:text-purple-900 flex-shrink-0">
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Logs Display */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Clock size={isMobileView ? 18 : 20} className="text-gray-600 flex-shrink-0" />
                                    Activity Logs
                                    <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2 whitespace-nowrap">
                                        {logs.length} of {logsCount}
                                    </span>
                                </h2>
                                {logs.length > 0 && !isMobileView && (
                                    <button
                                        onClick={handleExportToExcel}
                                        disabled={isExporting}
                                        className="px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <FileSpreadsheet size={16} />
                                                Export to Excel
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8 sm:py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-4 text-sm">Loading logs...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 px-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity size={isMobileView ? 24 : 32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No logs found</h3>
                                    <p className="text-sm text-gray-500">
                                        {filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate
                                            ? 'No logs match your filter criteria.'
                                            : 'No activity logs available for this event yet.'}
                                    </p>
                                    {(filterType !== 'all' || checkpointFilter !== 'all' || fromDate || toDate) && (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-3xl hover:bg-purple-200 text-sm font-medium"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    {!isMobileView && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Scanned At
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Attendee
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Email
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Badge Code
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Checkpoint
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Type
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            Scanned By
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {logs.map((log, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {formatTimestamp(log.scannedAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <User size={12} className="text-green-600" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                                        {log.attendeeName}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[200px]">
                                                                {log.attendeeEmail}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 truncate max-w-[150px]">
                                                                {log.badgeCode}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[150px]">
                                                                {log.checkpointName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                                                                    {log.checkpointType}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[150px]">
                                                                {log.scannedBy}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Mobile Compact Card View */}
                                    {isMobileView && (
                                        <div className="p-3 space-y-2 mobile-container">
                                            {logs.map((log, index) => renderMobileCompactLogCard(log, index))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left whitespace-nowrap">
                                            {isMobileView ? (
                                                <>Page {currentPage + 1} of {totalPages}</>
                                            ) : (
                                                <>Page {currentPage + 1} of {totalPages}</>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-end gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="px-3 py-1.5 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <ChevronLeft size={16} />
                                                <span className="hidden sm:inline">Previous</span>
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages - 1}
                                                className="px-3 py-1.5 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    } catch (err) {
        console.error('=== COMPONENT ERROR ===', err);
        return (
            <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg m-4 overflow-hidden">
                <h2 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Component Error</h2>
                <pre className="text-xs sm:text-sm text-red-600 whitespace-pre-wrap break-words">
                    {err.toString()}
                </pre>
                <pre className="text-xs text-gray-600 mt-4 bg-gray-100 p-2 rounded overflow-auto">
                    {err.stack}
                </pre>
            </div>
        );
    }
};

export default EventTracking;