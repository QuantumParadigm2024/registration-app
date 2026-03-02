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
    MessageSquare
} from 'lucide-react';

const PublicRegistrationForm = () => {
    const { eventKey } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [fileUploading, setFileUploading] = useState({}); // Track uploading state per file
    const [fileUploadErrors, setFileUploadErrors] = useState({}); // Track upload errors per file
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const fileInputRefs = useRef({});

    // Fetch form data when component mounts
    useEffect(() => {
        fetchFormData();
    }, [eventKey]);

    const fetchFormData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(
                `/public/events/${eventKey}/form`
            );

            console.log('Form data received:', response.data);

            // Normalize field types - convert "FILE" to "FILE_UPLOAD"
            if (response.data?.fields) {
                response.data.fields = response.data.fields.map(field => {
                    // Convert "FILE" to "FILE_UPLOAD" for consistency
                    if (field.fieldType === 'FILE') {
                        return {
                            ...field,
                            fieldType: 'FILE_UPLOAD'
                        };
                    }
                    return field;
                });
            }

            if (response.data) {
                setFormData(response.data);

                // Initialize form values based on field type
                const initialValues = {};
                const initialFilePreviews = {};

                if (response.data.fields && Array.isArray(response.data.fields)) {
                    response.data.fields.forEach(field => {
                        if (field.fieldType === 'CHECKBOX') {
                            initialValues[field.fieldKey] = [];
                        } else if (field.fieldType === 'FILE_UPLOAD') {
                            initialValues[field.fieldKey] = null; // Will store the URL after upload
                            initialFilePreviews[field.fieldKey] = null;
                        } else {
                            initialValues[field.fieldKey] = '';
                        }
                    });
                }

                setFormValues(initialValues);
                setFilePreviews(initialFilePreviews);
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

    // Parse section data
    const parseSectionData = (dataJson) => {
        try {
            return JSON.parse(dataJson);
        } catch (e) {
            console.error('Error parsing section data:', e);
            return {};
        }
    };

    // Handle form input changes
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
    };

    // Handle checkbox changes
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

    // Upload file to server and get URL
    const uploadFileToServer = async (fieldKey, file) => {
        try {
            // Set uploading state
            setFileUploading(prev => ({ ...prev, [fieldKey]: true }));
            setFileUploadErrors(prev => ({ ...prev, [fieldKey]: null }));

            const formData = new FormData();
            formData.append('file', file);

            // Get token from localStorage or your auth context
            const token = localStorage.getItem('token'); // Adjust this based on where you store the token

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
                // Store the URL in formValues
                setFormValues(prev => ({
                    ...prev,
                    [fieldKey]: response.data.url
                }));

                // Create preview for images
                const previewUrl = URL.createObjectURL(file);
                setFilePreviews(prev => ({
                    ...prev,
                    [fieldKey]: previewUrl
                }));

                // Clear any validation error for this field
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
            
            // Clear the file input
            if (fileInputRefs.current[fieldKey]) {
                fileInputRefs.current[fieldKey].value = '';
            }
            
            throw err;
        } finally {
            setFileUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    // Handle file selection
    const handleFileSelect = async (fieldKey, file) => {
        if (!file) return;

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setValidationErrors(prev => ({
                ...prev,
                [fieldKey]: 'File size must be less than 10MB'
            }));
            return;
        }

        try {
            // Upload immediately after selection
            await uploadFileToServer(fieldKey, file);
        } catch (error) {
            // Error is already handled in uploadFileToServer
            console.error('File upload failed:', error);
        }
    };

    // Remove uploaded file
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

    // Validate field
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
                    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
                    const cleanedPhone = value.toString().replace(/[\s\-()]/g, '');
                    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
                        return 'Please enter a valid phone number (at least 10 digits)';
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

    // Validate form
    const validateForm = () => {
        if (!formData?.fields) return false;

        const errors = {};
        let isValid = true;

        formData.fields.forEach(field => {
            const value = formValues[field.fieldKey];
            const error = validateField(field, value);

            if (error) {
                errors[field.fieldKey] = error;
                isValid = false;
            }
        });

        // Check if any files are currently uploading
        const anyFileUploading = Object.values(fileUploading).some(status => status === true);
        if (anyFileUploading) {
            setSubmitError('Please wait for files to finish uploading');
            return false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Handle form submission
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

            // Create responses object
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

            // Prepare submission data
            const submissionData = {
                name: responses.name || responses.full_name || responses.first_name || '',
                email: responses.email || responses.email_address || '',
                phone: responses.phone || responses.phone_number || responses.mobile || '',
                responses: responses
            };

            // Submit the registration with file URLs
            const response = await axiosInstance.post(
                `/public/events/${eventKey}/register`,
                submissionData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.status === 'success' || response.data?.success) {
                setSubmitted(true);
                setFormValues({});
                setFilePreviews({});
                setValidationErrors({});
                setFileUploadErrors({});
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
        } finally {
            setSubmitting(false);
        }
    };

    // Parse options safely
    const parseOptions = (field) => {
        let options = [];

        try {
            if (!field.optionsJson) {
                return options;
            }

            // Case 1: Already an array
            if (Array.isArray(field.optionsJson)) {
                options = field.optionsJson;
            }
            // Case 2: String that needs parsing
            else if (typeof field.optionsJson === 'string') {
                // Try to parse as JSON first
                if (field.optionsJson.trim().startsWith('[') || field.optionsJson.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(field.optionsJson);
                        if (Array.isArray(parsed)) {
                            options = parsed;
                        } else if (parsed.options && Array.isArray(parsed.options)) {
                            options = parsed.options;
                        } else if (typeof parsed === 'object') {
                            // Convert object to array of values
                            options = Object.values(parsed);
                        }
                    } catch (jsonError) {
                        // Not valid JSON, try comma-separated
                        if (field.optionsJson.includes(',')) {
                            options = field.optionsJson.split(',').map(s => s.trim()).filter(s => s);
                        } else {
                            // Single value
                            options = [field.optionsJson.trim()];
                        }
                    }
                } else {
                    // Not JSON format, treat as comma-separated or single value
                    if (field.optionsJson.includes(',')) {
                        options = field.optionsJson.split(',').map(s => s.trim()).filter(s => s);
                    } else {
                        options = [field.optionsJson.trim()];
                    }
                }
            }
            // Case 3: Object with options property
            else if (field.optionsJson.options && Array.isArray(field.optionsJson.options)) {
                options = field.optionsJson.options;
            }
            // Case 4: Plain object
            else if (typeof field.optionsJson === 'object' && field.optionsJson !== null) {
                options = Object.values(field.optionsJson);
            }
        } catch (e) {
            console.error('Error parsing options for field:', field.fieldKey, e);

            // Ultimate fallback: if it's a string, try to split by common delimiters
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

        // Filter out empty options
        options = options.filter(opt => opt && opt.toString().trim() !== '');

        return options;
    };

    // Render field based on type
    const renderField = (field) => {
        const value = formValues[field.fieldKey] || '';
        const error = validationErrors[field.fieldKey];
        const uploadError = fileUploadErrors[field.fieldKey];
        const isUploading = fileUploading[field.fieldKey];
        const options = parseOptions(field);
        const filePreview = filePreviews[field.fieldKey];

        const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`;

        const getPlaceholder = () => {
            switch (field.fieldType) {
                case 'SHORT_ANSWER': return `Enter ${field.label.toLowerCase()}`;
                case 'EMAIL': return 'you@example.com';
                case 'PHONE': return '+1 (555) 123-4567';
                case 'NUMBER': return 'Enter a number';
                case 'DATE': return 'dd-mm-yyyy';
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

        // ============ FILE UPLOAD ============
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
                        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                    )}
                    {error && !uploadError && (
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    )}
                </div>
            );
        }

        // ============ RADIO / MULTIPLE CHOICE ============
        if (field.fieldType === 'RADIO' || field.fieldType === 'MULTIPLE_CHOICE') {
            if (!options || options.length === 0) {
                return (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                            No options configured for this {field.fieldType === 'RADIO' ? 'Multiple Choice' : 'multiple choice'} field.
                        </p>
                    </div>
                );
            }

            return (
                <div className="space-y-1">
                    <div className="space-y-1">
                        {options.map((option, idx) => (
                            <div key={idx} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`${field.fieldKey}-${idx}`}
                                    name={field.fieldKey}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    required={field.required}
                                />
                                <label
                                    htmlFor={`${field.fieldKey}-${idx}`}
                                    className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
            );
        }

        // ============ CHECKBOXES ============
        if (field.fieldType === 'CHECKBOX') {
            if (!options || options.length === 0) {
                return (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                            No options configured for this checkbox field.
                        </p>
                    </div>
                );
            }

            const selectedValues = Array.isArray(value) ? value : [];

            return (
                <div className="space-y-1">
                    <div className="space-y-1">
                        {options.map((option, idx) => (
                            <div key={idx} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${field.fieldKey}-${idx}`}
                                    checked={selectedValues.includes(option)}
                                    onChange={(e) => handleCheckboxChange(field.fieldKey, option, e.target.checked)}
                                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={`${field.fieldKey}-${idx}`}
                                    className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                    {selectedValues.length > 0 && (
                        <p className="text-xs text-gray-500">
                            Selected: {selectedValues.join(', ')}
                        </p>
                    )}
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
            );
        }

        // ============ DROPDOWN ============
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
                    {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
                </div>
            );
        }

        // ============ PARAGRAPH / TEXTAREA ============
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
                    {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
                </div>
            );
        }

        // ============ SHORT ANSWER & OTHER TEXT INPUTS ============
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
                {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
            </div>
        );
    };

    // Dynamically render form sections from API
    const renderFormSections = () => {
        if (!formData?.sections) return null;

        return formData.sections
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((section, index) => {
                const data = parseSectionData(section.dataJson);

                switch (section.type) {
                    case 'FORM_HEADER':
                        return (
                            <div key={index} className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {data.title || 'Event Registration'}
                                </h1>
                            </div>
                        );

                    case 'FORM_LOGO':
                        if (data.showLogo && data.logoUrl) {
                            return (
                                <div key={index} className="text-center mb-4">
                                    <img
                                        src={data.logoUrl}
                                        alt="Event Logo"
                                        className="h-16 mx-auto"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            );
                        }
                        return null;

                    case 'FORM_DESCRIPTION':
                        if (data.showSection && data.html) {
                            return (
                                <div key={index} className="mb-6 text-center">
                                    <div className="h-px bg-gray-200 w-full mb-4"></div>
                                    <div
                                        className="prose prose-sm max-w-none mx-auto"
                                        dangerouslySetInnerHTML={{ __html: data.html }}
                                    />
                                    <div className="h-px bg-gray-200 w-full mt-4"></div>
                                </div>
                            );
                        }
                        return null;

                    case 'FORM_MAIL':
                        return (
                            <div key={index} className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                                    Contact & Support
                                </h3>
                                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                    <div className="space-y-4">
                                        {data.showEventDescription && data.eventDescription && (
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{data.eventDescription}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.showAdvisor && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Advisor:</p>
                                                    <div className="h-8 border border-gray-300 rounded px-2 flex items-center text-sm">
                                                        {formValues.advisor || '[ ]'}
                                                    </div>
                                                </div>
                                            )}

                                            {data.showAccount && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Account:</p>
                                                    <div className="h-8 border border-gray-300 rounded px-2 flex items-center text-sm">
                                                        {formValues.account || '[ ]'}
                                                    </div>
                                                </div>
                                            )}

                                            {data.showSupportEmail && data.supportEmail && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Email Support:</p>
                                                    <a
                                                        href={`mailto:${data.supportEmail}`}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {data.supportEmail}
                                                    </a>
                                                </div>
                                            )}

                                            {data.showSupportPhone && data.supportPhone && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Phone Support:</p>
                                                    <a
                                                        href={`tel:${data.supportPhone.replace(/\D/g, '')}`}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {data.supportPhone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                    default:
                        return null;
                }
            });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
                    <p className="text-sm text-gray-600">Loading registration form...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Error Loading Form</h2>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
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

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Registration Successful!</h2>
                    <p className="text-sm text-gray-600">
                        Thank you for registering. We'll contact you with further details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Error message */}
                {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-1.5" />
                            <p className="text-xs text-red-700">{submitError}</p>
                            <button
                                onClick={() => setSubmitError(null)}
                                className="ml-auto text-red-500 hover:text-red-700"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Registration Form - Dynamically rendered from API fields */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-2">
                    {renderFormSections()}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-800">Registration Details</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {formData?.fields?.length || 0} fields to complete
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            {formData?.fields && formData.fields.length > 0 ? (
                                formData.fields
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((field, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-md transition-colors ${validationErrors[field.fieldKey] ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <label className={`block text-xs font-medium ${field.required ? 'text-gray-800' : 'text-gray-700'}`}>
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                                </label>
                                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                                                    {field.fieldType === 'RADIO' ? 'Multiple Choice' : 
                                                     field.fieldType === 'FILE_UPLOAD' ? 'File Upload' : 
                                                     field.fieldType.toLowerCase().replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            {renderField(field)}
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-6 text-xs text-gray-500">
                                    No registration fields configured
                                </div>
                            )}
                        </div>

                        {/* Privacy Section */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                <Shield className="w-4 h-4 mr-1" />
                                Privacy & Data Protection
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                                <p>• Your information is securely stored and will only be used for event registration.</p>
                                <p>• We will never share your personal data with third parties without your consent.</p>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="privacy-consent"
                                        required
                                        className="h-3.5 w-3.5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="privacy-consent" className="ml-1.5 text-xs text-gray-700">
                                        I agree to the processing of my personal data in accordance with the privacy policy
                                    </label>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    By submitting, you agree to our terms and conditions.
                                </p>

                                <button
                                    type="submit"
                                    disabled={submitting || Object.values(fileUploading).some(status => status)}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 
                                        ${submitting || Object.values(fileUploading).some(status => status)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white transition-colors shadow-sm`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : Object.values(fileUploading).some(status => status) ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading files...
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
                        <footer className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 mt-6">
                            <p>© {new Date().getFullYear()} Planotech Group of Companies.</p>
                        </footer>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PublicRegistrationForm;