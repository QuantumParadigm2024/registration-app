import { useState } from "react";
import axiosInstance from "../../helper/AxiosInstance";
import { useNotification } from "../../contestAPI/NotificationProvider";

const AssignUserModal = ({ event, currentUser, onClose, onAssign }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { success, error } = useNotification();

    // Helper function to get user's effective role
    const getUserEffectiveRole = () => {
        if (!currentUser) return null;

        // Platform role takes precedence for system-wide permissions
        if (currentUser.platformRole === "ROLE_EVENT_ADMIN") {
            return currentUser.platformRole;
        }

        // Otherwise use the highest event role
        return currentUser.highestEventRole;
    };

    // Define available roles based on current user's effective role
    const getAvailableRoles = () => {
        const userRole = getUserEffectiveRole();

        switch (userRole) {
            case "ROLE_EVENT_ADMIN":
                return [
                    { value: "ROLE_EVENT_ADMIN", label: "Event Admin" },
                    { value: "ROLE_COORDINATOR", label: "Coordinator" }
                ];
            default:
                return [];
        }
    };

    const availableRoles = getAvailableRoles();

    // Get current user's role for display
    const getCurrentUserRoleDisplay = () => {
        const userRole = getUserEffectiveRole();

        switch (userRole) {
            case "ROLE_EVENT_ADMIN":
                return "Event Admin";
            case "ROLE_COORDINATOR":
                return "Coordinator";
            case "ROLE_USER":
                return "User";
            default:
                return "Unknown Role";
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation (required)
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Email validation (required)
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        // Phone validation (optional)
        if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = "Phone number must be 10 digits";
        }

        // Password validation (required)
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Role validation (required)
        if (!formData.role) {
            newErrors.role = "Role is required";
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({
            ...prev,
            phone: value
        }));
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get event ID
            const eventId = event.eventId || event.id;

            if (!eventId) {
                throw new Error("Event ID is missing");
            }

            // Prepare the data to send
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                // Include phone only if it has value
                ...(formData.phone.trim() && { phoneNumber: formData.phone }),
                assignedByUserId: currentUser.userId,
                assignedByName: currentUser.name,
                assignedByEmail: currentUser.email
            };

            // Use the correct endpoint with axiosInstance
            const response = await axiosInstance.post(`/admin/events/${eventId}/assign-user`, userData);

            // Check if the response indicates success
            if (response.status >= 200 && response.status < 300) {
                // Reset form
                setFormData({
                    username: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: ""
                });

                // Show success notification
                const successMessage = response.data?.message || "User assigned successfully!";
                success(successMessage);

                // Call parent callback
                onAssign(successMessage);
            } else {
                throw new Error(response.data?.message || "Failed to assign user");
            }

        } catch (error) {
            console.error('Error assigning user:', error);

            // Handle different error types
            let errorMessage = "Failed to assign user. Please try again.";

            if (error.response) {
                // Server responded with an error status
                errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    `Server error: ${error.response.status}`;

                // Handle validation errors from server
                if (error.response.data?.errors) {
                    const serverErrors = error.response.data.errors;
                    setErrors(prev => ({
                        ...prev,
                        ...serverErrors,
                        submit: errorMessage
                    }));
                    return;
                }
            } else if (error.request) {
                // Request was made but no response
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Something else happened
                errorMessage = error.message || "An unexpected error occurred.";
            }

            // Show error notification
            error(errorMessage);

            setErrors({
                submit: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slideUp my-4 max-h-[90vh] flex flex-col">
                {/* Modal Header - Fixed */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl flex-shrink-0">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800">Assign User to Event</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Add a new user to "{event.name || event.eventName}"
                        </p>
                        <div className="mt-1 text-xs text-gray-600">
                            <span className="font-medium">Your Role:</span> {getCurrentUserRoleDisplay()}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Username - Required */}
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.username ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter username"
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                    )}
                                </div>

                                {/* Email - Required */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone - Optional */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter 10-digit phone number (optional)"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Optional - Provide if available
                                    </p>
                                </div>

                                {/* Password - Required with visibility toggle */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                {/* Role - Required */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.role ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a role</option>
                                        {availableRoles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Available roles: {availableRoles.map(r => r.label).join(', ')}
                                    </p>
                                </div>

                                {/* Required fields note */}
                                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    <p>Fields marked with <span className="text-red-500">*</span> are required</p>
                                </div>

                                {/* Submit error */}
                                {errors.submit && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{errors.submit}</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Modal Footer - Fixed */}
                <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-3xl transition-colors cursor-pointer"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-3xl transition-colors cursor-pointer ${isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Assigning...
                            </span>
                        ) : (
                            'Assign User'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignUserModal;