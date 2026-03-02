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
    BarChart3,
    Activity
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

    // Refs for click outside detection
    const previewModalRef = useRef(null);
    const shareModalRef = useRef(null);

    const { success, error } = useNotification();
    const [showAllDetails, setShowAllDetails] = useState(false);
    const currentUser = useSelector((state) => state.user.user);

    // Function to get back button text and route based on role
    const getBackButtonConfig = () => {
        const userRole = currentUser?.platformRole || currentUser?.highestEventRole;

        if (userRole === "ROLE_SUPER_ADMIN") {
            return {
                text: "Back to Events",
                route: "/create-event"
            };
        } else {
            return {
                text: "Back to Events",
                route: "/events"
            };
        }
    };

    // Get event data from location state
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

    // Fetch forms when component mounts or when showCreateForm changes
    useEffect(() => {
        if (eventId) {
            fetchForms();
        }
    }, [eventId, showCreateForm]);

    // Click outside handler for modals
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle Preview Modal
            if (showFormPreview && previewModalRef.current && !previewModalRef.current.contains(event.target)) {
                setShowFormPreview(false);
                setFormToPreview(null);
            }

            // Handle Share Modal
            if (showShareModal && shareModalRef.current && !shareModalRef.current.contains(event.target)) {
                setShowShareModal(false);
                setFormLink('');
                setCopied(false);
            }
        };

        // Add event listener when modals are open
        if (showFormPreview || showShareModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFormPreview, showShareModal]);

    // Generate form preview link
    const generateFormLink = (formId, eventKey) => {
        if (eventKey) {
            try {
                const eventName = getEventName();
                let urlEventName = 'event';

                if (eventName && eventName !== 'Unnamed Event') {
                    urlEventName = eventName
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .substring(0, 50);
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

    // Function to preview a form
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
                            console.log(`Fetched ${formData.formSections.length} sections for ${formData.status} form preview`);
                        }
                    } catch (sectionsErr) {
                        console.error('Error fetching form sections:', sectionsErr);
                        formData.formSections = [];
                    }
                } else {
                    console.log('Form status not recognized for sections fetch:', formData.status);
                    formData.formSections = [];
                }
            }

            setFormToPreview(formData);
            setShowFormPreview(true);
        } catch (err) {
            console.error('Error fetching form details for preview:', err);
            error('Failed to load form for preview');
        }
    };

    // Function to share a form
    const handleShareForm = (form) => {
        const link = generateFormLink(form.formId, form.eventKey || event?.eventKey);
        setFormLink(link);
        setShowShareModal(true);
    };

    // Function to copy link to clipboard
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

    // Function to open form in new tab
    const openFormInNewTab = () => {
        window.open(formLink, '_blank');
    };

    // Function to close preview modal
    const closePreviewModal = () => {
        setShowFormPreview(false);
        setFormToPreview(null);
    };

    // Function to close share modal
    const closeShareModal = () => {
        setShowShareModal(false);
        setFormLink('');
        setCopied(false);
    };

    // Fetch forms - Updated to handle exact workflow cases
    const fetchForms = async () => {
        try {
            const versionsResponse = await axiosInstance.get(`/form/event/${eventId}/versions`);
            console.log('Versions response:', versionsResponse.data);

            let publishedForm = null;
            let draftFormsList = [];

            if (versionsResponse.data && versionsResponse.data.status === 'success') {
                const formsData = versionsResponse.data.data || [];

                publishedForm = formsData.find(form =>
                    form.status === 'PUBLISHED' || form.status === 'published'
                );

                draftFormsList = formsData.filter(form =>
                    (form.status === 'DRAFT' || form.status === 'draft')
                );

                draftFormsList.sort((a, b) => {
                    if (a.version && b.version) {
                        return b.version - a.version;
                    }
                    return (b.formId || b.id) - (a.formId || a.id);
                });
            }

            console.log('Published form found:', publishedForm);
            console.log('Draft forms found:', draftFormsList);

            setRegistrationForm(publishedForm || null);
            setDraftForms(draftFormsList);

        } catch (err) {
            console.error('Error fetching forms:', err);
            if (err.response && err.response.status === 404) {
                setRegistrationForm(null);
                setDraftForms([]);
            } else {
                setRegistrationForm(null);
                setDraftForms([]);
                error('Failed to load forms');
            }
        }
    };

    // Handle form save/publish
    const handleFormSave = (formData) => {
        console.log('Form saved/published:', formData);

        if (formData.eventKey) {
            success(`Form published successfully! Event Key: ${formData.eventKey}`);
        } else if (formData.message && formData.message.includes('published')) {
            success('Form published successfully!');
        } else {
            success('Form saved successfully!');
        }

        setShowCreateForm(false);
        setDraftFormData(null);
        fetchForms();
    };

    const handleDraftSaved = (draftData) => {
        success('Draft saved successfully!');
        setShowCreateForm(false);
        setDraftFormData(null);
        fetchForms();
    };

    // Function to edit a draft form
    const handleEditDraft = async (draftId) => {
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
                    console.log(`Fetched ${formData.formSections.length} sections for draft form`);
                }
            } catch (sectionsErr) {
                console.error('Error fetching form sections for draft:', sectionsErr);
                formData.formSections = [];
            }

            setDraftFormData(formData);
            setShowCreateForm(true);

            console.log('Draft form data with sections loaded:', formData);
        } catch (err) {
            console.error('Error fetching draft form:', err);
            error('Failed to load draft form');
        }
    };

    // Function to edit published form (creates a new draft version)
    const handleEditPublishedForm = async (publishedFormId) => {
        try {
            const response = await axiosInstance.get(`/form/${publishedFormId}`);

            let formData = response.data;
            if (response.data.data) {
                formData = response.data.data;
            }

            try {
                const sectionsResponse = await axiosInstance.get(`/forms/${publishedFormId}/sections`);
                if (sectionsResponse.data && sectionsResponse.data.status === 'success') {
                    formData.formSections = sectionsResponse.data.data || [];
                    console.log(`Fetched ${formData.formSections.length} sections for published form`);
                }
            } catch (sectionsErr) {
                console.error('Error fetching form sections for published form:', sectionsErr);
                formData.formSections = [];
            }

            setDraftFormData(formData);
            setShowCreateForm(true);

            console.log('Published form data loaded for editing:', formData);
        } catch (err) {
            console.error('Error fetching published form:', err);
            error('Failed to load published form');
        }
    };

    // Function to handle form builder cancel
    const handleFormBuilderCancel = () => {
        console.log('Form builder cancelled, refreshing forms list...');
        setShowCreateForm(false);
        setDraftFormData(null);
        fetchForms();
    };

    // Function to fetch event from the events list API
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

            const foundEvent = eventsList.find(e =>
                (e.eventId && e.eventId.toString() === eventId) ||
                (e.id && e.id.toString() === eventId)
            );

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

    // Function to navigate to event tracking page
    const handleTrackEvent = () => {
        navigate(`/track-event/${eventId}`, {
            state: { eventData: event }
        });
    };

   

    // Helper functions
    const getEventName = () => {
        return event?.name || event?.eventName || 'Unnamed Event';
    };

    const getEventLogo = () => {
        return event?.logo || event?.logoUrl || null;
    };

    const getEventDescription = () => {
        return event?.description || event?.Description || '';
    };

    const getEventLocation = () => {
        return event?.location || '';
    };

    const getCreatedByInfo = () => {
        if (event?.createdBy) {
            return {
                name: event.createdBy.name || 'System Admin',
                email: event.createdBy.email || 'admin@quantumparadigm.in'
            };
        }
        return {
            name: 'System Admin',
            email: 'admin@quantumparadigm.in'
        };
    };

    const truncateDescription = (text, maxLength = 150) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength);
    };

    const backButtonConfig = getBackButtonConfig();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading event details...</span>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Event Not Found</h3>
                    <p className="text-gray-500">The event you're looking for doesn't exist or you don't have permission to access it.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="pt-4 pb-6 px-3 sm:px-4 md:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <button
                            onClick={() => navigate(backButtonConfig.route)}
                            className="flex items-center text-gray-600 hover:text-gray-800 mb-2 cursor-pointer text-sm transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {backButtonConfig.text}
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Event</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
                            Manage forms and settings for {getEventName()}
                        </p>
                    </div>
                    
                    {/* Action Buttons - Stack on mobile, row on desktop */}
                    <div className="flex flex-col sm:flex-row gap-3">
                       
                        
                        {/* Track Event Button */}
                        <button
                            onClick={handleTrackEvent}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-3xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                        >
                            <Activity size={18} className="sm:w-5 sm:h-5" />
                            Track Event
                        </button>
                    </div>
                </div>

                {/* Form Preview Modal with Click Outside - Mobile Optimized */}
                {showFormPreview && formToPreview && (
                    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                        <div
                            ref={previewModalRef}
                            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                        >
                            <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Form Preview</h2>
                                <button
                                    onClick={closePreviewModal}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-100 rounded-full p-1.5 sm:p-1 transition-colors"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                                <FormPreview formData={formToPreview} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Modal with Click Outside - Mobile Optimized */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                        <div
                            ref={shareModalRef}
                            className="bg-white rounded-lg w-full max-w-md shadow-xl"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Share2 className="text-purple-600" size={18} />
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Share Form</h2>
                                    </div>
                                    <button
                                        onClick={closeShareModal}
                                        className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-100 rounded-full p-1.5 transition-colors"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Form Link
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={formLink}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className={`w-full sm:w-auto px-4 py-2 rounded-3xl font-semibold flex items-center justify-center gap-2 ${copied ? 'bg-green-400 hover:bg-green-500' : 'bg-purple-400 hover:bg-purple-500'} text-white transition-colors cursor-pointer text-sm`}
                                        >
                                            {copied ? (
                                                <>
                                                    <CheckCircle size={16} />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                    <button
                                        onClick={openFormInNewTab}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Open Form
                                    </button>
                                    <button
                                        onClick={closeShareModal}
                                        className="w-full sm:w-auto px-4 py-2 border bg-white text-gray rounded-3xl border-gray-300 cursor-pointer transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Stack on mobile, grid on desktop */}
                {showCreateForm ? (
                    <FormBuilder
                        eventId={eventId}
                        eventName={getEventName()}
                        onClose={handleFormBuilderCancel}
                        onSave={(responseData) => {
                            console.log('Publish response:', responseData);
                            if (responseData && responseData.eventKey) {
                                setEvent(prev => ({
                                    ...prev,
                                    eventKey: responseData.eventKey
                                }));
                            }
                            handleFormSave(responseData);
                            setDraftFormData(null);
                        }}
                        onDraftSaved={() => {
                            handleDraftSaved();
                            setDraftFormData(null);
                        }}
                        notification={{ success, error }}
                        initialFormData={draftFormData}
                    />
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Left Column - Forms List - Full width on mobile */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-300 to-pink-300 p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText size={18} className="text-white" />
                                        <h2 className="text-base sm:text-lg font-semibold text-white">Registration Forms</h2>
                                    </div>
                                    <p className="text-white/90 text-xs sm:text-sm">Create custom forms for your event attendees</p>
                                </div>

                                <div className="p-4 sm:p-5 lg:p-6">
                                    {/* Case 1: No forms exist at all */}
                                    {!registrationForm && draftForms.length === 0 && (
                                        <div className="text-center py-4 sm:py-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText size={24} className="text-purple-600" />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Start creating registration forms</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                                Design custom forms to collect information from your event participants.
                                            </p>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => setShowCreateForm(true)}
                                                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
                                                >
                                                    Create Form
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Case 2: Only published form exists (no drafts) */}
                                    {registrationForm && draftForms.length === 0 && (
                                        <div className="mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Published Form</h3>
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                                                    LIVE • v{registrationForm.version || '1.0'}
                                                </span>
                                            </div>

                                            <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-1 break-words">{registrationForm.title || 'Registration Form'}</h4>
                                                        <p className="text-sm font-medium text-gray-600 mb-2">version {registrationForm.version || '1.0'}</p>
                                                        <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded inline-block">
                                                            Published: {registrationForm.publishedAt ? new Date(registrationForm.publishedAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-3 mt-6">
                                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handlePreviewForm(registrationForm)}
                                                            className="w-full sm:w-auto px-5 sm:px-6 py-2 bg-green-400 font-semibold text-white rounded-3xl hover:bg-green-500 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                        >
                                                            <Eye size={16} />
                                                            Preview
                                                        </button>
                                                        <button
                                                            onClick={() => handleShareForm(registrationForm)}
                                                            className="w-full sm:w-auto px-5 sm:px-6 py-2 bg-white border font-semibold border-green-500 text-green-600 rounded-3xl hover:bg-green-50 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                        >
                                                            <Share2 size={16} />
                                                            Share
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Published Form Button - Only show when NO drafts exist */}
                                            <div className="mt-6 pt-4 border-t border-gray-200">
                                                <div className="text-center">
                                                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                                                        Want to create a new version of this form?
                                                    </p>
                                                    <button
                                                        onClick={() => handleEditPublishedForm(registrationForm.formId)}
                                                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-3xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 mx-auto cursor-pointer text-sm"
                                                    >
                                                        Edit Published Form
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Case 3: Both published form AND drafts exist */}
                                    {registrationForm && draftForms.length > 0 && (
                                        <>
                                            {/* Published Form Section */}
                                            <div className="mb-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={16} className="text-green-600" />
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Published Form</h3>
                                                    </div>
                                                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                                                        LIVE • v{registrationForm.version || '1.0'}
                                                    </span>
                                                </div>

                                                <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 mb-1 break-words">{registrationForm.title || 'Registration Form'}</h4>
                                                            <p className="text-sm font-medium text-gray-600 mb-2">version {registrationForm.version || '1.0'}</p>
                                                            <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded inline-block">
                                                                Published: {registrationForm.publishedAt ? new Date(registrationForm.publishedAt).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-3 mt-6">
                                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => handlePreviewForm(registrationForm)}
                                                                className="w-full sm:w-auto px-5 sm:px-6 py-2 bg-green-400 font-semibold text-white rounded-3xl hover:bg-green-500 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                            >
                                                                <Eye size={16} />
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => handleShareForm(registrationForm)}
                                                                className="w-full sm:w-auto px-5 sm:px-6 py-2 bg-white border font-semibold border-green-500 text-green-600 rounded-3xl hover:bg-green-50 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                            >
                                                                <Share2 size={16} />
                                                                Share
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Draft Forms Section - Show when drafts exist */}
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Clock size={16} className="text-yellow-600" />
                                                    <h3 className="text-sm font-semibold text-gray-800">
                                                        Draft Version (v{draftForms[0].version})
                                                    </h3>
                                                </div>

                                                <div className="space-y-3">
                                                    {draftForms.map((draft) => (
                                                        <div
                                                            key={draft.formId || draft.id}
                                                            className="bg-yellow-50 rounded-lg border border-yellow-200 p-5 relative"
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6">
                                                                <div className="flex-1 mb-3 sm:mb-0">
                                                                    <h4 className="font-medium text-gray-800 mb-2 break-words">{draft.title || 'Untitled Draft'}</h4>
                                                                    <p className="text-sm text-gray-600">Version {draft.version || '1.0'} • Draft</p>
                                                                    {draft.updatedAt && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Last modified: {new Date(draft.updatedAt).toLocaleString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full h-fit self-start">
                                                                    DRAFT • v{draft.version || '1.0'}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handlePreviewForm(draft)}
                                                                    className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                                    title="Preview Draft"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditDraft(draft.formId || draft.id)}
                                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                                    title="Continue Editing"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* NO "Edit Published Form" button when drafts exist */}
                                        </>
                                    )}

                                    {/* Case 4: Only draft exists (no published form) */}
                                    {!registrationForm && draftForms.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock size={16} className="text-yellow-600" />
                                                <h3 className="text-sm font-semibold text-gray-800">Draft Forms ({draftForms.length})</h3>
                                            </div>

                                            <div className="space-y-3">
                                                {draftForms.map((draft) => (
                                                    <div
                                                        key={draft.formId || draft.id}
                                                        className="bg-yellow-50 rounded-lg border border-yellow-200 p-5 relative"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6">
                                                            <div className="flex-1 mb-3 sm:mb-0">
                                                                <h4 className="font-medium text-gray-800 mb-2 break-words">{draft.title || 'Untitled Draft'}</h4>
                                                                <p className="text-sm text-gray-600">version {draft.version || '1.0'}</p>
                                                                {draft.updatedAt && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Last modified: {new Date(draft.updatedAt).toLocaleString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full h-fit self-start">
                                                                DRAFT • v{draft.version || '1.0'}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handlePreviewForm(draft)}
                                                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                                title="Preview Draft"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditDraft(draft.formId || draft.id)}
                                                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 text-sm cursor-pointer transition-colors"
                                                                title="Continue Editing"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Event Details Card - Full width on mobile */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 sm:p-5 lg:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList size={18} className="text-purple-600" />
                                            <h2 className="text-base sm:text-lg font-bold text-gray-600">Event Details</h2>
                                        </div>
                                        {getEventLogo() && (
                                            <img
                                                src={getEventLogo()}
                                                alt="Event logo"
                                                className="h-10 sm:h-12 w-auto object-contain rounded-lg self-start sm:self-auto"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-4 sm:space-y-5">
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Event Name</h3>
                                            <p className="text-lg sm:text-xl font-bold text-gray-800 break-words">{getEventName()}</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Start Date & Time</h3>
                                                <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span className="break-words">{event.startDate ? new Date(event.startDate).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    }) : 'Not set'}</span>
                                                </p>
                                            </div>
                                            {event.endDate && (
                                                <div>
                                                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">End Date & Time</h3>
                                                    <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="break-words">{new Date(event.endDate).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {getEventDescription() && (
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Description</h3>
                                                <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 break-words">
                                                    {showAllDetails ? (
                                                        getEventDescription()
                                                    ) : (
                                                        <>
                                                            {truncateDescription(getEventDescription(), 150)}
                                                            {getEventDescription().length > 150 && (
                                                                <button
                                                                    onClick={() => setShowAllDetails(true)}
                                                                    className="text-purple-600 font-medium ml-1 hover:text-purple-700 focus:outline-none cursor-pointer"
                                                                >
                                                                    ... Read more
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {getEventLocation() && (
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Location</h3>
                                                <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2 break-words">
                                                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span>{getEventLocation()}</span>
                                                </p>
                                            </div>
                                        )}

                                        {showAllDetails && (
                                            <>
                                                <div>
                                                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Created By</h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User size={18} className="text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-800 break-words">
                                                                {getCreatedByInfo().name}
                                                            </p>
                                                            <p className="text-xs sm:text-sm text-gray-500 break-words">
                                                                {getCreatedByInfo().email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {assignedUsers.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Users size={16} className="text-gray-400" />
                                                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Team Members ({assignedUsers.length})</h3>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {assignedUsers.slice(0, 3).map((user, index) => {
                                                                const userName = user.name || user.username || user.email || 'Unknown User';
                                                                const userRole = user.role || user.highestEventRole || 'User';

                                                                return (
                                                                    <div
                                                                        key={user.userId || user.id || index}
                                                                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 hover:bg-gray-50 rounded"
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                                <span className="text-white text-xs font-bold">
                                                                                    {userName.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                                                                        </div>
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-center ${userRole === 'ROLE_EVENT_ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                                            userRole === 'ROLE_COORDINATOR' ? 'bg-purple-100 text-purple-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {userRole === 'ROLE_EVENT_ADMIN' ? 'Event Admin' :
                                                                                userRole === 'ROLE_COORDINATOR' ? 'Coordinator' :
                                                                                    userRole.replace('ROLE_', '').slice(0, 10)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {assignedUsers.length > 3 && (
                                                                <p className="text-xs sm:text-sm text-gray-500 text-center pt-2">
                                                                    + {assignedUsers.length - 3} more team members
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                                            <button
                                                onClick={() => setShowAllDetails(!showAllDetails)}
                                                className="flex items-center gap-1 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer transition-colors"
                                            >
                                                {showAllDetails ? (
                                                    <>
                                                        Show less
                                                        <ChevronUp size={14} />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show more
                                                        <ChevronDown size={14} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <EventRegistrations />
        </>
    );
};

export default ManageEvent;