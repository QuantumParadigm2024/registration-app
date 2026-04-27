import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Download,
    CheckCircle,
    XCircle,
    User,
    Mail,
    Phone,
    Calendar,
    Award,
    Loader2,
    RefreshCw,
    AlertCircle,
    CheckSquare,
    FileSpreadsheet,
    Eye,
    EyeOff,
    Building2,
    Briefcase,
    MapPin,
    Cake,
    Tag,
    MoreVertical,
    ChevronsUpDown,
    Menu,
    X,
    Settings,
    Save,
    Check,
    Edit,
    Grid,
    List,
    QrCode,
    Badge as BadgeIcon
} from 'lucide-react';
import axiosInstance from '../../../helper/AxiosInstance';
import PreviewBadge from './PreviewBadge';
import * as XLSX from 'xlsx';
import { Upload, AlertTriangle } from 'lucide-react';


const EventRegistrations = () => {
    const { eventId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [badgeData, setBadgeData] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);
    const [checkInLoading, setCheckInLoading] = useState({});
    const [badgeLoading, setBadgeLoading] = useState(false);
    const [selectedRegistrations, setSelectedRegistrations] = useState([]);
    const [exportLoading, setExportLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importError, setImportError] = useState(null);
    const [importSuccess, setImportSuccess] = useState(false);

    // Type filter states
    const [availableTypes, setAvailableTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [loadingTypes, setLoadingTypes] = useState(false);

    // Badge configuration states
    const [showFormatModal, setShowFormatModal] = useState(false);
    const [formFields, setFormFields] = useState([]);
    const [badgeConfig, setBadgeConfig] = useState(null);
    const [selectedConfigFields, setSelectedConfigFields] = useState([]);
    const [savingConfig, setSavingConfig] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(false);

    // Modal states
    const [showBulkPreviewBadge, setShowBulkPreviewBadge] = useState(false);
    const [showSinglePreviewBadge, setShowSinglePreviewBadge] = useState(false);
    const [selectedBadgeId, setSelectedBadgeId] = useState(null);

    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Add this state near your other state declarations
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [pendingCheckIn, setPendingCheckIn] = useState(null);

    const [selectedFormType, setSelectedFormType] = useState('');
    const [useExcelType, setUseExcelType] = useState(true);
    const [customType, setCustomType] = useState('');
    const [useCustomType, setUseCustomType] = useState(false);
    const [fileHeaders, setFileHeaders] = useState([]);
    const [headerValidation, setHeaderValidation] = useState({ hasName: false, hasEmail: false, hasType: false });

    // Helper function to get color for type badge
    const getTypeColor = (type) => {
        const colors = {
            'Sponsor': 'bg-purple-100 text-purple-800',
            'VIP': 'bg-yellow-100 text-yellow-800',
            'Speaker': 'bg-blue-100 text-blue-800',
            'Media': 'bg-green-100 text-green-800',
            'Staff': 'bg-gray-100 text-gray-800',
            'Attendee': 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    // Check for mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch badge configuration on mount
    useEffect(() => {
        fetchBadgeConfig();
    }, [eventId]);

    // Fetch available types on mount
    useEffect(() => {
        fetchAvailableTypes();
    }, [eventId]);

    // Format key for display
    const formatResponseKey = (key) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get icon for response field
    const getFieldIcon = (key) => {
        const iconMap = {
            city: <MapPin className="w-4 h-4 flex-shrink-0" />,
            company: <Building2 className="w-4 h-4 flex-shrink-0" />,
            company_name: <Building2 className="w-4 h-4 flex-shrink-0" />,
            designation: <Briefcase className="w-4 h-4 flex-shrink-0" />,
            date_of_birth: <Cake className="w-4 h-4 flex-shrink-0" />,
            select_department: <Tag className="w-4 h-4 flex-shrink-0" />,
            department: <Tag className="w-4 h-4 flex-shrink-0" />
        };
        return iconMap[key] || <User className="w-4 h-4 flex-shrink-0" />;
    };

    // Fetch badge configuration
    const fetchBadgeConfig = async () => {
        try {
            setLoadingConfig(true);
            const response = await axiosInstance.get(`/events/${eventId}/config`);
            if (response.data?.status === "success" && response.data?.data) {
                setBadgeConfig(response.data.data);
                if (response.data.data.selectedFieldKeys) {
                    setSelectedConfigFields(response.data.data.selectedFieldKeys);
                }
            }
        } catch (err) {
            console.error('Error fetching badge config:', err);
            // If 404, no config exists yet - that's fine
            if (err.response?.status !== 404) {
                console.error('Unexpected error:', err);
            }
        } finally {
            setLoadingConfig(false);
        }
    };

    // Fetch available types for the event
    const fetchAvailableTypes = async () => {
        try {
            setLoadingTypes(true);
            const response = await axiosInstance.get(`/admin/events/${eventId}/formType`);
            if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
                setAvailableTypes(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching available types:', err);
            // Don't show error to user, just log it
        } finally {
            setLoadingTypes(false);
        }
    };

    // Fetch form fields for configuration
    const fetchFormFields = async () => {
        try {
            const response = await axiosInstance.get(`/events/${eventId}/form-fields`);
            if (Array.isArray(response.data)) {
                setFormFields(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setFormFields(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching form fields:', err);
        }
    };

    // Open format modal
    const openFormatModal = async () => {
        await fetchFormFields();
        setShowFormatModal(true);
    };

    // Save badge configuration
    const saveBadgeConfig = async () => {
        if (selectedConfigFields.length === 0) {
            alert('Please select at least one field for the badge');
            return;
        }

        setSavingConfig(true);
        try {
            const response = await axiosInstance.post(`/events/${eventId}/config`, {
                selectedFieldKeys: selectedConfigFields
            });

            if (response.data?.status === "success") {
                setBadgeConfig({ selectedFieldKeys: selectedConfigFields });
                setShowFormatModal(false);
                alert('Badge format saved successfully!');
            }
        } catch (err) {
            console.error('Error saving badge config:', err);
            alert('Failed to save badge format. Please try again.');
        } finally {
            setSavingConfig(false);
        }
    };

    // Toggle field selection in config
    const toggleConfigField = (fieldKey) => {
        setSelectedConfigFields((prev) => {
            if (prev.includes(fieldKey)) {
                return prev.filter((f) => f !== fieldKey);
            }
            return [...prev, fieldKey];
        });
    };

    // Toggle row expansion
    const toggleRowExpansion = (registrationId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(registrationId)) {
                newSet.delete(registrationId);
            } else {
                newSet.add(registrationId);
            }
            return newSet;
        });
    };

    // View registration details in modal
    const viewRegistrationDetails = (registration) => {
        setSelectedRegistration(registration);
        setShowDetailModal(true);
        if (isMobileView) {
            setIsMobileMenuOpen(false);
        }
    };

    // Fetch registrations
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchRegistrations();
        }, 500);

        setSearchTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [eventId, currentPage, searchTerm, selectedType]);

    // Fetch badge data on mount
    useEffect(() => {
        fetchBadgeData();
    }, [eventId]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setIsSearching(true);
            setError(null);

            const params = {
                page: currentPage - 1,
                size: pageSize
            };

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            // Add type filter if selected
            if (selectedType && selectedType.trim()) {
                params.formType = selectedType;
            }

            const response = await axiosInstance.get(
                `/admin/events/${eventId}/registrations`,
                { params }
            );

            if (response.data?.status === 'success') {
                setRegistrations(response.data.data || []);
                setFilteredRegistrations(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);

                if (currentPage > (response.data.totalPages || 1)) {
                    setCurrentPage(1);
                }
            } else {
                throw new Error('Failed to fetch registrations');
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load registrations');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const fetchBadgeData = async () => {
        try {
            const response = await axiosInstance.get(
                `/events/${eventId}/badges/exportAll`
            );

            if (response.data?.status === 'success') {
                setBadgeData(response.data.data || []);
                return response.data.data;
            }
            return [];
        } catch (err) {
            console.error('Error fetching badge data:', err);
            return [];
        }
    };

    const handleExportToExcel = async () => {
        try {
            setExportLoading(true);

            const response = await axiosInstance.get(
                `/admin/events/${eventId}/exportAll`
            );

            if (response.data?.status === 'success' && response.data?.data) {
                const registrations = response.data.data;

                const allResponseKeys = new Set();
                registrations.forEach(reg => {
                    if (reg.responses) {
                        Object.keys(reg.responses).forEach(key => allResponseKeys.add(key));
                    }
                });

                const responseKeys = Array.from(allResponseKeys).sort();

                const excelData = registrations.map(reg => {
                    const baseData = {
                        'Registration ID': reg.registrationId,
                        'Name': reg.name,
                        'Type': reg.type || '',
                        'Email': reg.email,
                        'Phone': reg.phone,
                        'Checked In': reg.checkedIn ? 'Yes' : 'No',
                        'Submitted At': new Date(reg.submittedAt).toLocaleString(),
                    };

                    responseKeys.forEach(key => {
                        const formattedKey = formatResponseKey(key);
                        baseData[formattedKey] = reg.responses?.[key] || '';
                    });

                    return baseData;
                });

                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const maxWidth = 50;
                const wscols = [];
                for (let i = 0; i < responseKeys.length + 7; i++) {
                    wscols.push({ wch: Math.min(30, maxWidth) });
                }
                worksheet['!cols'] = wscols;

                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

                const date = new Date().toISOString().split('T')[0];
                const filename = `event_${eventId}_registrations_${date}.xlsx`;

                XLSX.writeFile(workbook, filename);
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (err) {
            console.error('Error exporting to Excel:', err);
            let errorMessage = 'Failed to export data';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            alert(`Export failed: ${errorMessage}`);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePreviewBadge = (registrationId = null) => {
        if (registrationId) {
            setSelectedBadgeId(registrationId);
            setShowSinglePreviewBadge(true);
        } else {
            setShowBulkPreviewBadge(true);
        }
        if (isMobileView) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedRegistrations.length === filteredRegistrations.length) {
            setSelectedRegistrations([]);
        } else {
            setSelectedRegistrations(filteredRegistrations.map(reg => reg.registrationId));
        }
    };

    const handleSelectRegistration = (registrationId) => {
        setSelectedRegistrations(prev =>
            prev.includes(registrationId)
                ? prev.filter(id => id !== registrationId)
                : [...prev, registrationId]
        );
    };

    const resetSearch = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedRegistrations([]);
        setCurrentPage(1);
    };

    const resetTypeFilter = () => {
        setSelectedType('');
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setSelectedRegistrations([]);
            setExpandedRows(new Set());
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = isMobileView ? 3 : 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= (isMobileView ? 2 : 4); i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - (isMobileView ? 2 : 3); i <= totalPages; i++) pageNumbers.push(i);
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const getCheckedInCount = () => {
        return registrations.filter(r => r.checkedIn).length;
    };

    const getNotCheckedInCount = () => {
        return registrations.filter(r => !r.checkedIn).length;
    };

    // Validate Excel file headers
    const validateExcelHeaders = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0];
                    
                    if (!headers || headers.length === 0) {
                        reject(new Error('Excel file is empty or has no headers'));
                        return;
                    }
                    
                    const normalizedHeaders = headers.map(h => String(h || '').trim().toLowerCase());
                    const hasName = normalizedHeaders.includes('name');
                    const hasEmail = normalizedHeaders.includes('email');
                    const hasType = normalizedHeaders.includes('type');
                    
                    setFileHeaders(headers);
                    setHeaderValidation({ hasName, hasEmail, hasType });
                    
                    if (!hasName || !hasEmail) {
                        reject(new Error('Excel file must contain "name" and "email" columns'));
                        return;
                    }
                    
                    resolve({ hasName, hasEmail, hasType });
                } catch (error) {
                    reject(new Error('Failed to read Excel file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    };

    // Single handleFileSelect function with validation
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (validExtensions.includes(fileExtension)) {
                try {
                    // Validate headers immediately
                    await validateExcelHeaders(file);
                    setSelectedFile(file);
                    setImportError(null);
                    setImportSuccess(false);
                } catch (err) {
                    setImportError(err.message);
                    setSelectedFile(null);
                    event.target.value = '';
                    setFileHeaders([]);
                    setHeaderValidation({ hasName: false, hasEmail: false, hasType: false });
                }
            } else {
                setImportError('Please select a valid Excel file (.xlsx, .xls, .xlsm, .xlsb)');
                setSelectedFile(null);
                event.target.value = '';
            }
        }
    };

    const handleImportExcel = async () => {
        if (!selectedFile) {
            setImportError('Please select a file to import');
            return;
        }

        // Validate required columns
        if (!headerValidation.hasName || !headerValidation.hasEmail) {
            setImportError('Excel file must contain "name" and "email" columns');
            return;
        }

        // Validate based on type selection method
        if (useExcelType && !useCustomType) {
            if (!headerValidation.hasType) {
                setImportError('Excel file must contain a "type" column when using the "Use Type column from Excel" option');
                return;
            }
        } else if (!useExcelType && !useCustomType) {
            if (!selectedFormType || selectedFormType === '') {
                setImportError('Please select a type from the list');
                return;
            }
        } else if (useCustomType) {
            if (!customType || customType.trim() === '') {
                setImportError('Please enter a custom type');
                return;
            }
        }

        setImportLoading(true);
        setImportError(null);
        setImportSuccess(false);

        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Add formType parameter based on selection
        if (!useExcelType && !useCustomType && selectedFormType) {
            formData.append('formType', selectedFormType);
        }
        
        if (useCustomType && customType) {
            formData.append('formType', customType.trim());
        }
        // If useExcelType is true, we don't send formType parameter

        try {
            const response = await axiosInstance.post(
                `/form/event/${eventId}/import-excel`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data?.status === 'success') {
                setImportSuccess(true);
                setTimeout(() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setUseExcelType(true);
                    setUseCustomType(false);
                    setSelectedFormType('');
                    setCustomType('');
                    setFileHeaders([]);
                    setHeaderValidation({ hasName: false, hasEmail: false, hasType: false });
                    fetchRegistrations();
                    fetchBadgeData();
                    fetchAvailableTypes();
                }, 2000);
            } else {
                throw new Error(response.data?.message || 'Failed to import data');
            }
        } catch (err) {
            console.error('Error importing Excel:', err);
            setImportError(err.response?.data?.message || err.message || 'Failed to import Excel file');
        } finally {
            setImportLoading(false);
        }
    };

    const resetImportModal = () => {
        setSelectedFile(null);
        setImportError(null);
        setImportSuccess(false);
        setUseExcelType(true);
        setUseCustomType(false);
        setSelectedFormType('');
        setCustomType('');
        setFileHeaders([]);
        setHeaderValidation({ hasName: false, hasEmail: false, hasType: false });
        setShowImportModal(false);
    };

    const renderMobileRegistrationCard = (registration) => (
        <div key={registration.registrationId} className="bg-white rounded-lg border border-gray-200 p-3 mb-3 w-full overflow-hidden">
            {/* Card Header with Selection */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="h-8 w-8 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-xs">
                                {registration.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{registration.name}</h3>
                        {registration.type && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getTypeColor(registration.type)}`}>
                                {registration.type}
                            </span>
                        )}
                        {registration.responses?.company_name && (
                            <p className="text-xs text-gray-500 flex items-center truncate mt-1">
                                <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{registration.responses.company_name}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(registration.registrationId)}
                        onChange={() => handleSelectRegistration(registration.registrationId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <button
                        onClick={() => toggleRowExpansion(registration.registrationId)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {expandedRows.has(registration.registrationId) ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-1.5 mb-2">
                <div className="flex items-center text-xs">
                    <Mail className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{registration.email}</span>
                </div>
                <div className="flex items-center text-xs">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{registration.phone || '—'}</span>
                </div>
                <div className="flex items-center text-xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                    <span className="text-gray-600">{formatDateShort(registration.submittedAt)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
                <button
                    onClick={() => handleCheckInToggle(registration.registrationId, registration.checkedIn)}
                    disabled={checkInLoading[registration.registrationId]}
                    className={`inline-flex items-center justify-center px-2 py-1.5 rounded text-xs font-medium transition-colors ${registration.checkedIn
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                >
                    {checkInLoading[registration.registrationId] ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : registration.checkedIn ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    <span className="truncate">{registration.checkedIn ? 'Checked In' : 'Check In'}</span>
                </button>

                <button
                    onClick={() => handlePreviewBadge(registration.registrationId)}
                    className="inline-flex items-center justify-center px-2 py-1.5 bg-purple-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                    <Award className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Badge</span>
                </button>

                <button
                    onClick={() => viewRegistrationDetails(registration)}
                    className="inline-flex items-center justify-center px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                    <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>View</span>
                </button>
            </div>

            {/* Expanded Details */}
            {expandedRows.has(registration.registrationId) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Additional Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(registration.responses || {}).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-2 rounded overflow-hidden">
                                <div className="flex items-center text-xs text-gray-500 mb-1">
                                    {getFieldIcon(key)}
                                    <span className="ml-1 truncate">{formatResponseKey(key)}</span>
                                </div>
                                <div className="text-xs font-medium text-gray-900 break-words">
                                    {value || '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (loading && !isSearching) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center px-4 w-full max-w-sm">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading registrations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4 w-full">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error Loading Registrations</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchRegistrations}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto w-full sm:w-auto"
                    >
                        <RefreshCw className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        );
    }

    const handleCheckInToggle = async (registrationId, currentStatus) => {
        if (currentStatus) {
            await performCheckInToggle(registrationId, currentStatus);
            return;
        }

        setPendingCheckIn({ registrationId, currentStatus });
        setShowCheckInDialog(true);
    };

    const performCheckInToggle = async (registrationId, currentStatus) => {
        try {
            setCheckInLoading(prev => ({ ...prev, [registrationId]: true }));

            const response = await axiosInstance.post(
                `/events/${eventId}/badges/${registrationId}/manual-checkin`
            );

            if (response.data?.status === 'success') {
                await fetchRegistrations();
            } else {
                throw new Error('Failed to toggle check-in');
            }
        } catch (err) {
            console.error('Error toggling check-in:', err);
        } finally {
            setCheckInLoading(prev => ({ ...prev, [registrationId]: false }));
            setShowCheckInDialog(false);
            setPendingCheckIn(null);
        }
    };

    const cancelCheckIn = () => {
        setShowCheckInDialog(false);
        setPendingCheckIn(null);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full">
                    {/* Header */}
                    <div className="mb-3 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Event Registrations</h1>
                                <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
                                    Total {totalElements} registrations
                                </p>
                            </div>

                            {/* Mobile Menu Button */}
                            {isMobileView && (
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="self-end p-2 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0"
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <Menu className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>
                            )}

                            {/* Desktop Actions */}
                            {!isMobileView && (
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        disabled={importLoading}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:bg-blue-400"
                                    >
                                        {importLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <Upload className="w-4 h-4 mr-1" />
                                        )}
                                        Import Excel
                                    </button>

                                    <button
                                        onClick={handleExportToExcel}
                                        disabled={exportLoading}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm disabled:bg-green-400"
                                    >
                                        {exportLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <FileSpreadsheet className="w-4 h-4 mr-1" />
                                        )}
                                        Export Excel
                                    </button>

                                    <button
                                        onClick={() => handlePreviewBadge()}
                                        disabled={badgeLoading}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:bg-blue-400"
                                    >
                                        {badgeLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <BadgeIcon className="w-4 h-4 mr-1" />
                                        )}
                                        All Badges
                                    </button>

                                    <button
                                        onClick={fetchRegistrations}
                                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Refresh"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Badge Format Info */}
                        {badgeConfig && !isMobileView && (
                            <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Settings size={12} className="text-purple-600" />
                                    </div>
                                    <span className="text-xs text-purple-700">
                                        Badge format configured with {(badgeConfig.selectedFieldKeys?.length || 0)} field(s)
                                    </span>
                                </div>
                                <button
                                    onClick={openFormatModal}
                                    className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
                                >
                                    <Edit size={12} />
                                    Edit
                                </button>
                            </div>
                        )}

                        {/* Mobile Actions Menu */}
                        {isMobileView && isMobileMenuOpen && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                                <div className="flex flex-col space-y-2">
                                    {availableTypes.length > 0 && (
                                        <select
                                            value={selectedType}
                                            onChange={(e) => {
                                                setSelectedType(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            disabled={loadingTypes}
                                        >
                                            <option value="">All Types</option>
                                            {availableTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        disabled={importLoading}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm disabled:bg-blue-400"
                                    >
                                        {importLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Upload className="w-4 h-4 mr-2" />
                                        )}
                                        Import Excel
                                    </button>

                                    <button
                                        onClick={handleExportToExcel}
                                        disabled={exportLoading}
                                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm disabled:bg-green-400"
                                    >
                                        {exportLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        )}
                                        Export to Excel
                                    </button>

                                    <button
                                        onClick={() => handlePreviewBadge()}
                                        disabled={badgeLoading}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm disabled:bg-blue-400"
                                    >
                                        {badgeLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <BadgeIcon className="w-4 h-4 mr-2" />
                                        )}
                                        Generate All Badges
                                    </button>

                                    <button
                                        onClick={fetchRegistrations}
                                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Total</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{totalElements}</p>
                                </div>
                                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Checked</p>
                                    <p className="text-base sm:text-xl font-bold text-green-600 mt-0.5">
                                        {getCheckedInCount()}
                                    </p>
                                </div>
                                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Pending</p>
                                    <p className="text-base sm:text-xl font-bold text-gray-600 mt-0.5">
                                        {getNotCheckedInCount()}
                                    </p>
                                </div>
                                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Badges</p>
                                    <p className="text-base sm:text-xl font-bold text-purple-600 mt-0.5">
                                        {badgeData.length || registrations.length}
                                    </p>
                                </div>
                                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="relative flex-1">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={isMobileView ? "Search..." : "Search by name, email, phone, ID, company..."}
                                    className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {isSearching && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Type Filter Dropdown - Desktop */}
                            {availableTypes.length > 0 && !isMobileView && (
                                <div className="relative">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => {
                                            setSelectedType(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        disabled={loadingTypes}
                                    >
                                        <option value="">All Types</option>
                                        {availableTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingTypes && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={resetSearch}
                                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || selectedType) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        Search: {searchTerm}
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="ml-1 hover:text-blue-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedType && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                        Type: {selectedType}
                                        <button
                                            onClick={() => setSelectedType('')}
                                            className="ml-1 hover:text-purple-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bulk Actions */}
                    {selectedRegistrations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center">
                                    <CheckSquare className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-blue-800">
                                        {selectedRegistrations.length} selected
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <button
                                        onClick={() => handlePreviewBadge()}
                                        className="px-4 py-2 sm:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                                    >
                                        <Download className="w-4 h-4 mr-2 sm:mr-1" />
                                        Export Selected
                                    </button>
                                    <button
                                        onClick={() => setSelectedRegistrations([])}
                                        className="px-4 py-2 sm:py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 bg-white"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile View: Select All Toggle */}
                    {isMobileView && filteredRegistrations.length > 0 && (
                        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-2 mb-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedRegistrations.length === filteredRegistrations.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-xs text-gray-700">Select All</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {selectedRegistrations.length} of {filteredRegistrations.length}
                            </span>
                        </div>
                    )}

                    {/* Registrations Display */}
                    {filteredRegistrations.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            {!isMobileView && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <User className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Name
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <Tag className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Type
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <Mail className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Email
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <Phone className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Phone
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Registered
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center">
                                                            <Eye className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            Details
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredRegistrations.map((registration) => (
                                                    <React.Fragment key={registration.registrationId}>
                                                        <tr className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRegistrations.includes(registration.registrationId)}
                                                                    onChange={() => handleSelectRegistration(registration.registrationId)}
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 flex-shrink-0">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                                                            <span className="text-white font-medium text-xs">
                                                                                {registration.name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                                                                        {registration.responses?.company_name && (
                                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                                <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                                <span className="truncate max-w-[150px]">{registration.responses.company_name}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {registration.type ? (
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(registration.type)}`}>
                                                                        {registration.type}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-sm text-gray-600 truncate max-w-[200px]">{registration.email}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-sm text-gray-600">{registration.phone || '—'}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-sm text-gray-600 whitespace-nowrap">
                                                                    {formatDateShort(registration.submittedAt)}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    onClick={() => handleCheckInToggle(registration.registrationId, registration.checkedIn)}
                                                                    disabled={checkInLoading[registration.registrationId]}
                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${registration.checkedIn
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                                        }`}
                                                                >
                                                                    {checkInLoading[registration.registrationId] ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                                    ) : registration.checkedIn ? (
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                    ) : (
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    {registration.checkedIn ? 'Checked In' : 'Check In'}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    onClick={() => handlePreviewBadge(registration.registrationId)}
                                                                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors whitespace-nowrap"
                                                                >
                                                                    <Award className="w-3 h-3 mr-1" />
                                                                    Badge
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center space-x-1">
                                                                    <button
                                                                        onClick={() => toggleRowExpansion(registration.registrationId)}
                                                                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                                                        title={expandedRows.has(registration.registrationId) ? "Hide details" : "Show details"}
                                                                    >
                                                                        {expandedRows.has(registration.registrationId) ? (
                                                                            <EyeOff className="w-4 h-4" />
                                                                        ) : (
                                                                            <Eye className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => viewRegistrationDetails(registration)}
                                                                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                                                        title="View full details"
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedRows.has(registration.registrationId) && (
                                                            <tr className="bg-gray-50">
                                                                <td colSpan="9" className="px-4 py-3">
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                        {Object.entries(registration.responses || {}).map(([key, value]) => (
                                                                            <div key={key} className="bg-white p-2 rounded border border-gray-200 overflow-hidden">
                                                                                <div className="flex items-center text-xs text-gray-500 mb-1">
                                                                                    {getFieldIcon(key)}
                                                                                    <span className="ml-1 truncate">{formatResponseKey(key)}</span>
                                                                                </div>
                                                                                <div className="text-sm font-medium text-gray-900 break-words">
                                                                                    {value || '—'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Card View */}
                            {isMobileView && (
                                <div className="space-y-2 w-full">
                                    {filteredRegistrations.map(renderMobileRegistrationCard)}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="mt-3 sm:mt-4 px-3 py-2 bg-white rounded-lg border border-gray-200 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="text-xs text-gray-600 text-center sm:text-left">
                                            {isMobileView ? (
                                                <>Page {currentPage} of {totalPages}</>
                                            ) : (
                                                <>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalElements)} of {totalElements}</>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center sm:justify-end space-x-1">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                                            >
                                                First
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-1.5 sm:p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-center space-x-1">
                                                {getPageNumbers().map((page, index) => (
                                                    page === '...' ? (
                                                        <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-gray-600">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`min-w-[28px] sm:min-w-[32px] px-2 py-1 text-xs font-medium rounded transition-colors ${currentPage === page
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 sm:p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                                            >
                                                Last
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center w-full">
                            <div className="flex flex-col items-center">
                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">No registrations found</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {searchTerm || selectedType
                                        ? 'Try adjusting your search or filters'
                                        : 'No one has registered for this event yet'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Check-in Confirmation Dialog */}
            {showCheckInDialog && pendingCheckIn && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onClick={cancelCheckIn}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
                                Confirm Check-in
                            </h3>

                            {(() => {
                                const attendee = registrations.find(r => r.registrationId === pendingCheckIn.registrationId);
                                if (!attendee) return null;

                                return (
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-semibold text-lg">
                                                    {attendee.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-gray-900 truncate">
                                                    {attendee.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    ID: {attendee.registrationId}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                <span className="text-gray-700 truncate">{attendee.email}</span>
                                            </div>
                                            {attendee.phone && (
                                                <div className="flex items-center text-sm">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    <span className="text-gray-700">{attendee.phone}</span>
                                                </div>
                                            )}
                                            {attendee.responses?.company_name && (
                                                <div className="flex items-center text-sm">
                                                    <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    <span className="text-gray-700 truncate">{attendee.responses.company_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            <p className="text-sm text-gray-600 text-center mb-6">
                                This action will mark them as present at the event.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={cancelCheckIn}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => performCheckInToggle(pendingCheckIn.registrationId, pendingCheckIn.currentStatus)}
                                    disabled={checkInLoading[pendingCheckIn.registrationId]}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-green-400"
                                >
                                    {checkInLoading[pendingCheckIn.registrationId] ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Checking in...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Confirm Check-in
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Badge Format Modal */}
            {showFormatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="min-h-screen px-2 sm:px-4 py-2 sm:py-8 flex items-center justify-center">
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-auto max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                        {badgeConfig ? 'Edit Badge Format' : 'Configure Badge Format'}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        Select fields to display on badges. Live preview shows how the badge will look.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedConfigFields(badgeConfig?.selectedFieldKeys || []);
                                        setShowFormatModal(false);
                                    }}
                                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6">
                                {/* Left Side - Field Selection */}
                                <div className="lg:w-1/2">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <Check className="w-4 h-4 mr-2 text-purple-600" />
                                        Available Fields
                                    </h3>

                                    {formFields.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {formFields.map((field) => {
                                                const isChecked = selectedConfigFields.includes(field.fieldKey);

                                                return (
                                                    <label
                                                        key={field.fieldKey}
                                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isChecked
                                                            ? 'bg-purple-50 border-purple-400 shadow-md'
                                                            : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <div className="relative flex-shrink-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleConfigField(field.fieldKey)}
                                                                    className="sr-only"
                                                                />
                                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${isChecked
                                                                    ? 'bg-purple-600 border-purple-600'
                                                                    : 'bg-white border-gray-300'
                                                                    }`}>
                                                                    {isChecked && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                                                    {field.label}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                                        {field.fieldType}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                            </div>
                                            <p className="text-gray-700 font-medium text-base sm:text-lg">No form fields available</p>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                                Add fields to the event form first to configure badge display
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side - Live Preview */}
                                <div className="lg:w-1/2">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <Eye className="w-4 h-4 mr-2 text-purple-600" />
                                        Live Preview
                                    </h3>

                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 shadow-inner sticky top-24">
                                        <div className="flex justify-center">
                                            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-[350px] transform transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                                                <div className="p-6">
                                                    {selectedConfigFields.length > 0 && (
                                                        <div className="space-y-3 mb-4">
                                                            {selectedConfigFields.slice(0, 3).map((fieldKey) => {
                                                                const field = formFields.find(f => f.fieldKey === fieldKey);
                                                                let sampleValue = "Sample Value";
                                                                if (field?.fieldType === 'EMAIL') sampleValue = "john.doe@company.com";
                                                                if (field?.fieldType === 'PHONE') sampleValue = "+1 (555) 123-4567";
                                                                if (field?.fieldType === 'DATE') sampleValue = "15 Jan 2024";
                                                                if (fieldKey.includes('company')) sampleValue = "Acme Corporation";
                                                                if (fieldKey.includes('department') || fieldKey.includes('select_department')) sampleValue = "Human Resources";
                                                                if (fieldKey.includes('city')) sampleValue = "New York";
                                                                if (fieldKey.includes('designation')) sampleValue = "Senior Manager";

                                                                return (
                                                                    <div key={fieldKey} className="text-center border-t border-gray-100 pt-2">
                                                                        <p className="text-sm font-semibold text-gray-800">
                                                                            {sampleValue}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}

                                                            {selectedConfigFields.length > 3 && (
                                                                <div className="text-center text-xs text-purple-600 font-medium bg-purple-50 py-1 px-2 rounded-full">
                                                                    +{selectedConfigFields.length - 3} more field(s)
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col items-center">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl blur-lg opacity-50"></div>
                                                            <div className="relative bg-white p-2 rounded-2xl border border-gray-200 shadow-inner">
                                                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                                                    <QrCode className="w-12 h-12 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
                                                            <p className="text-xs font-mono font-bold text-gray-800">
                                                                BDG-PREVIEW-123
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                                                    <p className="text-xs text-gray-500">
                                                        Preview shows sample data. Actual badges will use real attendee information.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 flex items-center justify-between p-4 sm:p-6 border-t border-gray-200">
                                <div className="text-xs sm:text-sm text-gray-600">
                                    {selectedConfigFields.length} field(s) selected
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedConfigFields(badgeConfig?.selectedFieldKeys || []);
                                            setShowFormatModal(false);
                                        }}
                                        className="px-4 py-2 sm:px-5 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveBadgeConfig}
                                        disabled={savingConfig || selectedConfigFields.length === 0}
                                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm shadow-lg shadow-purple-500/30"
                                    >
                                        {savingConfig ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Save Format</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedRegistration && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="min-h-screen px-2 sm:px-4 py-2 sm:py-8 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 z-10">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-sm sm:text-lg">
                                            {selectedRegistration.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm sm:text-xl font-bold text-gray-900 truncate">Registration Details</h2>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {selectedRegistration.registrationId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-3 sm:p-6">
                                {/* Status Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-blue-600">Check-in</p>
                                                <div className="flex items-center mt-1">
                                                    {selectedRegistration.checkedIn ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" />
                                                            <span className="text-xs sm:text-sm font-semibold text-green-700">Checked In</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1" />
                                                            <span className="text-xs sm:text-sm font-semibold text-gray-700">Not Checked In</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                                {selectedRegistration.checkedIn ? (
                                                    <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-purple-600">Registered</p>
                                                <p className="text-xs sm:text-sm font-semibold text-purple-700 mt-1 truncate">
                                                    {formatDateShort(selectedRegistration.submittedAt)}
                                                </p>
                                            </div>
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                                <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-green-600">Badge</p>
                                                <p className="text-xs sm:text-sm font-semibold text-green-700 mt-1">
                                                    {badgeData.some(b => b.registrationId === selectedRegistration.registrationId)
                                                        ? 'Available'
                                                        : 'Pending'}
                                                </p>
                                            </div>
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Information Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                    {/* Personal Information */}
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                                            Personal Information
                                        </h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-start">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Full Name</p>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{selectedRegistration.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{selectedRegistration.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                        {selectedRegistration.phone || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                                            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                                            Professional
                                        </h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            {selectedRegistration.type && (
                                                <div className="flex items-start">
                                                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Type</p>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {selectedRegistration.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRegistration.responses?.company_name && (
                                                <div className="flex items-start">
                                                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Company</p>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {selectedRegistration.responses.company_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRegistration.responses?.designation && (
                                                <div className="flex items-start">
                                                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Designation</p>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {selectedRegistration.responses.designation}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRegistration.responses?.department && (
                                                <div className="flex items-start">
                                                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Department</p>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {selectedRegistration.responses.department}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRegistration.responses?.city && (
                                                <div className="flex items-start">
                                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">City</p>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {selectedRegistration.responses.city}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Responses */}
                                {selectedRegistration.responses && Object.keys(selectedRegistration.responses).length > 0 && (
                                    <div className="mt-3 sm:mt-6">
                                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                                            <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                                            Additional Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                            {Object.entries(selectedRegistration.responses)
                                                .filter(([key]) => !['company_name', 'designation', 'department', 'city'].includes(key))
                                                .map(([key, value]) => (
                                                    <div key={key} className="bg-gray-50 rounded-lg p-2 sm:p-3 overflow-hidden">
                                                        <div className="flex items-center text-xs text-gray-500 mb-1">
                                                            {getFieldIcon(key)}
                                                            <span className="ml-1 truncate">{formatResponseKey(key)}</span>
                                                        </div>
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                            {value || '—'}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 p-3 sm:p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handlePreviewBadge(selectedRegistration.registrationId);
                                    }}
                                    className="px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center order-1 sm:order-2"
                                >
                                    <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span>View Badge</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk PreviewBadge Modal */}
            {showBulkPreviewBadge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="min-h-screen px-2 sm:px-4 py-2 sm:py-8">
                        <div className="relative bg-white rounded-xl shadow-xl max-w-7xl mx-auto max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
                            <PreviewBadge
                                onClose={() => {
                                    setShowBulkPreviewBadge(false);
                                }}
                                selectedRegistrations={selectedRegistrations.length > 0 ? selectedRegistrations : null}
                                allRegistrations={filteredRegistrations}
                                isSingleBadge={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Single PreviewBadge Modal */}
            {showSinglePreviewBadge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                    <div className="min-h-screen px-2 sm:px-4 py-2 sm:py-8">
                        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl mx-auto max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
                            <PreviewBadge
                                onClose={() => {
                                    setShowSinglePreviewBadge(false);
                                    setSelectedBadgeId(null);
                                }}
                                selectedRegistrationId={selectedBadgeId}
                                isSingleBadge={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Import Excel Modal */}
            {showImportModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onClick={resetImportModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fadeIn max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Import Excel File
                                    </h3>
                                </div>
                                <button
                                    onClick={resetImportModal}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {importSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-green-800">
                                        Import successful! Refreshing data...
                                    </p>
                                </div>
                            )}

                            {importError && !importSuccess && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 flex-1">
                                        {importError}
                                    </p>
                                </div>
                            )}

                            {/* Header Validation Status */}
                            {selectedFile && (
                                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-2">📋 Detected Headers:</p>
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs">
                                            {headerValidation.hasName ? 
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" /> : 
                                                <XCircle className="w-3 h-3 text-red-600 mr-1" />
                                            }
                                            <span className={headerValidation.hasName ? "text-green-700" : "text-red-700"}>
                                                "name" column {headerValidation.hasName ? "✓ Found" : "✗ Missing (Required)"}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            {headerValidation.hasEmail ? 
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" /> : 
                                                <XCircle className="w-3 h-3 text-red-600 mr-1" />
                                            }
                                            <span className={headerValidation.hasEmail ? "text-green-700" : "text-red-700"}>
                                                "email" column {headerValidation.hasEmail ? "✓ Found" : "✗ Missing (Required)"}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            {headerValidation.hasType ? 
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" /> : 
                                                <XCircle className="w-3 h-3 text-yellow-600 mr-1" />
                                            }
                                            <span className={headerValidation.hasType ? "text-green-700" : "text-yellow-700"}>
                                                "type" column {headerValidation.hasType ? "✓ Found" : "⚠ Optional (Only needed if using Excel type option)"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-yellow-800 mb-1">
                                            General Import Requirements:
                                        </p>
                                        <ul className="text-xs text-yellow-700 space-y-1">
                                            <li>• Only Excel files (.xlsx, .xls, .xlsm, .xlsb) are allowed</li>
                                            <li>• File must contain <strong className="font-semibold">"name"</strong> and <strong className="font-semibold">"email"</strong> columns (required)</li>
                                            <li>• <strong className="font-semibold">"type"</strong> column is optional and only needed if using "Use Type column from Excel" option</li>
                                            <li>• Other columns will be mapped to custom form fields</li>
                                            <li>• Maximum file size: 10MB</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Type Selection Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type Assignment Method <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="space-y-3">
                                    {/* Option 1: Use Type column from Excel */}
                                    <div className={`p-3 border rounded-lg transition-colors ${useExcelType && !useCustomType ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="radio"
                                                name="typeMethod"
                                                checked={useExcelType && !useCustomType}
                                                onChange={() => {
                                                    setUseExcelType(true);
                                                    setUseCustomType(false);
                                                    setSelectedFormType('');
                                                    setCustomType('');
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center">
                                                    <FileSpreadsheet className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">Use "Type" column from Excel</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Read type values from the <strong className="font-semibold">"type"</strong> column in your Excel file
                                                </p>
                                                {useExcelType && !useCustomType && !headerValidation.hasType && selectedFile && (
                                                    <div className="mt-2 p-2 bg-red-50 rounded-lg flex items-start">
                                                        <AlertTriangle className="w-3 h-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-red-700">
                                                            Error: Your Excel file does not have a "type" column. Please add a "type" column or choose another type assignment method.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>

                                    {/* Option 2: Select from existing types */}
                                    <div className={`p-3 border rounded-lg transition-colors ${!useExcelType && !useCustomType ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="radio"
                                                name="typeMethod"
                                                checked={!useExcelType && !useCustomType}
                                                onChange={() => {
                                                    setUseExcelType(false);
                                                    setUseCustomType(false);
                                                    setCustomType('');
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center">
                                                    <Tag className="w-4 h-4 text-purple-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">Select from existing types</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Apply the same type to all registrations in this import
                                                </p>
                                            </div>
                                        </label>

                                        {/* Existing Types Dropdown */}
                                        {!useExcelType && !useCustomType && (
                                            <div className="ml-7 mt-3">
                                                {availableTypes.length > 0 ? (
                                                    <>
                                                        <select
                                                            value={selectedFormType}
                                                            onChange={(e) => setSelectedFormType(e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            <option value="">Select a type...</option>
                                                            {availableTypes.map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {!selectedFormType && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                ⚠️ Please select a type
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                                        <p className="text-xs text-yellow-700">
                                                            ⚠️ No types available. Please add types to the event first or use custom type option.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Option 3: Enter custom type */}
                                    <div className={`p-3 border rounded-lg transition-colors ${useCustomType ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="radio"
                                                name="typeMethod"
                                                checked={useCustomType}
                                                onChange={() => {
                                                    setUseCustomType(true);
                                                    setUseExcelType(false);
                                                    setSelectedFormType('');
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center">
                                                    <Edit className="w-4 h-4 text-orange-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">Enter custom type</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Create and apply a new custom type to all registrations
                                                </p>
                                            </div>
                                        </label>

                                        {/* Custom Type Input */}
                                        {useCustomType && (
                                            <div className="ml-7 mt-3">
                                                <input
                                                    type="text"
                                                    value={customType}
                                                    onChange={(e) => setCustomType(e.target.value)}
                                                    placeholder="e.g., Premium, Gold, Silver, Guest, etc."
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {!customType.trim() && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        ⚠️ Please enter a custom type
                                                    </p>
                                                )}
                                                {customType.trim() && (
                                                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                                        <p className="text-xs text-green-700">
                                                            ✓ Will assign type: <strong className="font-semibold">{customType}</strong> to all imported registrations
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.xlsm,.xlsb"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={importLoading}
                                    />
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${selectedFile
                                        ? 'border-green-300 bg-green-50'
                                        : importError && !importSuccess
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-blue-400'
                                        }`}>
                                        {selectedFile ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    Click to browse or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Excel files only (.xlsx, .xls)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Validation Summary */}
                            {selectedFile && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-2">✅ Validation Summary:</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center">
                                            {headerValidation.hasName && headerValidation.hasEmail ? (
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                                            ) : (
                                                <XCircle className="w-3 h-3 text-red-600 mr-1" />
                                            )}
                                            <span>Required columns (name, email): {headerValidation.hasName && headerValidation.hasEmail ? '✓ Valid' : '✗ Invalid'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            {useExcelType && !useCustomType ? (
                                                headerValidation.hasType ? (
                                                    <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-600 mr-1" />
                                                )
                                            ) : (
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                                            )}
                                            <span>Type assignment: {
                                                useExcelType && !useCustomType ? 
                                                    (headerValidation.hasType ? '✓ Type column found' : '✗ Type column missing') :
                                                !useExcelType && !useCustomType ?
                                                    (selectedFormType ? '✓ Type selected' : '⚠ Please select a type') :
                                                useCustomType ?
                                                    (customType.trim() ? '✓ Custom type entered' : '⚠ Please enter a custom type') :
                                                '✓ Valid'
                                            }</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={resetImportModal}
                                    disabled={importLoading}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImportExcel}
                                    disabled={
                                        !selectedFile || 
                                        importLoading || 
                                        importSuccess ||
                                        !headerValidation.hasName ||
                                        !headerValidation.hasEmail ||
                                        (useExcelType && !useCustomType && !headerValidation.hasType) ||
                                        (!useExcelType && !useCustomType && (!selectedFormType || selectedFormType === '')) ||
                                        (useCustomType && (!customType || customType.trim() === ''))
                                    }
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {importLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Importing...
                                        </>
                                    ) : importSuccess ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Imported!
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Import File
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EventRegistrations;