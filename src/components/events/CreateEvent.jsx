import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../helper/AxiosInstance";
import EventsList from "./EventsList";
import { Search, FilterList } from "@mui/icons-material";
import { useNotification } from "../../contestAPI/NotificationProvider";

const CreateEvent = () => {
    const [showForm, setShowForm] = useState(false);
    const [personQuery, setPersonQuery] = useState("");
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [logoUrl, setLogoUrl] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const searchTimeoutRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { success, error } = useNotification();

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch users when form opens
    useEffect(() => {
        if (showForm) {
            searchUsers("");
        } else {
            setSuggestedUsers([]);
        }
    }, [showForm]);

    // Search users when typing
    useEffect(() => {
        if (!showForm) return;

        if (!personQuery.trim()) {
            searchUsers("");
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            await searchUsers(personQuery.trim());
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [personQuery, showForm]);

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

    // Validation functions
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        const minLength = password.length >= 6;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return minLength && hasLetter && hasNumber && hasSpecialChar;
    };

    const validatePhone = (phone) => {
        return /^\d{10}$/.test(phone);
    };

    // Handle logo upload
    const handleLogoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setLogoUrl("");
            return;
        }

        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axiosInstance.post("/file/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.status === "success" && res.data.url) {
                setLogoUrl(res.data.url);
                success("Logo uploaded successfully!");
            } else {
                throw new Error(res.data.message || "Failed to upload logo");
            }
        } catch (err) {
            console.error("Error uploading logo:", err);
            error("Error uploading logo: " + (err.response?.data?.message || err.message));
            setLogoUrl("");
            event.target.value = "";
        } finally {
            setIsUploadingLogo(false);
        }
    };

    // Search users
    const searchUsers = async (query) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/sa/get/eventUsers", {
                params: query ? { query } : {},
            });
            const users = Array.isArray(res.data?.data) ? res.data.data : [];
            setSuggestedUsers(users);
        } catch (err) {
            console.error("Error searching users:", err);
            setSuggestedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        const eventName = document.getElementById("eventName")?.value;
        const startDate = document.getElementById("startDate")?.value;
        const username = document.getElementById("username")?.value;
        const email = document.getElementById("email")?.value;
        const password = document.getElementById("password")?.value;
        const phone = document.getElementById("phone")?.value;

        if (!eventName?.trim()) errors.eventName = "Event Name is required";
        if (!startDate?.trim()) errors.startDate = "Start Date is required";

        if (!selectedPerson) {
            if (!username?.trim()) errors.username = "Username is required";
            if (!email?.trim()) errors.email = "Email is required";
            else if (!validateEmail(email)) errors.email = "Please enter a valid email address";
            if (!password?.trim()) errors.password = "Password is required";
            else if (!validatePassword(password)) errors.password = "Password must be at least 6 characters and contain letters, numbers, and special characters";
            if (phone?.trim() && !validatePhone(phone)) errors.phone = "Phone number must be exactly 10 digits";
        }

        if (!selectedPerson && (!username || !email || !password)) {
            errors.person = "Please either select an existing person or fill all required fields for a new person";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle create event
    const handleCreateEvent = async () => {
        if (!validateForm()) {
            // Show first error in notification
            const firstError = Object.values(formErrors)[0];
            error(firstError);
            return;
        }

        const eventName = document.getElementById("eventName").value;
        const description = document.getElementById("description").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const eventStartTime = document.getElementById("eventStartTime")?.value;
        const location = document.getElementById("location").value;

        const formData = new FormData();
        formData.append("name", eventName);
        formData.append("description", description || "");
        formData.append("startDate", startDate || "");
        formData.append("endDate", endDate || "");
        formData.append("eventStartTime", eventStartTime || "");
        formData.append("location", location || "");
        formData.append("logo", logoUrl || "");

        if (selectedPerson) {
            if (selectedPerson.email) formData.append("email", selectedPerson.email);
            else if (selectedPerson.username) formData.append("username", selectedPerson.username);
            else if (selectedPerson.id) formData.append("userId", selectedPerson.id);
            else {
                error("Selected person doesn't have email, username, or ID. Please select a valid user or add a new person.");
                return;
            }
        } else {
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const phone = document.getElementById("phone").value;

            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);
            if (phone) formData.append("phone", phone);
        }

        setIsSubmitting(true);
        try {
            const res = await axiosInstance.post("/sa/create/event", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.status === "success") {
                success("Event created successfully!");
                // Refresh events list
                await fetchEvents();
                // Close the form
                setShowForm(false);
                handleCloseForm();
            } else {
                throw new Error(res.data.message || "Failed to create event");
            }
        } catch (err) {
            console.error("Error creating event:", err);
            error("Error creating event: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle close form
    const handleCloseForm = () => {
        // Reset form state
        setPersonQuery("");
        setSelectedPerson(null);
        setSuggestedUsers([]);
        setIsLoading(false);
        setShowPassword(false);
        setFormErrors({});
        setLogoUrl("");
        setIsUploadingLogo(false);

        // Clear form fields
        if (typeof document !== 'undefined') {
            const fields = [
                "eventName", "description", "startDate", "endDate",
                "location", "logo", "username", "email", "password", "phone"
            ];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = "";
                }
            });

            // Reset character counter
            const counterElement = document.getElementById("descriptionCounter");
            if (counterElement) {
                counterElement.textContent = "0";
            }
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    };

    // Add this useEffect hook with your other useEffect hooks
    useEffect(() => {
        if (showForm) {
            const descriptionField = document.getElementById("description");
            const counterElement = document.getElementById("descriptionCounter");

            if (descriptionField && counterElement) {
                const updateCounter = () => {
                    counterElement.textContent = descriptionField.value.length;
                };

                descriptionField.addEventListener("input", updateCounter);

                // Initialize counter
                updateCounter();

                return () => {
                    descriptionField.removeEventListener("input", updateCounter);
                };
            }
        }
    }, [showForm]);

    // Toggle form visibility
    const toggleForm = () => {
        setShowForm(!showForm);

        // If closing the form, reset everything
        if (showForm) {
            handleCloseForm();
        } else {
            // When opening form, fetch all users
            searchUsers("");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getUserDisplayText = (user) => {
        if (user.email) return user.email;
        if (user.name) return user.name;
        if (user.username) return user.username;
        return `User #${user.id}`;
    };

    const clearFieldError = (fieldName) => {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
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
        // 🔍 Search by title & location
        const searchText = searchQuery.toLowerCase();

        const matchesSearch =
            !searchQuery ||
            event.name?.toLowerCase().includes(searchText) ||
            event.location?.toLowerCase().includes(searchText);

        // 🎯 Status filter (frontend derived)
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
                    onClick={toggleForm}
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

            {/* Seacrh & Filter */}
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
                    {/* Clear search button when there's text */}
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

            {/* Conditional Rendering: Show either EventsList OR Create Form */}
            {showForm ? (
                // Show Create Event Form
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">Create New Event</h2>
                            <button
                                onClick={toggleForm}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                title="Close form"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Event Fields */}
                            <div className="space-y-4">
                                <h3 className="text-sm md:text-base font-semibold text-gray-700 border-b pb-2">Event Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="eventName"
                                            placeholder="Enter event name"
                                            className={`w-full border ${formErrors.eventName ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm md:text-base`}
                                            onChange={() => clearFieldError('eventName')}
                                        />
                                        {formErrors.eventName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.eventName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            placeholder="Enter event location"
                                            className="w-full border border-gray-300 p-2 rounded text-sm md:text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            className={`w-full border ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm md:text-base`}
                                            onChange={() => clearFieldError('startDate')}
                                        />
                                        {formErrors.startDate && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            className="w-full border border-gray-300 p-2 rounded text-sm md:text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Start Time
                                        </label>
                                        <input
                                            type="time"
                                            id="eventStartTime"
                                            className={`w-full border ${formErrors.eventStartTime ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm md:text-base`}
                                            onChange={() => clearFieldError('eventStartTime')}
                                        />
                                        {formErrors.eventStartTime && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.eventStartTime}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        placeholder="Enter event description"
                                        className="w-full border border-gray-300 p-2 rounded min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                                        maxLength={500}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(0, 500);
                                            e.target.value = value;
                                            const counter = document.getElementById("descriptionCounter");
                                            if (counter) counter.textContent = value.length;
                                        }}
                                    />
                                    <div className="flex justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                            Max 500 characters
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            <span id="descriptionCounter">0</span>/500
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Logo
                                    </label>
                                    <input
                                        type="file"
                                        id="logo"
                                        className="w-full border border-gray-300 p-2 rounded text-xs md:text-sm"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={isUploadingLogo}
                                    />
                                    {isUploadingLogo && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                            <span>Uploading logo...</span>
                                        </div>
                                    )}
                                    {logoUrl && !isUploadingLogo && (
                                        <div className="mt-2 p-2 border border-green-300 rounded bg-green-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-green-700">Logo uploaded successfully</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLogoUrl("");
                                                        const logoInput = document.getElementById("logo");
                                                        if (logoInput) logoInput.value = "";
                                                    }}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-center">
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo preview"
                                                    className="h-16 w-auto object-contain rounded"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assign Person Section */}
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Assign a person <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Search for an existing admin or add a new person
                                    </p>
                                    {formErrors.person && !selectedPerson && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.person}</p>
                                    )}
                                </div>

                                {/* Search for Existing Person */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search person by name/email..."
                                            className="w-full border border-gray-300 p-2 rounded text-sm md:text-base"
                                            value={personQuery}
                                            onChange={(e) => {
                                                setPersonQuery(e.target.value);
                                                clearFieldError('person');
                                            }}
                                            disabled={!!selectedPerson}
                                        />
                                        {isLoading && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Suggestions Dropdown - Show when form is open, even without query */}
                                    {!selectedPerson && showForm && (
                                        <div className="border border-gray-200 rounded shadow-sm">
                                            <div className="bg-gray-50 p-2 border-b">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {personQuery ? "Select an admin" : "Available Admins"}
                                                </span>
                                            </div>

                                            <div className="max-h-48 md:max-h-60 overflow-y-auto">
                                                {isLoading ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        <div className="animate-spin rounded-full h-5 h-6 w-5 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                                                        <span className="text-sm">Loading...</span>
                                                    </div>
                                                ) : suggestedUsers.length > 0 ? (
                                                    suggestedUsers.map((user, i) => (
                                                        <div
                                                            key={user.id || i}
                                                            className="p-2 md:p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                            onClick={() => {
                                                                setSelectedPerson(user);
                                                                setPersonQuery(getUserDisplayText(user));
                                                                clearFieldError('person');
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-purple-600 font-medium text-xs md:text-sm">
                                                                                {user.name?.charAt(0)?.toUpperCase() ||
                                                                                    user.email?.charAt(0)?.toUpperCase() ||
                                                                                    user.username?.charAt(0)?.toUpperCase() ||
                                                                                    "U"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="font-medium text-gray-900 text-sm md:text-base truncate">
                                                                                {user.name || user.email || user.username || `User #${user.id}`}
                                                                            </div>
                                                                            <div className="text-xs md:text-sm text-gray-600 truncate">
                                                                                {user.email || "No email"}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Assigned Events */}
                                                                    {user.assignedEvents && user.assignedEvents.length > 0 ? (
                                                                        <div className="ml-9 md:ml-10 mt-1 md:mt-2">
                                                                            <div className="text-xs text-gray-500 mb-1">Assigned events:</div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {user.assignedEvents.slice(0, 2).map((event, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                                                    >
                                                                                        <span className="truncate max-w-[80px] md:max-w-none">{event.eventName}</span>
                                                                                    </span>
                                                                                ))}
                                                                                {user.assignedEvents.length > 2 && (
                                                                                    <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                                        +{user.assignedEvents.length - 2} more
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="ml-9 md:ml-10 mt-1 md:mt-2">
                                                                            <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                                No assigned events
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Role Badge */}
                                                                <div className="text-right ml-2">
                                                                    <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                        {user.role === "ROLE_EVENT_ADMIN" ? "Event Admin" : user.role}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 md:p-6 text-center">
                                                        <div className="text-gray-400 mb-2">
                                                            <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-gray-500 font-medium text-sm md:text-base">
                                                            {personQuery ? "No admin found" : "No admin assigned yet"}
                                                        </div>
                                                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                                                            {personQuery ? "Try searching with a different name or email" : "No admins available"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Person */}
                                    {selectedPerson && (
                                        <div className="p-3 md:p-4 border border-green-300 rounded-lg bg-green-50">
                                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-green-600 font-medium text-sm md:text-base">
                                                            {selectedPerson.name?.charAt(0)?.toUpperCase() ||
                                                                selectedPerson.email?.charAt(0)?.toUpperCase() ||
                                                                selectedPerson.username?.charAt(0)?.toUpperCase() ||
                                                                "U"}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-gray-900 text-sm md:text-base truncate">
                                                            {selectedPerson.name || selectedPerson.email || selectedPerson.username || `User #${selectedPerson.id}`}
                                                        </div>
                                                        <div className="text-xs md:text-sm text-gray-600 truncate">
                                                            {selectedPerson.email || "No email"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium bg-white px-2 md:px-3 py-0.5 md:py-1 rounded border border-red-200 hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedPerson(null);
                                                        setPersonQuery("");
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Selected Person's Assigned Events */}
                                            {selectedPerson.assignedEvents && selectedPerson.assignedEvents.length > 0 && (
                                                <div className="ml-10 md:ml-13">
                                                    <div className="text-xs text-gray-600 mb-1">Currently assigned to:</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedPerson.assignedEvents.slice(0, 3).map((event, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                <span className="truncate max-w-[80px] md:max-w-none">{event.eventName}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                {!selectedPerson && (
                                    <div className="relative flex items-center py-3 md:py-4">
                                        <div className="flex-grow border-t border-gray-300"></div>
                                        <span className="flex-shrink mx-3 md:mx-4 text-xs md:text-sm text-gray-500 font-medium">OR</span>
                                        <div className="flex-grow border-t border-gray-300"></div>
                                    </div>
                                )}

                                {/* Add New Person Fields - Show only if no person is selected */}
                                {!selectedPerson && (
                                    <div className="space-y-3 md:space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg">
                                        <h4 className="text-gray-700 font-semibold text-xs md:text-sm">Add a new person:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Username <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    placeholder="Enter username"
                                                    className={`w-full border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm`}
                                                    onChange={() => clearFieldError('username')}
                                                />
                                                {formErrors.username && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    placeholder="Enter email"
                                                    className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm`}
                                                    onChange={() => clearFieldError('email')}
                                                />
                                                {formErrors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        id="password"
                                                        placeholder="Enter password"
                                                        className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm pr-10`}
                                                        onChange={() => clearFieldError('password')}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                    >
                                                        {showPassword ? (
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                                {formErrors.password && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    id="phone"
                                                    placeholder="Enter phone number (10 digits)"
                                                    className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} p-2 rounded text-sm`}
                                                    onChange={() => clearFieldError('phone')}
                                                />
                                                {formErrors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-2">
                                            <p>Fields marked with <span className="text-red-500">*</span> are required</p>
                                            <div>
                                                <p className="font-medium mb-1">Password requirements:</p>
                                                <ul className="list-disc list-inside ml-2 space-y-0.5">
                                                    <li>At least 6 characters</li>
                                                    <li>Contains letters (a-z, A-Z)</li>
                                                    <li>Contains numbers (0-9)</li>
                                                    <li>Contains special characters (!@#$%^&* etc.)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 transition text-sm md:text-base cursor-pointer"
                                    onClick={() => {
                                        setShowForm(false);
                                        handleCloseForm();
                                    }}
                                    disabled={isSubmitting || isUploadingLogo}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-3xl hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer"
                                    onClick={handleCreateEvent}
                                    disabled={isSubmitting || isUploadingLogo}
                                >
                                    {isSubmitting || isUploadingLogo ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                                            <span>
                                                {isUploadingLogo ? "Uploading Logo..." :
                                                    isSubmitting ? "Creating Event..." : "Processing..."}
                                            </span>
                                        </>
                                    ) : (
                                        "Create Event"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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