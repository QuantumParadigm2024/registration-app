import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChevronLeft,
    FileText,
    Plus,
    Trash2,
    Save,
    Type,
    Hash,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    ChevronDown,
    Radio,
    CheckSquare,
    Text,
    File,
    ChevronRight,
    X,
    Eye,
    EyeOff,
    Grid,
    Image,
    Building,
    Palette,
    Layout,
    Upload,
    Loader,
    DollarSign,
    CreditCard,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    QrCode
} from 'lucide-react';
import axiosInstance from '../../../helper/AxiosInstance';
import EmailTemplateEditor from './EmailTemplateEditor';

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

// Form Builder Class (updated to handle form type)
class FormBuilderClass {
    constructor(eventId, formData = null, formType = null) {
        this.eventId = eventId;
        this.formId = formData?.formId || null;
        this.version = formData?.version || 1;
        this.status = formData?.status || 'DRAFT';
        this.active = formData?.active || true;
        this.eventKey = formData?.eventKey || '';
        this.formType = formData?.formType || formType || 'Delegate';

        // Initialize fields with ALL fields from API
        this.fields = this.getAllFieldsFromApi(formData?.fields || []);

        // If no fields from API, use default name and email fields
        if (this.fields.length === 0) {
            this.fields = this.getDefaultFields();
        }

        // Initialize form sections
        this.formSections = this.getDefaultFormSections();

        // If we have existing form sections from API, use them
        if (formData?.formSections && Array.isArray(formData.formSections)) {
            this.formSections = this.parseFormSections(formData.formSections);
        }
    }

    // Generate a truly unique ID
    generateUniqueId(prefix = 'field') {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const unique = `${timestamp}_${randomStr}`;
        return `${prefix}_${unique}`;
    }

    parseFormSections(apiSections) {
    if (!apiSections || !Array.isArray(apiSections)) {
        return this.getDefaultFormSections();
    }

    return apiSections.map(section => {
        let sectionData = {};
        
        try {
            // Parse the dataJson string from API
            if (section.dataJson) {
                sectionData = JSON.parse(section.dataJson);
            }
        } catch (e) {
            console.error('Error parsing section dataJson for type:', section.type, e);
            sectionData = {};
        }

        // Find default section for fallback values
        const defaultSection = this.getDefaultFormSections().find(s => s.type === section.type);
        
        return {
            type: section.type,
            displayOrder: section.displayOrder || defaultSection?.displayOrder || 1,
            data: sectionData,
            dataJson: section.dataJson || JSON.stringify(sectionData),
            required: defaultSection?.required || false
        };
    }).sort((a, b) => a.displayOrder - b.displayOrder);
}

   getDefaultFormSections() {
    const sections = [
        {
            type: 'FORM_HEADER',
            displayOrder: 1,
            data: {
                title: '',
                subtitle: '',
                showTitle: true,
                showSubtitle: true,
                titleColor: '#000000',
                subtitleColor: '#666666',
                backgroundColor: '#FFFFFF',
                alignment: 'center'
            },
            required: false
        },
        {
            type: 'FORM_LOGO',
            displayOrder: 2,
            data: {
                logoUrl: '',
                showLogo: true,
                logoSize: 'medium',
                logoAlignment: 'center',
                customLogo: false
            },
            required: false
        },
        {
            type: 'FORM_BANNER',
            displayOrder: 3,
            data: {
                bannerUrl: '',
                showBanner: true,
                bannerSize: 'full',
                bannerHeight: '300px',
                bannerAlignment: 'center',
                overlayColor: 'rgba(0,0,0,0.3)',
                showOverlay: false,
                title: '',
                titleColor: '#FFFFFF',
                subtitle: '',
                subtitleColor: '#FFFFFF',
                buttonText: '',
                buttonLink: '',
                buttonBgColor: '#FFFFFF',
                buttonTextColor: '#7C3AED',
                buttonBorderRadius: 'rounded-lg',
                customCss: ''
            },
            required: false
        },
        {
            type: 'FORM_SPONSORS',
            displayOrder: 4,
            data: {
                sponsors: [],
                showSection: true,
                title: 'Our Sponsors',
                layout: 'grid',
                columns: 3,
                showTiers: false,
                tiers: []
            },
            required: false
        },
        {
            type: 'FORM_RULES',
            displayOrder: 5,
            data: {
                showSection: true,
                title: 'Rules & Regulations',
                rules: [],
                backgroundColor: '#F9FAFB',
                textColor: '#374151',
                bulletColor: '#DC2626',
                showBullets: true
            },
            required: false
        },
        {
            type: 'FORM_DESCRIPTION',
            displayOrder: 6,
            data: {
                description: '',
                showSection: true,
                backgroundColor: '#F9FAFB'
            },
            required: false
        }
    ];

    // Return sections with dataJson property
    return sections.map(section => ({
        ...section,
        dataJson: JSON.stringify(section.data)
    }));
}

    getAllFieldsFromApi(apiFields) {
        if (!apiFields || !Array.isArray(apiFields) || apiFields.length === 0) {
            return [];
        }

        return apiFields
            .map((field, index) => this.transformApiField(field, index + 1))
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    transformApiField(field, displayOrder) {
        const typeMapping = {
            'TEXT': 'text',
            'TEXTAREA': 'textarea',
            'EMAIL': 'email',
            'PHONE': 'phone',
            'NUMBER': 'number',
            'DATE': 'date',
            'SELECT': 'select',
            'DROPDOWN': 'select',
            'RADIO': 'radio',
            'CHECKBOX': 'checkbox',
            'FILE': 'file'
        };

        let id;

        if (field.formFieldId) {
            id = `field_db_${field.formFieldId}_${Date.now()}`;
        } else if (field.fieldKey) {
            id = `field_${field.fieldKey}_${this.generateUniqueId()}`;
        } else {
            const baseString = field.label || 'field';
            id = this.generateUniqueId(baseString.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        }

        return {
            id: id,
            formFieldId: field.formFieldId || null,
            type: typeMapping[field.fieldType] || field.fieldType?.toLowerCase() || 'text',
            label: field.label || '',
            placeholder: field.placeholder || '',
            required: field.required || false,
            options: field.optionsJson ? JSON.parse(field.optionsJson) : [],
            displayOrder: field.displayOrder || displayOrder,
            fieldKey: field.fieldKey
        };
    }

    clone() {
        const clone = new FormBuilderClass(this.eventId);
        clone.formId = this.formId;
        clone.version = this.version;
        clone.status = this.status;
        clone.active = this.active;
        clone.eventKey = this.eventKey;
        clone.formType = this.formType;
        clone.fields = this.fields.map(field => ({ ...field }));
        clone.formSections = this.formSections.map(section => ({
            ...section,
            data: { ...section.data },
            dataJson: section.dataJson
        }));
        return clone;
    }

    generateFieldKey(label) {
        return label.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_+|_+$)/g, '')
            .substring(0, 50);
    }

    getDefaultFields() {
        return [
            {
                id: 'field_name_default',
                type: 'text',
                label: 'Name',
                placeholder: 'Enter your full name',
                required: true,
                options: [],
                displayOrder: 1,
                fieldKey: 'name',
                formFieldId: null
            },
            {
                id: 'field_email_default',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email address',
                required: true,
                options: [],
                displayOrder: 2,
                fieldKey: 'email',
                formFieldId: null
            }
        ];
    }

    addField(fieldType, config = {}) {
        const defaultConfigs = {
            'text': { label: 'Short Answer', required: false, placeholder: 'Enter text' },
            'textarea': { label: 'Paragraph', required: false, placeholder: 'Enter long text' },
            'email': { label: 'Email', required: false, placeholder: 'email@example.com' },
            'phone': { label: 'Phone Number', required: false, placeholder: '+91 ' },
            'number': { label: 'Number', required: false, placeholder: 'Enter a number' },
            'date': { label: 'Date', required: false, placeholder: '' },
            'select': { label: 'Select', required: false, options: ["Option 1", "Option 2"], placeholder: 'Choose an option' },
            'radio': { label: 'Multiple Choice', required: false, options: ["Option 1", "Option 2"], placeholder: '' },
            'checkbox': { label: 'Checkboxes', required: false, options: ["Option 1", "Option 2"], placeholder: '' },
            'file': { label: 'File Upload', required: false, placeholder: 'Choose file' }
        };

        const fieldConfig = defaultConfigs[fieldType] || { label: 'Question', required: false, placeholder: '' };

        if (fieldType === 'text' && config.label?.toLowerCase().includes('name')) {
            const existingNameField = this.fields.find(f =>
                f.label.toLowerCase().includes('name') && f.type === 'text'
            );
            if (existingNameField) {
                throw new Error('A name field already exists');
            }
        } else if (fieldType === 'email') {
            const existingEmailField = this.fields.find(f => f.type === 'email');
            if (existingEmailField) {
                throw new Error('An email field already exists');
            }
        }

        const fieldKey = this.generateFieldKey(config.label || fieldConfig.label);
        const uniqueId = `new_${fieldKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newField = {
            id: uniqueId,
            type: fieldType,
            label: config.label || fieldConfig.label,
            placeholder: config.placeholder || fieldConfig.placeholder,
            required: config.required || fieldConfig.required,
            options: [...(config.options || fieldConfig.options || [])],
            displayOrder: this.fields.length + 1,
            fieldKey: fieldKey,
            formFieldId: null
        };

        this.fields.push(newField);
        return newField;
    }

    removeField(fieldId) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];

        if ((field.label.toLowerCase().includes('name') && field.type === 'text' && field.required) ||
            (field.type === 'email' && field.required)) {
            throw new Error('Required Name and Email fields cannot be removed');
        }

        this.fields.splice(fieldIndex, 1);

        this.fields.forEach((field, index) => {
            field.displayOrder = index + 1;
        });

        return true;
    }

    updateField(fieldId, property, value) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];

        if ((field.fieldKey === 'name' && field.required) ||
            (field.fieldKey === 'email' && field.required)) {
            if (property === 'type') {
                throw new Error('Required Name and Email field types cannot be changed');
            }
            if (property === 'label') {
                if ((field.fieldKey === 'name' && !value.toLowerCase().includes('name')) ||
                    (field.fieldKey === 'email' && !value.toLowerCase().includes('email'))) {
                    throw new Error('Required Name and Email field labels must contain "name" or "email"');
                }
            }
            if (property === 'required' && value === false) {
                throw new Error('Required Name and Email fields cannot be made optional');
            }
        }

        this.fields[fieldIndex][property] = value;

        if (property === 'label' && field.fieldKey !== 'name' && field.fieldKey !== 'email') {
            this.fields[fieldIndex].fieldKey = this.generateFieldKey(value);
        }

        return true;
    }

    reorderFields(fromIndex, toIndex) {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
            fromIndex >= this.fields.length || toIndex >= this.fields.length) return false;

        const [movedField] = this.fields.splice(fromIndex, 1);
        this.fields.splice(toIndex, 0, movedField);

        this.fields.forEach((field, index) => {
            field.displayOrder = index + 1;
        });

        return true;
    }

    addOption(fieldId) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];
        if (!['select', 'radio', 'checkbox'].includes(field.type)) return false;

        if (!field.options) {
            field.options = [];
        }

        const optionNumber = field.options.length + 1;
        field.options.push(`Option ${optionNumber}`);
        return true;
    }

    updateOption(fieldId, optionIndex, value) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];
        if (!field.options || optionIndex >= field.options.length) return false;

        field.options[optionIndex] = value;
        return true;
    }

    removeOption(fieldId, optionIndex) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];
        if (!field.options || optionIndex >= field.options.length) return false;

        field.options.splice(optionIndex, 1);
        return true;
    }

    updateFormSection(sectionType, property, value) {
        const sectionIndex = this.formSections.findIndex(s => s.type === sectionType);
        if (sectionIndex === -1) return false;

        this.formSections[sectionIndex].data[property] = value;

        const updatedData = { ...this.formSections[sectionIndex].data };
        this.formSections[sectionIndex].dataJson = JSON.stringify(updatedData);

        return true;
    }

    validate() {
        const errors = {};

        const hasNameField = this.fields.some(field =>
            (field.label.toLowerCase().includes('name') && field.type === 'text') ||
            field.fieldKey === 'name'
        );

        const hasEmailField = this.fields.some(field =>
            field.type === 'email' || field.fieldKey === 'email'
        );

        if (!hasNameField) {
            errors.fields = 'Form must include at least one Name field';
        }
        if (!hasEmailField) {
            errors.fields = errors.fields
                ? errors.fields + ' and at least one Email field'
                : 'Form must include at least one Email field';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    validateFormSections() {
        const errors = {};
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    toApiFormat() {
        const typeMappingReverse = {
            'text': 'TEXT',
            'textarea': 'TEXTAREA',
            'email': 'EMAIL',
            'phone': 'PHONE',
            'number': 'NUMBER',
            'date': 'DATE',
            'select': 'DROPDOWN',
            'radio': 'RADIO',
            'checkbox': 'CHECKBOX',
            'file': 'FILE'
        };

        const fieldsData = this.fields.map(field => {
            const isNameOrEmailWithId = (field.fieldKey === 'name' || field.fieldKey === 'email') &&
                field.formFieldId &&
                !isNaN(field.formFieldId);

            const fieldObj = {
                fieldKey: field.fieldKey,
                fieldType: typeMappingReverse[field.type] || 'TEXT',
                label: field.label,
                required: field.required,
                displayOrder: field.displayOrder,
                optionsJson: field.options && field.options.length > 0
                    ? JSON.stringify(field.options)
                    : null
            };

            if (isNameOrEmailWithId) {
                fieldObj.formFieldId = parseInt(field.formFieldId);
            }

            return fieldObj;
        });

        const sectionsData = this.formSections.map(section => {
            let dataJson = section.dataJson;

            if (!dataJson || typeof dataJson !== 'string') {
                dataJson = JSON.stringify(section.data || {});
            }

            try {
                const parsedData = JSON.parse(dataJson);
                dataJson = JSON.stringify(parsedData);
            } catch (e) {
                dataJson = JSON.stringify({});
            }

            return {
                type: section.type,
                displayOrder: section.displayOrder,
                dataJson: dataJson
            };
        });

        return {
            fields: fieldsData,
            formSections: sectionsData,
            formType: this.formType
        };
    }
}

// AutoSaveHook
const useAutoSave = (formBuilder, publishStep, delay = 2000) => {
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const timeoutRef = useRef(null);
    const previousStateRef = useRef(null);

    const getCurrentState = () => {
        if (!formBuilder) return null;
        return {
            fields: JSON.stringify(formBuilder.fields),
            sections: JSON.stringify(formBuilder.formSections),
            step: publishStep
        };
    };

    const saveChanges = useCallback(async () => {
        if (!formBuilder || !formBuilder.formId) {
            console.log('Cannot auto-save: No form builder or form ID');
            return;
        }

        const currentState = getCurrentState();
        if (previousStateRef.current === currentState) {
            console.log('No changes to save');
            return;
        }

        setIsAutoSaving(true);

        try {
            const formData = formBuilder.toApiFormat();

            const sectionsPayload = formBuilder.formSections.map(section => {
                let dataJson = section.dataJson;
                if (dataJson && typeof dataJson === 'object') {
                    dataJson = JSON.stringify(dataJson);
                }
                return {
                    type: section.type,
                    displayOrder: section.displayOrder || 0,
                    dataJson: dataJson
                };
            });

            await axiosInstance.put(
                `/forms/${formBuilder.formId}/sections`,
                sectionsPayload
            );

            const fieldsPayload = formData.fields;
            await axiosInstance.put(
                `/form/${formBuilder.formId}/draft`,
                fieldsPayload
            );

            previousStateRef.current = currentState;
            setLastSaved(new Date());
            console.log('Auto-save successful at:', new Date().toLocaleTimeString());

        } catch (err) {
            console.error('Auto-save failed:', err);
        } finally {
            setIsAutoSaving(false);
        }
    }, [formBuilder, publishStep]);

    const triggerAutoSave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            saveChanges();
        }, delay);
    }, [saveChanges, delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        triggerAutoSave,
        isAutoSaving,
        lastSaved,
        saveNow: saveChanges
    };
};

// Payment Configuration Component
// Fix the PaymentConfiguration component - remove the misplaced useEffect
const PaymentConfiguration = ({ formId, onPaymentSaved, notification }) => {
    const [isPayment, setIsPayment] = useState(false);
    const [amount, setAmount] = useState('');
    const [paymentDeadline, setPaymentDeadline] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const { success, error } = notification;

    useEffect(() => {
        if (formId) {
            fetchPaymentDetails();
        }
    }, [formId]);

    // REMOVE THIS MISPLACED useEffect - it doesn't belong here
    // This useEffect was incorrectly copied from FormBuilder component
    /*
    useEffect(() => {
        if (initialFormData && initialFormData.formId) {
            // ... this code doesn't belong in PaymentConfiguration
        }
    }, [eventId, initialFormData]);
    */

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/payment/${formId}`);

            if (response.data?.status === 'success' && response.data?.data) {
                const paymentData = response.data.data;
                setIsPayment(paymentData.paid || false);
                setAmount(paymentData.amount?.toString() || '');
                setPaymentDeadline(paymentData.paymentDeadline || '');
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setIsPayment(false);
                setAmount('');
                setPaymentDeadline('');
            } else {
                console.error('Error fetching payment details:', err);
                error('Failed to load payment configuration');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (isPayment) {
            if (!amount || parseFloat(amount) <= 0) {
                newErrors.amount = 'Please enter a valid amount greater than 0';
            }
            if (!paymentDeadline) {
                newErrors.paymentDeadline = 'Please select a payment deadline';
            } else {
                const today = new Date().toISOString().split('T')[0];
                if (paymentDeadline < today) {
                    newErrors.paymentDeadline = 'Payment deadline cannot be in the past';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   // In PaymentConfiguration component, update the handleSavePayment function
const handleSavePayment = async () => {
    if (!validateForm()) {
        error('Please fix the validation errors');
        return;
    }

    try {
        setSaving(true);

        if (!isPayment) {
            onPaymentSaved?.({ paid: false });
            success('Payment configuration saved (Free form)');
            return;
        }

        const payload = {
            paid: isPayment,
            amount: parseFloat(amount),
            currency: 'INR',
            paymentDeadline: paymentDeadline
        };

        const response = await axiosInstance.post(`/payment/create/${formId}`, payload);

        if (response.data?.status === 'success') {
            // Just save, don't trigger any navigation
            success('Payment configuration saved successfully!');
            onPaymentSaved?.(payload);
            // Don't call any publish function here
        } else {
            throw new Error(response.data?.message || 'Failed to save payment configuration');
        }
    } catch (err) {
        console.error('Error saving payment:', err);
        error(err.response?.data?.message || 'Failed to save payment configuration');
    } finally {
        setSaving(false);
    }
};

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Loading payment configuration...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Payment Configuration</h3>
            </div>

            <div className="space-y-6">
                {/* Payment Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <p className="font-medium text-gray-800">Is this a paid form?</p>
                        <p className="text-sm text-gray-500">Toggle on if you want to charge attendees for registration</p>
                    </div>
                    <button
                        onClick={() => setIsPayment(!isPayment)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isPayment ? 'bg-purple-600' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPayment ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>

                {isPayment && (
                    <div className="space-y-4 pl-4 border-l-4 border-purple-200">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (INR) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        if (errors.amount) setErrors({ ...errors, amount: null });
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                            )}
                        </div>

                        {/* Currency Display */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <div className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                                INR (Indian Rupee) - ₹
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Payments will be processed in Indian Rupees (INR)
                            </p>
                        </div>

                        {/* Payment Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Deadline <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={paymentDeadline}
                                onChange={(e) => {
                                    setPaymentDeadline(e.target.value);
                                    if (errors.paymentDeadline) setErrors({ ...errors, paymentDeadline: null });
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.paymentDeadline ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.paymentDeadline && (
                                <p className="text-xs text-red-500 mt-1">{errors.paymentDeadline}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Attendees must complete payment by this date
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-700">
                                    <p className="font-medium mb-1">Payment Information:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        <li>All payments are processed in Indian Rupees (INR)</li>
                                        <li>Attendees will be redirected to payment gateway after form submission</li>
                                        <li>Registration is confirmed only after successful payment</li>
                                        <li>Payment must be completed by the deadline</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!isPayment && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700">This form will be free for attendees. No payment collection required.</p>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSavePayment}
                        disabled={saving}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Payment Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Inline Email Template Editor Component (no popup)
const EmailTemplateEditorInline = ({ eventId, eventName, notification, onSaveComplete }) => {
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
    const [descriptionCharCount, setDescriptionCharCount] = useState(0);
    const { success, error } = notification;

    // Fetch email template on mount
    useEffect(() => {
        fetchEmailTemplate();
    }, [eventId]);

    const fetchEmailTemplate = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/events/${eventId}/email-template`);
            
            if (response.data) {
                setTemplateData(response.data);
                setDescriptionCharCount(response.data.eventDescription?.length || 0);
                
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
        
        return regex.test(cleanNumber);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!templateData.eventName || templateData.eventName.trim() === '') {
            errors.eventName = 'Event name is required';
        }
        
        if (templateData.supportEmail && templateData.supportEmail.trim() !== '') {
            if (!validateEmail(templateData.supportEmail)) {
                errors.supportEmail = 'Please enter a valid email address';
            }
        }
        
        if (phoneNumber && phoneNumber.trim() !== '') {
            if (!validatePhoneNumber(selectedCountryCode.code, phoneNumber)) {
                errors.supportPhone = `Please enter a valid ${selectedCountryCode.country} phone number`;
            }
        }
        
        if (templateData.eventWebsite && templateData.eventWebsite.trim() !== '') {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            if (!urlRegex.test(templateData.eventWebsite)) {
                errors.eventWebsite = 'Please enter a valid URL';
            }
        }
        
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
        
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handlePhoneChange = (number) => {
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
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            error('Please upload a valid image file');
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
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            let imageUrl = response.data?.url || response.data?.data?.url;
            if (imageUrl) {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Loading email template...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Edit Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-t-lg">
                    <div className="flex items-center gap-2 text-white">
                        <Mail size={16} />
                        <h3 className="font-semibold text-sm">Email Template Configuration</h3>
                    </div>
                </div>

                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    {/* Event Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Event Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={templateData.eventName || ''}
                            onChange={(e) => handleInputChange('eventName', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 ${validationErrors.eventName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter event name"
                        />
                        {validationErrors.eventName && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.eventName}</p>
                        )}
                    </div>

                    {/* Event Logo */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event Logo</label>
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
                            <label className="cursor-pointer">
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
                                <div className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
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

                    {/* Event Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event Description</label>
                        <textarea
                            value={templateData.eventDescription || ''}
                            onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                            rows="4"
                            maxLength={2000}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter event description..."
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] text-gray-500">Supports line breaks</p>
                            <p className={`text-[10px] ${descriptionCharCount > 1900 ? 'text-orange-500' : 'text-gray-400'}`}>
                                {descriptionCharCount}/2000
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location & Venue</label>
                        <textarea
                            value={templateData.eventLocation || ''}
                            onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter venue location"
                        />
                    </div>

                    {/* Event Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Event Date</label>
                            <input
                                type="date"
                                value={templateData.eventDate || ''}
                                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={templateData.eventStartTime || ''}
                                onChange={(e) => handleInputChange('eventStartTime', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Support Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Support Email</label>
                        <input
                            type="email"
                            value={templateData.supportEmail || ''}
                            onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 ${validationErrors.supportEmail ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="support@example.com"
                        />
                        {validationErrors.supportEmail && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.supportEmail}</p>
                        )}
                    </div>

                    {/* Support Phone */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Support Phone</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedCountryCode.code}
                                onChange={(e) => {
                                    const country = countryCodes.find(c => c.code === e.target.value);
                                    if (country) handleCountryCodeChange(country);
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                {countryCodes.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder={selectedCountryCode.example}
                                className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 ${validationErrors.supportPhone ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>

                    {/* Event Website */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event Website</label>
                        <input
                            type="url"
                            value={templateData.eventWebsite || ''}
                            onChange={(e) => handleInputChange('eventWebsite', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 ${validationErrors.eventWebsite ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-800 mb-2">ℹ️ Auto-generated Information:</p>
                        <div className="space-y-1 text-xs text-blue-700">
                            <p>• Attendee Name & Email - Taken from registration form</p>
                            <p>• Badge Code - Auto-generated unique code</p>
                            <p>• QR Code - Auto-generated for entry verification</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3 rounded-t-lg">
                    <div className="flex items-center gap-2 text-white">
                        <Eye size={16} />
                        <h3 className="font-semibold text-sm">Email Preview</h3>
                    </div>
                </div>

                <div className="p-4 max-h-[600px] overflow-y-auto" style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                        {/* Logo */}
                        <div style={{ padding: '40px 30px 20px 30px', textAlign: 'center' }}>
                            {templateData.eventLogo ? (
                                <img src={templateData.eventLogo} alt="Event Logo" width="140" style={{ display: 'block', margin: '0 auto' }} />
                            ) : (
                                <div style={{ width: '140px', height: '60px', margin: '0 auto', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building size={30} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Header */}
                        <div style={{ padding: '0 40px 30px 40px', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>Registration Confirmed</h1>
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
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>Attendee</div>
                                            <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>{templateData.username || 'Attendee Name'}</div>
                                            {templateData.userEmail && <div style={{ fontSize: '13px', color: '#6b7280' }}>{templateData.userEmail}</div>}
                                        </td>
                                        <td width="50%" valign="top" align="right">
                                            {templateData.eventLocation && (
                                                <>
                                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>Location & Venue</div>
                                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500, whiteSpace: 'pre-line' }}>{templateData.eventLocation}</div>
                                                </>
                                            )}
                                            <div style={{ marginTop: '6px' }}>
                                                {templateData.eventDate && <div style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(templateData.eventDate)}</div>}
                                                {templateData.eventStartTime && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{templateData.eventStartTime}</div>}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* QR Section */}
                        <div style={{ padding: '0 40px 30px 40px' }}>
                            <table width="100%" cellSpacing="0" cellPadding="0" style={{ backgroundColor: '#eeeeee', padding: '30px', borderRadius: '12px' }}>
                                <tbody>
                                    <tr>
                                        <td align="center">
                                            {templateData.qrUrl ? (
                                                <img src={templateData.qrUrl} alt="Entry QR" width="140" style={{ margin: '0 auto 15px auto' }} />
                                            ) : (
                                                <div style={{ width: '140px', height: '140px', margin: '0 auto 15px auto', backgroundColor: '#e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <QrCode size={60} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>Entry Badge Code</div>
                                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '3px' }}>{templateData.badgeCode || 'BDG-XXXXXXXX'}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Support Section */}
                        {(templateData.supportEmail || templateData.supportPhone || templateData.eventWebsite) && (
                            <div style={{ padding: '0 40px 30px 40px', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', color: '#6b7280' }}>For support or inquiries:</p>
                                <div style={{ fontSize: '14px' }}>
                                    {templateData.supportEmail && <a href={`mailto:${templateData.supportEmail}`} style={{ color: '#111827', textDecoration: 'none' }}>{templateData.supportEmail}</a>}
                                    {templateData.supportEmail && templateData.supportPhone && <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>}
                                    {templateData.supportPhone && <span style={{ color: '#111827' }}>{templateData.supportPhone}</span>}
                                </div>
                                {templateData.eventWebsite && (
                                    <div style={{ marginTop: '10px' }}>
                                        <a href={templateData.eventWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'underline' }}>
                                            {templateData.eventWebsite}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ padding: '30px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#6b7280' }}>This confirms your registration for <strong>{templateData.eventName || eventName}</strong>.</p>
                            <span style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Powered by</span>
                            <img src="https://quantumshare.quantumparadigm.in/vedio/Planotech_Logo_Black.png" width="80" style={{ display: 'block', margin: '10px auto', opacity: 0.8 }} alt="Planotech" />
                            <p style={{ fontSize: '10px', color: '#9ca3af' }}>© 2026 Planotech Event & Marketing Pvt Ltd</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Form Type Selection Component
const FormTypeSelection = ({ onFormTypeSelected, existingFormType, isLoading }) => {
    const [formType, setFormType] = useState(existingFormType || '');
    const [customFormName, setCustomFormName] = useState('');
    const [error, setError] = useState('');

    const formTypes = [
        { value: 'Delegate', label: 'Delegate Registration', description: 'Standard delegate registration form' },
        { value: 'Speaker', label: 'Speaker Registration', description: 'For speakers and presenters' },
        { value: 'Sponsor', label: 'Sponsor Registration', description: 'For sponsors and partners' },
        { value: 'Volunteer', label: 'Volunteer Registration', description: 'For volunteers and staff' },
        { value: 'Media', label: 'Media Registration', description: 'For media and press' },
        { value: 'VIP', label: 'VIP Registration', description: 'For VIP guests' },
        { value: 'custom', label: 'Custom (Enter your own)', description: 'Create a custom form name' },
    ];

    const getSelectedFormName = () => {
        if (formType === 'custom') {
            return customFormName.trim();
        }
        return formType;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formName = getSelectedFormName();
        
        if (!formName) {
            setError('Please select or enter a form type/name');
            return;
        }
        onFormTypeSelected(formName);
    };

    const handleFormTypeChange = (e) => {
        const value = e.target.value;
        setFormType(value);
        setError('');
        
        // Reset custom name when switching away from custom
        if (value !== 'custom') {
            setCustomFormName('');
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Create New Form</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formType}
                        onChange={handleFormTypeChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Select form type...</option>
                        {formTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                {formType === 'custom' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Form Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={customFormName}
                            onChange={(e) => {
                                setCustomFormName(e.target.value);
                                setError('');
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter custom form name (e.g., Workshop Registration)"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter a descriptive name for your custom form
                        </p>
                    </div>
                )}

                {formType && formType !== 'custom' && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">Selected:</span> {formTypes.find(t => t.value === formType)?.description}
                        </p>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Creating Form...
                            </>
                        ) : (
                            <>
                                <ChevronRight size={16} />
                                Continue to Form Builder
                            </>
                        )}
                    </button>
                </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
                Note: A default form with Name and Email fields will be created. You can customize it later.
            </p>
        </div>
    );
};

// Main FormBuilder Component (updated)
const FormBuilder = ({ eventId, eventName, onClose, onSave, onDraftSaved, notification, existingFormData = null, isNewForm = false,        // Add this
    isEditingDraft = false   }) => {
    const [formBuilder, setFormBuilder] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [formSections, setFormSections] = useState([]);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [sectionErrors, setSectionErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [activeSection, setActiveSection] = useState('FORM_HEADER');
    const [publishStep, setPublishStep] = useState('formType');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadingSponsorLogos, setUploadingSponsorLogos] = useState({});
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
    const [showEmailEditor, setShowEmailEditor] = useState(false);
    const [isPublishingFlow, setIsPublishingFlow] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [isCreatingForm, setIsCreatingForm] = useState(false);

    const { success, error } = notification;

    const {
        triggerAutoSave,
        isAutoSaving,
        lastSaved,
        saveNow: saveNowAuto
    } = useAutoSave(formBuilder, publishStep, 2000);

    // Field type configurations
    const fieldTypes = [
        { type: 'text', label: 'Short Answer', icon: <Text size={14} />, description: 'Short text' },
        { type: 'textarea', label: 'Paragraph', icon: <Type size={14} />, description: 'Long text' },
        { type: 'email', label: 'Email', icon: <Mail size={14} />, description: 'Email' },
        { type: 'phone', label: 'Phone', icon: <Phone size={14} />, description: 'Phone' },
        { type: 'number', label: 'Number', icon: <Hash size={14} />, description: 'Number' },
        { type: 'date', label: 'Date', icon: <CalendarIcon size={14} />, description: 'Date' },
        { type: 'select', label: 'Dropdown', icon: <ChevronDown size={14} />, description: 'Select' },
        { type: 'radio', label: 'Multiple Choice', icon: <Radio size={14} />, description: 'Select one' },
        { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare size={14} />, description: 'Select multiple' },
        { type: 'file', label: 'File Upload', icon: <File size={14} />, description: 'Upload' }
    ];

    // Form section configurations
    const formSectionsConfig = [
        { type: 'FORM_HEADER', label: 'Header', icon: <Layout size={14} />, description: 'Form title and subtitle', required: true },
        { type: 'FORM_BANNER', label: 'Banner', icon: <Image size={14} />, description: 'Hero banner image', required: false },
        { type: 'FORM_LOGO', label: 'Logo', icon: <Image size={14} />, description: 'Event/Organization logo', required: true },
        { type: 'FORM_SPONSORS', label: 'Sponsors', icon: <Building size={14} />, description: 'Sponsor logos', required: false },
        { type: 'FORM_RULES', label: 'Rules & Regulations', icon: <FileText size={14} />, description: 'Event rules and guidelines', required: false },
        { type: 'FORM_DESCRIPTION', label: 'Description', icon: <File size={14} />, description: 'Event description', required: false }
    ];

    // Steps configuration
    const steps = [
        { id: 'formType', label: 'Form Type' },
        { id: 'fields', label: 'Form Fields' },
        { id: 'sections', label: 'Design' },
        { id: 'email', label: 'Email' },
        { id: 'payment', label: 'Payment' }
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === publishStep);
    };

    const goToNextStep = () => {
        const currentIndex = getCurrentStepIndex();
        if (currentIndex < steps.length - 1) {
            setPublishStep(steps[currentIndex + 1].id);
        }
    };

    const goToPreviousStep = () => {
        const currentIndex = getCurrentStepIndex();
        if (currentIndex > 0) {
            setPublishStep(steps[currentIndex - 1].id);
        }
    };

    // In FormBuilder component - handleFormTypeSelected function
const handleFormTypeSelected = async (formType) => {
    setIsCreatingForm(true);
    try {
        // This is the API call to create a new form draft
        const response = await axiosInstance.post(`/form/event/${eventId}/draft?formType=${encodeURIComponent(formType)}`);

        if (response.data?.status === 'success' && response.data?.data) {
            const formData = response.data.data;
            const builder = new FormBuilderClass(eventId, formData, formType);
            builder.formId = formData.formId;
            setFormBuilder(builder);
            setFormFields(builder.fields);
            setFormSections(builder.formSections);

            if (builder.fields.length > 0) {
                setActiveFieldId(builder.fields[0].id);
            }

            success(`Form created successfully! Form type: ${formType}`);
            setPublishStep('fields');
        } else {
            throw new Error(response.data?.message || 'Failed to create form');
        }
    } catch (err) {
        console.error('Error creating form:', err);
        error(err.response?.data?.message || 'Failed to create form. Please try again.');
    } finally {
        setIsCreatingForm(false);
    }
};

useEffect(() => {
    // If we have existingFormData from props, load it directly
    if (existingFormData && existingFormData.formId) {
        setIsLoadingDraft(true);
        try {
            const builder = new FormBuilderClass(eventId, existingFormData, existingFormData.formType);
            builder.formId = existingFormData.formId;
            builder.status = existingFormData.status || 'DRAFT';
            builder.active = existingFormData.active !== false;
            builder.eventKey = existingFormData.eventKey || '';
            
            // If there are form sections from API, load them
            // Make sure existingFormData.formSections exists and is an array
            if (existingFormData.formSections && Array.isArray(existingFormData.formSections) && existingFormData.formSections.length > 0) {
                builder.formSections = builder.parseFormSections(existingFormData.formSections);
            } else {
                // Use default sections if no sections exist
                builder.formSections = builder.getDefaultFormSections();
            }
            
            setFormBuilder(builder);
            setFormFields([...builder.fields]);
            setFormSections([...builder.formSections]);

            if (builder.fields.length > 0) {
                setActiveFieldId(builder.fields[0].id);
            }

            if (builder.formSections.length > 0) {
                setActiveSection(builder.formSections[0].type);
            }

            // Skip form type selection and go directly to fields
            setPublishStep('fields');
        } catch (err) {
            console.error('Error loading existing form data:', err);
            error('Failed to load form data');
        } finally {
            setIsLoadingDraft(false);
        }
    }
}, [eventId, existingFormData]);

    // Sync formFields and formSections with formBuilder
useEffect(() => {
    if (formBuilder) {
        setFormFields([...formBuilder.fields]);
        
        // Ensure formSections is always an array
        const sections = formBuilder.formSections && Array.isArray(formBuilder.formSections) 
            ? [...formBuilder.formSections] 
            : formBuilder.getDefaultFormSections();
        setFormSections(sections);

        if (publishStep === 'fields') {
            if (formBuilder.fields.length > 0) {
                if (activeFieldId) {
                    const fieldExists = formBuilder.fields.some(f => f.id === activeFieldId);
                    if (!fieldExists) {
                        setActiveFieldId(formBuilder.fields[0].id);
                    }
                } else {
                    setActiveFieldId(formBuilder.fields[0].id);
                }
            } else {
                setActiveFieldId(null);
            }
        }
    }
}, [formBuilder, publishStep]);

    // Cleanup logo preview URL
    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

  
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
                updateFormSection('FORM_LOGO', 'logoUrl', imageUrl);
                const previewUrl = URL.createObjectURL(file);
                setLogoPreview(previewUrl);
                success('Logo uploaded successfully!');
            } else if (response.data && response.data.data && response.data.data.url) {
                const imageUrl = response.data.data.url;
                updateFormSection('FORM_LOGO', 'logoUrl', imageUrl);
                const previewUrl = URL.createObjectURL(file);
                setLogoPreview(previewUrl);
                success('Logo uploaded successfully!');
            } else {
                error('Failed to upload logo: Invalid response format');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            error(err.response?.data?.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleLogoUpload(file);
        }
        e.target.value = '';
    };

    const addField = (fieldType) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const newField = newBuilder.addField(fieldType);
            setFormBuilder(newBuilder);
            setActiveFieldId(newField.id);
            setAutoSaveStatus('saving');

            const fieldTypeInfo = fieldTypes.find(ft => ft.type === fieldType);
            if (fieldTypeInfo) {
                success(`${fieldTypeInfo.label} field added`);
            }

            if (autoSaveEnabled && newBuilder.formId) {
                triggerAutoSave();
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const removeField = (fieldId) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const removed = newBuilder.removeField(fieldId);
            if (removed) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (activeFieldId === fieldId) {
                    if (newBuilder.fields.length > 0) {
                        setActiveFieldId(newBuilder.fields[0].id);
                    } else {
                        setActiveFieldId(null);
                    }
                }
                success('Field removed');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const updateField = (fieldId, property, value) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateField(fieldId, property, value);
            if (updated) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const updateFormSection = (sectionType, property, value) => {
        if (!formBuilder) return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateFormSection(sectionType, property, value);
            if (updated) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (sectionType === 'FORM_LOGO' && property === 'logoUrl') {
                    if (value) {
                        setLogoPreview(value);
                    } else {
                        setLogoPreview(null);
                    }
                }

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const handleDragStart = (index) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
    };

    const handleDrop = (index) => {
        if (draggingIndex === null || draggingIndex === index || !formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const reordered = newBuilder.reorderFields(draggingIndex, index);
            if (reordered) {
                setFormBuilder(newBuilder);
                setDraggingIndex(null);
                setAutoSaveStatus('saving');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const handleLogoDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleLogoDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            handleLogoUpload(file);
        }
    };

    const addOptionToField = (fieldId) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const added = newBuilder.addOption(fieldId);
            if (added) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const updateOptionInField = (fieldId, optionIndex, value) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateOption(fieldId, optionIndex, value);
            if (updated) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const removeOptionFromField = (fieldId, optionIndex) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const removed = newBuilder.removeOption(fieldId, optionIndex);
            if (removed) {
                setFormBuilder(newBuilder);
                setAutoSaveStatus('saving');

                if (autoSaveEnabled && newBuilder.formId) {
                    triggerAutoSave();
                }
            }
        } catch (err) {
            error(err.message);
            setAutoSaveStatus('error');
        }
    };

    const validateForm = () => {
        if (!formBuilder) return false;

        const validation = formBuilder.validate();
        setFormErrors(validation.errors);
        return validation.isValid;
    };

    const validateFormSections = () => {
        if (!formBuilder) return false;

        const validation = formBuilder.validateFormSections();
        setSectionErrors(validation.errors);
        return validation.isValid;
    };

    const handleSaveDraft = async () => {
        if (!formBuilder) return;

        if (!formBuilder.formId) {
            error('Form ID is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = formBuilder.toApiFormat();
            const fieldsPayload = formData.fields;

            if (formBuilder.formSections && formBuilder.formSections.length > 0) {
                const sectionsPayload = formBuilder.formSections.map(section => {
                    let dataJson = section.dataJson;
                    if (dataJson && typeof dataJson === 'object') {
                        dataJson = JSON.stringify(dataJson);
                    }

                    return {
                        type: section.type,
                        displayOrder: section.displayOrder || section.order || 0,
                        dataJson: dataJson
                    };
                });

                sectionsPayload.sort((a, b) => a.displayOrder - b.displayOrder);

                try {
                    await axiosInstance.put(
                        `/forms/${formBuilder.formId}/sections`,
                        sectionsPayload
                    );
                } catch (sectionError) {
                    console.warn('Section update failed, but continuing with draft save...');
                }
            }

            const response = await axiosInstance.put(
                `/form/${formBuilder.formId}/draft`,
                fieldsPayload
            );

            if (response.data) {
                success('Draft saved successfully!');

                setTimeout(() => {
                    onDraftSaved?.(response.data);
                    onClose();
                }, 500);
            }
        } catch (err) {
            console.error('Error saving draft:', err);
            error(err.response?.data?.message || 'Failed to save draft');
        } finally {
            setIsSubmitting(false);
        }
    };
const handleFieldsNext = async () => {
    if (!formBuilder) return;

    const validation = formBuilder.validate();
    setFormErrors(validation.errors);

    if (!validation.isValid) {
        error('Please fix the validation errors before proceeding');
        return;
    }

    // Clone the current builder
    const updatedBuilder = formBuilder.clone();

    // Ensure formSections is initialized
    if (!updatedBuilder.formSections || updatedBuilder.formSections.length === 0) {
        updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
    }

    // Fetch sections from API if formId exists
    if (updatedBuilder.formId) {
        try {
            const sectionsResponse = await axiosInstance.get(`/forms/${updatedBuilder.formId}/sections`);
            if (sectionsResponse.data?.status === 'success' && sectionsResponse.data?.data && sectionsResponse.data.data.length > 0) {
                updatedBuilder.formSections = updatedBuilder.parseFormSections(sectionsResponse.data.data);
            } else {
                // If no sections from API, use default sections
                updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
            updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
        }
    } else {
        updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
    }

    setFormBuilder(updatedBuilder);
    setFormSections([...updatedBuilder.formSections]);
    setFormFields([...updatedBuilder.fields]);
    setPublishStep('sections');

    // Set active section to first available section
    if (updatedBuilder.formSections.length > 0) {
        setActiveSection(updatedBuilder.formSections[0].type);
    } else {
        setActiveSection('FORM_HEADER');
    }

    success('Fields saved successfully! Moving to form customization.');
};

    const handleDesignNext = () => {
        if (!formBuilder) return;

        const validation = formBuilder.validateFormSections();
        setSectionErrors(validation.errors);

        if (!validation.isValid) {
            error('Please fix the validation errors before proceeding');
            return;
        }

        setPublishStep('email');
        success('Design saved! Now configure email template.');
    };

    const handleEmailNext = () => {
        setPublishStep('payment');
        success('Email template configured! Now set up payment.');
    };

    const handlePaymentSaved = (payment) => {
        setPaymentData(payment);
    };

    const handleFinalPublish = async () => {
        if (!formBuilder) return;

        setIsSubmitting(true);
        try {
            // First, save all form data
            const formData = formBuilder.toApiFormat();
            const fieldsPayload = formData.fields;

            if (formBuilder.formSections && formBuilder.formSections.length > 0) {
                const sectionsPayload = formBuilder.formSections.map(section => {
                    let dataJson = section.dataJson;
                    if (dataJson && typeof dataJson === 'object') {
                        dataJson = JSON.stringify(dataJson);
                    }

                    return {
                        type: section.type,
                        displayOrder: section.displayOrder || section.order || 0,
                        dataJson: dataJson
                    };
                });

                sectionsPayload.sort((a, b) => a.displayOrder - b.displayOrder);

                try {
                    await axiosInstance.put(
                        `/forms/${formBuilder.formId}/sections`,
                        sectionsPayload
                    );
                } catch (sectionError) {
                    console.warn('Section update failed, but continuing with publish...');
                }
            }

            // Publish the form
            const response = await axiosInstance.post(
                `/form/${formBuilder.formId}/publish`,
                fieldsPayload
            );

            if (response.data) {
                success('Form published successfully!');

                if (onSave) {
                    onSave(response.data);
                }

                setTimeout(() => {
                    onClose();
                }, 500);
            }
        } catch (err) {
            console.error('Error publishing form:', err);
            error(err.response?.data?.message || 'Failed to publish form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToFields = () => {
        setPublishStep('fields');
        if (formBuilder.fields.length > 0) {
            setActiveFieldId(formBuilder.fields[0].id);
        }
    };

    const getFieldTypeIcon = (type) => {
        const fieldType = fieldTypes.find(ft => ft.type === type);
        return fieldType ? fieldType.icon : <Text size={14} />;
    };

    const getFormSectionIcon = (type) => {
        const section = formSectionsConfig.find(s => s.type === type);
        return section ? section.icon : <Layout size={14} />;
    };

    const renderFieldInput = (field) => {
        const baseInputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        className={`${baseInputClass} bg-white`}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        className={`${baseInputClass} bg-white resize-none`}
                        rows="3"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'email':
                return (
                    <input
                        type="email"
                        className={`${baseInputClass} bg-white`}
                        placeholder={field.placeholder || "email@example.com"}
                    />
                );
            case 'phone':
                return (
                    <input
                        type="tel"
                        className={`${baseInputClass} bg-white`}
                        placeholder={field.placeholder || "(123) 456-7890"}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className={`${baseInputClass} bg-white`}
                        placeholder={field.placeholder || "Enter a number"}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        className={`${baseInputClass} bg-white`}
                    />
                );
            case 'select':
                return (
                    <select className={`${baseInputClass} bg-white`}>
                        <option value="">Choose an option</option>
                        {field.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                                <input
                                    type="radio"
                                    name={`field-${field.id}`}
                                    className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'file':
                return (
                    <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-white">
                        <File size={16} className="text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderFieldEditor = () => {
        const field = formFields.find(f => f.id === activeFieldId);

        if (!field) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText size={18} className="text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Select a Field</h3>
                    <p className="text-xs text-gray-500">Click on a field from the list to edit its settings</p>
                </div>
            );
        }

        const isRequiredNameField = field.label.toLowerCase().includes('name') && field.type === 'text' && field.required;
        const isRequiredEmailField = field.type === 'email' && field.required;
        const isProtectedField = isRequiredNameField || isRequiredEmailField;

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-600">
                            {getFieldTypeIcon(field.type)}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-700">
                            Field Settings: <span className="font-normal text-gray-500">{field.label}</span>
                        </h3>
                    </div>
                    {!isProtectedField && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this field?')) {
                                    removeField(field.id);
                                }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove field"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Label <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={field.label || ''}
                            onChange={(e) => updateField(field.id, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter field label"
                            disabled={isProtectedField}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Placeholder
                        </label>
                        <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter placeholder text"
                        />
                    </div>

                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Options
                            </label>
                            <div className="space-y-1.5">
                                {field.options?.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOptionInField(field.id, optIndex, e.target.value)}
                                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder={`Option ${optIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeOptionFromField(field.id, optIndex)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addOptionToField(field.id)}
                                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Option
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required || false}
                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                            disabled={isProtectedField}
                        />
                        <label htmlFor={`required-${field.id}`} className="ml-2 text-xs text-gray-700">
                            Required
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    const renderFormSectionsPreview = () => {
    // Add null checks at the beginning
    if (!formSections || formSections.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye size={18} className="text-purple-500" />
                    Live Preview
                </h2>
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Layout size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No sections available to preview</p>
                </div>
            </div>
        );
    }

    const logoSection = formSections.find(s => s?.type === 'FORM_LOGO');
    const headerSection = formSections.find(s => s?.type === 'FORM_HEADER');
    const bannerSection = formSections.find(s => s?.type === 'FORM_BANNER');

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye size={18} className="text-purple-500" />
                Live Preview
            </h2>

            <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                {bannerSection?.data?.showBanner !== false && bannerSection?.data?.bannerUrl && (
                    <div
                        className="relative rounded-lg overflow-hidden bg-gray-100 -mt-2"
                        style={{ height: bannerSection.data.bannerHeight || '200px' }}
                    >
                        <img
                            src={bannerSection.data.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: bannerSection.data.bannerAlignment || 'center' }}
                        />
                        {bannerSection.data.showOverlay && (
                            <div
                                className="absolute inset-0"
                                style={{ backgroundColor: bannerSection.data.overlayColor || 'rgba(0,0,0,0.3)' }}
                            ></div>
                        )}
                        {(bannerSection.data.title || bannerSection.data.subtitle || bannerSection.data.buttonText) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                {bannerSection.data.title && (
                                    <h3
                                        className="text-2xl font-bold mb-2"
                                        style={{ color: bannerSection.data.titleColor || '#FFFFFF' }}
                                    >
                                        {bannerSection.data.title}
                                    </h3>
                                )}
                                {bannerSection.data.subtitle && (
                                    <p
                                        className="text-sm mb-4"
                                        style={{ color: bannerSection.data.subtitleColor || '#FFFFFF' }}
                                    >
                                        {bannerSection.data.subtitle}
                                    </p>
                                )}
                                {bannerSection.data.buttonText && bannerSection.data.buttonLink && (
                                    <a
                                        href={bannerSection.data.buttonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-block px-6 py-2 text-sm font-semibold ${bannerSection.data.buttonBorderRadius || 'rounded-lg'}`}
                                        style={{
                                            backgroundColor: bannerSection.data.buttonBgColor || '#FFFFFF',
                                            color: bannerSection.data.buttonTextColor || '#7C3AED'
                                        }}
                                    >
                                        {bannerSection.data.buttonText}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {logoSection?.data?.showLogo !== false && logoSection?.data?.logoUrl && (
                    <div className={`flex justify-${logoSection.data.logoAlignment || 'center'}`}>
                        <div className={`${logoSection.data.logoSize === 'small' ? 'w-16' :
                            logoSection.data.logoSize === 'large' ? 'w-32' : 'w-24'
                            }`}>
                            <img
                                src={logoSection.data.logoUrl}
                                alt="Logo"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                )}

                {headerSection?.data?.showTitle !== false && (
                    <div className="text-center">
                        {headerSection.data.title && (
                            <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: headerSection.data.titleColor || '#000000' }}
                            >
                                {headerSection.data.title}
                            </h1>
                        )}
                        {headerSection.data.subtitle && (
                            <p
                                className="text-sm"
                                style={{ color: headerSection.data.subtitleColor || '#666666' }}
                            >
                                {headerSection.data.subtitle}
                            </p>
                        )}
                    </div>
                )}

                {formSections.map((section) => {
                    if (!section) return null;
                    if (section.type === 'FORM_DESCRIPTION' && section.data?.showSection !== false && section.data?.description) {
                        return (
                            <div
                                key={section.type}
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: section.data.backgroundColor || '#F9FAFB' }}
                            >
                                <p className="text-sm text-gray-700">{section.data.description}</p>
                            </div>
                        );
                    }
                    return null;
                })}

                {formSections.map((section) => {
                    if (!section) return null;
                    if (section.type === 'FORM_RULES' && section.data?.showSection !== false && section.data?.rules?.length > 0) {
                        return (
                            <div
                                key={section.type}
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: section.data.backgroundColor || '#F9FAFB',
                                    color: section.data.textColor || '#374151'
                                }}
                            >
                                <h3 className="text-sm font-semibold mb-3">{section.data.title || 'Rules & Regulations'}</h3>
                                <ul className="space-y-2">
                                    {section.data.rules.map((rule, idx) => (
                                        <li key={rule.id || idx} className="flex items-start gap-2 text-xs">
                                            {section.data.showBullets !== false && (
                                                <span
                                                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                                    style={{ backgroundColor: section.data.bulletColor || '#DC2626' }}
                                                ></span>
                                            )}
                                            <span>{rule.text || `Rule ${idx + 1}`}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }
                    return null;
                })}

                {formSections.map((section) => {
                    if (!section) return null;
                    if (section.type === 'FORM_SPONSORS' && section.data?.showSection !== false && section.data?.sponsors?.length > 0) {
                        return (
                            <div key={section.type} className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">
                                    {section.data.title || 'Our Sponsors'}
                                </h3>
                                <div className={`grid grid-cols-${section.data.columns || 3} gap-4`}>
                                    {section.data.sponsors.map((sponsor) => (
                                        <div key={sponsor.id} className="text-center group">
                                            <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden bg-white mb-2 flex items-center justify-center p-3">
                                                {sponsor.logoUrl ? (
                                                    <img
                                                        src={sponsor.logoUrl}
                                                        alt={sponsor.name}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                ) : (
                                                    <Building className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>
                                            {sponsor.name && (
                                                <p className="text-xs font-medium text-gray-700 truncate">
                                                    {sponsor.name}
                                                </p>
                                            )}
                                            {section.data.showTiers && sponsor.tier && (
                                                <p className="text-[10px] text-gray-500 mt-0.5">{sponsor.tier}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

    const renderSectionEditor = (section) => {
        if (!section) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Layout size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Select a Section</h3>
                    <p className="text-xs text-gray-500">Click on a section from the left panel to edit its settings</p>
                </div>
            );
        }

        const sectionConfig = formSectionsConfig.find(s => s.type === section.type);
        const uploadingSponsorLogosLocal = uploadingSponsorLogos || {};

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-600">
                            {getFormSectionIcon(section.type)}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-700">
                            Edit {sectionConfig?.label || section.type}: <span className="font-normal text-gray-500">{section.type}</span>
                        </h3>
                    </div>
                    {section.required && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            Required
                        </span>
                    )}
                </div>

                <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                    {section.type === 'FORM_HEADER' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={section.data.title || ''}
                                    onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter form title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={section.data.subtitle || ''}
                                    onChange={(e) => updateFormSection(section.type, 'subtitle', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter form subtitle"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Title Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.titleColor || '#000000'}
                                        onChange={(e) => updateFormSection(section.type, 'titleColor', e.target.value)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Subtitle Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.subtitleColor || '#666666'}
                                        onChange={(e) => updateFormSection(section.type, 'subtitleColor', e.target.value)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="show-title"
                                    checked={section.data.showTitle !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showTitle', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="show-title" className="ml-2 text-xs text-gray-700">
                                    Show Title
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="show-subtitle"
                                    checked={section.data.showSubtitle !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showSubtitle', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="show-subtitle" className="ml-2 text-xs text-gray-700">
                                    Show Subtitle
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Alignment
                                </label>
                                <select
                                    value={section.data.alignment || 'center'}
                                    onChange={(e) => updateFormSection(section.type, 'alignment', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Background Color
                                </label>
                                <input
                                    type="color"
                                    value={section.data.backgroundColor || '#FFFFFF'}
                                    onChange={(e) => updateFormSection(section.type, 'backgroundColor', e.target.value)}
                                    className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                />
                            </div>
                        </>
                    )}

                    {section.type === 'FORM_LOGO' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Logo Image
                                </label>
                                <div className="space-y-3">
                                    {(section.data.logoUrl || logoPreview) && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-600 mb-1">Current Logo:</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                                    <img
                                                        src={logoPreview || section.data.logoUrl}
                                                        alt="Logo preview"
                                                        className="max-w-full max-h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateFormSection('FORM_LOGO', 'logoUrl', '');
                                                        setLogoPreview(null);
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Trash2 size={12} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="logo-upload-editor"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                            onChange={handleFileInputChange}
                                            className="hidden"
                                            disabled={uploadingLogo}
                                        />
                                        <label
                                            htmlFor="logo-upload-editor"
                                            className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingLogo
                                                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                                }`}
                                            onDragOver={handleLogoDragOver}
                                            onDrop={handleLogoDrop}
                                        >
                                            {uploadingLogo ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader className="w-6 h-6 text-purple-600 animate-spin mb-2" />
                                                    <p className="text-xs text-gray-600">Uploading...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                                        {section.data.logoUrl || logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Click to browse or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        JPG, PNG, GIF, WebP, SVG • Max 5MB
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Or enter logo URL:</p>
                                        <input
                                            type="text"
                                            value={section.data.logoUrl || ''}
                                            onChange={(e) => updateFormSection(section.type, 'logoUrl', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Logo Size
                                    </label>
                                    <select
                                        value={section.data.logoSize || 'medium'}
                                        onChange={(e) => updateFormSection(section.type, 'logoSize', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Alignment
                                    </label>
                                    <select
                                        value={section.data.logoAlignment || 'center'}
                                        onChange={(e) => updateFormSection(section.type, 'logoAlignment', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="show-logo"
                                    checked={section.data.showLogo !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showLogo', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="show-logo" className="ml-2 text-xs text-gray-700">
                                    Show Logo
                                </label>
                            </div>

                            {sectionErrors[section.type] && (
                                <p className="text-xs text-red-600 mt-1">{sectionErrors[section.type]}</p>
                            )}
                        </>
                    )}

                    {section.type === 'FORM_BANNER' && (
                        <>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600">
                                        Banner Image
                                    </label>
                                    {section.data.bannerUrl && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateFormSection(section.type, 'bannerUrl', '');
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 size={12} />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {section.data.bannerUrl && (
                                        <div className="mb-2">
                                            <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                <img
                                                    src={section.data.bannerUrl}
                                                    alt="Banner preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="banner-upload-editor"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                                                    if (!validTypes.includes(file.type)) {
                                                        error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
                                                        return;
                                                    }

                                                    const maxSize = 5 * 1024 * 1024;
                                                    if (file.size > maxSize) {
                                                        error('File size must be less than 5MB');
                                                        return;
                                                    }

                                                    setUploadingLogo(true);

                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const response = await axiosInstance.post('/file/upload', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });

                                                        let imageUrl = null;
                                                        if (response.data?.url) {
                                                            imageUrl = response.data.url;
                                                        } else if (response.data?.data?.url) {
                                                            imageUrl = response.data.data.url;
                                                        }

                                                        if (imageUrl) {
                                                            updateFormSection(section.type, 'bannerUrl', imageUrl);
                                                            success('Banner uploaded successfully!');
                                                        } else {
                                                            throw new Error('Invalid response format');
                                                        }
                                                    } catch (err) {
                                                        console.error('Error uploading banner:', err);
                                                        error(err.response?.data?.message || 'Failed to upload banner');
                                                    } finally {
                                                        setUploadingLogo(false);
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="banner-upload-editor"
                                            className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadingLogo
                                                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                                }`}
                                        >
                                            {uploadingLogo ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader className="w-6 h-6 text-purple-600 animate-spin mb-2" />
                                                    <p className="text-xs text-gray-600">Uploading...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                                        {section.data.bannerUrl ? 'Change Banner' : 'Upload Banner'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Click to browse or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        JPG, PNG, GIF, WebP • Max 5MB
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Or enter banner URL:</p>
                                        <input
                                            type="text"
                                            value={section.data.bannerUrl || ''}
                                            onChange={(e) => updateFormSection(section.type, 'bannerUrl', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="https://example.com/banner.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Banner Height
                                    </label>
                                    <select
                                        value={section.data.bannerHeight || '300px'}
                                        onChange={(e) => updateFormSection(section.type, 'bannerHeight', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="200px">Small (200px)</option>
                                        <option value="300px">Medium (300px)</option>
                                        <option value="400px">Large (400px)</option>
                                        <option value="500px">Extra Large (500px)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Alignment
                                    </label>
                                    <select
                                        value={section.data.bannerAlignment || 'center'}
                                        onChange={(e) => updateFormSection(section.type, 'bannerAlignment', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`show-overlay-editor`}
                                    checked={section.data.showOverlay || false}
                                    onChange={(e) => updateFormSection(section.type, 'showOverlay', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-overlay-editor`} className="ml-2 text-xs text-gray-700">
                                    Show overlay
                                </label>
                            </div>

                            {section.data.showOverlay && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Overlay Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.overlayColor ? section.data.overlayColor.replace(/[^#\dA-Fa-f]/g, '') : '#000000'}
                                        onChange={(e) => updateFormSection(section.type, 'overlayColor', `rgba(${parseInt(e.target.value.slice(1, 3), 16)}, ${parseInt(e.target.value.slice(3, 5), 16)}, ${parseInt(e.target.value.slice(5, 7), 16)}, 0.3)`)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3 mt-2">
                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Banner Content (Optional)</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={section.data.title || ''}
                                            onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Banner title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Title Color
                                        </label>
                                        <input
                                            type="color"
                                            value={section.data.titleColor || '#FFFFFF'}
                                            onChange={(e) => updateFormSection(section.type, 'titleColor', e.target.value)}
                                            className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Subtitle
                                        </label>
                                        <input
                                            type="text"
                                            value={section.data.subtitle || ''}
                                            onChange={(e) => updateFormSection(section.type, 'subtitle', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Banner subtitle"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Subtitle Color
                                        </label>
                                        <input
                                            type="color"
                                            value={section.data.subtitleColor || '#FFFFFF'}
                                            onChange={(e) => updateFormSection(section.type, 'subtitleColor', e.target.value)}
                                            className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Button Text
                                            </label>
                                            <input
                                                type="text"
                                                value={section.data.buttonText || ''}
                                                onChange={(e) => updateFormSection(section.type, 'buttonText', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Learn More"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Button Link
                                            </label>
                                            <input
                                                type="url"
                                                value={section.data.buttonLink || ''}
                                                onChange={(e) => updateFormSection(section.type, 'buttonLink', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Button Background
                                            </label>
                                            <input
                                                type="color"
                                                value={section.data.buttonBgColor || '#FFFFFF'}
                                                onChange={(e) => updateFormSection(section.type, 'buttonBgColor', e.target.value)}
                                                className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Button Text Color
                                            </label>
                                            <input
                                                type="color"
                                                value={section.data.buttonTextColor || '#7C3AED'}
                                                onChange={(e) => updateFormSection(section.type, 'buttonTextColor', e.target.value)}
                                                className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Button Border Radius
                                        </label>
                                        <select
                                            value={section.data.buttonBorderRadius || 'rounded-lg'}
                                            onChange={(e) => updateFormSection(section.type, 'buttonBorderRadius', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="rounded-none">None</option>
                                            <option value="rounded-sm">Small</option>
                                            <option value="rounded">Medium</option>
                                            <option value="rounded-lg">Large</option>
                                            <option value="rounded-full">Full (Pill)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id={`show-banner`}
                                    checked={section.data.showBanner !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showBanner', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-banner`} className="ml-2 text-xs text-gray-700">
                                    Show Banner
                                </label>
                            </div>
                        </>
                    )}

                    {section.type === 'FORM_SPONSORS' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={section.data.title || 'Our Sponsors'}
                                    onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter section title"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`show-tiers-editor`}
                                    checked={section.data.showTiers || false}
                                    onChange={(e) => updateFormSection(section.type, 'showTiers', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-tiers-editor`} className="ml-2 text-xs text-gray-700">
                                    Show sponsor tiers/categories
                                </label>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600">
                                        Sponsors ({section.data.sponsors?.length || 0})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const sponsors = [...(section.data.sponsors || [])];
                                            sponsors.push({
                                                id: `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                                name: '',
                                                logoUrl: '',
                                                website: '',
                                                tier: ''
                                            });
                                            updateFormSection(section.type, 'sponsors', sponsors);
                                        }}
                                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Sponsor
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {section.data.sponsors?.map((sponsor, sponsorIndex) => {
                                        const isUploading = uploadingSponsorLogosLocal[sponsor.id];

                                        return (
                                            <div key={sponsor.id} className="border border-gray-200 rounded-lg p-3 hover:border-purple-200 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="relative w-12 h-12 flex-shrink-0">
                                                        <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                            {isUploading ? (
                                                                <div className="w-full h-full flex items-center justify-center bg-purple-50">
                                                                    <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                                                                </div>
                                                            ) : sponsor.logoUrl ? (
                                                                <img
                                                                    src={sponsor.logoUrl}
                                                                    alt={sponsor.name || 'Sponsor logo'}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Building className="w-5 h-5 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {!isUploading && (
                                                                <>
                                                                    <input
                                                                        type="file"
                                                                        id={`sponsor-logo-editor-${sponsor.id}`}
                                                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
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

                                                                                setUploadingSponsorLogos(prev => ({
                                                                                    ...prev,
                                                                                    [sponsor.id]: true
                                                                                }));

                                                                                const formData = new FormData();
                                                                                formData.append('file', file);

                                                                                try {
                                                                                    const response = await axiosInstance.post('/file/upload', formData, {
                                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                                    });

                                                                                    let imageUrl = null;
                                                                                    if (response.data?.url) {
                                                                                        imageUrl = response.data.url;
                                                                                    } else if (response.data?.data?.url) {
                                                                                        imageUrl = response.data.data.url;
                                                                                    }

                                                                                    if (imageUrl) {
                                                                                        const updatedSponsors = [...section.data.sponsors];
                                                                                        updatedSponsors[sponsorIndex] = {
                                                                                            ...updatedSponsors[sponsorIndex],
                                                                                            logoUrl: imageUrl
                                                                                        };
                                                                                        updateFormSection(section.type, 'sponsors', updatedSponsors);
                                                                                        success('Sponsor logo uploaded successfully!');
                                                                                    } else {
                                                                                        throw new Error('Invalid response format');
                                                                                    }
                                                                                } catch (err) {
                                                                                    console.error('Error uploading sponsor logo:', err);
                                                                                    error(err.response?.data?.message || 'Failed to upload sponsor logo');
                                                                                } finally {
                                                                                    setUploadingSponsorLogos(prev => {
                                                                                        const newState = { ...prev };
                                                                                        delete newState[sponsor.id];
                                                                                        return newState;
                                                                                    });
                                                                                    e.target.value = '';
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <label
                                                                        htmlFor={`sponsor-logo-editor-${sponsor.id}`}
                                                                        className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
                                                                    >
                                                                        <Upload className="w-3 h-3" />
                                                                        Upload Logo
                                                                    </label>
                                                                </>
                                                            )}

                                                            {sponsor.logoUrl && !isUploading && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updatedSponsors = [...section.data.sponsors];
                                                                        updatedSponsors[sponsorIndex] = {
                                                                            ...updatedSponsors[sponsorIndex],
                                                                            logoUrl: ''
                                                                        };
                                                                        updateFormSection(section.type, 'sponsors', updatedSponsors);
                                                                    }}
                                                                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={sponsor.name || ''}
                                                            onChange={(e) => {
                                                                const updatedSponsors = [...section.data.sponsors];
                                                                updatedSponsors[sponsorIndex] = {
                                                                    ...updatedSponsors[sponsorIndex],
                                                                    name: e.target.value
                                                                };
                                                                updateFormSection(section.type, 'sponsors', updatedSponsors);
                                                            }}
                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                            placeholder="Sponsor name"
                                                            disabled={isUploading}
                                                        />

                                                        {section.data.showTiers && (
                                                            <select
                                                                value={sponsor.tier || ''}
                                                                onChange={(e) => {
                                                                    const updatedSponsors = [...section.data.sponsors];
                                                                    updatedSponsors[sponsorIndex] = {
                                                                        ...updatedSponsors[sponsorIndex],
                                                                        tier: e.target.value
                                                                    };
                                                                    updateFormSection(section.type, 'sponsors', updatedSponsors);
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                                disabled={isUploading}
                                                            >
                                                                <option value="">Select Tier</option>
                                                                <option value="Platinum">Platinum</option>
                                                                <option value="Gold">Gold</option>
                                                                <option value="Silver">Silver</option>
                                                                <option value="Bronze">Bronze</option>
                                                                <option value="Partner">Partner</option>
                                                                <option value="Community">Community</option>
                                                            </select>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedSponsors = section.data.sponsors.filter((_, idx) => idx !== sponsorIndex);
                                                            updateFormSection(section.type, 'sponsors', updatedSponsors);

                                                            if (uploadingSponsorLogosLocal[sponsor.id]) {
                                                                setUploadingSponsorLogos(prev => {
                                                                    const newState = { ...prev };
                                                                    delete newState[sponsor.id];
                                                                    return newState;
                                                                });
                                                            }
                                                        }}
                                                        disabled={isUploading}
                                                        className={`p-1 ${isUploading ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 cursor-pointer'}`}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Columns
                                </label>
                                <select
                                    value={section.data.columns || 3}
                                    onChange={(e) => updateFormSection(section.type, 'columns', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={2}>2 Columns</option>
                                    <option value={3}>3 Columns</option>
                                    <option value={4}>4 Columns</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id={`show-sponsors-section`}
                                    checked={section.data.showSection !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showSection', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-sponsors-section`} className="ml-2 text-xs text-gray-700">
                                    Show Sponsors Section
                                </label>
                            </div>
                        </>
                    )}

                    {section.type === 'FORM_RULES' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={section.data.title || 'Rules & Regulations'}
                                    onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter section title"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600">
                                        Rules ({section.data.rules?.length || 0})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const rules = [...(section.data.rules || [])];
                                            rules.push({
                                                id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                                text: ''
                                            });
                                            updateFormSection(section.type, 'rules', rules);
                                        }}
                                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Rule
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                    {section.data.rules?.map((rule, ruleIndex) => (
                                        <div key={rule.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-2">
                                            <div className="mt-2 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            </div>

                                            <input
                                                type="text"
                                                value={rule.text || ''}
                                                onChange={(e) => {
                                                    const updatedRules = [...section.data.rules];
                                                    updatedRules[ruleIndex] = {
                                                        ...updatedRules[ruleIndex],
                                                        text: e.target.value
                                                    };
                                                    updateFormSection(section.type, 'rules', updatedRules);
                                                }}
                                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                placeholder="Enter rule"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedRules = section.data.rules.filter((_, idx) => idx !== ruleIndex);
                                                    updateFormSection(section.type, 'rules', updatedRules);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Background Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.backgroundColor || '#F9FAFB'}
                                        onChange={(e) => updateFormSection(section.type, 'backgroundColor', e.target.value)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Text Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.textColor || '#374151'}
                                        onChange={(e) => updateFormSection(section.type, 'textColor', e.target.value)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Bullet Color
                                    </label>
                                    <input
                                        type="color"
                                        value={section.data.bulletColor || '#DC2626'}
                                        onChange={(e) => updateFormSection(section.type, 'bulletColor', e.target.value)}
                                        className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`show-bullets-editor`}
                                        checked={section.data.showBullets !== false}
                                        onChange={(e) => updateFormSection(section.type, 'showBullets', e.target.checked)}
                                        className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor={`show-bullets-editor`} className="ml-2 text-xs text-gray-700">
                                        Show bullets
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id={`show-rules-section`}
                                    checked={section.data.showSection !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showSection', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-rules-section`} className="ml-2 text-xs text-gray-700">
                                    Show Rules Section
                                </label>
                            </div>
                        </>
                    )}

                    {section.type === 'FORM_DESCRIPTION' && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={section.data.description || ''}
                                    onChange={(e) => updateFormSection(section.type, 'description', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows="4"
                                    placeholder="Enter form description..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Background Color
                                </label>
                                <input
                                    type="color"
                                    value={section.data.backgroundColor || '#F9FAFB'}
                                    onChange={(e) => updateFormSection(section.type, 'backgroundColor', e.target.value)}
                                    className="w-full h-9 cursor-pointer rounded border border-gray-300"
                                />
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id={`show-description-section`}
                                    checked={section.data.showSection !== false}
                                    onChange={(e) => updateFormSection(section.type, 'showSection', e.target.checked)}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor={`show-description-section`} className="ml-2 text-xs text-gray-700">
                                    Show Description Section
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderFormPreview = () => {
        if (formFields.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">No fields added yet</h3>
                    <p className="text-gray-500 text-sm mb-3">Click on a field type from the left to add your first field</p>
                    <div className="text-xs text-gray-400">
                        Note: Form must include <span className="font-semibold text-purple-600">Name</span> and <span className="font-semibold text-purple-600">Email</span> fields
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Registration Form Preview</h2>

                <div className="space-y-4">
                    {formFields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderFieldInput(field)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

const renderCompletePreview = () => {
    if (!formSections || formSections.length === 0 && formFields.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus size={20} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">No content to preview</h3>
                <p className="text-gray-500 text-sm">Add fields and customize sections to see the preview</p>
            </div>
        );
    }

    const logoSection = formSections?.find(s => s?.type === 'FORM_LOGO');
    const headerSection = formSections?.find(s => s?.type === 'FORM_HEADER');
    const bannerSection = formSections?.find(s => s?.type === 'FORM_BANNER');
    const sponsorsSection = formSections?.find(s => s?.type === 'FORM_SPONSORS');
    const rulesSection = formSections?.find(s => s?.type === 'FORM_RULES');
    const descriptionSection = formSections?.find(s => s?.type === 'FORM_DESCRIPTION');

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {bannerSection?.data?.showBanner !== false && bannerSection?.data?.bannerUrl && (
                <div
                    className="relative w-full bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${bannerSection.data.bannerUrl})`,
                        height: bannerSection.data.bannerHeight || '300px',
                        minHeight: '150px'
                    }}
                >
                    {bannerSection.data.showOverlay && (
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: bannerSection.data.overlayColor || 'rgba(0,0,0,0.3)' }}
                        />
                    )}

                    <div className={`absolute inset-0 flex flex-col justify-center px-4 md:px-8 ${bannerSection.data.bannerAlignment === 'left' ? 'items-start text-left' :
                        bannerSection.data.bannerAlignment === 'right' ? 'items-end text-right' : 'items-center text-center'
                        }`}>
                        {bannerSection.data.title && (
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                                {bannerSection.data.title}
                            </h2>
                        )}
                        {bannerSection.data.subtitle && (
                            <p className="text-sm md:text-base text-white mb-4 drop-shadow-md">
                                {bannerSection.data.subtitle}
                            </p>
                        )}
                        {bannerSection.data.buttonText && bannerSection.data.buttonLink && (
                            <a
                                href={bannerSection.data.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition-colors"
                                style={{
                                    backgroundColor: bannerSection.data.buttonBgColor || '#FFFFFF',
                                    color: bannerSection.data.buttonTextColor || '#7C3AED'
                                }}
                            >
                                {bannerSection.data.buttonText}
                            </a>
                        )}
                    </div>
                </div>
            )}

            <div className="p-6">
                {logoSection?.data?.showLogo !== false && logoSection?.data?.logoUrl && (
                    <div className={`flex justify-${logoSection.data.logoAlignment || 'center'} mb-6`}>
                        <div className={`${logoSection.data.logoSize === 'small' ? 'w-16' :
                            logoSection.data.logoSize === 'large' ? 'w-32' : 'w-24'
                            }`}>
                            <img
                                src={logoSection.data.logoUrl}
                                alt="Logo"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                )}

                {headerSection?.data?.showTitle !== false && (
                    <div className={`text-${headerSection.data.alignment || 'center'} mb-6`}>
                        {headerSection.data.title && (
                            <h1
                                className="text-2xl md:text-3xl font-bold mb-2"
                                style={{ color: headerSection.data.titleColor || '#000000' }}
                            >
                                {headerSection.data.title}
                            </h1>
                        )}
                        {headerSection.data.subtitle && (
                            <p
                                className="text-sm md:text-base"
                                style={{ color: headerSection.data.subtitleColor || '#666666' }}
                            >
                                {headerSection.data.subtitle}
                            </p>
                        )}
                    </div>
                )}

                {descriptionSection?.data?.showSection !== false && descriptionSection?.data?.description && (
                    <div
                        className="p-4 rounded-lg mb-6"
                        style={{ backgroundColor: descriptionSection.data.backgroundColor || '#F9FAFB' }}
                    >
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {descriptionSection.data.description}
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Registration Form</h3>
                    {formFields.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-sm">No fields added yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formFields.map((field) => (
                                <div key={field.id} className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderFieldInput(field)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {rulesSection?.data?.showSection !== false && rulesSection?.data?.rules?.length > 0 && (
                    <div
                        className="p-4 rounded-lg mb-6"
                        style={{
                            backgroundColor: rulesSection.data.backgroundColor || '#F9FAFB',
                            color: rulesSection.data.textColor || '#374151'
                        }}
                    >
                        <h3 className="text-sm font-semibold mb-3">
                            {rulesSection.data.title || 'Rules & Regulations'}
                        </h3>
                        <ul className="space-y-2">
                            {rulesSection.data.rules.map((rule, idx) => (
                                <li key={rule.id || idx} className="flex items-start gap-2 text-sm">
                                    {rulesSection.data.showBullets !== false && (
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                            style={{ backgroundColor: rulesSection.data.bulletColor || '#DC2626' }}
                                        />
                                    )}
                                    <span className="text-gray-700">{rule.text || `Rule ${idx + 1}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {sponsorsSection?.data?.showSection !== false && sponsorsSection?.data?.sponsors?.length > 0 && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">
                            {sponsorsSection.data.title || 'Our Sponsors'}
                        </h3>
                        <div className={`grid grid-cols-${sponsorsSection.data.columns || 3} gap-6`}>
                            {sponsorsSection.data.sponsors.map((sponsor) => (
                                <div key={sponsor.id} className="text-center group">
                                    <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden bg-white mb-2 flex items-center justify-center p-3">
                                        {sponsor.logoUrl ? (
                                            <img
                                                src={sponsor.logoUrl}
                                                alt={sponsor.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <Building className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    {sponsor.name && (
                                        <p className="text-xs font-medium text-gray-700 truncate">
                                            {sponsor.name}
                                        </p>
                                    )}
                                    {sponsorsSection.data.showTiers && sponsor.tier && (
                                        <p className="text-[10px] text-gray-500 mt-0.5">{sponsor.tier}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
    // Render step indicator
    const renderStepIndicator = () => {
        const currentIndex = getCurrentStepIndex();

        return (
            <div className="px-6 pt-6 pb-2 border-b border-gray-200">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div
                                className={`flex flex-col items-center ${index <= currentIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => {
                                    if (index <= currentIndex && index !== currentIndex) {
                                        setPublishStep(step.id);
                                    }
                                }}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${index < currentIndex
                                        ? 'bg-green-500 text-white shadow-md'
                                        : index === currentIndex
                                            ? 'bg-purple-600 text-white shadow-md ring-4 ring-purple-100'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {index < currentIndex ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <div className="mt-2">
                                    <span className={`text-xs font-medium ${index === currentIndex ? 'text-purple-600' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                                    <div
                                        className="h-full bg-purple-600 transition-all duration-300"
                                        style={{ width: index < currentIndex ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    // Show loading state while checking for existing form
    if (isLoadingDraft) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="text-white hover:text-white/80 cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white">Form Builder</h2>
                        <p className="text-white/80 text-xs">
                            {existingFormData ? 'Loading existing form...' : 'Creating new form...'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">
                    {existingFormData ? 'Loading form data...' : 'Checking for existing form...'}
                </span>
            </div>
        </div>
    );
}

    // Show form type selection if no form exists and we're in formType step
   if (publishStep === 'formType' && !existingFormData) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white hover:text-white/80 cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">Form Builder</h2>
                            <p className="text-white/80 text-xs">
                                Create registration form for {eventName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
                <FormTypeSelection
                    onFormTypeSelected={handleFormTypeSelected}
                    existingFormType={null}
                    isLoading={isCreatingForm}
                />
            </div>
        </div>
    );
}

    // If we don't have a form builder yet, show loading
    if (!formBuilder) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white hover:text-white/80 cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">Form Builder</h2>
                            <p className="text-white/80 text-xs">
                                Loading form...
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading form builder...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Form Builder Header */}
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white hover:text-white/80 cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">Form Builder</h2>
                            <p className="text-white/80 text-xs">
                                {publishStep === 'fields'
                                    ? `Create registration form for ${eventName} • ${formBuilder.formType} form`
                                    : publishStep === 'sections'
                                        ? 'Customize form appearance'
                                        : publishStep === 'email'
                                            ? 'Configure email template'
                                            : 'Configure payment settings'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                            <div className="text-white/80 text-xs">
                                Form Type: <span className="font-semibold text-white">{formBuilder.formType}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                            {previewMode ? (
                                <>
                                    <EyeOff size={14} />
                                    Edit Mode
                                </>
                            ) : (
                                <>
                                    <Eye size={14} />
                                    Preview
                                </>
                            )}
                        </button>
                        <div className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded">
                            {publishStep === 'fields'
                                ? `${formFields.length} field${formFields.length !== 1 ? 's' : ''}`
                                : publishStep === 'sections'
                                    ? `${formSections.filter(s => s.data.showSection !== false).length} visible sections`
                                    : publishStep === 'payment'
                                        ? 'Payment Setup'
                                        : 'Email Setup'
                            }
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            {isAutoSaving && (
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                                    <Loader size={12} className="animate-spin text-white" />
                                    <span className="text-white/90 text-xs">Saving...</span>
                                </div>
                            )}
                            {!isAutoSaving && lastSaved && (
                                <div className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">
                                    Saved: {lastSaved.toLocaleTimeString()}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setAutoSaveEnabled(!autoSaveEnabled);
                                    if (!autoSaveEnabled) {
                                        success('Auto-save enabled');
                                    } else {
                                        success('Auto-save disabled');
                                    }
                                }}
                                className={`px-2 py-1 rounded text-xs transition-colors ${autoSaveEnabled
                                    ? 'bg-green-500/30 text-white hover:bg-green-500/40'
                                    : 'bg-red-500/30 text-white/80 hover:bg-red-500/40'
                                    }`}
                                title={autoSaveEnabled ? 'Auto-save is on' : 'Auto-save is off'}
                            >
                                {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {previewMode ? (
                <div className="p-6 bg-gray-50 min-h-screen">
                    <div className="max-w-3xl mx-auto">
                        {renderCompletePreview()}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-280px)]">
                    {/* FIELDS MODE */}
                    {publishStep === 'fields' && (
                        <>
                            <div className="lg:w-1/6 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Grid size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Field Types</h3>
                                </div>
                                <div className="space-y-1">
                                    {fieldTypes.map((fieldType) => (
                                        <button
                                            key={fieldType.type}
                                            onClick={() => addField(fieldType.type)}
                                            className="w-full flex items-center gap-2 p-2 bg-white hover:bg-purple-50 border border-gray-200 rounded transition-all duration-200 hover:border-purple-300 hover:shadow-xs cursor-pointer text-left"
                                        >
                                            <div className="text-purple-600">
                                                {fieldType.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-gray-700 truncate">{fieldType.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Fields:</span>
                                            <span className="font-semibold">{formFields.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Required Fields:</span>
                                            <span className="font-semibold text-red-600">
                                                {formFields.filter(f => f.required).length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-2/6 border-r border-gray-200 bg-white p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Form Fields ({formFields.length})
                                    </h3>
                                </div>

                                {formFields.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Plus size={18} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">Add fields from the left panel</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {formFields.map((field, index) => {
                                            const isActive = activeFieldId === field.id;
                                            return (
                                                <div
                                                    key={field.id}
                                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isActive
                                                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setActiveFieldId(field.id)}
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={() => handleDrop(index)}
                                                >
                                                    <div className="text-gray-400 cursor-move">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={isActive ? 'text-purple-600' : 'text-gray-500'}>
                                                                {getFieldTypeIcon(field.type)}
                                                            </span>
                                                            <span className={`text-sm font-medium truncate ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
                                                                {field.label || 'Unnamed Field'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">
                                                                {fieldTypes.find(ft => ft.type === field.type)?.label || field.type}
                                                            </span>
                                                            {field.required && (
                                                                <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">
                                                            #{field.displayOrder}
                                                        </span>
                                                        {!((field.label.toLowerCase().includes('name') && field.type === 'text' && field.required) ||
                                                            (field.type === 'email' && field.required)) && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm('Are you sure you want to delete this field?')) {
                                                                            removeField(field.id);
                                                                        }
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Delete field"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="lg:w-3/6 bg-gray-50 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>{renderFieldEditor()}</div>
                                    <div>
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Eye size={14} className="text-gray-500" />
                                                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Live Preview</h3>
                                            </div>
                                            <div className="overflow-y-auto max-h-[400px]">
                                                {renderFormPreview()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SECTIONS MODE */}
                    {publishStep === 'sections' && (
                        <>
                            <div className="lg:w-1/4 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Layout size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Form Sections</h3>
                                </div>
                                <div className="space-y-1">
                                    {formSectionsConfig.map((section) => {
                                        const sectionData = formSections.find(s => s.type === section.type);
                                        return (
                                            <button
                                                key={section.type}
                                                onClick={() => setActiveSection(section.type)}
                                                className={`w-full flex items-center gap-2 p-3 border rounded-lg transition-all duration-200 cursor-pointer text-left ${activeSection === section.type
                                                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                                                    }`}
                                            >
                                                <div className={`${activeSection === section.type ? 'text-purple-600' : 'text-gray-500'}`}>
                                                    {section.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-700 truncate">{section.label}</div>
                                                    <div className="text-xs text-gray-500 truncate">{section.description}</div>
                                                </div>
                                                {section.required && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Required Sections:</span>
                                            <span className="font-semibold text-red-600">
                                                {formSections.filter(s => s.required).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Visible Sections:</span>
                                            <span className="font-semibold text-purple-600">
                                                {formSections.filter(s => s.data.showSection !== false).length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-2/4 border-r border-gray-200 bg-white p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Palette size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Editor Tool</h3>
                                </div>
                                {renderSectionEditor(formSections.find(s => s.type === activeSection))}
                            </div>

                            <div className="lg:w-2/4 bg-gray-50 p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                                {renderFormSectionsPreview()}
                            </div>
                        </>
                    )}

                    {/* EMAIL MODE - Inline like fields and sections */}
                    {publishStep === 'email' && formBuilder && (
                        <div className="p-6 bg-gray-50 min-h-[calc(100vh-280px)]">
                            <div className="max-w-6xl mx-auto">
                                <EmailTemplateEditorInline
                                    eventId={formBuilder?.eventId || eventId}
                                    eventName={eventName}
                                    notification={notification}
                                    onSaveComplete={() => { }}
                                />
                            </div>
                        </div>
                    )}

                    {/* PAYMENT MODE */}
                    {publishStep === 'payment' && (
                        <div className="p-6 bg-gray-50 min-h-[calc(100vh-280px)] flex justify-center">
                            <div className="w-full max-w-2xl">
                                <PaymentConfiguration
                                    formId={formBuilder?.formId}
                                    onPaymentSaved={handlePaymentSaved}
                                    notification={notification}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div className="text-xs text-gray-600">
                        {publishStep === 'fields' ? (
                            <div className="flex items-center gap-2">
                                <span>{formFields.length} field{formFields.length !== 1 ? 's' : ''}</span>
                                {formFields.some(f => f.required) && (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                        {formFields.filter(f => f.required).length} required
                                    </span>
                                )}
                                {formErrors.fields && (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                        {formErrors.fields}
                                    </span>
                                )}
                            </div>
                        ) : publishStep === 'sections' ? (
                            <div className="flex items-center gap-2">
                                <span>Customizing form design</span>
                                {Object.keys(sectionErrors).length > 0 && (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                        {Object.values(sectionErrors)[0]}
                                    </span>
                                )}
                            </div>
                        ) : publishStep === 'email' ? (
                            <span>Configure email notification template</span>
                        ) : publishStep === 'payment' ? (
                            <span>Set up payment collection (optional)</span>
                        ) : (
                            <span>Configure your form settings</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {publishStep !== 'formType' && (
                            <button
                                onClick={goToPreviousStep}
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                        >
                            <Save size={16} />
                            Save Draft
                        </button>
                        {publishStep === 'fields' && (
                            <button
                                onClick={handleFieldsNext}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 cursor-pointer"
                            >
                                Next: Design
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {publishStep === 'sections' && (
                            <button
                                onClick={handleDesignNext}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 cursor-pointer"
                            >
                                Next: Email
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {publishStep === 'email' && (
                            <button
                                onClick={handleEmailNext}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 cursor-pointer"
                            >
                                Next: Payment
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {publishStep === 'payment' && (
                            <button
                                onClick={handleFinalPublish}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white flex items-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Publish Form
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;