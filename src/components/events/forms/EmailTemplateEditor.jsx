import React, { useState, useEffect, useRef } from 'react';
import {
    Mail,
    Edit3,
    Save,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Building,
    QrCode,
    User,
    Link as LinkIcon,
    CalendarDays,
    MapPinned,
    Headphones,
    Upload,
    Clock,
    ChevronDown
} from 'lucide-react';
import axiosInstance from '../../../helper/AxiosInstance';

// Country codes data
const countryCodes = [
    { code: '+91', country: 'India', pattern: '^[0-9]{10}$', example: '9876543210', maxLength: 10 },
    { code: '+1', country: 'USA/Canada', pattern: '^[0-9]{10}$', example: '2125551234', maxLength: 10 },
    { code: '+44', country: 'UK', pattern: '^[0-9]{10}$', example: '7911123456', maxLength: 10 },
    { code: '+61', country: 'Australia', pattern: '^[0-9]{9}$', example: '412345678', maxLength: 9 },
    { code: '+49', country: 'Germany', pattern: '^[0-9]{10,11}$', example: '15123456789', maxLength: 11 },
    { code: '+33', country: 'France', pattern: '^[0-9]{9}$', example: '612345678', maxLength: 9 },
    { code: '+81', country: 'Japan', pattern: '^[0-9]{10}$', example: '9012345678', maxLength: 10 },
    { code: '+86', country: 'China', pattern: '^[0-9]{11}$', example: '13812345678', maxLength: 11 },
    { code: '+65', country: 'Singapore', pattern: '^[0-9]{8}$', example: '91234567', maxLength: 8 },
    { code: '+971', country: 'UAE', pattern: '^[0-9]{9}$', example: '501234567', maxLength: 9 },
    { code: '+966', country: 'Saudi Arabia', pattern: '^[0-9]{9}$', example: '512345678', maxLength: 9 },
    { code: '+60', country: 'Malaysia', pattern: '^[0-9]{9,10}$', example: '123456789', maxLength: 10 },
    { code: '+64', country: 'New Zealand', pattern: '^[0-9]{9}$', example: '211234567', maxLength: 9 },
    { code: '+27', country: 'South Africa', pattern: '^[0-9]{9}$', example: '712345678', maxLength: 9 },
];

const EmailTemplateEditor = ({ 
    eventId, 
    eventName, 
    onClose, 
    notification,
    isPublishingFlow = false,
    onPublishConfirm 
}) => {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [templateData, setTemplateData] = useState({
        supportEmail: '',
        supportPhone: '',
        eventLocation: '',
        eventDescription: '',
        eventName: '',
        eventWebsite: '',
        eventLogo: '',
        eventDate: '',
        eventStartTime: '',
        badgeCode: 'BDG-XXXXXXXX',
        qrUrl: '',
        username: '',
        userEmail: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [descriptionCharCount, setDescriptionCharCount] = useState(0);
    const { success, error } = notification;
    
    // Ref for modal content to handle click outside
    const modalRef = useRef(null);

    // Fetch email template on mount
    useEffect(() => {
        fetchEmailTemplate();
    }, [eventId]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const fetchEmailTemplate = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/events/${eventId}/email-template`);
            
            if (response.data) {
                setTemplateData(response.data);
                setOriginalData(response.data);
                setDescriptionCharCount(response.data.eventDescription?.length || 0);
                
                // Parse phone number if exists
                if (response.data.supportPhone) {
                    const phoneStr = response.data.supportPhone.toString();
                    let matchedCode = countryCodes.find(c => phoneStr.startsWith(c.code));
                    if (matchedCode) {
                        setSelectedCountryCode(matchedCode);
                        setPhoneNumber(phoneStr.substring(matchedCode.code.length));
                    } else {
                        setPhoneNumber(phoneStr);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching email template:', err);
            error(err.response?.data?.message || 'Failed to load email template');
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (countryCode, number) => {
        if (!number || number.trim() === '') return true;
        
        const selectedCountry = countryCodes.find(c => c.code === countryCode);
        if (!selectedCountry) return false;
        
        const cleanNumber = number.replace(/\s/g, '');
        const regex = new RegExp(selectedCountry.pattern);
        
        if (!regex.test(cleanNumber)) {
            return false;
        }
        
        return true;
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate event name
        if (!templateData.eventName || templateData.eventName.trim() === '') {
            errors.eventName = 'Event name is required';
        }
        
        // Validate email format
        if (templateData.supportEmail && templateData.supportEmail.trim() !== '') {
            if (!validateEmail(templateData.supportEmail)) {
                errors.supportEmail = 'Please enter a valid email address (e.g., user@example.com)';
            }
        }
        
        // Validate phone number with country code
        if (phoneNumber && phoneNumber.trim() !== '') {
            const fullPhoneNumber = selectedCountryCode.code + phoneNumber.replace(/\s/g, '');
            if (!validatePhoneNumber(selectedCountryCode.code, phoneNumber)) {
                errors.supportPhone = `Please enter a valid ${selectedCountryCode.country} phone number (${selectedCountryCode.example})`;
            }
        }
        
        // Validate website URL
        if (templateData.eventWebsite && templateData.eventWebsite.trim() !== '') {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            if (!urlRegex.test(templateData.eventWebsite)) {
                errors.eventWebsite = 'Please enter a valid URL (e.g., https://example.com)';
            }
        }
        
        // Validate event description length
        if (templateData.eventDescription && templateData.eventDescription.length > 2000) {
            errors.eventDescription = 'Event description cannot exceed 2000 characters';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field, value) => {
        if (field === 'eventDescription' && value.length > 2000) {
            error('Event description cannot exceed 2000 characters');
            return;
        }
        
        const newData = { ...templateData, [field]: value };
        setTemplateData(newData);
        
        if (field === 'eventDescription') {
            setDescriptionCharCount(value.length);
        }
        
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: null }));
        }
        
        if (originalData) {
            const hasChanges = JSON.stringify(newData) !== JSON.stringify(originalData);
            setHasChanges(hasChanges);
        }
        setSaveStatus(null);
    };

    const handlePhoneChange = (number) => {
        // Allow only digits and spaces
        const cleanedNumber = number.replace(/[^\d\s]/g, '');
        setPhoneNumber(cleanedNumber);
        
        const fullPhoneNumber = selectedCountryCode.code + cleanedNumber.replace(/\s/g, '');
        handleInputChange('supportPhone', fullPhoneNumber);
        
        if (validationErrors.supportPhone) {
            setValidationErrors(prev => ({ ...prev, supportPhone: null }));
        }
    };

    const handleCountryCodeChange = (countryCode) => {
        setSelectedCountryCode(countryCode);
        
        if (phoneNumber) {
            const fullPhoneNumber = countryCode.code + phoneNumber.replace(/\s/g, '');
            handleInputChange('supportPhone', fullPhoneNumber);
        }
        
        if (validationErrors.supportPhone) {
            setValidationErrors(prev => ({ ...prev, supportPhone: null }));
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            error('Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG)');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingLogo(true);

        try {
            const response = await axiosInstance.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.url && response.data.status === 'success') {
                const imageUrl = response.data.url;
                handleInputChange('eventLogo', imageUrl);
                success('Logo uploaded successfully!');
            } else if (response.data && response.data.data && response.data.data.url) {
                const imageUrl = response.data.data.url;
                handleInputChange('eventLogo', imageUrl);
                success('Logo uploaded successfully!');
            } else {
                error('Failed to upload logo');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            error(err.response?.data?.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            error('Please fix the validation errors before saving');
            return;
        }
        
        try {
            setSaving(true);
            
            const payload = {
                supportEmail: templateData.supportEmail,
                supportPhone: templateData.supportPhone,
                eventLocation: templateData.eventLocation,
                eventDescription: templateData.eventDescription,
                eventName: templateData.eventName,
                eventWebsite: templateData.eventWebsite,
                eventLogo: templateData.eventLogo,
                eventDate: templateData.eventDate,
                eventStartTime: templateData.eventStartTime,
                badgeCode: templateData.badgeCode,
                qrUrl: templateData.qrUrl
            };

            const response = await axiosInstance.put(`/events/${eventId}/email-content`, payload);
            
            if (response.data?.status === 'success') {
                setSaveStatus('success');
                setOriginalData({ ...templateData });
                setHasChanges(false);
                success('Email template updated successfully!');
                
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                throw new Error(response.data?.message || 'Failed to save');
            }
        } catch (err) {
            console.error('Error saving email template:', err);
            setSaveStatus('error');
            error(err.response?.data?.message || 'Failed to save email template');
        } finally {
            setSaving(false);
        }
    };

    const handlePublishConfirm = async () => {
        if (!validateForm()) {
            error('Please fix the validation errors before publishing');
            return;
        }
        
        if (onPublishConfirm) {
            try {
                setSaving(true);
                
                const payload = {
                    supportEmail: templateData.supportEmail,
                    supportPhone: templateData.supportPhone,
                    eventLocation: templateData.eventLocation,
                    eventDescription: templateData.eventDescription,
                    eventName: templateData.eventName || eventName,
                    eventWebsite: templateData.eventWebsite,
                    eventLogo: templateData.eventLogo,
                    eventDate: templateData.eventDate,
                    eventStartTime: templateData.eventStartTime,
                    badgeCode: templateData.badgeCode,
                    qrUrl: templateData.qrUrl
                };

                const response = await axiosInstance.put(`/events/${eventId}/email-content`, payload);
                
                if (response.data?.status === 'success') {
                    success('Email template saved successfully!');
                    onPublishConfirm(templateData);
                } else {
                    throw new Error(response.data?.message || 'Failed to save email template');
                }
            } catch (err) {
                console.error('Error saving email template during publish:', err);
                error(err.response?.data?.message || 'Failed to save email template. Please try again.');
                setSaving(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Render email preview
    const renderEmailPreview = () => {
        return (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <Mail size={16} />
                        <h3 className="font-semibold text-sm">Email Preview</h3>
                    </div>
                </div>

                <div className="p-4 max-h-[calc(70vh-120px)] overflow-y-auto" style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                        
                        {/* Logo */}
                        <div style={{ padding: '40px 30px 20px 30px', textAlign: 'center' }}>
                            {templateData.eventLogo ? (
                                <img 
                                    src={templateData.eventLogo} 
                                    alt="Event Logo" 
                                    width="140"
                                    style={{ display: 'block', margin: '0 auto', border: 0 }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                                <div style={{ width: '140px', height: '60px', margin: '0 auto', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building size={30} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Header */}
                        <div style={{ padding: '0 40px 30px 40px', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
                                Registration Confirmed
                            </h1>
                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', margin: '0 0 16px 0' }}>
                                Dear <strong>{templateData.username || 'Attendee'}</strong>,
                            </p>
                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', margin: 0 }}>
                                Your registration for <strong>{templateData.eventName || eventName}</strong> is successful.
                            </p>
                        </div>

                        {/* Event Description */}
                        {templateData.eventDescription && (
                            <div style={{ padding: '0 40px 30px 40px' }}>
                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>
                                    {templateData.eventDescription}
                                </p>
                            </div>
                        )}

                        {/* Details Section */}
                        <div style={{ padding: '0 40px 30px 40px' }}>
                            <table width="100%" cellSpacing="0" cellPadding="0" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '30px' }}>
                                <tbody>
                                    <tr>
                                        <td width="50%" valign="top" align="left">
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>
                                                Attendee
                                            </div>
                                            <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>
                                                {templateData.username || 'Attendee Name'}
                                            </div>
                                            {templateData.userEmail && (
                                                <div style={{ fontSize: '13px', color: '#6b7280', wordBreak: 'break-all' }}>
                                                    {templateData.userEmail}
                                                </div>
                                            )}
                                          </td>

                                        <td width="50%" valign="top" align="right">
                                            {templateData.eventLocation && (
                                                <>
                                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>
                                                        Location & Venue
                                                    </div>
                                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500, whiteSpace: 'pre-line' }}>
                                                        {templateData.eventLocation}
                                                    </div>
                                                </>
                                            )}
                                            <div style={{ marginTop: '6px' }}>
                                                {templateData.eventDate && (
                                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                        {formatDate(templateData.eventDate)}
                                                    </div>
                                                )}
                                                {templateData.eventStartTime && (
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                                        {templateData.eventStartTime}
                                                    </div>
                                                )}
                                            </div>
                                          </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* QR Section */}
                        <div style={{ padding: '0 40px 30px 40px' }}>
                            <table width="100%" cellSpacing="0" cellPadding="0" style={{ backgroundColor: '#eeeeee', padding: '30px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                <tbody>
                                    <tr>
                                        <td align="center">
                                            {templateData.qrUrl ? (
                                                <img 
                                                    src={templateData.qrUrl} 
                                                    alt="Entry QR" 
                                                    width="140"
                                                    style={{ display: 'block', margin: '0 auto 15px auto' }}
                                                />
                                            ) : (
                                                <div style={{ width: '140px', height: '140px', margin: '0 auto 15px auto', backgroundColor: '#e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <QrCode size={60} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>
                                                Entry Badge Code
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '3px' }}>
                                                {templateData.badgeCode || 'BDG-XXXXXXXX'}
                                            </div>
                                          </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Support Section */}
                        {(templateData.supportEmail || templateData.supportPhone || templateData.eventWebsite) && (
                            <div style={{ padding: '0 40px 30px 40px', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                    For support or inquiries:
                                </p>
                                <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                                    {templateData.supportEmail && (
                                        <a href={`mailto:${templateData.supportEmail}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>
                                            {templateData.supportEmail}
                                        </a>
                                    )}
                                    {templateData.supportEmail && templateData.supportPhone && (
                                        <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>
                                    )}
                                    {templateData.supportPhone && (
                                        <span style={{ color: '#111827', fontWeight: 500 }}>{templateData.supportPhone}</span>
                                    )}
                                </div>
                                {templateData.eventWebsite && (
                                    <div style={{ marginTop: '10px' }}>
                                        <a href={templateData.eventWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                            {templateData.eventWebsite}
                                        </a>
                                    </div>
                                )}
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '20px', fontStyle: 'italic' }}>
                                    Please do not reply to this email.
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ padding: '30px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#6b7280' }}>
                                This confirms your registration for <strong>{templateData.eventName || eventName}</strong>.
                            </p>
                            <span style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>
                                Powered by
                            </span>
                            <img 
                                src="https://quantumshare.quantumparadigm.in/vedio/Planotech_Logo_Black.png"
                                width="80"
                                style={{ display: 'block', margin: '10px auto', opacity: 0.8 }}
                                alt="Planotech"
                            />
                            <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                                © 2026 Planotech Event & Marketing Pvt Ltd
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEditForm = () => {
        return (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className={`px-4 py-3 ${isPublishingFlow ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-teal-600'} rounded-t-lg`}>
                    <div className="flex items-center gap-2 text-white">
                        <Edit3 size={17} />
                        <h3 className="font-semibold text-sm">
                            {isPublishingFlow ? 'Configure Email Template' : 'Edit Email Template'}
                        </h3>
                    </div>
                </div>

                <div className="p-4 max-h-[calc(70vh-120px)] overflow-y-auto space-y-4">
                    {/* Event Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Event Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={templateData.eventName || ''}
                            onChange={(e) => handleInputChange('eventName', e.target.value)}
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${validationErrors.eventName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter event name"
                        />
                        {validationErrors.eventName && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.eventName}</p>
                        )}
                    </div>

                    {/* Event Logo with Upload Option */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Event Logo
                        </label>
                        <div className="space-y-2">
                            {templateData.eventLogo && (
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                    <img src={templateData.eventLogo} alt="Logo" className="h-10 w-auto object-contain" />
                                    <button
                                        onClick={() => handleInputChange('eventLogo', '')}
                                        className="text-xs text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) handleLogoUpload(file);
                                            e.target.value = '';
                                        }}
                                        className="hidden"
                                        disabled={uploadingLogo}
                                    />
                                    <div className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                        {uploadingLogo ? (
                                            <>
                                                <Loader size={14} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={14} />
                                                {templateData.eventLogo ? 'Change Logo' : 'Upload Logo'}
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Event Description with Character Limit */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Event Description
                        </label>
                        <textarea
                            value={templateData.eventDescription || ''}
                            onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                            rows="4"
                            maxLength={2000}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter event description..."
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] text-gray-500">Supports line breaks for better formatting</p>
                            <p className={`text-[10px] ${descriptionCharCount > 1900 ? 'text-orange-500' : 'text-gray-400'}`}>
                                {descriptionCharCount}/2000 characters
                            </p>
                        </div>
                        {validationErrors.eventDescription && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.eventDescription}</p>
                        )}
                    </div>

                    {/* Location & Venue */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Location & Venue
                        </label>
                        <textarea
                            value={templateData.eventLocation || ''}
                            onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                            rows="2"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter venue location (can include map link on next line)"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">You can add map link on a new line</p>
                    </div>

                    {/* Event Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Event Date
                            </label>
                            <input
                                type="date"
                                value={templateData.eventDate || ''}
                                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Event Start Time
                            </label>
                            <input
                                type="time"
                                value={templateData.eventStartTime || ''}
                                onChange={(e) => handleInputChange('eventStartTime', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Support Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Support Email
                        </label>
                        <input
                            type="email"
                            value={templateData.supportEmail || ''}
                            onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${validationErrors.supportEmail ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="support@example.com"
                        />
                        {validationErrors.supportEmail && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.supportEmail}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1">Enter a valid email address</p>
                    </div>

                    {/* Support Phone with Country Code Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Support Phone Number
                        </label>
                        <div className="flex gap-2">
                            {/* Country Code Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedCountryCode.code}
                                    onChange={(e) => {
                                        const country = countryCodes.find(c => c.code === e.target.value);
                                        if (country) handleCountryCodeChange(country);
                                    }}
                                    className="appearance-none px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white pr-8"
                                >
                                    {countryCodes.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.code} ({country.country})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            
                            {/* Phone Number Input */}
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder={selectedCountryCode.example}
                                maxLength={selectedCountryCode.maxLength + 2}
                                className={`flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${validationErrors.supportPhone ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                        {validationErrors.supportPhone ? (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.supportPhone}</p>
                        ) : (
                            <p className="text-[10px] text-gray-500 mt-1">
                                Example: {selectedCountryCode.example} (without country code)
                            </p>
                        )}
                    </div>

                    {/* Event Website */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Event Website
                        </label>
                        <input
                            type="url"
                            value={templateData.eventWebsite || ''}
                            onChange={(e) => handleInputChange('eventWebsite', e.target.value)}
                            className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${validationErrors.eventWebsite ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="https://example.com"
                        />
                        {validationErrors.eventWebsite && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.eventWebsite}</p>
                        )}
                    </div>

                    {/* Non-editable fields info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-800 mb-2">ℹ️ Information (Auto-generated):</p>
                        <div className="space-y-1 text-xs text-blue-700">
                            <p>• <strong>Attendee Name & Email:</strong> Taken from registration form</p>
                            <p>• <strong>Badge Code:</strong> Auto-generated unique code for each attendee</p>
                            <p>• <strong>QR Code:</strong> Auto-generated for entry verification</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderFooterButtons = () => {
        if (isPublishingFlow) {
            return (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePublishConfirm}
                        disabled={saving}
                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Saving & Publishing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                Confirm & Publish Form
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    Close
                </button>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Loading email template...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-gray-100 rounded-xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            {isPublishingFlow ? 'Configure Email Template' : 'Email Template Editor'}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500">
                            {isPublishingFlow 
                                ? 'Customize the email that attendees will receive after registration'
                                : 'Customize the email that attendees will receive after registration'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Split Screen Content */}
                <div className="flex-1 overflow-hidden p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full">
                        {/* Left Side - Edit Form */}
                        <div className="lg:w-1/2 overflow-y-auto">
                            {renderEditForm()}
                        </div>

                        {/* Right Side - Live Preview */}
                        <div className="lg:w-1/2 overflow-y-auto mt-4 lg:mt-0">
                            {renderEmailPreview()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-end flex-shrink-0">
                    {renderFooterButtons()}
                </div>
            </div>
        </div>
    );
};

export default EmailTemplateEditor;