import { useState, useEffect } from "react";
import axiosInstance from "../../helper/AxiosInstance";
import { useNotification } from "../../contestAPI/NotificationProvider";

const EditEventModal = ({ event, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: event.name || "",
        description: event.description || "",
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
        location: event.location || "",
        logo: event.logo || event.logoUrl || ""
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(event.logo || event.logoUrl || "");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [charCount, setCharCount] = useState(event.description?.length || 0);
    const { success, error } = useNotification();

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    // Handle logo file change - UPLOAD IMMEDIATELY
    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setLogoFile(file);
        setIsUploading(true);

        try {
            // Upload file immediately
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            const uploadRes = await axiosInstance.post("/file/upload", uploadFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (uploadRes.data.status === "success" && uploadRes.data.url) {
                // Update form data with uploaded URL
                setFormData(prev => ({
                    ...prev,
                    logo: uploadRes.data.url
                }));
                // Logo upload notification will be handled by parent after modal closes
            } else {
                throw new Error(uploadRes.data.message || "Failed to upload logo");
            }
        } catch (err) {
            console.error("Error uploading logo:", err);
            // Logo upload error will be shown in the modal
            // Reset on error
            setLogoPreview("");
            setLogoFile(null);
            e.target.value = "";
        } finally {
            setIsUploading(false);
        }
    };

    // Remove logo
    const handleRemoveLogo = () => {
        setLogoPreview("");
        setLogoFile(null);
        setFormData(prev => ({ ...prev, logo: "" }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = "Event Name is required";
        if (!formData.startDate) errors.startDate = "Start Date is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Prepare data for update
            const updateData = {
                name: formData.name,
                description: formData.description || "",
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                location: formData.location || "",
                logo: formData.logo || ""
            };

            // Send update request
            const res = await axiosInstance.put(`/admin/events/${event.eventId || event.id}`, updateData);

            if (res.data.status === "success") {
                // Call onUpdate which will show notification and close modal
                if (onUpdate) {
                    onUpdate("Event updated successfully!");
                }
            } else {
                throw new Error(res.data.message || "Failed to update event");
            }
        } catch (err) {
            console.error("Error updating event:", err);
            // For errors, we need to show notification in modal before closing
            // Or pass error message to parent
            if (onUpdate) {
                onUpdate("Error updating event: " + (err.response?.data?.message || err.message), "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && !isSubmitting && !isUploading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isSubmitting, isUploading, onClose]);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            {/* Modal Container - Stop propagation on inner click */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white flex items-center justify-between p-4 md:p-6 border-b border-gray-200 rounded-t-2xl z-10">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800">Modify Event</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 md:p-2 rounded-lg transition-colors cursor-pointer"
                        disabled={isSubmitting || isUploading}
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 md:p-6">
                    <div className="space-y-6">
                        {/* Event Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Enter event name"
                                disabled={isSubmitting}
                            />
                            {formErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Description - FIXED: Ensure value is properly set */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                type="text"
                                name="description"
                                value={formData.description}
                                maxLength={500}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setCharCount(e.target.value.length);
                                }}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                                placeholder="Enter event description (max 500 characters)"
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                    Maximum 500 characters
                                </p>
                                <p className="text-xs text-gray-500">
                                    <span>{charCount}</span>/500
                                </p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className={`w-full border ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                    disabled={isSubmitting}
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
                                    name="endDate"
                                    value={formData.endDate || ""}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter event location"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Logo
                            </label>
                            <div className="space-y-3">
                                {/* Logo Preview */}
                                {logoPreview && (
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-700">Current Logo:</span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isSubmitting || isUploading}
                                            >
                                                Remove Logo
                                            </button>
                                        </div>
                                        <div className="flex justify-center">
                                            <img
                                                src={logoPreview}
                                                alt="Event logo preview"
                                                className="h-24 w-auto object-contain rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="text-gray-500 text-sm">Logo failed to load</div>';
                                                }}
                                            />
                                        </div>
                                        {isUploading && (
                                            <div className="mt-2 text-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 inline-block mr-2"></div>
                                                <span className="text-xs text-gray-500">Uploading logo...</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {logoPreview ? "Upload New Logo" : "Upload Logo"}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className={`cursor-pointer ${(isSubmitting || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className={`px-4 py-2.5 ${isUploading ? 'bg-gray-400' : 'bg-gray-600'} text-white rounded-3xl hover:bg-gray-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                {isUploading ? "Uploading..." : "Choose File"}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                                disabled={isSubmitting || isUploading}
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            {logoFile ? logoFile.name : "No file chosen"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload a new logo to replace the current one
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-3xl hover:bg-gray-50 transition font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isSubmitting || isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-purple-600 text-white px-6 py-2.5 rounded-3xl hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isSubmitting || isUploading}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Updating Event...</span>
                                    </>
                                ) : (
                                    "Update Event"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default EditEventModal