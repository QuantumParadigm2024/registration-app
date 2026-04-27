import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../../contestAPI/NotificationProvider';
import {
    ChevronLeft,
    Users,
    FileText,
    Plus,
    Trash2,
    Edit,
    Calendar,
    MapPin,
    User,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Clock,
    Eye,
    Share2,
    Copy,
    ExternalLink,
    Activity,
    AlertCircle,
    Building,
    Mail,
    Phone,
    Globe,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    X,
    MoreVertical,
    Archive,
    Send,
    Sparkles,
    Layers,
    TrendingUp,
    Shield,
    Zap,
    Gift,
    BarChart3,
    FormInput,
    Ticket,
    Target
} from 'lucide-react';
import axiosInstance from '../../helper/AxiosInstance';
import { useSelector } from 'react-redux';
import FormBuilder from './forms/FormBuilder';
import FormPreview from './forms/FormPreview';
import EventRegistrations from './registrations/EventRegistrations';

const ManageEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [registrationForm, setRegistrationForm] = useState(null);
    const [draftForms, setDraftForms] = useState([]);
    const [showFormPreview, setShowFormPreview] = useState(false);
    const [formToPreview, setFormToPreview] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [formLink, setFormLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [draftFormData, setDraftFormData] = useState(null);
    const [formsByType, setFormsByType] = useState({});
    const [allPublishedForms, setAllPublishedForms] = useState([]);
    const [allDraftForms, setAllDraftForms] = useState([]);
    const [activeTab, setActiveTab] = useState('forms');
    const [isEditingDraft, setIsEditingDraft] = useState(false);

    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
    const [selectedFormType, setSelectedFormType] = useState(null);
    const [isCreatingDraft, setIsCreatingDraft] = useState(false);

    const previewModalRef = useRef(null);
    const shareModalRef = useRef(null);
    const editConfirmModalRef = useRef(null);

    const { success, error } = useNotification();
    const currentUser = useSelector((state) => state.user.user);

    const getBackButtonConfig = () => {
        const userRole = currentUser?.platformRole || currentUser?.highestEventRole;
        if (userRole === "ROLE_SUPER_ADMIN") {
            return { text: "Back to Events", route: "/create-event" };
        } else {
            return { text: "Back to Events", route: "/events" };
        }
    };

    useEffect(() => {
        if (location.state?.eventData) {
            setEvent(location.state.eventData);
            setIsLoading(false);
            if (location.state.eventData.assignedUsers) {
                setAssignedUsers(location.state.eventData.assignedUsers);
            }
        } else {
            fetchEventFromList();
        }
    }, [location.state, eventId]);

    useEffect(() => {
        if (eventId) {
            fetchForms();
        }
    }, [eventId, showCreateForm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFormPreview && previewModalRef.current && !previewModalRef.current.contains(event.target)) {
                setShowFormPreview(false);
                setFormToPreview(null);
            }
            if (showShareModal && shareModalRef.current && !shareModalRef.current.contains(event.target)) {
                setShowShareModal(false);
                setFormLink('');
                setCopied(false);
            }
            if (showEditConfirmModal && editConfirmModalRef.current && !editConfirmModalRef.current.contains(event.target)) {
                setShowEditConfirmModal(false);
                setSelectedFormType(null);
            }
        };

        if (showFormPreview || showShareModal || showEditConfirmModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFormPreview, showShareModal, showEditConfirmModal]);

    const generateFormLink = (formId, eventKey) => {
        if (eventKey) {
            try {
                const eventName = getEventName();
                let urlEventName = 'event';
                if (eventName && eventName !== 'Unnamed Event') {
                    urlEventName = eventName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);
                }
                if (!urlEventName || urlEventName.length === 0) {
                    urlEventName = 'event';
                }
                return `${window.location.origin}/register/${eventKey}`;
            } catch (error) {
                console.error('Error generating form link:', error);
                return `${window.location.origin}/register/${eventKey}`;
            }
        }
        return '';
    };

    const handleformLink = async (form) => {
    try {
        // Make the API call to get the form key
        const response = await axiosInstance.get(`/form/${form.formId}/key`);
        
        if (response.data && response.data.formKey) {
            const formKey = response.data.formKey;
            
            // Generate the share link using the form key
            const eventName = getEventName();
            let urlEventName = 'event';
            if (eventName && eventName !== 'Unnamed Event') {
                urlEventName = eventName.toLowerCase().trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .substring(0, 50);
            }
            if (!urlEventName || urlEventName.length === 0) {
                urlEventName = 'event';
            }
            
            const link = `${window.location.origin}/register/${formKey}`;
            return link;
        }
        return '';
    } catch (err) {
        console.error('Failed to get form key:', err);
        error('Failed to get form link');
        return '';
    }
};

    const handlePreviewForm = async (form) => {
        try {
            let formData = form;
            if (form.formId && !form.fields) {
                const response = await axiosInstance.get(`/form/${form.formId}`);
                if (response.data) {
                    formData = response.data.data || response.data;
                }
                if (formData.status === 'PUBLISHED' || formData.status === 'published' ||
                    formData.status === 'DRAFT' || formData.status === 'draft') {
                    try {
                        const sectionsResponse = await axiosInstance.get(`/forms/${form.formId}/sections`);
                        if (sectionsResponse.data && sectionsResponse.data.status === 'success') {
                            formData.formSections = sectionsResponse.data.data || [];
                        }
                    } catch (sectionsErr) {
                        console.error('Error fetching form sections:', sectionsErr);
                        formData.formSections = [];
                    }
                }
            }
            setFormToPreview(formData);
            setShowFormPreview(true);
        } catch (err) {
            console.error('Error fetching form details for preview:', err);
            error('Failed to load form for preview');
        }
    };

   const handleShareForm = async (form) => {
    try {
        const link = await handleformLink(form);
        if (link) {
            setFormLink(link);
            setShowShareModal(true);
        } else {
            error('Failed to generate share link');
        }
    } catch (err) {
        console.error('Error generating share link:', err);
        error('Failed to generate share link');
    }
};

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formLink)
            .then(() => {
                setCopied(true);
                success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                error('Failed to copy link');
            });
    };

    const openFormInNewTab = () => {
        window.open(formLink, '_blank');
    };

    const closePreviewModal = () => {
        setShowFormPreview(false);
        setFormToPreview(null);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setFormLink('');
        setCopied(false);
    };

    const createDraftFromPublishedForm = async (formType) => {
        setIsCreatingDraft(true);
        try {
            const response = await axiosInstance.post(`/form/event/${eventId}/draft?formType=${formType}`);
            if (response.data && response.data.status === 'success') {
                success(`New draft version created successfully for ${formType} form!`);
                await fetchForms();
                const updatedFormsByType = { ...formsByType };
                const formsOfType = updatedFormsByType[formType] || [];
                const newDraft = formsOfType.find(f => f.status === 'DRAFT' || f.status === 'draft');
                if (newDraft) {
                    await handleEditDraft(newDraft.formId, true);
                } else {
                    setShowCreateForm(true);
                    setDraftFormData(null);
                    setIsEditingDraft(false);
                }
                setShowEditConfirmModal(false);
                setSelectedFormType(null);
            } else {
                error('Failed to create draft version');
            }
        } catch (err) {
            console.error('Error creating draft from published form:', err);
            error(err.response?.data?.message || 'Failed to create draft version');
        } finally {
            setIsCreatingDraft(false);
        }
    };

    const handleEditPublishedFormClick = (formType) => {
        setSelectedFormType(formType);
        setShowEditConfirmModal(true);
    };

    const fetchForms = async () => {
        try {
            const versionsResponse = await axiosInstance.get(`/form/event/${eventId}/forms`);
            let publishedFormsList = [];
            let draftFormsList = [];
            let groupedForms = {};

            if (versionsResponse.data && versionsResponse.data.status === 'success') {
                const formsByTypeData = versionsResponse.data.data || {};
                groupedForms = formsByTypeData;

                Object.keys(formsByTypeData).forEach(formType => {
                    const forms = formsByTypeData[formType];
                    const publishedForm = forms.find(form => form.status === 'PUBLISHED' || form.status === 'published');
                    if (publishedForm) {
                        publishedFormsList.push({ ...publishedForm, formTypeDisplay: formType });
                    }
                    const drafts = forms.filter(form => form.status === 'DRAFT' || form.status === 'draft').map(draft => ({ ...draft, formTypeDisplay: formType }));
                    drafts.sort((a, b) => {
                        if (a.version && b.version) return b.version - a.version;
                        return (b.formId || b.id) - (a.formId || a.id);
                    });
                    draftFormsList.push(...drafts);
                });

                publishedFormsList.sort((a, b) => (b.formId || b.id) - (a.formId || a.id));
                draftFormsList.sort((a, b) => {
                    if (a.version && b.version) return b.version - a.version;
                    return (b.formId || b.id) - (a.formId || a.id);
                });
            }

            setFormsByType(groupedForms);
            setAllPublishedForms(publishedFormsList);
            setAllDraftForms(draftFormsList);
            setRegistrationForm(publishedFormsList.length > 0 ? publishedFormsList[0] : null);
            setDraftForms(draftFormsList);
        } catch (err) {
            console.error('Error fetching forms:', err);
            if (err.response && err.response.status === 404) {
                setFormsByType({});
                setAllPublishedForms([]);
                setAllDraftForms([]);
                setRegistrationForm(null);
                setDraftForms([]);
            } else {
                error('Failed to load forms');
            }
        }
    };

    const handleFormSave = (formData) => {
        if (formData.eventKey) {
            success(`Form published successfully! Event Key: ${formData.eventKey}`);
        } else if (formData.message && formData.message.includes('published')) {
            success('Form published successfully!');
        } else {
            success('Form saved successfully!');
        }
        setShowCreateForm(false);
        setDraftFormData(null);
        setIsEditingDraft(false);
        fetchForms();
    };

    const handleDraftSaved = () => {
        success('Draft saved successfully!');
        setShowCreateForm(false);
        setDraftFormData(null);
        setIsEditingDraft(false);
        fetchForms();
    };

    const handleEditDraft = async (draftId, isFromPublished = false) => {
        try {
            const response = await axiosInstance.get(`/form/${draftId}`);
            let formData = response.data;
            if (response.data.data) {
                formData = response.data.data;
            }
            try {
                const sectionsResponse = await axiosInstance.get(`/forms/${draftId}/sections`);
                if (sectionsResponse.data && sectionsResponse.data.status === 'success') {
                    formData.formSections = sectionsResponse.data.data || [];
                }
            } catch (sectionsErr) {
                console.error('Error fetching form sections for draft:', sectionsErr);
                formData.formSections = [];
            }
            
            // Check if this draft is derived from a published form
            // If it has a published version in the same form type, then it's an edit of published form
            const formType = formData.formType || formData.formTypeDisplay;
            if (formType && formsByType[formType]) {
                const hasPublishedVersion = formsByType[formType].some(f => f.status === 'PUBLISHED' || f.status === 'published');
                if (hasPublishedVersion || isFromPublished) {
                    setIsEditingDraft(true);
                } else {
                    setIsEditingDraft(false);
                }
            } else {
                setIsEditingDraft(false);
            }
            
            setDraftFormData(formData);
            setShowCreateForm(true);
        } catch (err) {
            console.error('Error fetching draft form:', err);
            error('Failed to load draft form');
        }
    };

    const handleFormBuilderCancel = () => {
        setShowCreateForm(false);
        setDraftFormData(null);
        setIsEditingDraft(false);
        fetchForms();
    };

    const fetchEventFromList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("/admin/events");
            let eventsList = [];
            if (response.data && Array.isArray(response.data.data)) {
                eventsList = response.data.data;
            } else if (Array.isArray(response.data)) {
                eventsList = response.data;
            } else if (response.data && response.data.events) {
                eventsList = response.data.events;
            }
            const foundEvent = eventsList.find(e => (e.eventId && e.eventId.toString() === eventId) || (e.id && e.id.toString() === eventId));
            if (foundEvent) {
                setEvent(foundEvent);
                if (foundEvent.assignedUsers) {
                    setAssignedUsers(foundEvent.assignedUsers);
                }
            } else {
                error('Event not found');
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching event from list:', err);
            error('Failed to load event details');
            setIsLoading(false);
        }
    };

    const handleTrackEvent = () => {
        navigate(`/track-event/${eventId}`, { state: { eventData: event } });
    };

    const getEventName = () => event?.name || event?.eventName || 'Unnamed Event';
    const getEventLogo = () => event?.logo || event?.logoUrl || null;
    const getEventDescription = () => event?.description || event?.Description || '';
    const getEventLocation = () => event?.location || '';
    const getCreatedByInfo = () => {
        if (event?.createdBy) {
            return { name: event.createdBy.name || 'System Admin', email: event.createdBy.email || 'admin@quantumparadigm.in' };
        }
        return { name: 'System Admin', email: 'admin@quantumparadigm.in' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const backButtonConfig = getBackButtonConfig();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
                    </div>
                    <p className="mt-4 text-gray-500">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h3>
                    <p className="text-gray-500 mb-6">The event you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header Bar */}
                <div className={`${showCreateForm ? 'bg-white border-b border-gray-200' : 'bg-gradient-to-r from-purple-500 to-pink-500 p-4'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate(backButtonConfig.route)}
                                className={`flex items-center text-sm transition-colors ${showCreateForm
                                    ? 'text-gray-500 hover:text-gray-700'
                                    : 'text-white/90 hover:text-white'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                {backButtonConfig.text}
                            </button>
                            <button
                                onClick={handleTrackEvent}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${showCreateForm
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:from-purple-600 hover:to-pink-600'
                                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                                    }`}
                            >
                                <Target size={16} />
                                Tracking
                            </button>
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                            {getEventLogo() && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={getEventLogo()}
                                        alt={getEventName()}
                                        className="max-w-12 max-h-12 w-auto h-auto rounded-lg object-contain shadow-md"
                                        style={{
                                            maxWidth: '48px',
                                            maxHeight: '48px',
                                            width: 'auto',
                                            height: 'auto'
                                        }}
                                    />
                                </div>
                            )}
                            <div>
                                <h1 className={`text-2xl font-bold ${showCreateForm ? 'text-gray-900' : 'text-white'}`}>
                                    {getEventName()}
                                </h1>
                                <p className={`text-sm mt-1 ${showCreateForm ? 'text-gray-500' : 'text-white/80'}`}>
                                    {showCreateForm ? 'Continue building your form' : 'Manage your event forms and settings'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('forms')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'forms'
                                    ? 'text-gray-800 border-b-2 border-gray-800'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FormInput size={16} />
                                    Registration Forms
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'details'
                                    ? 'text-gray-800 border-b-2 border-gray-800'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Building size={16} />
                                    Event Details
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('registrations')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'registrations'
                                    ? 'text-gray-800 border-b-2 border-gray-800'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Ticket size={16} />
                                    Registrations
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Forms Tab */}
                    {activeTab === 'forms' && (
                        showCreateForm ? (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <FormBuilder
                                    eventId={eventId}
                                    eventName={getEventName()}
                                    onClose={handleFormBuilderCancel}
                                    onSave={handleFormSave}
                                    onDraftSaved={handleDraftSaved}
                                    notification={{ success, error }}
                                    initialFormData={draftFormData}
                                    existingFormData={draftFormData}
                                    isNewForm={!isEditingDraft && !draftFormData?.formId}
                                    isEditingDraft={isEditingDraft}
                                />
                            </div>
                        ) : (
                            <div>
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Form Types</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(formsByType).length}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Different registration forms</p>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Published Forms</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{allPublishedForms.length}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Currently live</p>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">Draft Forms</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{allDraftForms.length}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">In progress</p>
                                    </div>
                                </div>

                                {/* Create Form CTA */}
                                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Gift className="w-5 h-5 text-gray-600" />
                                                <h2 className="text-lg font-semibold text-gray-800">Ready to create a new form?</h2>
                                            </div>
                                            <p className="text-gray-600 text-sm">Design custom registration forms to collect attendee information, preferences, and more.</p>
                                        </div>
                                        <button
                                            onClick={() => { setDraftFormData(null); setShowCreateForm(true); setIsEditingDraft(false); }}
                                            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Plus size={18} />
                                            Create New Form
                                        </button>
                                    </div>
                                </div>

                                {/* Forms Grid */}
                                {Object.keys(formsByType).length === 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText size="32" className="text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">No forms created yet</h3>
                                        <p className="text-gray-500 text-sm mb-5">Get started by creating your first registration form.</p>
                                        <button
                                            onClick={() => { setDraftFormData(null); setShowCreateForm(true); setIsEditingDraft(false); }}
                                            className="px-5 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Create First Form
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.keys(formsByType).map((formType) => {
                                            const forms = formsByType[formType];
                                            const publishedForm = forms.find(f => f.status === 'PUBLISHED' || f.status === 'published');
                                            const draftFormsForType = forms.filter(f => f.status === 'DRAFT' || f.status === 'draft');

                                            return (
                                                <div key={formType} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                                                    {/* Card Header */}
                                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                                                                    <FileText size={18} className="text-gray-700" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-gray-800">{formType}</h3>
                                                                    {publishedForm && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">Version {publishedForm.version}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {!publishedForm && draftFormsForType.length === 0 && (
                                                                <button
                                                                    onClick={() => { setDraftFormData({ formType: formType }); setShowCreateForm(true); setIsEditingDraft(false); }}
                                                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                                                                >
                                                                    <Plus size={14} />
                                                                    Create Form
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Published Form Section */}
                                                            {publishedForm && (
                                                                <div className="border rounded-lg p-4 bg-green-50/30 border-green-200">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                                                <CheckCircle size={12} className="text-green-600" />
                                                                            </div>
                                                                            <span className="text-sm font-medium text-green-700">Published Version</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => handlePreviewForm(publishedForm)}
                                                                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                                title="Preview"
                                                                            >
                                                                                <Eye size={15} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleShareForm(publishedForm)}
                                                                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                                title="Share"
                                                                            >
                                                                                <Share2 size={15} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEditPublishedFormClick(formType)}
                                                                                disabled={draftFormsForType.length > 0}
                                                                                className={`p-1.5 rounded transition-colors ${draftFormsForType.length > 0
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                                                    }`}
                                                                                title={draftFormsForType.length > 0 ? "Draft already exists" : "Edit"}
                                                                            >
                                                                                <Edit size={15} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-500">Status:</span>
                                                                            <span className="text-green-600 font-medium">Live</span>
                                                                        </div>
                                                                        {publishedForm.publishedAt && (
                                                                            <div className="flex justify-between text-sm">
                                                                                <span className="text-gray-500">Published:</span>
                                                                                <span className="text-gray-600">{new Date(publishedForm.publishedAt).toLocaleDateString()}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-500">Responses:</span>
                                                                            <span className="text-gray-600">{publishedForm.responseCount || 0}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Draft Forms Section */}
                                                            {draftFormsForType.length > 0 && (
                                                                <div className="border rounded-lg p-4 bg-orange-50/30 border-orange-200">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                                                            <Clock size={12} className="text-orange-600" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-orange-700">
                                                                            Draft Versions ({draftFormsForType.length})
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {draftFormsForType.map((draft) => (
                                                                            <div key={draft.formId || draft.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-100">
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-gray-800">Version {draft.version}</p>
                                                                                    {draft.updatedAt && (
                                                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                                                            Last edited {new Date(draft.updatedAt).toLocaleDateString()}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button
                                                                                        onClick={() => handlePreviewForm(draft)}
                                                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                                        title="Preview"
                                                                                    >
                                                                                        <Eye size={14} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleEditDraft(draft.formId || draft.id)}
                                                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                                        title="Edit"
                                                                                    >
                                                                                        <Edit size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Empty State when no forms */}
                                                            {!publishedForm && draftFormsForType.length === 0 && (
                                                                <div className="col-span-2 text-center py-8">
                                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                        <FileText size={24} className="text-gray-400" />
                                                                    </div>
                                                                    <p className="text-gray-400 text-sm">No forms created for {formType}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {/* Event Details Tab */}
                    {activeTab === 'details' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                {getEventLogo() && (
                                    <div className="mb-6 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={getEventLogo()}
                                                alt={getEventName()}
                                                className="rounded-lg object-contain border border-gray-200 bg-gray-50"
                                                style={{
                                                    maxWidth: '80px',
                                                    maxHeight: '80px',
                                                    width: 'auto',
                                                    height: 'auto'
                                                }}
                                            />
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">{getEventName()}</h2>
                                                <p className="text-sm text-gray-500 mt-1">Event Details</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                                                <h2 className="text-md font-semibold text-gray-800">About This Event</h2>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {getEventDescription() || 'No description provided.'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Start Date</span>
                                                </div>
                                                <p className="text-gray-800 font-medium">{formatDate(event.startDate)}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{formatTime(event.startDate)}</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500 uppercase">End Date</span>
                                                </div>
                                                <p className="text-gray-800 font-medium">{formatDate(event.endDate)}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{formatTime(event.endDate)}</p>
                                            </div>
                                        </div>

                                        {getEventLocation() && (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Location</span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{getEventLocation()}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <User className="w-4 h-4 text-gray-600" />
                                                <h3 className="text-sm font-medium text-gray-800">Organizer</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="text-white text-sm font-bold">
                                                        {getCreatedByInfo().name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{getCreatedByInfo().name}</p>
                                                    <p className="text-xs text-gray-500">{getCreatedByInfo().email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="w-4 h-4 text-gray-600" />
                                                <h3 className="text-sm font-medium text-gray-800">Status</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm text-gray-600">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Registrations Tab */}
                    {activeTab === 'registrations' && (
                        <EventRegistrations />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showEditConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={editConfirmModalRef} className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="text-gray-600" size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Edit Published Form</h2>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Editing will create a new draft version. The published form will remain live until you publish the new version.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 mb-5 border-l-4 border-gray-400">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Form Type:</span> {selectedFormType}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Note: Form type cannot be modified in draft version
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setShowEditConfirmModal(false); setSelectedFormType(null); }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => createDraftFromPublishedForm(selectedFormType)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                                    disabled={isCreatingDraft}
                                >
                                    {isCreatingDraft ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit size={14} />
                                            Yes, Edit Form
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFormPreview && formToPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={previewModalRef} className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <h2 className="text-md font-semibold text-gray-800">Form Preview</h2>
                            </div>
                            <button
                                onClick={closePreviewModal}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[calc(90vh-60px)]">
                            <FormPreview formData={formToPreview} />
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={shareModalRef} className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Share2 className="text-gray-600" size={18} />
                                    <h2 className="text-md font-semibold text-gray-800">Share Form</h2>
                                </div>
                                <button onClick={closeShareModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Form Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formLink}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm ${copied
                                            ? 'bg-gray-600 hover:bg-gray-700'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                            } text-white`}
                                    >
                                        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Share this link with attendees to collect registrations</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={openFormInNewTab}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
                                >
                                    <ExternalLink size={14} />
                                    Open
                                </button>
                                <button
                                    onClick={closeShareModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageEvent;