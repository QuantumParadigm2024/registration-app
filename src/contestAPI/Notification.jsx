import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X, Info, AlertTriangle } from "lucide-react";

const Notification = ({
    message,
    type = "success",
    duration = 3000,
    onClose,
    position = "top-right"
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    // Get icon based on type
    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    // Get background color based on type
    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200";
            case "error":
                return "bg-red-50 border-red-200";
            case "warning":
                return "bg-yellow-50 border-yellow-200";
            case "info":
                return "bg-blue-50 border-blue-200";
            default:
                return "bg-green-50 border-green-200";
        }
    };

    // Get text color based on type
    const getTextColor = () => {
        switch (type) {
            case "success":
                return "text-green-800";
            case "error":
                return "text-red-800";
            case "warning":
                return "text-yellow-800";
            case "info":
                return "text-blue-800";
            default:
                return "text-green-800";
        }
    };

    // Get progress bar color based on type
    const getProgressColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            case "info":
                return "bg-blue-500";
            default:
                return "bg-green-500";
        }
    };

    // Get position classes
    const getPositionClasses = () => {
        switch (position) {
            case "top-left":
                return "top-4 left-4";
            case "top-center":
                return "top-4 left-1/2 transform -translate-x-1/2";
            case "top-right":
                return "top-4 right-4";
            case "bottom-left":
                return "bottom-4 left-4";
            case "bottom-center":
                return "bottom-4 left-1/2 transform -translate-x-1/2";
            case "bottom-right":
                return "bottom-4 right-4";
            default:
                return "top-4 right-4";
        }
    };

    // Handle close
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Wait for exit animation
    };

    useEffect(() => {
        if (!duration) return;

        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        // Progress bar animation
        const interval = setInterval(() => {
            setProgress(prev => {
                const decrement = (100 / duration) * 50; // Update every 50ms
                return Math.max(prev - decrement, 0);
            });
        }, 50);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration]);

    return (
        <div className={`fixed ${getPositionClasses()} z-[10000]`}>
            <div
                className={`${getBgColor()} border rounded-lg shadow-lg min-w-[300px] max-w-md transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95 pointer-events-none'}`}
            >
                {/* Progress bar */}
                {duration > 0 && (
                    <div className="h-1 w-full bg-gray-200 rounded-t-lg overflow-hidden">
                        <div
                            className={`h-full ${getProgressColor()} transition-all duration-100 ease-linear`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Notification content */}
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon()}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className={`text-sm font-medium ${getTextColor()}`}>
                                {message}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${getTextColor()} hover:opacity-75`}
                            >
                                <span className="sr-only">Close</span>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;