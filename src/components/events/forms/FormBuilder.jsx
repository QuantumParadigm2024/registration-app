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

        // Initialize fields with ALL fields from API, not just name and email
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

    // Update the parseFormSections method in FormBuilderClass
    parseFormSections(apiSections) {
        const defaultSections = this.getDefaultFormSections();

        return apiSections.map(section => {
            const defaultSection = defaultSections.find(s => s.type === section.type) || {};

            let sectionData = {};
            let dataJson = '{}';

            try {
                // Try to parse dataJson from API
                if (section.dataJson) {
                    sectionData = JSON.parse(section.dataJson);
                    dataJson = section.dataJson;
                } else {
                    // Use default data
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

    // Update the getDefaultFormSections method in FormBuilderClass
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
                    layout: 'grid'
                },
                required: false
            },
            {
                type: 'FORM_DESCRIPTION',
                displayOrder: 4,
                data: {
                    html: '',
                    showSection: true,
                    backgroundColor: '#F9FAFB'
                },
                required: false
            }
        ];

        // Add dataJson to each section
        return sections.map(section => ({
            ...section,
            dataJson: JSON.stringify(section.data)
        }));
    }

    // Get ALL fields from API response
    getAllFieldsFromApi(apiFields) {
        if (!apiFields || !Array.isArray(apiFields) || apiFields.length === 0) {
            return [];
        }

        return apiFields
            .map((field, index) => this.transformApiField(field, index + 1))
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    // Transform single API field
    transformApiField(field, displayOrder) {
        const typeMapping = {
            'TEXT': 'text',
            'textarea': 'TEXTAREA',
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

        // Create ID - for name/email fields, preserve formFieldId if exists
        let id = Date.now().toString();
        let formFieldId = null;

        // For name and email fields, preserve the formFieldId from backend
        if (field.fieldKey === 'name' || field.fieldKey === 'email') {
            if (field.formFieldId) {
                id = field.formFieldId.toString();
                formFieldId = field.formFieldId;
            }
        }

        return {
            id: id,
            formFieldId: formFieldId, // Only for name/email fields from backend
            type: typeMapping[field.fieldType] || field.fieldType?.toLowerCase() || 'text',
            label: field.label || '',
            placeholder: field.placeholder || '',
            required: field.required || false,
            options: field.optionsJson ? JSON.parse(field.optionsJson) : [],
            displayOrder: field.displayOrder || displayOrder,
            fieldKey: field.fieldKey // ALWAYS use fieldKey from backend
        };
    }

    // Create a copy of the instance
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

    // Generate field key from label
    generateFieldKey(label) {
        return label.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_+|_+$)/g, '')
            .substring(0, 50);
    }

    // Get default fields (ONLY name and email, NO textarea)
    getDefaultFields() {
        return [
            {
                id: 'name_field',
                type: 'text',
                label: 'Name',
                placeholder: 'Enter your full name',
                required: true,
                options: [],
                displayOrder: 1,
                fieldKey: 'name'
            },
            {
                id: 'email_field',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email address',
                required: true,
                options: [],
                displayOrder: 2,
                fieldKey: 'email'
            }
        ];
    }

    // Add a new field
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
            // Check if name field already exists (case-insensitive)
            const existingNameField = this.fields.find(f =>
                f.label.toLowerCase().includes('name') && f.type === 'text'
            );
            if (existingNameField) {
                throw new Error('A name field already exists');
            }
        } else if (fieldType === 'email') {
            // Check if email field already exists
            const existingEmailField = this.fields.find(f => f.type === 'email');
            if (existingEmailField) {
                throw new Error('An email field already exists');
            }
        }

        const newField = {
            id: `new_field_${Date.now()}`, // Clear string ID for new fields
            type: fieldType,
            label: config.label || fieldConfig.label,
            placeholder: config.placeholder || fieldConfig.placeholder,
            required: config.required || fieldConfig.required,
            options: [...(config.options || fieldConfig.options || [])],
            displayOrder: this.fields.length + 1,
            fieldKey: this.generateFieldKey(config.label || fieldConfig.label)
            // NO formFieldId for newly added fields
        };

        this.fields.push(newField);
        return newField;
    }

    // Remove a field
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

        // Don't allow changing required name/email field types (check by fieldKey)
        if ((field.fieldKey === 'name' && field.required) ||
            (field.fieldKey === 'email' && field.required)) {
            if (property === 'type') {
                throw new Error('Required Name and Email field types cannot be changed');
            }
            if (property === 'label') {
                // Don't allow changing label if it's a required name/email field
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

        // Update fieldKey if label changed, but ONLY for custom fields (not name/email)
        if (property === 'label' && field.fieldKey !== 'name' && field.fieldKey !== 'email') {
            this.fields[fieldIndex].fieldKey = this.generateFieldKey(value);
        }

        return true;
    }

    // Reorder fields
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

    // Add option to field
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

    // Update option in field
    updateOption(fieldId, optionIndex, value) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];
        if (!field.options || optionIndex >= field.options.length) return false;

        field.options[optionIndex] = value;
        return true;
    }

    // Remove option from field
    removeOption(fieldId, optionIndex) {
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex === -1) return false;

        const field = this.fields[fieldIndex];
        if (!field.options || optionIndex >= field.options.length) return false;

        field.options.splice(optionIndex, 1);
        return true;
    }

    // Update the updateFormSection method in FormBuilderClass
    updateFormSection(sectionType, property, value) {
        const sectionIndex = this.formSections.findIndex(s => s.type === sectionType);
        if (sectionIndex === -1) return false;

        // Update the data property
        this.formSections[sectionIndex].data[property] = value;

        // Update dataJson to always be a proper JSON string
        const updatedData = { ...this.formSections[sectionIndex].data };
        this.formSections[sectionIndex].dataJson = JSON.stringify(updatedData);

        return true;
    }

    // Update the validate method to be more specific
    validate() {
        const errors = {};

        // Check if we have at least one name field (text type with "name" in label OR fieldKey === 'name')
        const hasNameField = this.fields.some(field =>
            (field.label.toLowerCase().includes('name') && field.type === 'text') ||
            field.fieldKey === 'name'
        );

        const hasEmailField = this.fields.some(field =>
            field.type === 'email' || field.fieldKey === 'email'
        );

        if (!hasNameField) {
            errors.fields = 'Form must include at least one Name field (text type with "name" in label)';
        }
        if (!hasEmailField) {
            errors.fields = errors.fields
                ? errors.fields + ' and at least one Email field (email type)'
                : 'Form must include at least one Email field (email type)';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validate form sections
    validateFormSections() {
        const errors = {};

        // Check required sections
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

    // Update the toApiFormat method in FormBuilderClass
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
            // Check if this is a name or email field with formFieldId from backend
            const isNameOrEmailWithId = (field.fieldKey === 'name' || field.fieldKey === 'email') &&
                field.formFieldId &&
                !isNaN(field.formFieldId);

            // Create the field object
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

            // ONLY add formFieldId for name/email fields that have it from backend
            if (isNameOrEmailWithId) {
                fieldObj.formFieldId = parseInt(field.formFieldId);
            }

            return fieldObj;
        });

        // Format form sections exactly as backend expects
        const sectionsData = this.formSections.map(section => {
            // Ensure dataJson is properly formatted JSON string
            let dataJson = section.dataJson;

            // If dataJson is not a string or is empty, create it from data object
            if (!dataJson || typeof dataJson !== 'string') {
                dataJson = JSON.stringify(section.data || {});
            }

            // Parse and re-stringify to ensure valid JSON
            try {
                const parsedData = JSON.parse(dataJson);
                dataJson = JSON.stringify(parsedData);
            } catch (e) {
                // If parsing fails, use empty object
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
    const [publishStep, setPublishStep] = useState('fields'); // 'fields' or 'sections'
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

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
        { type: 'FORM_DESCRIPTION', label: 'Description', icon: <FileText size={14} />, description: 'Event description', required: false }
    ];

    // Sync formFields and formSections with formBuilder
    useEffect(() => {
        if (formBuilder) {
            setFormFields([...formBuilder.fields]);
            setFormSections([...formBuilder.formSections]);
            // Set first field as active if in fields step
            if (publishStep === 'fields' && formBuilder.fields.length > 0 && !activeFieldId) {
                setActiveFieldId(formBuilder.fields[0].id);
            }
        }
    }, [formBuilder]);

    // Cleanup logo preview URL on component unmount
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

    // Load draft form
    const loadDraft = async () => {
        try {
            setIsLoadingDraft(true);

            // First, get the form draft data (fields)
            const draftResponse = await axiosInstance.post(`/form/event/${eventId}/draft`);

            let builder;

            if (draftResponse.data?.data) {
                const formData = draftResponse.data.data;

                // Create builder with form data (fields only at this point)
                builder = new FormBuilderClass(eventId, formData);

                // NOW fetch sections separately if formId exists
                if (builder.formId) {
                    try {
                        console.log('Fetching sections for form:', builder.formId);
                        const sectionsResponse = await axiosInstance.get(`/forms/${builder.formId}/sections`);

                        if (sectionsResponse.data?.status === 'success' && sectionsResponse.data?.data) {
                            const apiSections = sectionsResponse.data.data;
                            console.log('Loaded sections from API:', apiSections);

                            // Parse and set the sections
                            builder.formSections = builder.parseFormSections(apiSections);
                        }
                    } catch (sectionErr) {
                        console.error('Error fetching sections:', sectionErr);
                        // If sections fetch fails, use default sections
                        builder.formSections = builder.getDefaultFormSections();
                    }
                }
            } else {
                // No draft exists, create new form with default fields and sections
                builder = new FormBuilderClass(eventId);
            }

            setFormBuilder(builder);

            // Set active field if fields exist
            if (builder.fields.length > 0) {
                setActiveFieldId(builder.fields[0].id);
            }

            // Set logo preview if logo exists
            const logoSection = builder.formSections.find(s => s.type === 'FORM_LOGO');
            if (logoSection?.data?.logoUrl) {
                setLogoPreview(logoSection.data.logoUrl);
            }

            success('Draft loaded successfully');
        } catch (err) {
            console.error('Error loading draft:', err);

            // If 404 or no draft found, create new form
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

    // Handle logo file upload
    const handleLogoUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            error('Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
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

            console.log('Logo upload response:', response.data); // For debugging

            if (response.data && response.data.url && response.data.status === 'success') {
                // Get the image URL from response (direct from response.data.url)
                const imageUrl = response.data.url;

                if (imageUrl) {
                    // Update the form section with the new logo URL
                    updateFormSection('FORM_LOGO', 'logoUrl', imageUrl);

                    // Create preview URL
                    const previewUrl = URL.createObjectURL(file);
                    setLogoPreview(previewUrl);

                    success('Logo uploaded successfully!');
                } else {
                    error('Failed to get image URL from response');
                }
            } else if (response.data && response.data.message) {
                // Handle other response formats
                if (response.data.data && response.data.data.url) {
                    // If URL is inside data.data.url
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
            // More detailed error logging
            if (err.response) {
                console.error('Response error:', err.response.data);
                console.error('Response status:', err.response.status);
                console.error('Response headers:', err.response.headers);

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

    // Handle file input change
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleLogoUpload(file);
        }
        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    // Add field to form
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

    // Remove field from form
    const removeField = (fieldId) => {
        if (!formBuilder || publishStep !== 'fields') return;

        try {
            const newBuilder = formBuilder.clone();
            const removed = newBuilder.removeField(fieldId);
            if (removed) {
                setFormBuilder(newBuilder);
                if (activeFieldId === fieldId && newBuilder.fields.length > 0) {
                    setActiveFieldId(newBuilder.fields[0].id);
                } else if (newBuilder.fields.length === 0) {
                    setActiveFieldId(null);
                }
                success('Field removed');
            }
        } catch (err) {
            error(err.message);
        }
    };

    // Update field property
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

    // Update form section property
    const updateFormSection = (sectionType, property, value) => {
        if (!formBuilder || publishStep !== 'sections') return;

        try {
            const newBuilder = formBuilder.clone();
            const updated = newBuilder.updateFormSection(sectionType, property, value);
            if (updated) {
                setFormBuilder(newBuilder);

                // Update logo preview if logoUrl was changed
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

    // Drag and drop functionality for fields
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

    // Drag and drop for logo upload
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

    // Add option to field
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

    // Update option in field
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

    // Remove option from field
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

    // Validate form fields
    const validateForm = () => {
        if (!formBuilder) return false;

        const validation = formBuilder.validate();
        setFormErrors(validation.errors);
        return validation.isValid;
    };

    // Validate form sections
    const validateFormSections = () => {
        if (!formBuilder) return false;

        const validation = formBuilder.validateFormSections();
        setSectionErrors(validation.errors);
        return validation.isValid;
    };

    const handleSaveDraft = async () => {
        if (!formBuilder) return;

        // formId must exist for this endpoint to work
        if (!formBuilder.formId) {
            error('Form ID is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = formBuilder.toApiFormat();

            // BACKEND EXPECTS ONLY THE FIELDS ARRAY AS THE REQUEST BODY
            const fieldsPayload = formData.fields;

            console.log('Saving draft with fields payload:', fieldsPayload);

            // FIRST: Save form sections if they exist
            if (formBuilder.formSections && formBuilder.formSections.length > 0) {
                console.log('Updating sections for draft form:', formBuilder.formId);

                // Prepare sections payload according to your API format
                const sectionsPayload = formBuilder.formSections.map(section => {
                    // Ensure dataJson is properly stringified if it's an object
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

                // Sort by displayOrder if needed
                sectionsPayload.sort((a, b) => a.displayOrder - b.displayOrder);

                console.log('Draft sections payload:', sectionsPayload);

                try {
                    await axiosInstance.put(
                        `/forms/${formBuilder.formId}/sections`,
                        sectionsPayload  // Direct array payload
                    );
                    console.log('Draft sections updated successfully');
                } catch (sectionError) {
                    console.error('Error updating sections for draft:', sectionError);
                    console.error('Section error response:', sectionError.response?.data);
                    // Don't block draft saving if sections fail
                    console.warn('Section update failed, but continuing with draft save...');
                }
            } else {
                console.log('No sections to update for draft');
            }

            // SECOND: Save the form draft (fields only)
            const response = await axiosInstance.put(
                `/form/${formBuilder.formId}/draft`,
                fieldsPayload  // Send the array directly
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

    // Handle publish - show form sections
    const handlePublishClick = () => {
        if (!formBuilder) return;

        // Validate fields
        const validation = formBuilder.validate();
        setFormErrors(validation.errors);

        if (!validation.isValid) {
            return;
        }

        // CRITICAL FIX: Get a fresh clone and ensure formSections are properly set
        const updatedBuilder = formBuilder.clone();

        // Ensure formSections exist and are properly initialized
        if (!updatedBuilder.formSections || updatedBuilder.formSections.length === 0) {
            updatedBuilder.formSections = updatedBuilder.getDefaultFormSections();
        }

        // Force update the builder state
        setFormBuilder(updatedBuilder);

        // CRITICAL FIX: Explicitly set formSections state from the updated builder
        setFormSections([...updatedBuilder.formSections]);
        setFormFields([...updatedBuilder.fields]);

        // Move to form sections step
        setPublishStep('sections');

        // Set active section to first available section
        if (updatedBuilder.formSections.length > 0) {
            setActiveSection(updatedBuilder.formSections[0].type);
        } else {
            setActiveSection('FORM_HEADER');
        }

        success('Fields saved successfully! Moving to form customization.');
    };

    const handlePublishForm = async () => {
        if (!validateFormSections() || !formBuilder) {
            return;
        }

        // formId must exist for publishing
        if (!formBuilder.formId) {
            error('Form ID is required. Please save as draft first before publishing.');
            return;
        }

        // Double-check we have the latest fields
        const currentBuilder = formBuilder.clone();
        if (currentBuilder.fields.length === 0) {
            error('No fields found. Please add at least one field before publishing.');
            return;
        }

        // Log what we're about to send
        console.log('Publishing form with fields:', currentBuilder.fields);
        console.log('Publishing form with sections:', currentBuilder.formSections);

        setIsSubmitting(true);
        try {
            const formData = currentBuilder.toApiFormat();

            // Log the complete payload
            console.log('Complete publish payload:', formData);

            // FIRST: Update sections using the PUT endpoint
            if (currentBuilder.formSections && currentBuilder.formSections.length > 0) {
                console.log('Updating sections for form:', currentBuilder.formId);

                // Prepare sections payload according to your API format
                const sectionsPayload = currentBuilder.formSections.map(section => {
                    // Ensure dataJson is properly stringified if it's an object
                    let dataJson = section.dataJson;
                    if (dataJson && typeof dataJson === 'object') {
                        dataJson = JSON.stringify(dataJson);
                    }

                    return {
                        type: section.type,
                        displayOrder: section.displayOrder || section.order || 0, // Use appropriate property
                        dataJson: dataJson
                    };
                });

                // Sort by displayOrder if needed
                sectionsPayload.sort((a, b) => a.displayOrder - b.displayOrder);

                console.log('Sections payload:', sectionsPayload);

                try {
                    await axiosInstance.put(
                        `/forms/${currentBuilder.formId}/sections`,
                        sectionsPayload  // Direct array payload as shown in your example
                    );
                    console.log('Sections updated successfully');
                } catch (sectionError) {
                    console.error('Error updating sections:', sectionError);
                    console.error('Section error response:', sectionError.response?.data);
                    // You might want to decide whether to continue or stop here
                    // For now, we'll continue with publishing but log the error
                    console.warn('Section update failed, but continuing with publish...');
                }
            } else {
                console.log('No sections to update');
            }

            // SECOND: Publish the form
            const response = await axiosInstance.post(
                `/form/${currentBuilder.formId}/publish`,
                formData
            );

            console.log('Publish response:', response.data);

            if (response.data) {
                success('Form published successfully!');

                // Call onSave with the response data (which contains eventKey)
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

    // Go back to fields step
    const handleBackToFields = () => {
        setPublishStep('fields');
        if (formBuilder.fields.length > 0) {
            setActiveFieldId(formBuilder.fields[0].id);
        }
    };

    // Field type icons
    const getFieldTypeIcon = (type) => {
        const fieldType = fieldTypes.find(ft => ft.type === type);
        return fieldType ? fieldType.icon : <Text size={14} />;
    };

    // Form section icons
    const getFormSectionIcon = (type) => {
        const section = formSectionsConfig.find(s => s.type === type);
        return section ? section.icon : <Layout size={14} />;
    };

    // Render field input based on type (for preview)
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

    // Render form sections preview
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

                                            {/* Logo Upload Area */}
                                            <div className="space-y-3">
                                                {/* Current Logo Preview */}
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

                                                {/* File Upload Input */}
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

                                                    {/* Manual URL input as fallback */}
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
                                    <div className="text-center py-4">
                                        <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500">Sponsor logos configuration</p>
                                        <p className="text-xs text-gray-400 mt-1">Coming soon...</p>
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

    // Render field editor
    const renderFieldEditor = () => {
        const field = formFields.find(f => f.id === activeFieldId);
        if (!field) return null;

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-600">
                            {getFieldTypeIcon(field.type)}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-700">Field Settings</h3>
                    </div>
                    {!(field.label.toLowerCase().includes('name') && field.type === 'text') &&
                        field.type !== 'email' && (
                            <button
                                onClick={() => removeField(field.id)}
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
                            disabled={(field.label.toLowerCase().includes('name') && field.type === 'text') || field.type === 'email'}
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
                            disabled={(field.label.toLowerCase().includes('name') && field.type === 'text') || field.type === 'email'}
                        />
                        <label htmlFor={`required-${field.id}`} className="ml-2 text-xs text-gray-700">
                            Required
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    // Render form preview
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
                                        {formFields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${activeFieldId === field.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
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
                                                        <span className="text-purple-600">
                                                            {getFieldTypeIcon(field.type)}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700 truncate">
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
                                                <div className="text-xs text-gray-400">
                                                    #{field.displayOrder}
                                                </div>
                                            </div>
                                        ))}
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
                                        {activeFieldId ? (
                                            renderFieldEditor()
                                        ) : (
                                            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-gray-800 mb-2">Select a Field</h3>
                                                <p className="text-xs text-gray-500">Click on a field from the list to edit its settings</p>
                                            </div>
                                        )}
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
                                className={`px-6 py-2 rounded-3xl text-sm font-semibold ${isSubmitting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'} text-white flex items-center gap-2 cursor-pointer`}
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