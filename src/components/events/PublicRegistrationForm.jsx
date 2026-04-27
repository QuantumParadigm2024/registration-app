import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from "../../helper/AxiosInstance";
import {
    Loader2,
    Mail,
    Phone,
    User,
    Calendar,
    Hash,
    FileText,
    CheckSquare,
    Circle,
    ChevronDown,
    Upload,
    CheckCircle,
    XCircle,
    Shield,
    Send,
    AlertCircle,
    MessageSquare,
    Building,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    KeyRound,
    ShieldCheck
} from 'lucide-react';
import PaymentComponent from '../payment/PaymentDetails';
// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Country codes list
const COUNTRY_CODES = [
    { code: '+91', name: 'India', flag: '🇮🇳', length: 10, example: '9876543210' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸', length: 10, example: '2125551234' },
    { code: '+44', name: 'UK', flag: '🇬🇧', length: 10, example: '7123456789' },
    { code: '+61', name: 'Australia', flag: '🇦🇺', length: 9, example: '412345678' },
    { code: '+971', name: 'UAE', flag: '🇦🇪', length: 9, example: '501234567' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', length: 9, example: '512345678' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬', length: 8, example: '91234567' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾', length: 9, example: '123456789' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩', length: 10, example: '8123456789' },
    { code: '+86', name: 'China', flag: '🇨🇳', length: 11, example: '13812345678' },
    { code: '+81', name: 'Japan', flag: '🇯🇵', length: 10, example: '9012345678' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷', length: 10, example: '1012345678' },
    { code: '+49', name: 'Germany', flag: '🇩🇪', length: 10, example: '15123456789' },
    { code: '+33', name: 'France', flag: '🇫🇷', length: 9, example: '612345678' },
    { code: '+39', name: 'Italy', flag: '🇮🇹', length: 10, example: '3123456789' },
    { code: '+34', name: 'Spain', flag: '🇪🇸', length: 9, example: '612345678' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷', length: 11, example: '11912345678' },
    { code: '+7', name: 'Russia', flag: '🇷🇺', length: 10, example: '9123456789' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦', length: 9, example: '712345678' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽', length: 10, example: '5512345678' }
];

const PublicRegistrationForm = () => {
    const { eventKey } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [fileUploading, setFileUploading] = useState({});
    const [fileUploadErrors, setFileUploadErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const fileInputRefs = useRef({});
    const [sponsorsPerView, setSponsorsPerView] = useState(4);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [otherStates, setOtherStates] = useState({});
    
    // State for phone number with country code
    const [selectedCountryForField, setSelectedCountryForField] = useState({});
    const [phoneDisplayNumbers, setPhoneDisplayNumbers] = useState({});

    const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentDetails, setPaymentDetails] = useState(null);

    // Email verification states
    const [emailVerification, setEmailVerification] = useState({
        emailFieldKey: null,
        isVerified: false,
        otpSent: false,
        otpValue: '',
        sendingOtp: false,
        verifyingOtp: false,
        otpSentTime: null,
        resendCooldown: 0,
        error: null,
        showVerificationUI: false
    });

    const emailDebounceTimer = useRef(null);

    useEffect(() => {
        fetchFormData();

        const handleResize = () => {
            if (window.innerWidth < 640) {
                setSponsorsPerView(2);
            } else if (window.innerWidth < 768) {
                setSponsorsPerView(3);
            } else {
                setSponsorsPerView(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [eventKey]);

    // Resend cooldown timer
    useEffect(() => {
        if (emailVerification.resendCooldown > 0) {
            const timer = setTimeout(() => {
                setEmailVerification(prev => ({
                    ...prev,
                    resendCooldown: prev.resendCooldown - 1
                }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [emailVerification.resendCooldown]);

    const fetchFormData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(
                `/public/events/${eventKey}/form`
            );

            console.log('Form data received:', response.data);

            if (response.data?.fields) {
                response.data.fields = response.data.fields.map(field => {
                    if (field.fieldType === 'FILE') {
                        return {
                            ...field,
                            fieldType: 'FILE_UPLOAD'
                        };
                    }
                    return field;
                });

                // FIND THE EMAIL FIELD
                const emailField = response.data.fields.find(field =>
                    field.fieldType === 'EMAIL' ||
                    field.fieldKey?.toLowerCase().includes('email') ||
                    field.label?.toLowerCase().includes('email')
                );

                if (emailField) {
                    setEmailVerification(prev => ({
                        ...prev,
                        emailFieldKey: emailField.fieldKey
                    }));
                }
            }

            if (response.data) {
                setFormData(response.data);

                const initialValues = {};
                const initialFilePreviews = {};
                const initialOtherStates = {};
                const initialSelectedCountry = {};
                const initialPhoneDisplay = {};

                if (response.data.fields && Array.isArray(response.data.fields)) {
                    response.data.fields.forEach(field => {
                        if (field.fieldType === 'CHECKBOX') {
                            initialValues[field.fieldKey] = [];
                        } else if (field.fieldType === 'FILE_UPLOAD') {
                            initialValues[field.fieldKey] = null;
                            initialFilePreviews[field.fieldKey] = null;
                        } else {
                            initialValues[field.fieldKey] = '';
                        }

                        if (field.fieldType === 'RADIO' || field.fieldType === 'MULTIPLE_CHOICE' || field.fieldType === 'CHECKBOX') {
                            initialOtherStates[field.fieldKey] = {
                                showOtherInput: false,
                                otherValue: '',
                                isOtherChecked: false
                            };
                        }
                        
                        // Initialize phone field with default country +91
                        if (field.fieldType === 'PHONE') {
                            initialSelectedCountry[field.fieldKey] = '+91';
                            initialPhoneDisplay[field.fieldKey] = '';
                        }
                    });
                }

                setFormValues(initialValues);
                setFilePreviews(initialFilePreviews);
                setOtherStates(initialOtherStates);
                setSelectedCountryForField(initialSelectedCountry);
                setPhoneDisplayNumbers(initialPhoneDisplay);
            } else {
                throw new Error('No form data received');
            }
        } catch (err) {
            console.error('Error fetching form:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load registration form. Please check the event link.'
            );
        } finally {
            setLoading(false);
        }
    };

    const parseSectionData = (dataJson) => {
        try {
            return JSON.parse(dataJson);
        } catch (e) {
            console.error('Error parsing section data:', e);
            return {};
        }
    };

    const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setShowPaymentModal(false);
    setSubmitted(true);
    setSubmitting(false);
    setPaymentProcessing(false);
    
    // Clean up form data
    setFormValues({});
    setFilePreviews({});
    setValidationErrors({});
    setFileUploadErrors({});
    setOtherStates({});
    
    // Resolve the promise if it exists
    if (window.paymentPromise) {
        window.paymentPromise.resolve(paymentData);
        delete window.paymentPromise;
    }
};

const handlePaymentError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
    setShowPaymentModal(false);
    setSubmitError(errorMessage);
    setSubmitting(false);
    setPaymentProcessing(false);
    
    // Reject the promise if it exists
    if (window.paymentPromise) {
        window.paymentPromise.reject(new Error(errorMessage));
        delete window.paymentPromise;
    }
};

const handlePaymentClose = () => {
    console.log('Payment modal closed');
    setShowPaymentModal(false);
    setSubmitting(false);
    setPaymentProcessing(false);
    
    // Reject the promise if it exists
    if (window.paymentPromise) {
        window.paymentPromise.reject(new Error('Payment cancelled by user'));
        delete window.paymentPromise;
    }
};

    const getLogoSizeClass = (size) => {
        switch (size?.toLowerCase()) {
            case 'small':
                return 'h-8 md:h-12';
            case 'large':
                return 'h-20 md:h-28';
            case 'medium':
            default:
                return 'h-12 md:h-16';
        }
    };

    const getHeaderAlignmentClass = (alignment) => {
        switch (alignment?.toLowerCase()) {
            case 'left':
                return 'text-left';
            case 'right':
                return 'text-right';
            case 'center':
            default:
                return 'text-center';
        }
    };

    // Validate phone number with selected country
    const validatePhoneNumberWithCountry = (countryCode, phoneNumber, fieldKey) => {
        // Remove all non-digit characters
        const digitsOnly = phoneNumber.toString().replace(/\D/g, '');
        
        // Find the selected country
        const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
        
        if (!selectedCountry) {
            return { isValid: false, message: 'Invalid country selection' };
        }
        
        // Check if phone number is empty
        if (digitsOnly.length === 0) {
            return { isValid: false, message: 'Phone number is required' };
        }
        
        // Check length based on country
        if (digitsOnly.length !== selectedCountry.length) {
            return { 
                isValid: false, 
                message: `${selectedCountry.name} phone number must be exactly ${selectedCountry.length} digits (current: ${digitsOnly.length})` 
            };
        }
        
        // All validations passed
        const formattedNumber = `${countryCode}${digitsOnly}`;
        return { isValid: true, message: null, formatted: formattedNumber };
    };

    // Handle phone number change with country code
    const handlePhoneWithCountryChange = (fieldKey, countryCode, phoneDigits) => {
        // Update display number
        setPhoneDisplayNumbers(prev => ({
            ...prev,
            [fieldKey]: phoneDigits
        }));
        
        // Format the full number for storage
        const fullNumber = `${countryCode}${phoneDigits}`;
        handleInputChange(fieldKey, fullNumber);
        
        // Validate in real-time
        if (phoneDigits.length > 0) {
            const validation = validatePhoneNumberWithCountry(countryCode, phoneDigits, fieldKey);
            
            if (validation.isValid) {
                // Clear validation error if valid
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldKey];
                    return newErrors;
                });
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    [fieldKey]: validation.message
                }));
            }
        } else if (phoneDigits.length === 0 && validationErrors[fieldKey]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
    };

    // Handle country code change
    const handleCountryChange = (fieldKey, newCountryCode, currentPhoneDigits) => {
        setSelectedCountryForField(prev => ({
            ...prev,
            [fieldKey]: newCountryCode
        }));
        
        // Clear the phone number when country changes
        setPhoneDisplayNumbers(prev => ({
            ...prev,
            [fieldKey]: ''
        }));
        
        // Clear the stored value
        handleInputChange(fieldKey, '');
        
        // Clear validation error
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldKey];
            return newErrors;
        });
    };

    // Send OTP function
    const sendOtp = async (emailValue) => {
        if (!emailValue || emailValue.trim() === '') {
            setEmailVerification(prev => ({
                ...prev,
                error: 'Please enter your email address'
            }));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            setEmailVerification(prev => ({
                ...prev,
                error: 'Please enter a valid email address'
            }));
            return;
        }

        try {
            setEmailVerification(prev => ({
                ...prev,
                sendingOtp: true,
                error: null
            }));

            const response = await axiosInstance.post(
                `/public/events/${eventKey}/send-otp`,
                null,
                { params: { email: emailValue } }
            );

            if (response.data?.status === 'success') {
                setEmailVerification(prev => ({
                    ...prev,
                    otpSent: true,
                    sendingOtp: false,
                    otpSentTime: Date.now(),
                    resendCooldown: 60,
                    error: null,
                    showVerificationUI: true
                }));
            } else {
                throw new Error(response.data?.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            setEmailVerification(prev => ({
                ...prev,
                sendingOtp: false,
                error: err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.'
            }));
        }
    };

    // Verify OTP function
    const verifyOtp = async () => {
        if (!emailVerification.otpValue || emailVerification.otpValue.trim() === '') {
            setEmailVerification(prev => ({
                ...prev,
                error: 'Please enter the OTP'
            }));
            return;
        }

        const emailValue = formValues[emailVerification.emailFieldKey];
        if (!emailValue) {
            setEmailVerification(prev => ({
                ...prev,
                error: 'Email address is missing'
            }));
            return;
        }

        try {
            setEmailVerification(prev => ({
                ...prev,
                verifyingOtp: true,
                error: null
            }));

            const response = await axiosInstance.post(
                `/public/events/${eventKey}/verify-otp`,
                null,
                { params: { email: emailValue, otp: emailVerification.otpValue } }
            );

            if (response.data?.status === 'success') {
                setEmailVerification(prev => ({
                    ...prev,
                    isVerified: true,
                    verifyingOtp: false,
                    error: null
                }));
            } else {
                throw new Error(response.data?.message || 'OTP verification failed');
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            let errorMessage = 'OTP verification failed';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                if (errorMessage.toLowerCase().includes('expired')) {
                    errorMessage = 'OTP has expired. Please request a new one.';
                } else if (errorMessage.toLowerCase().includes('invalid')) {
                    errorMessage = 'Invalid OTP. Please check and try again.';
                }
            }

            setEmailVerification(prev => ({
                ...prev,
                verifyingOtp: false,
                error: errorMessage
            }));
        }
    };

    const handleInputChange = (fieldKey, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldKey]: value
        }));

        if (validationErrors[fieldKey]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }

        // AUTO-TRIGGER OTP WHEN EMAIL IS ENTERED
        if (fieldKey === emailVerification.emailFieldKey) {
            setEmailVerification(prev => ({
                ...prev,
                isVerified: false,
                otpSent: false,
                otpValue: '',
                error: null,
                showVerificationUI: false
            }));

            if (emailDebounceTimer.current) {
                clearTimeout(emailDebounceTimer.current);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && value.trim() !== '' && emailRegex.test(value)) {
                emailDebounceTimer.current = setTimeout(() => {
                    sendOtp(value);
                }, 500);
            }
        }
    };

    const handleCheckboxChange = (fieldKey, optionValue, isChecked) => {
        setFormValues(prev => {
            const currentValues = prev[fieldKey] || [];
            let newValues;

            if (isChecked) {
                newValues = [...currentValues, optionValue];
            } else {
                newValues = currentValues.filter(val => val !== optionValue);
            }

            return {
                ...prev,
                [fieldKey]: newValues
            };
        });

        if (validationErrors[fieldKey]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
    };

    const uploadFileToServer = async (fieldKey, file) => {
        try {
            setFileUploading(prev => ({ ...prev, [fieldKey]: true }));
            setFileUploadErrors(prev => ({ ...prev, [fieldKey]: null }));

            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');

            const response = await axiosInstance.post(
                '/file/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );

            if (response.data?.status === 'success' && response.data?.url) {
                setFormValues(prev => ({
                    ...prev,
                    [fieldKey]: response.data.url
                }));

                const previewUrl = URL.createObjectURL(file);
                setFilePreviews(prev => ({
                    ...prev,
                    [fieldKey]: previewUrl
                }));

                if (validationErrors[fieldKey]) {
                    setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[fieldKey];
                        return newErrors;
                    });
                }

                return response.data.url;
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            setFileUploadErrors(prev => ({
                ...prev,
                [fieldKey]: err.response?.data?.message || 'File upload failed. Please try again.'
            }));

            if (fileInputRefs.current[fieldKey]) {
                fileInputRefs.current[fieldKey].value = '';
            }

            throw err;
        } finally {
            setFileUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const handleFileSelect = async (fieldKey, file) => {
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setValidationErrors(prev => ({
                ...prev,
                [fieldKey]: 'File size must be less than 10MB'
            }));
            return;
        }

        try {
            await uploadFileToServer(fieldKey, file);
        } catch (error) {
            console.error('File upload failed:', error);
        }
    };

    const removeFile = (fieldKey) => {
        if (filePreviews[fieldKey]) {
            URL.revokeObjectURL(filePreviews[fieldKey]);
        }

        setFilePreviews(prev => ({
            ...prev,
            [fieldKey]: null
        }));

        setFormValues(prev => ({
            ...prev,
            [fieldKey]: null
        }));

        setFileUploadErrors(prev => ({
            ...prev,
            [fieldKey]: null
        }));

        if (fileInputRefs.current[fieldKey]) {
            fileInputRefs.current[fieldKey].value = '';
        }
    };

    const validateField = (field, value) => {
        if (field.required) {
            if (field.fieldType === 'CHECKBOX') {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return `${field.label} is required`;
                }
            } else if (field.fieldType === 'FILE_UPLOAD') {
                if (!value) {
                    return `${field.label} is required`;
                }
            } else {
                if (!value || value.toString().trim() === '') {
                    return `${field.label} is required`;
                }
            }
        }

        if (value && value.toString().trim() !== '') {
            switch (field.fieldType) {
                case 'EMAIL':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'Please enter a valid email address';
                    }
                    break;

                case 'PHONE':
                    // For phone, validation is handled in real-time, but we do a final check here
                    const selectedCountryCode = selectedCountryForField[field.fieldKey] || '+91';
                    const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCountryCode);
                    const phoneDigits = phoneDisplayNumbers[field.fieldKey] || '';
                    
                    if (field.required && (!phoneDigits || phoneDigits.length === 0)) {
                        return `${field.label} is required`;
                    }
                    
                    if (phoneDigits && selectedCountry && phoneDigits.length !== selectedCountry.length) {
                        return `${selectedCountry.name} phone number must be exactly ${selectedCountry.length} digits`;
                    }
                    break;

                case 'NUMBER':
                    if (isNaN(value) || value === '') {
                        return 'Please enter a valid number';
                    }
                    break;

                case 'DATE':
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        return 'Please enter a valid date';
                    }
                    break;

                default:
                    break;
            }
        }

        return null;
    };

    const validateForm = () => {
        if (!formData?.fields) return false;

        const errors = {};
        let isValid = true;

        // Check if email is verified
        if (!emailVerification.isVerified && emailVerification.emailFieldKey) {
            setSubmitError('Please verify your email address before submitting');
            return false;
        }

        formData.fields.forEach(field => {
            let value = formValues[field.fieldKey];
            
            // For phone fields, use the display number for validation
            if (field.fieldType === 'PHONE') {
                value = phoneDisplayNumbers[field.fieldKey] || '';
            }
            
            const error = validateField(field, value);

            if (error) {
                errors[field.fieldKey] = error;
                isValid = false;
            }
        });

        const anyFileUploading = Object.values(fileUploading).some(status => status === true);
        if (anyFileUploading) {
            setSubmitError('Please wait for files to finish uploading');
            return false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Render email verification UI
    const renderEmailVerificationUI = () => {
        if (!emailVerification.showVerificationUI && !emailVerification.isVerified) return null;

        const emailValue = formValues[emailVerification.emailFieldKey];

        if (emailVerification.isVerified) {
            return (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-green-800">✓ Email Verified Successfully!</p>
                            <p className="text-xs text-green-600">{emailValue}</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (emailVerification.sendingOtp) {
            return (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <p className="text-xs text-blue-700">Sending OTP to {emailValue}...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
                <div className="flex items-start gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">Please verify your email to complete registration</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={emailVerification.otpValue}
                            onChange={(e) => setEmailVerification(prev => ({
                                ...prev,
                                otpValue: e.target.value,
                                error: null
                            }))}
                            placeholder="Enter OTP sent to your email"
                            maxLength={6}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={emailVerification.verifyingOtp}
                            autoFocus
                        />
                        {emailVerification.verifyingOtp && (
                            <div className="absolute right-2 top-2.5">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={!emailVerification.otpValue || emailVerification.verifyingOtp}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[80px]"
                    >
                        {emailVerification.verifyingOtp ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Verify
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs">
                    <button
                        type="button"
                        onClick={() => sendOtp(emailValue)}
                        disabled={emailVerification.resendCooldown > 0 || emailVerification.sendingOtp}
                        className={`text-blue-600 hover:text-blue-700 flex items-center gap-1 ${emailVerification.resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {emailVerification.resendCooldown > 0 ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Resend OTP in {emailVerification.resendCooldown}s
                            </>
                        ) : (
                            'Resend OTP'
                        )}
                    </button>
                    <span className="text-gray-500">
                        OTP sent to {emailValue}
                    </span>
                </div>

                {emailVerification.error && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-600">{emailVerification.error}</p>
                    </div>
                )}
            </div>
        );
    };

    // Render field with phone number country code dropdown
    const renderField = (field) => {
        const value = formValues[field.fieldKey] || '';
        const error = validationErrors[field.fieldKey];
        const uploadError = fileUploadErrors[field.fieldKey];
        const isUploading = fileUploading[field.fieldKey];
        const options = parseOptions(field);
        const filePreview = filePreviews[field.fieldKey];
        const otherState = otherStates[field.fieldKey] || {
            showOtherInput: false,
            otherValue: '',
            isOtherChecked: false
        };

        const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`;

        const getPlaceholder = () => {
            switch (field.fieldType) {
                case 'SHORT_ANSWER': return `Enter ${field.label.toLowerCase()}`;
                case 'EMAIL': return 'you@example.com';
                case 'PHONE': {
                    const selectedCountry = COUNTRY_CODES.find(c => c.code === (selectedCountryForField[field.fieldKey] || '+91'));
                    return selectedCountry ? `${selectedCountry.example}` : 'Enter phone number';
                }
                case 'NUMBER': return 'Enter a number';
                case 'DATE': return 'YYYY-MM-DD';
                case 'PARAGRAPH': return `Enter ${field.label.toLowerCase()}`;
                default: return `Enter ${field.label.toLowerCase()}`;
            }
        };

        const getInputType = () => {
            switch (field.fieldType) {
                case 'EMAIL': return 'email';
                case 'PHONE': return 'tel';
                case 'NUMBER': return 'number';
                case 'DATE': return 'date';
                default: return 'text';
            }
        };

        const getFieldIcon = () => {
            switch (field.fieldType) {
                case 'EMAIL': return <Mail className="w-4 h-4 text-gray-400" />;
                case 'PHONE': return <Phone className="w-4 h-4 text-gray-400" />;
                case 'NUMBER': return <Hash className="w-4 h-4 text-gray-400" />;
                case 'DATE': return <Calendar className="w-4 h-4 text-gray-400" />;
                case 'PARAGRAPH': return <MessageSquare className="w-4 h-4 text-gray-400" />;
                case 'DROPDOWN': return <ChevronDown className="w-4 h-4 text-gray-400" />;
                case 'RADIO':
                case 'MULTIPLE_CHOICE':
                    return <Circle className="w-4 h-4 text-gray-400" />;
                case 'CHECKBOX': return <CheckSquare className="w-4 h-4 text-gray-400" />;
                case 'FILE_UPLOAD': return <Upload className="w-4 h-4 text-gray-400" />;
                default: return <User className="w-4 h-4 text-gray-400" />;
            }
        };

        // PHONE FIELD WITH COUNTRY CODE DROPDOWN
        if (field.fieldType === 'PHONE') {
            const selectedCountryCode = selectedCountryForField[field.fieldKey] || '+91';
            const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCountryCode);
            const displayNumber = phoneDisplayNumbers[field.fieldKey] || '';
            const isRequired = field.required;
            const fieldError = validationErrors[field.fieldKey];
            
            return (
                <div>
                    <div className="flex gap-2">
                        {/* Country Code Dropdown */}
                        <div className="relative flex-shrink-0 w-36">
                            <select
                                value={selectedCountryCode}
                                onChange={(e) => handleCountryChange(field.fieldKey, e.target.value, displayNumber)}
                                className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none cursor-pointer bg-white ${
                                    fieldError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                {COUNTRY_CODES.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.flag} {country.code}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-2.5 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        
                        {/* Phone Number Input */}
                        <div className="flex-1 relative">
                            <div className="absolute left-2 top-2.5">
                                <Phone className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={displayNumber}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(/\D/g, '');
                                    // Limit based on country's digit length
                                    let limitedDigits = digitsOnly;
                                    if (selectedCountry && digitsOnly.length > selectedCountry.length) {
                                        limitedDigits = digitsOnly.substring(0, selectedCountry.length);
                                    }
                                    handlePhoneWithCountryChange(field.fieldKey, selectedCountryCode, limitedDigits);
                                }}
                                placeholder={getPlaceholder()}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm pl-8 ${
                                    fieldError ? 'border-red-500 bg-red-50' : 
                                    displayNumber && displayNumber.length === selectedCountry?.length ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`}
                                required={isRequired}
                                maxLength={selectedCountry?.length || 15}
                            />
                            {displayNumber && displayNumber.length === selectedCountry?.length && !fieldError && (
                                <div className="absolute right-2 top-2.5">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Help text and validation messages */}
                    <div className="mt-1">
                       
                        {displayNumber && displayNumber.length > 0 && displayNumber.length !== selectedCountry?.length && (
                            <p className="text-xs text-blue-600 mt-0.5">
                                ℹ️ {selectedCountry?.name} phone number requires {selectedCountry?.length} digits (current: {displayNumber.length})
                            </p>
                        )}
                        {fieldError && (
                            <p className="text-xs text-red-600 mt-0.5 break-words">
                                {fieldError}
                            </p>
                        )}
                        {displayNumber && displayNumber.length === selectedCountry?.length && !fieldError && (
                            <p className="text-xs text-green-600 mt-0.5">
                                ✓ Valid {selectedCountry?.name} phone number
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        if (field.fieldType === 'FILE_UPLOAD') {
            return (
                <div>
                    <input
                        type="file"
                        ref={el => fileInputRefs.current[field.fieldKey] = el}
                        onChange={(e) => handleFileSelect(field.fieldKey, e.target.files[0])}
                        className="hidden"
                        id={`file-${field.fieldKey}`}
                        accept="image/*,.pdf,.doc,.docx"
                        disabled={isUploading}
                        required={field.required && !value}
                    />

                    {isUploading ? (
                        <div className="border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="text-sm text-gray-600">Uploading file...</span>
                            </div>
                        </div>
                    ) : value ? (
                        <div className="border border-gray-300 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Uploaded successfully
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(field.fieldKey)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                    {filePreview && filePreview.startsWith('blob:') ? (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                    ) : (
                                        <FileText className="w-4 h-4 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-900 font-medium truncate">
                                        {fileInputRefs.current[field.fieldKey]?.files[0]?.name || 'File uploaded'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        File URL stored
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <label
                            htmlFor={`file-${field.fieldKey}`}
                            className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors 
                                ${uploadError ? 'border-red-300 bg-red-50' :
                                    error ? 'border-red-300 bg-red-50' :
                                        'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                    <Upload className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-700 font-medium mb-0.5">Click to upload</p>
                                <p className="text-xs text-gray-500">
                                    {field.label === 'Photograph'
                                        ? 'Supported: Images (JPG, PNG, GIF)'
                                        : 'Any file (max 10MB)'
                                    }
                                </p>
                            </div>
                        </label>
                    )}

                    {uploadError && (
                        <p className="text-xs text-red-600 mt-1 break-words">{uploadError}</p>
                    )}
                    {error && !uploadError && (
                        <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>
                    )}
                </div>
            );
        }

        // EMAIL field
        if (field.fieldType === 'EMAIL') {
            return (
                <div>
                    <div className="relative">
                        <div className="absolute left-2 top-2.5">
                            {getFieldIcon()}
                        </div>
                        <input
                            type={getInputType()}
                            value={value}
                            onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                            className={`${baseInputClass} pl-8 pr-10 ${emailVerification.isVerified ? 'border-green-500 bg-green-50' : ''}`}
                            placeholder={getPlaceholder()}
                            required={field.required}
                            disabled={emailVerification.isVerified}
                        />
                        {emailVerification.sendingOtp && (
                            <div className="absolute right-2 top-2.5">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            </div>
                        )}
                        {emailVerification.isVerified && (
                            <div className="absolute right-2 top-2.5">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        )}
                    </div>
                    {error && <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>}
                    {renderEmailVerificationUI()}
                </div>
            );
        }

        if (field.fieldType === 'RADIO' || field.fieldType === 'MULTIPLE_CHOICE') {
            if (!options || options.length === 0) {
                return (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 break-words">
                            No options configured for this field.
                        </p>
                    </div>
                );
            }

            const hasOtherOption = options.some(opt =>
                opt.toLowerCase() === 'other' || opt.toLowerCase() === 'others'
            );

            const handleRadioChange = (selectedOption) => {
                if (selectedOption.toLowerCase() === 'other' || selectedOption.toLowerCase() === 'others') {
                    updateOtherState(field.fieldKey, { showOtherInput: true });
                    handleInputChange(field.fieldKey, '');
                } else {
                    updateOtherState(field.fieldKey, { showOtherInput: false, otherValue: '' });
                    handleInputChange(field.fieldKey, selectedOption);
                }
            };

            const handleOtherInputChange = (e) => {
                const otherText = e.target.value;
                updateOtherState(field.fieldKey, { otherValue: otherText });
                handleInputChange(field.fieldKey, otherText);
            };

            return (
                <div className="space-y-1">
                    <div className="space-y-1">
                        {options.map((option, idx) => {
                            const isOther = option.toLowerCase() === 'other' || option.toLowerCase() === 'others';

                            return (
                                <div key={idx}>
                                    <div className="flex items-start">
                                        <input
                                            type="radio"
                                            id={`${field.fieldKey}-${idx}`}
                                            name={field.fieldKey}
                                            value={isOther ? 'other' : option}
                                            checked={isOther ? otherState.showOtherInput : value === option}
                                            onChange={() => handleRadioChange(option)}
                                            className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5 flex-shrink-0"
                                            required={field.required}
                                        />
                                        <label
                                            htmlFor={`${field.fieldKey}-${idx}`}
                                            className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 break-words flex-1"
                                        >
                                            {option}
                                        </label>
                                    </div>

                                    {isOther && otherState.showOtherInput && (
                                        <div className="ml-6 mt-2 mb-2">
                                            <input
                                                type="text"
                                                value={otherState.otherValue}
                                                onChange={handleOtherInputChange}
                                                placeholder="Please specify"
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {error && <p className="text-xs text-red-600 break-words">{error}</p>}
                </div>
            );
        }

        if (field.fieldType === 'CHECKBOX') {
            if (!options || options.length === 0) {
                return (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 break-words">
                            No options configured for this checkbox field.
                        </p>
                    </div>
                );
            }

            const selectedValues = Array.isArray(value) ? value : [];

            const hasOtherOption = options.some(opt =>
                opt.toLowerCase() === 'other' || opt.toLowerCase() === 'others'
            );

            const regularOptions = options.filter(opt =>
                opt.toLowerCase() !== 'other' && opt.toLowerCase() !== 'others'
            );

            const otherOption = options.find(opt =>
                opt.toLowerCase() === 'other' || opt.toLowerCase() === 'others'
            );

            const handleCheckboxChangeWithOther = (option, isChecked) => {
                if (option.toLowerCase() === 'other' || option.toLowerCase() === 'others') {
                    updateOtherState(field.fieldKey, { isOtherChecked: isChecked });
                    if (!isChecked) {
                        const newValues = selectedValues.filter(val =>
                            val !== otherState.otherValue
                        );
                        handleInputChange(field.fieldKey, newValues);
                        updateOtherState(field.fieldKey, { otherValue: '' });
                    } else if (otherState.otherValue) {
                        const newValues = [...selectedValues, otherState.otherValue];
                        handleInputChange(field.fieldKey, newValues);
                    }
                } else {
                    handleCheckboxChange(field.fieldKey, option, isChecked);
                }
            };

            const handleOtherCheckboxInputChange = (e) => {
                const text = e.target.value;
                updateOtherState(field.fieldKey, { otherValue: text });

                if (otherState.isOtherChecked) {
                    const newValues = selectedValues.filter(val =>
                        val !== otherState.otherValue
                    );

                    if (text.trim() !== '') {
                        newValues.push(text);
                    }

                    handleInputChange(field.fieldKey, newValues);
                }
            };

            return (
                <div className="space-y-1">
                    <div className="space-y-1">
                        {regularOptions.map((option, idx) => (
                            <div key={idx} className="flex items-start">
                                <input
                                    type="checkbox"
                                    id={`${field.fieldKey}-${idx}`}
                                    checked={selectedValues.includes(option)}
                                    onChange={(e) => handleCheckboxChangeWithOther(option, e.target.checked)}
                                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
                                />
                                <label
                                    htmlFor={`${field.fieldKey}-${idx}`}
                                    className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 break-words flex-1"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}

                        {hasOtherOption && (
                            <div>
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id={`${field.fieldKey}-other`}
                                        checked={otherState.isOtherChecked}
                                        onChange={(e) => handleCheckboxChangeWithOther('other', e.target.checked)}
                                        className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
                                    />
                                    <label
                                        htmlFor={`${field.fieldKey}-other`}
                                        className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 break-words flex-1"
                                    >
                                        {otherOption || 'Other'}
                                    </label>
                                </div>

                                {otherState.isOtherChecked && (
                                    <div className="ml-6 mt-2 mb-2">
                                        <input
                                            type="text"
                                            value={otherState.otherValue}
                                            onChange={handleOtherCheckboxInputChange}
                                            placeholder="Please specify"
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedValues.length > 0 && (
                        <p className="text-xs text-gray-500 break-words">
                            Selected: {selectedValues.join(', ')}
                        </p>
                    )}
                    {error && <p className="text-xs text-red-600 break-words">{error}</p>}
                </div>
            );
        }

        if (field.fieldType === 'DROPDOWN') {
            return (
                <div className="relative">
                    <div className="absolute left-2 top-2.5">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                        className={`${baseInputClass} pl-8 appearance-none cursor-pointer`}
                        required={field.required}
                    >
                        <option value="">Select an option</option>
                        {options.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-2.5 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    {error && <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>}
                </div>
            );
        }

        if (field.fieldType === 'PARAGRAPH') {
            return (
                <div className="relative">
                    <div className="absolute left-2 top-2.5">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>
                    <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                        className={`${baseInputClass} pl-8 resize-none`}
                        rows="3"
                        placeholder={getPlaceholder()}
                        required={field.required}
                    />
                    {error && <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>}
                </div>
            );
        }

        return (
            <div className="relative">
                <div className="absolute left-2 top-2.5">
                    {getFieldIcon()}
                </div>
                <input
                    type={getInputType()}
                    value={value}
                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                    className={`${baseInputClass} pl-8`}
                    placeholder={getPlaceholder()}
                    required={field.required}
                    min={field.fieldType === 'NUMBER' && field.minValue ? field.minValue : undefined}
                    max={field.fieldType === 'NUMBER' && field.maxValue ? field.maxValue : undefined}
                    step={field.fieldType === 'NUMBER' && field.step ? field.step : undefined}
                />
                {error && <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>}
            </div>
        );
    };

    const parseOptions = (field) => {
        let options = [];

        try {
            if (!field.optionsJson) {
                return options;
            }

            if (Array.isArray(field.optionsJson)) {
                options = field.optionsJson;
            }
            else if (typeof field.optionsJson === 'string') {
                if (field.optionsJson.trim().startsWith('[') || field.optionsJson.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(field.optionsJson);
                        if (Array.isArray(parsed)) {
                            options = parsed;
                        } else if (parsed.options && Array.isArray(parsed.options)) {
                            options = parsed.options;
                        } else if (typeof parsed === 'object') {
                            options = Object.values(parsed);
                        }
                    } catch (jsonError) {
                        if (field.optionsJson.includes(',')) {
                            options = field.optionsJson.split(',').map(s => s.trim()).filter(s => s);
                        } else {
                            options = [field.optionsJson.trim()];
                        }
                    }
                } else {
                    if (field.optionsJson.includes(',')) {
                        options = field.optionsJson.split(',').map(s => s.trim()).filter(s => s);
                    } else {
                        options = [field.optionsJson.trim()];
                    }
                }
            }
            else if (field.optionsJson.options && Array.isArray(field.optionsJson.options)) {
                options = field.optionsJson.options;
            }
            else if (typeof field.optionsJson === 'object' && field.optionsJson !== null) {
                options = Object.values(field.optionsJson);
            }
        } catch (e) {
            console.error('Error parsing options for field:', field.fieldKey, e);

            if (typeof field.optionsJson === 'string') {
                const delimiters = [',', ';', '|', '\n'];
                for (const delimiter of delimiters) {
                    if (field.optionsJson.includes(delimiter)) {
                        options = field.optionsJson.split(delimiter).map(s => s.trim()).filter(s => s);
                        break;
                    }
                }
            }
        }

        options = options.filter(opt => opt && opt.toString().trim() !== '');

        return options;
    };

    const updateOtherState = (fieldKey, updates) => {
        setOtherStates(prev => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                ...updates
            }
        }));
    };

    const processPayment = async (entryId, amount, currency) => {
    return new Promise((resolve, reject) => {
        setShowPaymentModal(true);
        setPaymentDetails({
            entryId,
            amount,
            currency
        });
        // Store resolve/reject for later use
        window.paymentPromise = { resolve, reject };
    });
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        setSubmitError('Please fix the errors in the form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    try {
        setSubmitting(true);
        setSubmitError(null);

        const responses = {};

        formData.fields.forEach(field => {
            const value = formValues[field.fieldKey];

            if (field.fieldType === 'CHECKBOX' && Array.isArray(value)) {
                responses[field.fieldKey] = value.join(', ');
            } else if (value !== undefined && value !== null && value.toString().trim() !== '') {
                responses[field.fieldKey] = value.toString().trim();
            } else if (field.required) {
                responses[field.fieldKey] = '';
            }
        });

        // Get email value for response
        const emailValue = formValues[emailVerification.emailFieldKey] || '';
        
        // Get phone value with country code
        let phoneValue = '';
        if (formData.fields.some(f => f.fieldType === 'PHONE')) {
            const phoneField = formData.fields.find(f => f.fieldType === 'PHONE');
            if (phoneField) {
                const countryCode = selectedCountryForField[phoneField.fieldKey] || '+91';
                const phoneDigits = phoneDisplayNumbers[phoneField.fieldKey] || '';
                if (phoneDigits) {
                    phoneValue = `${countryCode}${phoneDigits}`;
                }
            }
        }

        const submissionData = {
            name: responses.name || responses.full_name || responses.first_name || '',
            email: emailValue,
            phone: phoneValue || responses.phone || responses.phone_number || responses.mobile || '',
            responses: responses
        };

        console.log('Submitting registration:', submissionData);

        const response = await axiosInstance.post(
            `/public/events/${eventKey}/register`,
            submissionData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Registration response:', response.data);

        if (response.data?.status === 'success') {
            const registrationId = response.data.registrationId || response.data.entryId;

            if (formData?.paymentDetails?.paid === true) {
                if (formData.paymentDetails.currency !== 'INR') {
                    setSubmitError(`Payment is required but currency ${formData.paymentDetails.currency} is not supported. Please contact the event organizer.`);
                    setSubmitting(false);
                    return;
                }

                // Show payment modal
                setPaymentDetails({
                    entryId: registrationId,
                    amount: formData.paymentDetails.amount,
                    currency: formData.paymentDetails.currency
                });
                setShowPaymentModal(true);
                setSubmitting(false); // Don't keep submitting state while payment is processing
            } else {
                setSubmitted(true);
                setSubmitting(false);
                // Clean up form data
                setFormValues({});
                setFilePreviews({});
                setValidationErrors({});
                setFileUploadErrors({});
                setOtherStates({});
            }
        } else {
            throw new Error(response.data?.message || 'Submission failed');
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        setSubmitError(
            err.response?.data?.message ||
            err.message ||
            'Failed to submit registration. Please try again.'
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSubmitting(false);
    }
};

    const renderFormSections = () => {
        if (!formData?.sections) return [];

        return formData.sections
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((section, index) => {
                const data = parseSectionData(section.dataJson);
                return { ...section, data, index };
            });
    };

    const renderBannerSection = (section, data) => {
        if (data.showBanner === false || !data.bannerUrl) {
            return null;
        }

        const bannerHeight = data.bannerHeight || '300px';
        const bannerAlignment = data.bannerAlignment || 'center';

        const getAlignmentClass = () => {
            switch (bannerAlignment?.toLowerCase()) {
                case 'left':
                    return 'items-start text-left';
                case 'right':
                    return 'items-end text-right';
                case 'center':
                default:
                    return 'items-center text-center';
            }
        };

        return (
            <div key={`banner-${section.index}`} className="relative w-full overflow-hidden">
                <div
                    className="relative bg-cover bg-center bg-no-repeat w-full"
                    style={{
                        backgroundImage: `url(${data.bannerUrl})`,
                        height: bannerHeight,
                        minHeight: '150px'
                    }}
                >
                    {data.showOverlay && (
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: data.overlayColor || 'rgba(0,0,0,0.3)' }}
                        />
                    )}

                    <div className={`absolute inset-0 flex flex-col justify-center px-4 md:px-8 ${getAlignmentClass()}`}>
                        {data.title && (
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                                {data.title}
                            </h2>
                        )}

                        {data.subtitle && (
                            <p className="text-sm md:text-base text-white mb-4 drop-shadow-md max-w-2xl">
                                {data.subtitle}
                            </p>
                        )}

                        {data.buttonText && data.buttonLink && (
                            <a
                                href={data.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
                            >
                                {data.buttonText}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSponsorsSection = (section, data) => {
        if (data.showSection === false || !data.sponsors || data.sponsors.length === 0) {
            return null;
        }

        const groupSponsorsByTier = () => {
            if (!data.showTiers) return null;

            const grouped = {};
            data.sponsors.forEach(sponsor => {
                const tier = sponsor.tier || 'Other';
                if (!grouped[tier]) {
                    grouped[tier] = [];
                }
                grouped[tier].push(sponsor);
            });
            return grouped;
        };

        const groupedSponsors = groupSponsorsByTier();

        const tierColors = {
            'Platinum': 'text-purple-700 bg-purple-50 border-purple-200',
            'Gold': 'text-yellow-700 bg-yellow-50 border-yellow-200',
            'Silver': 'text-gray-600 bg-gray-50 border-gray-200',
            'Bronze': 'text-amber-700 bg-amber-50 border-amber-200',
            'Partner': 'text-blue-700 bg-blue-50 border-blue-200',
            'Community': 'text-green-700 bg-green-50 border-green-200',
            'Other': 'text-gray-600 bg-gray-50 border-gray-200'
        };

        const AutoScrollCarousel = ({ sponsorsList }) => {
            const [scrollPosition, setScrollPosition] = useState(0);
            const [isHovered, setIsHovered] = useState(false);
            const scrollRef = useRef(null);
            const animationRef = useRef(null);

            const duplicatedSponsors = [...sponsorsList, ...sponsorsList, ...sponsorsList];

            useEffect(() => {
                const scroll = () => {
                    if (!isHovered && scrollRef.current) {
                        setScrollPosition(prev => {
                            const newPosition = prev + 0.5;
                            const maxScroll = scrollRef.current.scrollWidth / 3;
                            return newPosition >= maxScroll ? 0 : newPosition;
                        });
                    }
                    animationRef.current = requestAnimationFrame(scroll);
                };

                animationRef.current = requestAnimationFrame(scroll);

                return () => {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                    }
                };
            }, [isHovered]);

            useEffect(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollLeft = scrollPosition;
                }
            }, [scrollPosition]);

            return (
                <div
                    className="relative w-full overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto"
                        style={{
                            scrollBehavior: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {duplicatedSponsors.map((sponsor, idx) => (
                            <div
                                key={`${sponsor.id || sponsor.name}-${idx}`}
                                className="flex flex-col items-center text-center flex-shrink-0 group min-w-[80px] md:min-w-[100px]"
                            >
                                <div className="relative w-full flex justify-center mb-2">
                                    {sponsor.logoUrl ? (
                                        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 p-2 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                                            <img
                                                src={sponsor.logoUrl}
                                                alt={sponsor.name || 'Sponsor'}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                                            <Building className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                {sponsor.name && (
                                    <span className="text-xs text-gray-600 font-medium truncate max-w-[80px] md:max-w-[100px] px-1">
                                        {sponsor.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
                </div>
            );
        };

        const StaticCarousel = ({ sponsorsList }) => {
            const [currentIndex, setCurrentIndex] = useState(0);
            const itemsPerView = sponsorsPerView;
            const totalSponsors = sponsorsList.length;
            const maxIndex = Math.max(0, totalSponsors - itemsPerView);

            const nextSlide = () => {
                setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
            };

            const prevSlide = () => {
                setCurrentIndex(prev => Math.max(prev - 1, 0));
            };

            const visibleSponsors = sponsorsList.slice(currentIndex, currentIndex + itemsPerView);

            return (
                <div className="relative">
                    {totalSponsors > itemsPerView && (
                        <>
                            <button
                                onClick={prevSlide}
                                disabled={currentIndex === 0}
                                className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-4 z-10 bg-white rounded-full shadow-md p-1 md:p-2 border border-gray-200 transition-all
                                    ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-lg'}`}
                            >
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={currentIndex >= maxIndex}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-4 z-10 bg-white rounded-full shadow-md p-1 md:p-2 border border-gray-200 transition-all
                                    ${currentIndex >= maxIndex ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-lg'}`}
                            >
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>
                        </>
                    )}

                    <div className="overflow-hidden px-2 md:px-4">
                        <div className="flex justify-center gap-4 md:gap-6 transition-all duration-300">
                            {visibleSponsors.map((sponsor, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center flex-shrink-0 group" style={{ width: `calc(100% / ${itemsPerView} - 1rem)` }}>
                                    <div className="relative w-full flex justify-center mb-2">
                                        {sponsor.logoUrl ? (
                                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 p-2 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                                                <img
                                                    src={sponsor.logoUrl}
                                                    alt={sponsor.name || 'Sponsor'}
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                                                <Building className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {sponsor.name && (
                                        <span className="text-xs text-gray-600 font-medium truncate max-w-[80px] md:max-w-[100px] px-1">
                                            {sponsor.name}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {totalSponsors > itemsPerView && (
                        <div className="flex justify-center gap-1 mt-3">
                            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${currentIndex === idx ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        };

        const renderSponsorsCarousel = (sponsorsList) => {
            const autoScrollThreshold = 8;
            const totalSponsors = sponsorsList.length;

            if (totalSponsors >= autoScrollThreshold) {
                return <AutoScrollCarousel sponsorsList={sponsorsList} />;
            } else {
                return <StaticCarousel sponsorsList={sponsorsList} />;
            }
        };

        return (
            <div key={`sponsors-${section.index}`} className="py-6 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl mb-6 overflow-visible shadow-sm">
                <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {data.title || 'Our Sponsors'}
                </h2>

                {data.showTiers && groupedSponsors ? (
                    <div className="space-y-8">
                        {Object.entries(groupedSponsors).map(([tier, sponsors]) => {
                            if (!sponsors || sponsors.length === 0) return null;

                            return (
                                <div key={tier} className="space-y-4">
                                    <div className="flex justify-center">
                                        <h3 className={`text-sm font-semibold px-4 py-1.5 rounded-full border ${tierColors[tier] || tierColors.Other}`}>
                                            {tier} Sponsors
                                        </h3>
                                    </div>
                                    {renderSponsorsCarousel(sponsors)}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    renderSponsorsCarousel(data.sponsors)
                )}
            </div>
        );
    };

    const renderRulesSection = (section, data) => {
        if (data.showSection === false || !data.rules || data.rules.length === 0) {
            return null;
        }

        return (
            <div key={`rules-${section.index}`} className="py-4 px-3 sm:px-4 bg-gray-50 rounded-2xl mb-4">
                <div className="w-full">
                    <h2 className="text-base font-semibold mb-4 break-words">
                        {data.title || 'Rules & Regulations'}
                    </h2>
                    <div className="space-y-3">
                        {data.rules.map((rule, index) => (
                            <div key={rule.id || index} className="flex items-start gap-2">
                                <span className="inline-block min-w-[20px] text-gray-600 text-sm mt-0.5">•</span>
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words whitespace-normal">
                                        {rule.text || `Rule ${index + 1}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderDescriptionSection = (section, data) => {
        if (data.showSection === false || !data.description) return null;

        return (
            <div key={`description-${section.index}`} className="py-4 px-3 sm:px-4 bg-gray-50 rounded-2xl mb-4">
                <div className="w-full">
                    <div className="text-sm text-gray-700 whitespace-normal break-words leading-relaxed">
                        {data.description}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
                    <p className="text-sm text-gray-600">Loading registration form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Error Loading Form</h2>
                    <p className="text-sm text-gray-600 mb-4 break-words">{error}</p>
                    <button
                        onClick={fetchFormData}
                        className="px-5 py-2 bg-blue-600 text-sm text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Registration Successful!</h2>
                    <p className="text-sm text-gray-600 break-words">
                        Thank you for registering. {formData?.paymentDetails?.paid === true && 'Payment has been processed successfully. '}
                        We'll contact you with further details.
                    </p>
                </div>
            </div>
        );
    }

    const allSections = renderFormSections();

    const logoSections = allSections.filter(s => s.type === 'FORM_LOGO');
    const headerSections = allSections.filter(s => s.type === 'FORM_HEADER');
    const bannerSections = allSections.filter(s => s.type === 'FORM_BANNER');
    const bottomSections = allSections.filter(s =>
        s.type === 'FORM_SPONSORS' || s.type === 'FORM_RULES' || s.type === 'FORM_DESCRIPTION'
    );

    const mainBanner = bannerSections.length > 0 ? bannerSections[0] : null;

    return (
        <div className="min-h-screen bg-gray-50 py-4 md:py-6 px-3 md:px-4">
            <div className="max-w-3xl mx-auto">
                {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-700 flex-1 break-words">{submitError}</p>
                            <button
                                onClick={() => setSubmitError(null)}
                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {mainBanner && renderBannerSection(mainBanner, parseSectionData(mainBanner.dataJson))}

                    <div className="p-4 md:p-6">
                        {logoSections.map((section, idx) => {
                            const data = parseSectionData(section.dataJson);
                            if (data.showLogo && data.logoUrl) {
                                const logoSizeClass = getLogoSizeClass(data.logoSize);
                                const alignmentClass = getHeaderAlignmentClass(data.alignment || data.logoAlignment);
                                return (
                                    <div key={`logo-${idx}`} className={`${alignmentClass} mb-4`}>
                                        <img
                                            src={data.logoUrl}
                                            alt="Event Logo"
                                            className={`${logoSizeClass} ${alignmentClass === 'text-left' ? 'ml-0 mr-auto' : alignmentClass === 'text-right' ? 'ml-auto mr-0' : 'mx-auto'} object-contain max-w-full`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {headerSections.map((section, idx) => {
                            const data = parseSectionData(section.dataJson);
                            const alignmentClass = getHeaderAlignmentClass(data.alignment);

                            return (
                                <div key={`header-${idx}`} className={`${alignmentClass} mb-6`}>
                                    {data.title && data.showTitle !== false && (
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                                            {data.title}
                                        </h1>
                                    )}

                                    {data.subtitle && data.showSubtitle !== false && (
                                        <p className="text-sm md:text-base text-gray-600 mt-1 break-words leading-relaxed">
                                            {data.subtitle}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="mt-6 md:mt-10">
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 break-words">Registration Details</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formData?.fields?.length || 0} fields to complete
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-3 md:space-y-4">
                                {formData?.fields && formData.fields.length > 0 ? (
                                    formData.fields
                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                        .map((field, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-md transition-colors overflow-hidden ${validationErrors[field.fieldKey] ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <label className={`block text-xs md:text-sm font-medium break-words ${field.required ? 'text-gray-800' : 'text-gray-700'}`}>
                                                        {field.label}
                                                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                                    </label>
                                                </div>
                                                <div>
                                                    {renderField(field)}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500">
                                        No registration fields configured
                                    </div>
                                )}
                            </div>
                        </form>

                        {bottomSections.map((section) => {
                            const data = parseSectionData(section.dataJson);

                            if (section.type === 'FORM_SPONSORS') {
                                return renderSponsorsSection(section, data);
                            }

                            if (section.type === 'FORM_RULES') {
                                return renderRulesSection(section, data);
                            }

                            if (section.type === 'FORM_DESCRIPTION') {
                                return renderDescriptionSection(section, data);
                            }

                            return null;
                        })}

                        <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-2 flex items-center gap-1">
                            <Shield className="w-4 h-4 flex-shrink-0" />
                            <span className="break-words">Privacy & Data Protection</span>
                        </h4>
                        <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                            <p className="break-words leading-relaxed">• Your information is securely stored and will only be used for event registration.</p>
                            <p className="break-words leading-relaxed">• We will never share your personal data with third parties without your consent.</p>
                            <div className="flex items-start gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="privacy-consent"
                                    required
                                    className="h-3.5 w-3.5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                />
                                <label htmlFor="privacy-consent" className="text-xs text-gray-700 break-words flex-1 leading-relaxed">
                                    I agree to the processing of my personal data in accordance with the privacy policy
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-xs text-gray-500 text-center sm:text-left break-words">
                                By submitting, you agree to our terms and conditions.
                            </p>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={submitting || paymentProcessing || Object.values(fileUploading).some(status => status) || !emailVerification.isVerified}
                                className={`px-4 md:px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 
                                    ${submitting || paymentProcessing || Object.values(fileUploading).some(status => status) || !emailVerification.isVerified
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white transition-colors shadow-sm w-full sm:w-auto`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : paymentProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to Payment...
                                    </>
                                ) : Object.values(fileUploading).some(status => status) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading files...
                                    </>
                                ) : formData?.paymentDetails?.paid === true && formData?.paymentDetails?.currency === 'INR' ? (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Pay ₹{formData.paymentDetails.amount} & Submit
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Registration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 mt-6">
                    <p className="break-words">© {new Date().getFullYear()} Planotech Group of Companies.</p>
                </footer>
            </div>

            {/* Payment Modal */}
{showPaymentModal && paymentDetails && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
                <button
                    onClick={handlePaymentClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6">
                <PaymentComponent
                    formId={formData?.formId}
                    entryId={paymentDetails.entryId}
                    amount={paymentDetails.amount}
                    currency={paymentDetails.currency}
                    userName={formValues.name || formValues.full_name || ''}
                    userEmail={formValues.email || formValues.email_address || ''}
                    userPhone={formValues.phone || formValues.phone_number || formValues.mobile || ''}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onClose={handlePaymentClose}
                />
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default PublicRegistrationForm;