import React, { useState, useEffect, useRef } from 'react';
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
    Headphones,
    Link as LinkIcon,
    Globe,
    Building,
    Palette,
    Layout,
    Upload,
    Loader
} from 'lucide-react';
import axiosInstance from '../../../helper/AxiosInstance';

// Form Builder Class
class FormBuilderClass {
    constructor(eventId, formData = null) {
        this.eventId = eventId;
        this.formId = formData?.formId || null;
        this.version = formData?.version || 1;
        this.status = formData?.status || 'DRAFT';
        this.active = formData?.active || true;
        this.eventKey = formData?.eventKey || '';

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
        const defaultSections = this.getDefaultFormSections();

        return apiSections.map(section => {
            const defaultSection = defaultSections.find(s => s.type === section.type) || {};

            let sectionData = {};
            let dataJson = '{}';

            try {
                if (section.dataJson) {
                    sectionData = JSON.parse(section.dataJson);
                    dataJson = section.dataJson;
                } else {
                    sectionData = defaultSection.data || {};
                    dataJson = defaultSection.dataJson || '{}';
                }
            } catch (e) {
                console.error('Error parsing section dataJson:', e);
                sectionData = defaultSection.data || {};
                dataJson = defaultSection.dataJson || '{}';
            }

            return {
                type: section.type,
                displayOrder: section.displayOrder || defaultSection.displayOrder || 1,
                data: sectionData,
                dataJson: dataJson,
                required: defaultSection.required || false
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
                required: true
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
                required: true
            },
            {
                type: 'FORM_SPONSORS',
                displayOrder: 3,
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
                displayOrder: 4,
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
                displayOrder: 5,
                data: {
                    description: '',
                    showSection: true,
                    backgroundColor: '#F9FAFB'
                },
                required: false
            }
        ];

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

        // Create a truly unique ID
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

        // Check if we're trying to add another name or email field
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

        // Don't allow removing required name and email fields
        if ((field.label.toLowerCase().includes('name') && field.type === 'text' && field.required) ||
            (field.type === 'email' && field.required)) {
            throw new Error('Required Name and Email fields cannot be removed');
        }

        this.fields.splice(fieldIndex, 1);

        // Update displayOrder for remaining fields
        this.fields.forEach((field, index) => {
            field.displayOrder = index + 1;
        });

        return true;
    }

    updateField(fieldId, property, value) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];

        // Don't allow changing required name/email field types
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

        // Update fieldKey if label changed, but ONLY for custom fields
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

        // Update displayOrder
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

        const requiredSections = this.formSections.filter(section => section.required);

        requiredSections.forEach(section => {
            if (section.type === 'FORM_LOGO') {
                if (!section.data.logoUrl && section.data.showLogo) {
                    errors[section.type] = 'Logo is required';
                }
            }
        });

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
            formSections: sectionsData
        };
    }
}

const FormBuilder = ({ eventId, eventName, onClose, onSave, onDraftSaved, notification }) => {
    const [formBuilder, setFormBuilder] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [formSections, setFormSections] = useState([]);
    const [isLoadingDraft, setIsLoadingDraft] = useState(true);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [sectionErrors, setSectionErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [activeSection, setActiveSection] = useState('FORM_HEADER');
    const [publishStep, setPublishStep] = useState('fields');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadingSponsorLogos, setUploadingSponsorLogos] = useState({});

    const { success, error } = notification;

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
        { type: 'FORM_LOGO', label: 'Logo', icon: <Image size={14} />, description: 'Event/Organization logo', required: true },
        { type: 'FORM_SPONSORS', label: 'Sponsors', icon: <Building size={14} />, description: 'Sponsor logos', required: false },
        { type: 'FORM_RULES', label: 'Rules & Regulations', icon: <FileText size={14} />, description: 'Event rules and guidelines', required: false },
        { type: 'FORM_DESCRIPTION', label: 'Description', icon: <File size={14} />, description: 'Event description', required: false }
    ];

    // Debug effect to log field changes
    useEffect(() => {
        if (formFields.length > 0) {
            console.log('Current form fields:', formFields.map(f => ({
                id: f.id,
                label: f.label,
                type: f.type,
                displayOrder: f.displayOrder,
                isActive: f.id === activeFieldId
            })));
        }
    }, [formFields, activeFieldId]);

    // Sync formFields and formSections with formBuilder
    useEffect(() => {
        if (formBuilder) {
            setFormFields([...formBuilder.fields]);
            setFormSections([...formBuilder.formSections]);
            
            // Handle active field selection
            if (publishStep === 'fields') {
                if (formBuilder.fields.length > 0) {
                    // If there's an active field ID, verify it still exists
                    if (activeFieldId) {
                        const fieldExists = formBuilder.fields.some(f => f.id === activeFieldId);
                        if (!fieldExists) {
                            // Set to first field if active field no longer exists
                            setActiveFieldId(formBuilder.fields[0].id);
                        }
                    } else {
                        // No active field, set to first field
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

    // Load draft on component mount
    useEffect(() => {
        loadDraft();
    }, [eventId]);

    const loadDraft = async () => {
        try {
            setIsLoadingDraft(true);

            const draftResponse = await axiosInstance.post(`/form/event/${eventId}/draft`);

            let builder;

            if (draftResponse.data?.data) {
                const formData = draftResponse.data.data;
                builder = new FormBuilderClass(eventId, formData);

                if (builder.formId) {
                    try {
                        console.log('Fetching sections for form:', builder.formId);
                        const sectionsResponse = await axiosInstance.get(`/forms/${builder.formId}/sections`);

                        if (sectionsResponse.data?.status === 'success' && sectionsResponse.data?.data) {
                            const apiSections = sectionsResponse.data.data;
                            console.log('Loaded sections from API:', apiSections);
                            builder.formSections = builder.parseFormSections(apiSections);
                        }
                    } catch (sectionErr) {
                        console.error('Error fetching sections:', sectionErr);
                        builder.formSections = builder.getDefaultFormSections();
                    }
                }
            } else {
                builder = new FormBuilderClass(eventId);
            }

            setFormBuilder(builder);

            // Set active field if fields exist
            if (builder.fields.length > 0) {
                setActiveFieldId(builder.fields[0].id);
            }

            const logoSection = builder.formSections.find(s => s.type === 'FORM_LOGO');
            if (logoSection?.data?.logoUrl) {
                setLogoPreview(logoSection.data.logoUrl);
            }

            success('Draft loaded successfully');
        } catch (err) {
            console.error('Error loading draft:', err);

            if (err.response?.status === 404 || err.response?.data?.message?.includes('No draft found')) {
                const builder = new FormBuilderClass(eventId);
                setFormBuilder(builder);
                success('New form created');
            } else {
                error(err.response?.data?.message || 'Failed to load draft. Created new form instead.');
                const builder = new FormBuilderClass(eventId);
                setFormBuilder(builder);
            }
        } finally {
            setIsLoadingDraft(false);
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

            console.log('Logo upload response:', response.data);

            if (response.data && response.data.url && response.data.status === 'success') {
                const imageUrl = response.data.url;

                if (imageUrl) {
                    updateFormSection('FORM_LOGO', 'logoUrl', imageUrl);
                    const previewUrl = URL.createObjectURL(file);
                    setLogoPreview(previewUrl);
                    success('Logo uploaded successfully!');
                } else {
                    error('Failed to get image URL from response');
                }
            } else if (response.data && response.data.message) {
                if (response.data.data && response.data.data.url) {
                    const imageUrl = response.data.data.url;
                    updateFormSection('FORM_LOGO', 'logoUrl', imageUrl);
                    const previewUrl = URL.createObjectURL(file);
                    setLogoPreview(previewUrl);
                    success('Logo uploaded successfully!');
                } else {
                    error(response.data.message || 'Failed to upload logo');
                }
            } else {
                error('Failed to upload logo: Invalid response format');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            if (err.response) {
                console.error('Response error:', err.response.data);
                if (err.response.data && err.response.data.message) {
                    error(err.response.data.message);
                } else {
                    error('Failed to upload logo: Server error');
                }
            } else if (err.request) {
                console.error('No response received:', err.request);
                error('Failed to upload logo: No response from server');
            } else {
                console.error('Request setup error:', err.message);
                error('Failed to upload logo: ' + err.message);
            }
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

            const fieldTypeInfo = fieldTypes.find(ft => ft.type === fieldType);
            if (fieldTypeInfo) {
                success(`${fieldTypeInfo.label} field added`);
            }
        } catch (err) {
            error(err.message);
        }
    };

    const removeField = (fieldId) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const removed = newBuilder.removeField(fieldId);
            if (removed) {
                setFormBuilder(newBuilder);
                
                if (activeFieldId === fieldId) {
                    if (newBuilder.fields.length > 0) {
                        setActiveFieldId(newBuilder.fields[0].id);
                    } else {
                        setActiveFieldId(null);
                    }
                }
                success('Field removed');
            }
        } catch (err) {
            error(err.message);
        }
    };

    const updateField = (fieldId, property, value) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateField(fieldId, property, value);
            if (updated) {
                setFormBuilder(newBuilder);
            }
        } catch (err) {
            error(err.message);
        }
    };

    const updateFormSection = (sectionType, property, value) => {
        if (!formBuilder || publishStep !== 'sections') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateFormSection(sectionType, property, value);
            if (updated) {
                setFormBuilder(newBuilder);

                if (sectionType === 'FORM_LOGO' && property === 'logoUrl') {
                    if (value) {
                        setLogoPreview(value);
                    } else {
                        setLogoPreview(null);
                    }
                }
            }
        } catch (err) {
            error(err.message);
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
            }
        } catch (err) {
            error(err.message);
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
            }
        } catch (err) {
            error(err.message);
        }
    };

    const updateOptionInField = (fieldId, optionIndex, value) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateOption(fieldId, optionIndex, value);
            if (updated) {
                setFormBuilder(newBuilder);
            }
        } catch (err) {
            error(err.message);
        }
    };

    const removeOptionFromField = (fieldId, optionIndex) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const removed = newBuilder.removeOption(fieldId, optionIndex);
            if (removed) {
                setFormBuilder(newBuilder);
            }
        } catch (err) {
            error(err.message);
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

            console.log('Saving draft with fields payload:', fieldsPayload);

            if (formBuilder.formSections && formBuilder.formSections.length > 0) {
                console.log('Updating sections for draft form:', formBuilder.formId);

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

                console.log('Draft sections payload:', sectionsPayload);

                try {
                    await axiosInstance.put(
                        `/forms/${formBuilder.formId}/sections`,
                        sectionsPayload
                    );
                    console.log('Draft sections updated successfully');
                } catch (sectionError) {
                    console.error('Error updating sections for draft:', sectionError);
                    console.error('Section error response:', sectionError.response?.data);
                    console.warn('Section update failed, but continuing with draft save...');
                }
            } else {
                console.log('No sections to update for draft');
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
            console.error('Error details:', err.response?.data);
            console.error('Request payload sent:', err.config?.data);
            error(err.response?.data?.message || 'Failed to save draft');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublishClick = () => {
        if (!formBuilder) return;

        const validation = formBuilder.validate();
        setFormErrors(validation.errors);

        if (!validation.isValid) {
            return;
        }

        const updatedBuilder = formBuilder.clone();

        if (!updatedBuilder.formSections || updatedBuilder.formSections.length === 0) {
            updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
        }

        setFormBuilder(updatedBuilder);
        setFormSections([...updatedBuilder.formSections]);
        setFormFields([...updatedBuilder.fields]);
        setPublishStep('sections');

        if (updatedBuilder.formSections.length > 0) {
            setActiveSection(updatedBuilder.formSections[0].type);
        } else {
            setActiveSection('FORM_HEADER');
        }

        success('Fields saved successfully! Moving to form customization.');
    };

    const handlePublishForm = async () => {
        console.log('handlePublishForm called');
        console.log('formBuilder:', formBuilder);
        console.log('formBuilder.formId:', formBuilder?.formId);

        if (!validateFormSections() || !formBuilder) {
            return;
        }

        if (!formBuilder.formId) {
            console.log('No formId found');
            error('Form ID is required. Please save as draft first before publishing.');
            return;
        }

        const currentBuilder = formBuilder.clone();
        if (currentBuilder.fields.length === 0) {
            error('No fields found. Please add at least one field before publishing.');
            return;
        }

        console.log('Publishing form with fields:', currentBuilder.fields);
        console.log('Publishing form with sections:', currentBuilder.formSections);

        setIsSubmitting(true);
        try {
            const formData = currentBuilder.toApiFormat();

            console.log('Complete publish payload:', formData);

            if (currentBuilder.formSections && currentBuilder.formSections.length > 0) {
                console.log('Updating sections for form:', currentBuilder.formId);

                const sectionsPayload = currentBuilder.formSections.map(section => {
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

                console.log('Sections payload:', sectionsPayload);

                try {
                    await axiosInstance.put(
                        `/forms/${currentBuilder.formId}/sections`,
                        sectionsPayload
                    );
                    console.log('Sections updated successfully');
                } catch (sectionError) {
                    console.error('Error updating sections:', sectionError);
                    console.error('Section error response:', sectionError.response?.data);
                    console.warn('Section update failed, but continuing with publish...');
                }
            } else {
                console.log('No sections to update');
            }

            const response = await axiosInstance.post(
                `/form/${currentBuilder.formId}/publish`,
                formData
            );

            console.log('Publish response:', response.data);

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
            console.error('Error response:', err.response?.data);
            console.error('Request payload:', err.config?.data);
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
        
        console.log('Rendering field editor for:', { 
            activeFieldId, 
            fieldFound: !!field,
            fieldLabel: field?.label 
        });
        
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
        const logoSection = formSections.find(s => s.type === 'FORM_LOGO');
        const logoUrl = logoSection?.data?.logoUrl || '';

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Form Customization Preview</h2>

                <div className="space-y-6">
                    {formSections.map((section) => (
                        <div key={section.type} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getFormSectionIcon(section.type)}
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        {formSectionsConfig.find(s => s.type === section.type)?.label || section.type}
                                    </h3>
                                    {section.required && (
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                            Required
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600 flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={section.data.showSection !== false}
                                            onChange={(e) => updateFormSection(section.type, 'showSection', e.target.checked)}
                                            className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        Show
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {section.type === 'FORM_HEADER' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={section.data.title || ''}
                                                onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                                    className="w-full h-8 cursor-pointer"
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
                                                    className="w-full h-8 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {section.type === 'FORM_LOGO' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Logo
                                            </label>

                                            <div className="space-y-3">
                                                {(logoUrl || logoPreview) && (
                                                    <div className="mb-2">
                                                        <p className="text-xs text-gray-600 mb-1">Current Logo:</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                                                <img
                                                                    src={logoPreview || logoUrl}
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
                                                        id="logo-upload"
                                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                                        onChange={handleFileInputChange}
                                                        className="hidden"
                                                        disabled={uploadingLogo}
                                                    />
                                                    <label
                                                        htmlFor="logo-upload"
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
                                                                    {logoUrl || logoPreview ? 'Change Logo' : 'Upload Logo'}
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

                                                    <div className="mt-3">
                                                        <p className="text-xs text-gray-500 mb-1">Or enter logo URL:</p>
                                                        <input
                                                            type="text"
                                                            value={logoUrl || ''}
                                                            onChange={(e) => updateFormSection('FORM_LOGO', 'logoUrl', e.target.value)}
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                            placeholder="https://example.com/logo.png"
                                                        />
                                                    </div>
                                                </div>

                                                {sectionErrors[section.type] && (
                                                    <p className="text-xs text-red-600 mt-1">{sectionErrors[section.type]}</p>
                                                )}
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
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {section.type === 'FORM_SPONSORS' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Section Title
                                            </label>
                                            <input
                                                type="text"
                                                value={section.data.title || 'Our Sponsors'}
                                                onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Enter section title"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`show-tiers-${section.type}`}
                                                checked={section.data.showTiers || false}
                                                onChange={(e) => updateFormSection(section.type, 'showTiers', e.target.checked)}
                                                className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                            />
                                            <label htmlFor={`show-tiers-${section.type}`} className="ml-2 text-xs text-gray-700">
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

                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                {section.data.sponsors?.map((sponsor, sponsorIndex) => {
                                                    const isUploading = uploadingSponsorLogos[sponsor.id];

                                                    return (
                                                        <div key={sponsor.id} className="border border-gray-200 rounded-lg p-3 hover:border-purple-200 transition-colors">
                                                            <div className="flex items-start gap-3">
                                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                                    <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                                        {isUploading ? (
                                                                            <div className="w-full h-full flex items-center justify-center bg-purple-50">
                                                                                <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                                                                            </div>
                                                                        ) : sponsor.logoUrl ? (
                                                                            <img
                                                                                src={sponsor.logoUrl}
                                                                                alt={sponsor.name || 'Sponsor logo'}
                                                                                className="w-full h-full object-contain"
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Building className="w-6 h-6 text-gray-300" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {isUploading && (
                                                                        <div className="absolute inset-0 bg-purple-50 bg-opacity-90 rounded-lg flex items-center justify-center">
                                                                            <div className="text-center">
                                                                                <Loader className="w-4 h-4 text-purple-600 animate-spin mx-auto mb-1" />
                                                                                <span className="text-[10px] text-purple-600 font-medium">Uploading...</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        {!isUploading && (
                                                                            <>
                                                                                <input
                                                                                    type="file"
                                                                                    id={`sponsor-logo-${sponsor.id}`}
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
                                                                                    htmlFor={`sponsor-logo-${sponsor.id}`}
                                                                                    className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1 bg-purple-50 px-2 py-1 rounded"
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
                                                                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                                Remove Logo
                                                                            </button>
                                                                        )}

                                                                        {isUploading && (
                                                                            <span className="text-xs text-purple-600 flex items-center gap-1">
                                                                                <Loader className="w-3 h-3 animate-spin" />
                                                                                Uploading...
                                                                            </span>
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
                                                                        placeholder="Sponsor name (Optional)"
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

                                                                        if (uploadingSponsorLogos[sponsor.id]) {
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
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {section.data.sponsors?.length > 0 && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-xs font-medium text-gray-600">Live Preview:</p>
                                                    <p className="text-xs text-gray-400">
                                                        {section.data.sponsors.length} sponsor{section.data.sponsors.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div className={`grid grid-cols-${section.data.columns || 3} gap-4 p-4 bg-gray-50 rounded-lg`}>
                                                    {section.data.sponsors.map((sponsor) => (
                                                        <div key={sponsor.id} className="text-center group">
                                                            <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden bg-white mb-2 flex items-center justify-center p-3 hover:border-purple-300 transition-all">
                                                                {sponsor.logoUrl ? (
                                                                    <img
                                                                        src={sponsor.logoUrl}
                                                                        alt={sponsor.name}
                                                                        className="max-w-full max-h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <Building className="w-8 h-8 text-gray-300 mb-1" />
                                                                        <span className="text-[10px] text-gray-400">No logo</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {sponsor.name && (
                                                                <p className="text-xs font-medium text-gray-700 truncate group-hover:text-purple-600">
                                                                    {sponsor.name}
                                                                </p>
                                                            )}
                                                            {section.data.showTiers && sponsor.tier && (
                                                                <p className="text-[10px] text-gray-500 mt-0.5">{sponsor.tier}</p>
                                                            )}
                                                            {sponsor.website && (
                                                                <p className="text-[10px] text-purple-500 truncate mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {sponsor.website.replace(/^https?:\/\//, '')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {section.type === 'FORM_RULES' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Section Title
                                            </label>
                                            <input
                                                type="text"
                                                value={section.data.title || 'Rules & Regulations'}
                                                onChange={(e) => updateFormSection(section.type, 'title', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                                {section.data.rules?.map((rule, ruleIndex) => (
                                                    <div key={rule.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-2 hover:border-purple-200 transition-colors">
                                                        <div className="mt-3 flex-shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
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
                                                            placeholder="Enter rule (e.g., All participants must register before the deadline)"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedRules = section.data.rules.filter((_, idx) => idx !== ruleIndex);
                                                                updateFormSection(section.type, 'rules', updatedRules);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
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
                                                    className="w-full h-8 cursor-pointer"
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
                                                    className="w-full h-8 cursor-pointer"
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
                                                    className="w-full h-8 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`show-bullets-${section.type}`}
                                                    checked={section.data.showBullets !== false}
                                                    onChange={(e) => updateFormSection(section.type, 'showBullets', e.target.checked)}
                                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                                />
                                                <label htmlFor={`show-bullets-${section.type}`} className="ml-2 text-xs text-gray-700">
                                                    Show bullets
                                                </label>
                                            </div>
                                        </div>

                                        {section.data.rules?.length > 0 && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-xs font-medium text-gray-600">Live Preview:</p>
                                                    <p className="text-xs text-gray-400">
                                                        {section.data.rules.length} rule{section.data.rules.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div
                                                    className="p-4 rounded-lg"
                                                    style={{
                                                        backgroundColor: section.data.backgroundColor || '#F9FAFB',
                                                        color: section.data.textColor || '#374151'
                                                    }}
                                                >
                                                    <h3 className="text-sm font-semibold mb-3">{section.data.title || 'Rules & Regulations'}</h3>
                                                    <ul className="space-y-2">
                                                        {section.data.rules.map((rule, idx) => (
                                                            <li key={rule.id} className="flex items-start gap-2 text-xs">
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
                                            </div>
                                        )}
                                    </div>
                                )}

                                {section.type === 'FORM_DESCRIPTION' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={section.data.description || ''}
                                            onChange={(e) => updateFormSection(section.type, 'description', e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Enter form description 'Welcome to the biggest tech event of the year'"
                                        />
                                        <div className="mt-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Background Color
                                            </label>
                                            <input
                                                type="color"
                                                value={section.data.backgroundColor || '#F9FAFB'}
                                                onChange={(e) => updateFormSection(section.type, 'backgroundColor', e.target.value)}
                                                className="w-full h-8 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
                                Loading draft...
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading form draft...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Form Builder Header */}
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4">
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
                                {publishStep === 'fields'
                                    ? `Create registration form for ${eventName} • Drag to reorder fields`
                                    : 'Customize form appearance'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                            <div className={`flex items-center gap-1.5 ${publishStep === 'fields' ? 'text-white' : 'text-white/60'}`}>
                                <div className={`w-2 h-2 rounded-full ${publishStep === 'fields' ? 'bg-white' : 'bg-white/40'}`}></div>
                                <span className="text-xs font-medium">Fields</span>
                            </div>
                            <div className="w-4 h-px bg-white/40"></div>
                            <div className={`flex items-center gap-1.5 ${publishStep === 'sections' ? 'text-white' : 'text-white/60'}`}>
                                <div className={`w-2 h-2 rounded-full ${publishStep === 'sections' ? 'bg-white' : 'bg-white/40'}`}></div>
                                <span className="text-xs font-medium">Design</span>
                            </div>
                        </div>
                        {publishStep === 'fields' && (
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
                        )}
                        <div className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded">
                            {formFields.length} field{formFields.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {previewMode && publishStep === 'fields' ? (
                // Full Preview Mode
                <div className="p-6 bg-gray-50 min-h-screen">
                    <div className="max-w-2xl mx-auto">
                        {renderFormPreview()}
                    </div>
                </div>
            ) : (
                // Edit Mode
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
                    {/* Left Panel - Field Types or Form Sections */}
                    <div className="lg:w-1/6 border-r border-gray-200 bg-gray-50 p-4">
                        {publishStep === 'fields' ? (
                            <>
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
                            </>
                        ) : (
                            <>
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
                                                className={`w-full flex items-center gap-2 p-2 border rounded transition-all duration-200 cursor-pointer text-left ${activeSection === section.type
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                                                    }`}
                                            >
                                                <div className={`${activeSection === section.type ? 'text-purple-600' : 'text-gray-500'}`}>
                                                    {section.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-medium text-gray-700 truncate">{section.label}</div>
                                                    <div className="text-xs text-gray-500 truncate">{section.description}</div>
                                                </div>
                                                {section.required && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Stats */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-600 space-y-1">
                                {publishStep === 'fields' ? (
                                    <>
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
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle Panel - Fields List or Section Editor */}
                    <div className="lg:w-2/6 border-r border-gray-200 bg-white p-4">
                        {publishStep === 'fields' ? (
                            <>
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
                                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                                        isActive
                                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => {
                                                        console.log('Clicked field:', field.label, 'with ID:', field.id);
                                                        setActiveFieldId(field.id);
                                                    }}
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
                                                            <span className={`text-sm font-medium truncate ${
                                                                isActive ? 'text-purple-700' : 'text-gray-700'
                                                            }`}>
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
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <Palette size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Section Editor
                                    </h3>
                                </div>

                                {formSections.map((section) => (
                                    <div
                                        key={section.type}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors mb-2 ${activeSection === section.type
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setActiveSection(section.type)}
                                    >
                                        <div className="text-purple-600">
                                            {getFormSectionIcon(section.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-700 truncate">
                                                {formSectionsConfig.find(s => s.type === section.type)?.label || section.type}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {section.required ? 'Required' : 'Optional'}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            #{section.displayOrder}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Right Panel - Field Editor or Section Settings */}
                    <div className="lg:w-3/6 bg-gray-50 p-4">
                        <div className="grid grid-cols-1 gap-4 h-full">
                            {publishStep === 'fields' ? (
                                <>
                                    {/* Field Settings Panel */}
                                    <div>
                                        {renderFieldEditor()}
                                    </div>

                                    {/* Live Preview Panel */}
                                    <div className="flex-1">
                                        <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Eye size={14} className="text-gray-500" />
                                                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Live Preview</h3>
                                            </div>
                                            <div className="overflow-y-auto max-h-[400px]">
                                                {renderFormPreview()}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Section Settings Panel */}
                                    <div className="h-full">
                                        <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
                                            {renderFormSectionsPreview()}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center">
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
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Customizing form design</span>
                                {Object.keys(sectionErrors).length > 0 && (
                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                        {Object.values(sectionErrors)[0]}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {publishStep === 'sections' && (
                            <button
                                onClick={handleBackToFields}
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-3xl hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                            >
                                <ChevronLeft size={16} />
                                Back to Fields
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-3xl hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-purple-600 text-purple-600 font-semibold rounded-3xl hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer text-sm"
                        >
                            <Save size={16} />
                            Save Draft
                        </button>
                        {publishStep === 'fields' ? (
                            <button
                                onClick={handlePublishClick}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-3xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 cursor-pointer"
                            >
                                <Save size={16} />
                                Customize Form
                            </button>
                        ) : (
                            <button
                                onClick={handlePublishForm}
                                disabled={isSubmitting}
                                className={`px-6 py-2 rounded-3xl text-sm font-semibold ${
                                    isSubmitting
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                } text-white flex items-center gap-2 cursor-pointer`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                        Publishing
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
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