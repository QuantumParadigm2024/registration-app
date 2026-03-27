import { useState, useEffect } from "react";
import axiosInstance from "../../helper/AxiosInstance";
import EventsList from "../events/EventsList";
import CreateEventForm from "../events/CreateEventForm";
import {
    Search,
    FilterList,
    Close,
    Refresh,
    Dashboard,
    Event,
    Timeline,
    Schedule,
    LocationOn
} from "@mui/icons-material";

const EventAdminManagement = () => {
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Function to fetch events for this event admin
    const fetchEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const res = await axiosInstance.get("/admin/events");

            if (res.data && Array.isArray(res.data.data)) {
                setEvents(res.data.data);
            } else if (Array.isArray(res.data)) {
                setEvents(res.data);
            } else if (res.data && res.data.events) {
                setEvents(res.data.events);
            } else {
                console.warn("Unexpected API response structure:", res.data);
                setEvents([]);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            showNotification("Error loading events: " + (err.response?.data?.message || err.message), "error");
            setEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    // Show notification
    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, 3000);
    };

    // Filter events based on search and status
    const getEventStatus = (event) => {
        const today = new Date();
        const start = event.startDate ? new Date(event.startDate) : null;
        const end = event.endDate ? new Date(event.endDate) : null;

        if (start && start > today) return "upcoming";
        if (start && (!end || end >= today)) return "active";
        if (end && end < today) return "completed";

        return "upcoming";
    };

    const filteredEvents = events.filter((event) => {
        const searchText = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            event.name?.toLowerCase().includes(searchText) ||
            event.location?.toLowerCase().includes(searchText) ||
            event.description?.toLowerCase().includes(searchText);

        const eventStatus = getEventStatus(event);
        const matchesStatus =
            statusFilter === "all" || eventStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const activeEvents = events.filter(e => getEventStatus(e) === 'active').length;
    const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification Component */}
            {notification.show && (
                <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-3 shadow-lg animate-slideDown md:left-auto md:right-4 md:top-4 md:rounded-lg md:max-w-md ${notification.type === "success"
                    ? "bg-green-500 text-white"
                    : notification.type === "error"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {notification.type === "success" ? (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : notification.type === "error" ? (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <span className="font-medium text-sm md:text-base break-words">{notification.message}</span>
                        </div>
                        <button
                            onClick={() => setNotification({ show: false, message: "", type: "" })}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                        >
                            <Close className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-indigo-600 mb-1.5 sm:mb-2">
                        <Dashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Dashboard Overview</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                Events Management
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <LocationOn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">Manage and coordinate your assigned events</span>
                            </p>
                        </div>

                        {/* Add Event Button */}
                        <button
                            className={`${showForm ?
                                "p-3 rounded-full" :
                                "px-6 py-3 rounded-3xl flex items-center space-x-2"
                                } bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer`}
                            onClick={() => setShowForm(!showForm)}
                            title={showForm ? "Close Form" : "Add New Event"}
                        >
                            {showForm ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <>
                                    <span className="font-semibold">Add Event</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search and Filter - ALWAYS VISIBLE */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-xs sm:text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Close className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm cursor-pointer text-xs sm:text-sm pr-9 sm:pr-10"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                        </select>
                        <FilterList className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                {/* Stats Cards - ONLY SHOW WHEN FORM IS NOT OPEN */}
                {!showForm && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                        {/* Total Events Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Total Events</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{events.length}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                                    <Event className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        {/* Active Events Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Active</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeEvents}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                                    <Timeline className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">Upcoming</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{upcomingEvents}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                                    <Schedule className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conditional Rendering: Show either CreateEventForm OR Events List */}
                {showForm ? (
                    <CreateEventForm
                        onEventCreated={fetchEvents}
                        onCancel={() => setShowForm(false)}
                    />
                ) : (
                    <>
                        {/* Events List Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Events List
                                </h2>
                                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-medium rounded-full">
                                    {filteredEvents.length} events
                                </span>
                                {searchQuery && (
                                    <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">
                                        Filtered: "{searchQuery}"
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={fetchEvents}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors text-xs sm:text-sm font-medium self-start sm:self-auto"
                            >
                                <Refresh className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Refresh
                            </button>
                        </div>

                        {/* Events List */}
                        {isLoadingEvents ? (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="p-4 sm:p-8">
                                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-indigo-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
                                        <p className="text-xs sm:text-sm text-gray-500">Loading your events...</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                                    <EventsList
                                        events={filteredEvents}
                                        isLoading={false}
                                        showForm={false}
                                        searchQuery={searchQuery}
                                        statusFilter={statusFilter}
                                        onRefreshEvents={fetchEvents}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Custom keyframes for animation */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default EventAdminManagement;