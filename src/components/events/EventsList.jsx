import { useState, useEffect } from "react";
import { MoreVert } from "@mui/icons-material";
import EditEventModal from "./EditEventModal";
import AssignUserModal from "./AssignUserModal";
import { useSelector } from "react-redux";
import { useNotification } from "../../contestAPI/NotificationProvider";
import { useNavigate } from "react-router-dom";

const EventsList = ({
    events,
    isLoading,
    showForm,
    searchQuery,
    statusFilter,
    onRefreshEvents
}) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [localEvents, setLocalEvents] = useState([]);
    const [showAssignUserModal, setShowAssignUserModal] = useState(false);
    const { success, error, info, warning } = useNotification();
    const navigate = useNavigate(); // Initialize navigate

    // Get current user from Redux store
    const currentUser = useSelector((state) => state.user.user);

    // Handle successful event update
    const handleEventUpdated = (message = "Event updated successfully!") => {
        onRefreshEvents();
        success(message);
        closeEditModal();
    };

    // Update local events when props change
    useEffect(() => {
        const eventsData = events?.data || events;
        setLocalEvents(Array.isArray(eventsData) ? eventsData : []);
    }, [events]);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => {
            setMenuOpen(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Toggle menu for three dots
    const toggleMenu = (eventId, e) => {
        if (e) e.stopPropagation();
        setMenuOpen(menuOpen === eventId ? null : eventId);
    };

    // Handle view details
    const handleViewDetails = (event, e) => {
        if (e) e.stopPropagation();
        setSelectedEvent(event);
        setShowDetailsModal(true);
        setMenuOpen(null);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedEvent(null);
    };

    // Handle edit click
    const handleEditClick = (event, e) => {
        if (e) e.stopPropagation();
        setSelectedEvent(event);
        setShowEditModal(true);
        setMenuOpen(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedEvent(null);
    };

    // Handle manage event click
    // Update this function in EventsList component
    const handleManageEventClick = (event, e) => {
        if (e) e.stopPropagation();

        // Navigate to manage event page with event data
        navigate(`/manage-event/${event.eventId || event.id}`, {
            state: {
                eventData: event
            }
        });
        setMenuOpen(null);
    };

    // Handle assign user click
    const handleAssignUserClick = (event, e) => {
        if (e) e.stopPropagation();
        setSelectedEvent(event);
        setShowAssignUserModal(true);
        setMenuOpen(null);
    };

    // Handle successful user assignment
    const handleUserAssigned = (message = "User assigned successfully!") => {
        onRefreshEvents();
        success(message);
        closeAssignUserModal();
    };

    const closeAssignUserModal = () => {
        setShowAssignUserModal(false);
        setSelectedEvent(null);
    };

    // Check if current user has permission to assign users
    const canAssignUsers = currentUser && (
        currentUser.platformRole === "ROLE_EVENT_ADMIN" ||
        currentUser.highestEventRole === "ROLE_EVENT_ADMIN"||
        currentUser.platformRole === "ROLE_USER" ||
        currentUser.highestEventRole === "ROLE_USER"
    );

    // Check if current user has permission to manage events
    const canManageEvent = currentUser && (
        currentUser.platformRole === "ROLE_SUPER_ADMIN" ||
        currentUser.platformRole === "ROLE_EVENT_ADMIN" ||
        currentUser.highestEventRole === "ROLE_EVENT_ADMIN"||
        currentUser.platformRole === "ROLE_USER" ||
        currentUser.highestEventRole === "ROLE_USER"
    );

    // If form is showing, don't display events list
    if (showForm) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading events...</span>
            </div>
        );
    }

    // Get filtered events count by status for the header
    const getFilteredCount = () => {
        if (!localEvents || localEvents.length === 0) return 0;

        if (statusFilter === 'all') {
            return localEvents.length;
        }

        return localEvents.filter(event => {
            const eventStatus = getEventStatus(event);
            return eventStatus === statusFilter;
        }).length;
    };

    // Helper function to get event status
    const getEventStatus = (event) => {
        const currentDate = new Date();
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;

        if (!startDate) return 'upcoming';
        if (currentDate < startDate) return 'upcoming';
        if (endDate && currentDate > endDate) return 'completed';
        return 'active';
    };

    // Helper function to get status badge class
    const getStatusBadgeClass = (status) => {
        const classes = {
            'active': 'bg-green-100 text-green-800 border border-green-200',
            'upcoming': 'bg-blue-100 text-blue-800 border border-blue-200',
            'completed': 'bg-gray-100 text-gray-800 border border-gray-200'
        };
        return classes[status] || 'bg-purple-100 text-purple-800 border border-purple-200';
    };

    // Helper function to get status text
    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Get status-specific messages for empty states
    const getStatusMessage = () => {
        const statusMessages = {
            'active': {
                title: 'No Active Events',
                message: 'There are no active events at the moment.',
                icon: (
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                )
            },
            'upcoming': {
                title: 'No Upcoming Events',
                message: 'There are no upcoming events scheduled.',
                icon: (
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            },
            'completed': {
                title: 'No Completed Events',
                message: 'There are no completed events yet.',
                icon: (
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            },
            'all': {
                title: 'No Events Created Yet',
                message: 'Get started by creating your first event.',
                icon: (
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                )
            }
        };

        // Check if we have search results
        const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

        if (hasSearchQuery && localEvents.length === 0) {
            return {
                title: 'No results found',
                message: `We couldn't find any ${statusFilter !== 'all' ? statusFilter : ''} events matching "${searchQuery}".`,
                icon: (
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                isSearch: true
            };
        }

        return statusMessages[statusFilter] || statusMessages['all'];
    };

    // Check if we have any events
    const hasNoEvents = !localEvents || localEvents.length === 0;
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    // Show appropriate empty state message
    if (hasNoEvents || (hasSearchQuery && localEvents.length === 0)) {
        const statusMessage = getStatusMessage();

        return (
            <div className="text-center py-12 px-4">
                <div className="max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                        {statusMessage.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                        {statusMessage.title}
                    </h3>
                    <p className="text-gray-500 text-sm md:text-base mb-6">
                        {statusMessage.message}
                    </p>

                    {/* Show different actions based on state */}
                    {statusMessage.isSearch ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Try searching with different keywords or clear your search.
                            </p>
                        </div>
                    ) : statusFilter === 'all' ? (
                        <div className="flex items-center justify-center text-sm text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Create your first event to see it listed here</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                {statusFilter === 'active' && 'Check upcoming events or create a new one.'}
                                {statusFilter === 'upcoming' && 'Create a new event to schedule it.'}
                                {statusFilter === 'completed' && 'Active events will appear here once they finish.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-l font-bold text-gray-600">
                        {statusFilter === 'all' ? 'All Events' :
                            statusFilter === 'active' ? 'Active Events' :
                                statusFilter === 'upcoming' ? 'Upcoming Events' : 'Completed Events'}
                        <span className="ml-1 font-bold text-gray-600">
                            ({getFilteredCount()})
                        </span>
                    </h2>

                    {hasSearchQuery && (
                        <span className="text-sm text-gray-500">
                            matching "{searchQuery}"
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {localEvents.map((event) => {
                        // Determine event status
                        const status = getEventStatus(event);

                        // If we're filtering by status, only show matching events
                        if (statusFilter !== 'all' && status !== statusFilter) {
                            return null;
                        }

                        return (
                            <div
                                key={event.eventId || event.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
                            >
                                {/* Three dots menu button */}
                                <div className="absolute top-3 right-3 z-10">
                                    <button
                                        onClick={(e) => toggleMenu(event.eventId || event.id, e)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                        title="More options"
                                    >
                                        <MoreVert className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {/* Dropdown menu - Clean, professional design */}
                                    {menuOpen === (event.eventId || event.id) && (
                                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-300 z-20">
                                            {/* Small arrow pointing to button */}
                                            <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-300 transform rotate-45"></div>
                                            <div className="relative py-1">
                                                {/* Manage Event Option - Only show if user has permission */}
                                                {canManageEvent && (
                                                    <button
                                                        onClick={(e) => handleManageEventClick(event, e)}
                                                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer border-b border-gray-100"
                                                    >
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="font-semibold">Manage Event</span>
                                                    </button>
                                                )}

                                                {/* Assign User Option - Only show if user has permission */}
                                                {canAssignUsers && (
                                                    <button
                                                        onClick={(e) => handleAssignUserClick(event, e)}
                                                        className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer border-b border-gray-100"
                                                    >
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                        <span className="font-semibold">Assign User</span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => handleEditClick(event, e)}
                                                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="font-semibold">Edit Event</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Event Logo */}
                                {(event.logo || event.logoUrl) && (
                                    <div className="flex justify-center pt-4">
                                        <img
                                            src={event.logo || event.logoUrl}
                                            alt="Event logo"
                                            className="h-12 w-auto object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/100x40?text=Logo";
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="p-5 md:p-6" onClick={() => setMenuOpen(null)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 text-lg md:text-xl mb-2 line-clamp-1">
                                                {event.name || event.eventName}
                                            </h3>

                                            {/* Location */}
                                            {event.location && (
                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                    <svg
                                                        className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}

                                            {/* Event Dates */}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg
                                                    className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span className="font-medium">Start: </span>
                                                    <span className="text-gray-600">
                                                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'Not set'}
                                                    </span>
                                                    {event.endDate && (
                                                        <>
                                                            <span className="mx-1">•</span>
                                                            <span className="font-medium">End: </span>
                                                            <span className="text-gray-600">
                                                                {new Date(event.endDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer with status and view details */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusBadgeClass(status)}`}>
                                            {getStatusText(status)}
                                        </span>
                                        <button
                                            onClick={(e) => handleViewDetails(event, e)}
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <span className="leading-none">View Details</span>
                                            <svg
                                                className="w-4 h-4 relative top-[1px]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Details Modal */}
            {showDetailsModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto" onClick={closeDetailsModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-slideUp my-4 max-h-[90vh] flex flex-col">
                        {/* Modal Header - Fixed */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Event Details</h3>
                                <p className="text-xs text-gray-500 mt-1">Complete information about the event</p>
                            </div>
                            <button
                                onClick={closeDetailsModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-5">
                            {/* Event Logo */}
                            {(selectedEvent.logo || selectedEvent.logoUrl) && (
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-14 flex items-center justify-center">
                                        <img
                                            src={selectedEvent.logo || selectedEvent.logoUrl}
                                            alt="Event logo"
                                            className="max-h-14 max-w-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/80x56?text=Event+Logo';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                                {/* Left Column - Event Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Event Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Event Name</label>
                                                <p className="text-base font-medium text-gray-800">{selectedEvent.name || selectedEvent.eventName}</p>
                                            </div>

                                            {(selectedEvent.description || selectedEvent.Description) && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                                    <div className="group relative">
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg cursor-help truncate">
                                                            {(selectedEvent.description || selectedEvent.Description || '').length > 20
                                                                ? `${(selectedEvent.description || selectedEvent.Description || '').substring(0, 20)}...`
                                                                : selectedEvent.description || selectedEvent.Description || 'No description provided'
                                                            }
                                                        </p>
                                                        {/* Full description tooltip on hover */}
                                                        {(selectedEvent.description || selectedEvent.Description || '').length > 20 && (
                                                            <div className="absolute hidden group-hover:block z-10 w-64 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg top-full mt-2">
                                                                {/* Arrow pointing upwards */}
                                                                <div className="absolute -top-2 left-4 w-4 h-4">
                                                                    <div className="w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                                                                </div>
                                                                <div className="font-medium mb-1 text-gray-900">Description:</div>
                                                                <div className="whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                                    {selectedEvent.description || selectedEvent.Description}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Location</label>
                                                <div className="flex items-center text-gray-700">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="font-medium text-sm">{selectedEvent.location || 'Not specified'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Schedule */}
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Event Schedule</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start text-gray-700">
                                                <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <div>
                                                    <div className="font-medium text-sm">Start Date</div>
                                                    <div className="text-sm text-gray-600">
                                                        {selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'Not set'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Event Start Time - Display below Start Date */}
                                            {selectedEvent.eventStartTime && (
                                                <div className="flex items-start text-gray-700">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <div className="font-medium text-sm">Event Start Time</div>
                                                        <div className="text-sm text-gray-600">
                                                            {(() => {
                                                                // Format the time to 12-hour format
                                                                const timeStr = selectedEvent.eventStartTime;
                                                                if (!timeStr) return 'Not set';

                                                                // Check if it's already in HH:MM format
                                                                if (timeStr.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                                                                    const [hours, minutes] = timeStr.split(':');
                                                                    const hour = parseInt(hours);
                                                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                                                    const hour12 = hour % 12 || 12;
                                                                    return `${hour12}:${minutes} ${ampm}`;
                                                                }

                                                                // If it's a full datetime string, extract time
                                                                try {
                                                                    const date = new Date(timeStr);
                                                                    if (!isNaN(date.getTime())) {
                                                                        return date.toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true
                                                                        });
                                                                    }
                                                                } catch (e) {
                                                                    return timeStr;
                                                                }
                                                                return timeStr;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedEvent.endDate && (
                                                <div className="flex items-start text-gray-700">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="font-medium text-sm">End Date</div>
                                                        <div className="text-sm text-gray-600">
                                                            {new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Creator Details & Assigned Details */}
                                <div className="space-y-4">
                                    {/* Created By Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-800">Created By</h4>
                                        {selectedEvent.createdBy && (
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-xs font-bold">
                                                            S
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h5 className="text-sm font-semibold text-gray-800">
                                                            System Admin
                                                        </h5>
                                                        <p className="text-purple-600 text-xs font-medium">
                                                            Super Admin
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-2 space-y-1.5">
                                                    <div className="flex items-center text-gray-700 text-xs">
                                                        <svg className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="truncate font-medium">{selectedEvent.createdBy.email || 'admin@quantumparadigm.in'}</span>
                                                    </div>

                                                    {selectedEvent.createdAt && (
                                                        <div className="flex items-center text-gray-700 text-xs">
                                                            <svg className="w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned To Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-800">Assigned To</h4>
                                        {selectedEvent.assignedUsers && selectedEvent.assignedUsers.length > 0 ? (
                                            (() => {
                                                // Filter only event-level roles
                                                const eventLevelUsers = selectedEvent.assignedUsers.filter(user => {
                                                    const roleToCheck = user.highestEventRole || user.role || user.platformRole;
                                                    return roleToCheck === "ROLE_EVENT_ADMIN" ||
                                                        roleToCheck === "ROLE_COORDINATOR";
                                                });

                                                return eventLevelUsers.length > 0 ? (
                                                    <div
                                                        className={`space-y-2 ${eventLevelUsers.length > 3 ? 'max-h-56 overflow-y-auto pr-2' : ''}`}
                                                    >
                                                        {eventLevelUsers.map((user, index) => {
                                                            const displayRole = user.highestEventRole || user.role || user.platformRole;
                                                            const displayName = user.name || 'Unknown User';

                                                            return (
                                                                <div
                                                                    key={user.userId || index}
                                                                    className="bg-white rounded-lg p-2.5 border border-gray-200 hover:border-purple-300 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center min-w-0">
                                                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                                <span className="text-white text-xs font-bold">
                                                                                    {displayName.charAt(0)?.toUpperCase() || 'U'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="ml-2 min-w-0">
                                                                                <h5 className="text-xs font-semibold text-gray-800 truncate">
                                                                                    {displayName}
                                                                                </h5>
                                                                                <div className="flex items-center text-gray-600 text-xs mt-0.5">
                                                                                    <svg className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                    <span className="truncate">{user.email}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 flex-shrink-0 ${displayRole === "ROLE_EVENT_ADMIN" ? "bg-blue-100 text-blue-800" :
                                                                            displayRole === "ROLE_COORDINATOR" ? "bg-purple-100 text-purple-800" :
                                                                                "bg-gray-100 text-gray-800"
                                                                            }`}>
                                                                            {displayRole === "ROLE_EVENT_ADMIN" ? "Event Admin" :
                                                                                displayRole === "ROLE_COORDINATOR" ? "Coordinator" :
                                                                                    displayRole}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {eventLevelUsers.length > 3 && (
                                                            <div className="text-center text-xs text-gray-500 pt-1 pb-1">
                                                                Scroll for more users ({eventLevelUsers.length} total)
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                                        </svg>
                                                        <p className="text-xs">No event-level users assigned</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">Only Event Admin, Admin, and Coordinator roles shown</p>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                                <svg className="w-8 h-8 mx-auto text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                                </svg>
                                                <p className="text-xs">No assigned users</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-4 md:p-5 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={closeDetailsModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-3xl transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    onClose={closeEditModal}
                    onUpdate={handleEventUpdated}
                />
            )}

            {/* Assign User Modal */}
            {showAssignUserModal && selectedEvent && currentUser && (
                <AssignUserModal
                    event={selectedEvent}
                    currentUser={currentUser}
                    onClose={closeAssignUserModal}
                    onAssign={handleUserAssigned}
                />
            )}
        </>
    );
};

export default EventsList;