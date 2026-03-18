import { useState, useEffect } from "react";
import Sidebar from "../commonClasses/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and when window resizes
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
        };
        
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-screen z-40">
                <Sidebar
                    isOpen={sidebarOpen}
                    setIsOpen={setSidebarOpen}
                />
            </div>

            {/* Main content area */}
            <div
                className={`
                    flex-1 transition-all duration-300 ease-in-out
                    ${!isMobile && sidebarOpen ? "ml-64" : ""}
                    ${!isMobile && !sidebarOpen ? "ml-20" : ""}
                    ${isMobile ? "ml-0" : ""}
                    /* Different top padding for mobile vs desktop */
                    ${isMobile ? "pt-20" : "pt-6"}
                `}
            >
                <div className="px-4 md:px-6 py-4">
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;