import { Globe, Mail, Phone, File, ArrowLeft } from "lucide-react";

const FormPreview = ({ formData, onBack }) => {
    const { title, fields = [], formSections = [] } = formData;

    // Sort sections by displayOrder
    const sortedSections = [...formSections].sort((a, b) =>
        (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    // Sort fields by displayOrder
    const sortedFields = [...fields].sort((a, b) =>
        (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    const renderSection = (section) => {
        const sectionData = section.dataJson ? JSON.parse(section.dataJson) : section.data || {};

        switch (section.type) {
            case 'FORM_HEADER':
                return (
                    <div
                        className="w-full py-4 px-4 text-center"
                        style={{
                            backgroundColor: sectionData.backgroundColor || '#4F46E5'
                        }}
                    >
                        {sectionData.showTitle !== false && sectionData.title && (
                            <h1
                                className="text-xl md:text-2xl font-bold mb-1"
                                style={{ color: sectionData.titleColor || '#FFFFFF' }}
                            >
                                {sectionData.title}
                            </h1>
                        )}
                        {sectionData.showSubtitle !== false && sectionData.subtitle && (
                            <p
                                className="text-sm md:text-base"
                                style={{ color: sectionData.subtitleColor || '#E5E7EB' }}
                            >
                                {sectionData.subtitle}
                            </p>
                        )}
                    </div>
                );

            case 'FORM_LOGO':
                if (sectionData.showLogo === false || !sectionData.logoUrl) return null;

                const logoSizeClasses = {
                    small: 'w-12 h-12',
                    medium: 'w-16 h-16',
                    large: 'w-20 h-20'
                };

                const alignmentClasses = {
                    left: 'justify-start',
                    center: 'justify-center',
                    right: 'justify-end'
                };

                return (
                    <div
                        className={`py-3 px-4 flex ${alignmentClasses[sectionData.logoAlignment] || 'justify-center'}`}
                        style={{
                            backgroundColor: sectionData.backgroundColor || '#FFFFFF'
                        }}
                    >
                        <div className={`${logoSizeClasses[sectionData.logoSize] || 'w-16 h-16'} flex items-center justify-center`}>
                            <img
                                src={sectionData.logoUrl}
                                alt="Event Logo"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm">Logo not available</div>';
                                }}
                            />
                        </div>
                    </div>
                );

            case 'FORM_SPONSORS':
                if (sectionData.showSection === false || !sectionData.sponsors || sectionData.sponsors.length === 0) {
                    return null;
                }

                return (
                    <div className="py-4 px-4 bg-gray-50">
                        <h2 className="text-base font-semibold text-center mb-3">
                            {sectionData.title || 'Our Sponsors'}
                        </h2>
                        <div className={`grid ${sectionData.layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-3`}>
                            {sectionData.sponsors.map((sponsor, index) => (
                                <div key={index} className="flex items-center justify-center p-1">
                                    <img
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        className="max-h-10 object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'FORM_DESCRIPTION':
                if (sectionData.showSection === false || !sectionData.description) return null;

                return (
                    <div className="py-4 px-4">
                        <div className="max-w-2xl mx-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {sectionData.description}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderField = (field) => {
        const baseInputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500";

        switch (field.fieldType || field.type) {
            case 'text':
            case 'TEXT':
                return (
                    <input
                        type="text"
                        className={baseInputClass}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        disabled
                    />
                );

            case 'textarea':
            case 'TEXTAREA':
                return (
                    <textarea
                        className={`${baseInputClass} resize-none`}
                        rows="3"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        disabled
                    />
                );

            case 'email':
            case 'EMAIL':
                return (
                    <input
                        type="email"
                        className={baseInputClass}
                        placeholder={field.placeholder || "email@example.com"}
                        disabled
                    />
                );

            case 'phone':
            case 'PHONE':
                return (
                    <input
                        type="tel"
                        className={baseInputClass}
                        placeholder={field.placeholder || "(123) 456-7890"}
                        disabled
                    />
                );

            case 'number':
            case 'NUMBER':
                return (
                    <input
                        type="number"
                        className={baseInputClass}
                        placeholder={field.placeholder || "Enter a number"}
                        disabled
                    />
                );

            case 'date':
            case 'DATE':
                return (
                    <input
                        type="date"
                        className={baseInputClass}
                        disabled
                    />
                );

            case 'select':
            case 'DROPDOWN':
                const options = field.optionsJson ? JSON.parse(field.optionsJson) : field.options || [];
                return (
                    <select className={baseInputClass} disabled>
                        <option value="">{field.placeholder || "Choose an option"}</option>
                        {options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'radio':
            case 'RADIO':
                const radioOptions = field.optionsJson ? JSON.parse(field.optionsJson) : field.options || [];
                return (
                    <div className="space-y-1">
                        {radioOptions.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name={`field-${field.formFieldId || field.id}`}
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    disabled
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'checkbox':
            case 'CHECKBOX':
                const checkboxOptions = field.optionsJson ? JSON.parse(field.optionsJson) : field.options || [];
                return (
                    <div className="space-y-1">
                        {checkboxOptions.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    disabled
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'file':
            case 'FILE':
                return (
                    <div className="border border-dashed border-gray-300 rounded p-3 text-center bg-gray-50">
                        <File className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-gray-600 text-xs mb-1">Click to upload</p>
                        <p className="text-xs text-gray-500">{field.placeholder || "PNG, JPG, PDF up to 10MB"}</p>
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        className={baseInputClass}
                        placeholder={field.placeholder || "Enter text"}
                        disabled
                    />
                );
        }
    };

    return (
        <div className="min-h-screen">
            {/* Form Container - Centered with max width */}
            <div className="py-4 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Render all form sections with minimal spacing */}
                        {sortedSections
                            .filter(section => {
                                const sectionData = section.dataJson ? JSON.parse(section.dataJson) : section.data || {};
                                return sectionData.showSection !== false;
                            })
                            .map((section, index) => (
                                <div key={`${section.type}-${index}`}>
                                    {renderSection(section)}
                                </div>
                            ))
                        }

                        {/* Form fields container - reduced padding */}
                        <div className="py-6 px-4 md:px-6">
                            <div className="max-w-2xl mx-auto space-y-4">
                                {!title && (
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800">Registration Form</h2>
                                        <p className="text-sm text-gray-600 mt-1">Please fill in your details</p>
                                    </div>
                                )}

                                {sortedFields.length > 0 ? (
                                    sortedFields.map((field, index) => (
                                        <div key={field.formFieldId || field.id || index} className="space-y-1.5">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {renderField(field)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <div className="text-gray-400 mb-2">📋</div>
                                        <p className="text-sm text-gray-600">No fields in this form</p>
                                        <p className="text-xs text-gray-500 mt-1">Add fields to start collecting responses</p>
                                    </div>
                                )}

                                {/* Submit button - reduced top padding */}
                                <div className="pt-3 flex flex-col items-center">
                                    <button
                                        className="py-2.5 px-6 bg-purple-300 text-white font-medium rounded-3xl cursor-not-allowed opacity-70 text-sm"
                                        disabled
                                    >
                                        Submit Form
                                    </button>
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        This is a preview. Submit is disabled.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - reduced margin */}
            <div className="border-t border-gray-200 bg-white mt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-xs text-center text-gray-500">
                        Powered by Your Application Name
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FormPreview;