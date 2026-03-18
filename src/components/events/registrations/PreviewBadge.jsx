import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../helper/AxiosInstance";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { 
    Loader2, 
    Download, 
    X, 
    ChevronDown, 
    User, 
    Mail, 
    Phone, 
    QrCode, 
    Badge as BadgeIcon, 
    Check, 
    Layers,
    Save,
    Edit,
    Settings
} from "lucide-react";

const PreviewBadge = ({
    onClose,
    selectedRegistrations,
    allRegistrations,
    selectedRegistrationId,
    isSingleBadge = false
}) => {
    const { eventId } = useParams();
    const [badges, setBadges] = useState([]);
    const [singleBadge, setSingleBadge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [qrImages, setQrImages] = useState({});
    const [failedQrs, setFailedQrs] = useState({});
    const [allBadgesList, setAllBadgesList] = useState([]);
    
    // Badge configuration states
    const [formFields, setFormFields] = useState([]);
    const [badgeConfig, setBadgeConfig] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('grid');

    const dropdownRef = useRef(null);

    // Fetch form fields and badge configuration on mount
    useEffect(() => {
        fetchFormFields();
        fetchBadgeConfig();
    }, [eventId]);

    // First fetch all badges
    useEffect(() => {
        if (isSingleBadge && selectedRegistrationId) {
            fetchAllBadgesFirst();
        } else {
            fetchAllBadges();
        }
    }, [eventId, selectedRegistrationId, isSingleBadge, selectedRegistrations]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch form fields from the event
    const fetchFormFields = async () => {
        try {
            const response = await axiosInstance.get(`/events/${eventId}/form-fields`);
            if (Array.isArray(response.data)) {
                setFormFields(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setFormFields(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching form fields:", err);
        }
    };

    // Fetch badge configuration
    const fetchBadgeConfig = async () => {
        try {
            const response = await axiosInstance.get(`/events/${eventId}/config`);
            if (response.data?.status === "success" && response.data?.data) {
                setBadgeConfig(response.data.data);
                // Set selected fields from config
                if (response.data.data.selectedFieldKeys) {
                    setSelectedFields(response.data.data.selectedFieldKeys);
                }
            }
        } catch (err) {
            console.error("Error fetching badge config:", err);
            // If 404, no config exists yet - that's fine
            if (err.response?.status !== 404) {
                console.error("Unexpected error:", err);
            }
        }
    };

    // Save badge configuration
    const saveBadgeConfig = async () => {
        if (selectedFields.length === 0) {
            alert("Please select at least one field for the badge");
            return;
        }

        setSavingConfig(true);
        try {
            const response = await axiosInstance.post(`/events/${eventId}/config`, {
                selectedFieldKeys: selectedFields
            });
            
            if (response.data?.status === "success") {
                setBadgeConfig({ selectedFieldKeys: selectedFields });
                setIsEditingConfig(false);
                // Show success message (you might want to use a notification system)
                alert("Badge format saved successfully!");
            }
        } catch (err) {
            console.error("Error saving badge config:", err);
            alert("Failed to save badge format. Please try again.");
        } finally {
            setSavingConfig(false);
        }
    };

    // Get field value from badge (checks both root and responses)
    const getFieldValue = (badge, fieldKey) => {
        // Check if it's a default field from root object
        if (fieldKey === "email") return badge.email || badge.responses?.email || "";
        if (fieldKey === "phone" || fieldKey === "phone_number") {
            return badge.phone || badge.responses?.phone || badge.responses?.phone_number || "";
        }
        if (fieldKey === "name") return badge.responses?.name || badge.name || "";
        
        // For other fields, check responses
        return badge.responses?.[fieldKey] || "";
    };

    // Get display name from responses or root object
    const getDisplayName = (badge) => {
        return badge.responses?.name || badge.name || "Attendee";
    };

    const generateQRFromBadge = async (badge) => {
        try {
            // Create payload map matching backend structure
            const payloadMap = {
                name: getDisplayName(badge),
                email: badge.email || badge.responses?.email || "",
                badge: badge.badgeCode || `BDG-${badge.entryId}`,
                entryId: badge.entryId,
                event: badge.eventName || "Event"
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
            console.error(`Failed to generate QR for ${badge.entryId}:`, err);
            return null;
        }
    };

    // Load or generate QR image
    const loadQRImage = async (badge) => {
        try {
            if (badge.qrUrl) {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = badge.qrUrl;

                img.onload = () => {
                    setQrImages(prev => ({ ...prev, [badge.entryId]: badge.qrUrl }));
                    setFailedQrs(prev => ({ ...prev, [badge.entryId]: false }));
                };

                img.onerror = async () => {
                    const generatedQR = await generateQRFromBadge(badge);
                    if (generatedQR) {
                        setQrImages(prev => ({ ...prev, [badge.entryId]: generatedQR }));
                        setFailedQrs(prev => ({ ...prev, [badge.entryId]: false }));
                    } else {
                        setFailedQrs(prev => ({ ...prev, [badge.entryId]: true }));
                    }
                };
            } else {
                const generatedQR = await generateQRFromBadge(badge);
                if (generatedQR) {
                    setQrImages(prev => ({ ...prev, [badge.entryId]: generatedQR }));
                    setFailedQrs(prev => ({ ...prev, [badge.entryId]: false }));
                } else {
                    setFailedQrs(prev => ({ ...prev, [badge.entryId]: true }));
                }
            }
        } catch (err) {
            console.error(`Error in loadQRImage for ${badge.entryId}:`, err);
            setFailedQrs(prev => ({ ...prev, [badge.entryId]: true }));
        }
    };

    // First fetch all badges to find the badge by entryId
    const fetchAllBadgesFirst = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get(`/events/${eventId}/badges/exportAll`);

            let badgesData = [];
            if (response.data?.status === "success" && Array.isArray(response.data.data)) {
                badgesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                badgesData = response.data;
            } else if (Array.isArray(response.data?.data)) {
                badgesData = response.data.data;
            }

            setAllBadgesList(badgesData);

            const foundBadge = badgesData.find(badge => badge.entryId === selectedRegistrationId);

            if (foundBadge) {
                setSingleBadge(foundBadge);
                setBadges([foundBadge]);
                await loadQRImage(foundBadge);
            } else {
                try {
                    await fetchSingleBadgeByEntryId();
                } catch {
                    setError("Badge not found");
                }
            }
        } catch (err) {
            console.error("Error fetching badges:", err);
            setError("Failed to load badge. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Try fetching by entryId
    const fetchSingleBadgeByEntryId = async () => {
        try {
            const response = await axiosInstance.get(
                `/events/${eventId}/badges/${selectedRegistrationId}`
            );

            if (response.data?.status === "success" && response.data.data) {
                const badgeData = response.data.data;
                setSingleBadge(badgeData);
                setBadges([badgeData]);
                await loadQRImage(badgeData);
                return true;
            }
            return false;
        } catch (err) {
            console.error("EntryId endpoint failed:", err);
            throw err;
        }
    };

    // Fetch all badges
    const fetchAllBadges = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(`/events/${eventId}/badges/exportAll`);

            let badgesData = [];
            if (response.data?.status === "success" && Array.isArray(response.data.data)) {
                badgesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                badgesData = response.data;
            } else if (Array.isArray(response.data?.data)) {
                badgesData = response.data.data;
            }

            setAllBadgesList(badgesData);

            let filteredBadges = [];
            if (selectedRegistrations && selectedRegistrations.length > 0) {
                filteredBadges = badgesData.filter(badge =>
                    selectedRegistrations.includes(badge.entryId)
                );
            } else {
                filteredBadges = badgesData;
            }

            setBadges(filteredBadges);

            for (const badge of filteredBadges) {
                await loadQRImage(badge);
            }
        } catch (err) {
            console.error("Error fetching badges:", err);
            setError("Failed to load badges. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const retryLoadQR = (entryId) => {
        const badge = badges.find(b => b.entryId === entryId) || singleBadge;
        if (badge) {
            setFailedQrs(prev => ({ ...prev, [entryId]: false }));
            loadQRImage(badge);
        }
    };

    const toggleField = (fieldKey) => {
        setSelectedFields((prev) => {
            if (prev.includes(fieldKey)) {
                return prev.filter((f) => f !== fieldKey);
            }
            return [...prev, fieldKey];
        });
    };

    const handleDownloadPDF = async () => {
        if (!badges.length) {
            alert("No badges to download");
            return;
        }

        setDownloading(true);

        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [76, 102],
            });

            for (let i = 0; i < badges.length; i++) {
                const badge = badges[i];

                if (i !== 0) pdf.addPage();

                const centerX = 38;

                // Name - Always show
                const displayName = getDisplayName(badge);
                pdf.setFontSize(16);
                pdf.setFont("helvetica", "bold");
                pdf.text(displayName, centerX, 20, { align: "center" });

                // Selected field values from config - No labels, just values
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                let y = 28;

                selectedFields.forEach((fieldKey) => {
                    const value = getFieldValue(badge, fieldKey);
                    if (!value) return;
                    pdf.text(String(value), centerX, y, { align: "center" });
                    y += 6;
                });

                // Generate QR Code for PDF
                try {
                    const payloadMap = {
                        name: displayName,
                        email: badge.email || badge.responses?.email || "",
                        badge: badge.badgeCode || `BDG-${badge.entryId}`,
                        entryId: badge.entryId,
                        event: badge.eventName || "Event"
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
                    const qrY = 45;

                    pdf.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
                } catch (err) {
                    console.error("QR generation failed:", err);
                }

                // Badge Code
                pdf.setFontSize(7);
                pdf.setFont("helvetica", "bold");
                pdf.text(badge.badgeCode || `BDG-${badge.entryId}`, centerX, 92, { align: "center" });
            }

            let fileName;
            if (isSingleBadge) {
                fileName = `${getDisplayName(badges[0])}_${badges[0]?.badgeCode || 'Badge'}.pdf`;
            } else {
                fileName = selectedRegistrations?.length > 0
                    ? `Selected_Badges_Event_${eventId}.pdf`
                    : `All_Badges_Event_${eventId}.pdf`;
            }

            pdf.save(fileName);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto m-4">
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full animate-pulse"></div>
                        </div>
                        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin mx-auto text-blue-600 relative" />
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg font-medium mt-4 sm:mt-6">Loading your badge...</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Preparing a perfect preview for you</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto m-4">
                <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <span className="text-3xl sm:text-4xl">⚠️</span>
                    </div>
                    <p className="text-red-600 text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{error}</p>
                    <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">We couldn't load your badge. Please try again.</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={isSingleBadge ? fetchAllBadgesFirst : fetchAllBadges}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200 font-medium text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-7xl mx-auto m-2 sm:m-4 border border-gray-100">
            {/* Enhanced Header - Responsive */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200/80">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <BadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {isSingleBadge ? 'Badge Preview' : 'Badges Preview'}
                        </h2>
                        <div className="flex flex-wrap items-center mt-2 gap-2">
                            <div className="px-2 sm:px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-xs sm:text-sm font-medium flex items-center">
                                <Layers className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[180px] sm:max-w-none">
                                    {isSingleBadge
                                        ? `Badge for ${getDisplayName(singleBadge) || 'Attendee'}`
                                        : `${badges.length} badge${badges.length !== 1 ? 's' : ''} ready for export`
                                    }
                                </span>
                            </div>
                            {badgeConfig && !isEditingConfig && (
                                <div className="px-2 sm:px-3 py-1 bg-green-50 rounded-full text-green-700 text-xs sm:text-sm font-medium flex items-center">
                                    <Check className="w-3 h-3 mr-1" />
                                    <span>Format: {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
                    {/* Badge Format Configuration Button */}
                    <button
                        onClick={() => setIsEditingConfig(!isEditingConfig)}
                        className="w-full sm:w-auto group px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        {isEditingConfig ? (
                            <>
                                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="font-medium">Editing Format</span>
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4" />
                                <span className="font-medium">
                                    {badgeConfig ? 'Edit Badge Format' : 'Configure Badge Format'}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading || badges.length === 0}
                        className="w-full sm:w-auto group px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="font-medium">Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                <span className="font-medium">{isSingleBadge ? 'Download Badge' : 'Download PDF'}</span>
                            </>
                        )}
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto p-2 sm:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Badge Format Configuration Panel */}
            {isEditingConfig && (
                <div className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/50">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-purple-600" />
                                Configure Badge Format
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Select the fields to display on badges. Name, QR code, and badge code are always shown.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={saveBadgeConfig}
                                disabled={savingConfig || selectedFields.length === 0}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 transition-all duration-200 flex items-center space-x-2 text-sm"
                            >
                                {savingConfig ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Format</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingConfig(false);
                                    // Revert to saved config if exists
                                    if (badgeConfig) {
                                        setSelectedFields(badgeConfig.selectedFieldKeys);
                                    }
                                }}
                                className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 shadow-lg transition-all duration-200 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {formFields.length > 0 ? (
                            formFields.map((field) => {
                                const isChecked = selectedFields.includes(field.fieldKey);
                                const hasValue = badges.some(badge => getFieldValue(badge, field.fieldKey));

                                return (
                                    <label
                                        key={field.fieldKey}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-150 cursor-pointer hover:bg-white/50 ${isChecked ? 'bg-white/70 border-purple-200' : 'bg-white/30'}`}
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="relative flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleField(field.fieldKey)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                                                    isChecked
                                                        ? 'bg-purple-600 border-purple-600'
                                                        : 'bg-white border-gray-300'
                                                }`}>
                                                    {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${hasValue ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {field.label}
                                                </p>
                                                {field.required && (
                                                    <span className="text-xs text-red-500">Required</span>
                                                )}
                                            </div>
                                        </div>
                                        {!hasValue && (
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                                                no data
                                            </span>
                                        )}
                                    </label>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-8 bg-white/50 rounded-xl">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <p className="text-sm text-gray-500">No form fields available</p>
                                <p className="text-xs text-gray-400 mt-1">Add fields to the event form first</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Badge Grid - Responsive Cards */}
            {badges.length === 0 ? (
                <div className="text-center py-12 sm:py-16 md:py-20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <BadgeIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-900 text-lg sm:text-xl font-semibold mb-2">No badges found</p>
                    <p className="text-gray-500 text-sm sm:text-base">There are no badges available to preview at this time.</p>
                </div>
            ) : (
                <div className={`grid ${isSingleBadge 
                    ? 'grid-cols-1 justify-items-center' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4 sm:gap-5 md:gap-6 max-h-[70vh] overflow-y-auto p-1 sm:p-2 custom-scrollbar`}>
                    {badges.map((badge) => (
                        <div
                            key={badge.entryId}
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden w-full"
                            style={{
                                maxWidth: isSingleBadge ? "400px" : "100%",
                                margin: "0 auto"
                            }}
                        >
                            {/* Decorative gradient bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                            
                            <div className="p-4 sm:p-5 md:p-6">
                                {/* Name with gradient text - Responsive */}
                                <div className="text-center mb-3 sm:mb-4">
                                    <h4 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                                        {getDisplayName(badge)}
                                    </h4>
                                </div>

                                {/* Selected Fields from Config - ONLY VALUES, NO LABELS */}
                                {selectedFields.length > 0 && (
                                    <div className="space-y-2 sm:space-y-1 mb-4 sm:mb-6">
                                        {selectedFields.map((fieldKey) => {
                                            const value = getFieldValue(badge, fieldKey);
                                            if (!value) return null;

                                            return (
                                                <div key={fieldKey} className="text-center">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-800 truncate px-2">
                                                        {String(value)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* QR Code Section - Responsive sizing */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                        <div className="relative bg-white p-2 sm:p-3 rounded-2xl border border-gray-100 shadow-inner">
                                            {qrImages[badge.entryId] ? (
                                                <img
                                                    src={qrImages[badge.entryId]}
                                                    alt={`QR Code for ${getDisplayName(badge)}`}
                                                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                                                    {failedQrs[badge.entryId] ? (
                                                        <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                                    ) : (
                                                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge Code - Responsive */}
                                    <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
                                        <p className="text-xs sm:text-sm font-mono font-bold text-gray-800 truncate max-w-[150px] sm:max-w-[180px]">
                                            {badge.badgeCode || `BDG-${badge.entryId}`}
                                        </p>
                                    </div>

                                    {failedQrs[badge.entryId] && (
                                        <button
                                            onClick={() => retryLoadQR(badge.entryId)}
                                            className="mt-2 sm:mt-3 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-colors duration-200 font-medium"
                                        >
                                            Retry Loading QR
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-from-top-5 {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-in {
                    animation: fade-in 0.2s ease-out, slide-in-from-top-5 0.3s ease-out;
                }
                
                /* Mobile dropdown positioning fix */
                @media (max-width: 640px) {
                    .fixed.dropdown-mobile {
                        position: fixed;
                        left: 1rem;
                        right: 1rem;
                        width: auto;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default PreviewBadge;