import { useState, useEffect } from "react";
import axiosInstance from "../../helper/AxiosInstance";
import EventsList from "./EventsList";
import { Search, FilterList } from "@mui/icons-material";
import { useNotification } from "../../contestAPI/NotificationProvider";
import CreateEventForm from "./CreateEventForm";

const CreateEvent = () => {
    const [showForm, setShowForm] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { success, error } = useNotification();

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Function to fetch events
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
            error("Error loading events: " + (err.response?.data?.message || err.message));
            setEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

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
            event.location?.toLowerCase().includes(searchText);

        const eventStatus = getEventStatus(event);
        const matchesStatus =
            statusFilter === "all" || eventStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="pt-7 pb-6 px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Events</h1>
                    <p className="text-gray-600 mt-2">Manage your events and registrations</p>
                </div>

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

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Events by title, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            title="Clear search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <div className="relative w-45">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full px-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                        </select>
                        <FilterList className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Conditional Rendering: Show either CreateEventForm OR EventsList */}
            {showForm ? (
                <CreateEventForm
                    onEventCreated={fetchEvents}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <EventsList
                    events={filteredEvents}
                    isLoading={isLoadingEvents}
                    showForm={showForm}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    onRefreshEvents={fetchEvents}
                />
            )}
        </div>
    );
};

export default CreateEvent;