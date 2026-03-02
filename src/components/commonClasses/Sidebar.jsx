import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    Event,
    Assignment,
    People,
    BarChart,
    Settings,
    Menu as MenuIcon,
    ChevronLeft,
    Dashboard as DashboardIcon,
    CalendarMonth,
    Analytics,
    AdminPanelSettings,
    Person,
    Logout,
    DarkMode,
    LightMode,
    Menu,
    Close,
TrendingUp
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";

// Import logos
import QPBigLogo from '/src/assets/QP_Big.png';
import QPSmallLogo from '/src/assets/QP_Small.png';
import { clearUser } from "../../redux/userSlice";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const logoutConfirmRef = useRef(null);
    const sidebarRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const dispatch=useDispatch();

    const EVENT_ROLES = [
        "ROLE_EVENT_ADMIN",
        "ROLE_COORDINATOR"
    ];

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            
            // Auto close sidebar on mobile when resizing from desktop to mobile
            if (mobile && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, setIsOpen]);

    // Handle swipe gestures for mobile
    useEffect(() => {
        if (!isMobile) return;

        const handleTouchStart = (e) => {
            touchStartX.current = e.touches[0].clientX;
        };

        const handleTouchMove = (e) => {
            touchEndX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            const swipeDistance = touchEndX.current - touchStartX.current;
            
            // Swipe right to open sidebar (from left edge)
            if (touchStartX.current < 50 && swipeDistance > 50 && !isOpen) {
                setIsOpen(true);
            }
            
            // Swipe left to close sidebar
            if (swipeDistance < -50 && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, isOpen, setIsOpen]);

    // Handle click outside for logout confirmation
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (logoutConfirmRef.current && !logoutConfirmRef.current.contains(event.target)) {
                setShowLogoutConfirm(false);
            }
        };

        if (showLogoutConfirm) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showLogoutConfirm]);

    // Handle body scroll lock when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, isOpen]);

    const hasEventRole = (user) => {
        if (!user) return false;
        return (
            EVENT_ROLES.includes(user.platformRole) ||
            EVENT_ROLES.includes(user.highestEventRole)
        );
    };

    const user = useSelector((state) => state.user.user);

    const menu = [
        {
            name: "Dashboard",
            icon: hasEventRole(user) ? <DashboardIcon /> : <Home />,
            path: hasEventRole(user) ? "/eventAdminDashboard" : "/dashboard"
        },
        {
            name: hasEventRole(user) ? "Events" : "Create Event",
            icon: <Event />,
            path: hasEventRole(user) ? "/events" : "/create-event"
        },
        {
            name: "Analytics",
            icon: <Analytics />,
            path: "/analytics",
            hidden: !hasEventRole(user)
        },
{
            name: "User Performance", // New menu item
            icon: <TrendingUp />, // Using TrendingUp icon
            path: "/user-analytics",
            hidden: !hasEventRole(user) // Show only for event admins and coordinators
        },
        {
            name: "Settings",
            icon: <Settings />,
            path: "/settings"
        }
    ].filter(item => !item.hidden);

    const getSidebarTitle = (user) => {
        if (!user) return { title: "Guest", icon: <Person className="text-gray-400" /> };
        
        const roleConfig = {
            "ROLE_SUPER_ADMIN": { title: "Super Admin", icon: <AdminPanelSettings className="text-amber-400" /> },
            "ROLE_EVENT_ADMIN": { title: "Event Admin", icon: <AdminPanelSettings className="text-blue-400" /> },
            "ROLE_ADMIN": { title: "Admin", icon: <AdminPanelSettings className="text-green-400" /> },
            "ROLE_COORDINATOR": { title: "Coordinator", icon: <Person className="text-purple-400" /> }
        };

        const role = user.platformRole === "ROLE_SUPER_ADMIN" 
            ? user.platformRole 
            : user.highestEventRole;
        
        return roleConfig[role] || { title: "User", icon: <Person className="text-gray-400" /> };
    };

    const roleInfo = getSidebarTitle(user);

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user || !user.name) return "U";
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

     const handleLogoutConfirm = async () => {
        try {
            // Use axiosInstance - it will add the token automatically
            // Make sure your AxiosInstance.js is configured to ADD token to logout
            const response = await axiosInstance.post("/user/logout", {}, {
                withCredentials: true
            });

            console.log("✅ Backend logout successful:", response.data);
        } catch (error) {
            console.log("⚠️ Backend logout error:", error.response?.data?.message || error.message);
        } finally {
            // Clear all local tokens
            sessionStorage.removeItem("00y");
            Cookies.remove("00x", { path: "/" });
            dispatch(clearUser());

            try {
                broadcastChannel.postMessage({ type: 'LOGOUT' });
            } catch (e) {
                console.log("Broadcast failed:", e);
            }

            navigate("/login");
        }
    };

    // Handle logout cancel
    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    // Handle logout click
    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    // Handle menu item click
    const handleMenuItemClick = (path) => {
        navigate(path);
        if (isMobile) {
            setIsOpen(false);
        }
    };

    // Consistent gradient for all active/hover states
    const activeGradient = "from-purple-500 to-pink-500";

    return (
        <>
            {/* Mobile Navigation Bar - Only visible on mobile */}
            {isMobile && (
                <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center px-4 shadow-sm">
                    <div className="flex items-center justify-between w-full">
                        {/* Left side - Menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Center - Company Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <img 
                                src={QPBigLogo} 
                                alt="QP Logo"
                                className="h-8 w-auto object-contain"
                                loading="lazy"
                            />
                        </div>

                        {/* Right side - User avatar (or empty div for balance) */}
                        {user ? (
                            <div className={`
                                w-8 h-8 rounded-full 
                                bg-gradient-to-br ${activeGradient} 
                                flex items-center justify-center 
                                shadow-md
                            `}>
                                <span className="text-white font-semibold text-xs">
                                    {getUserInitials()}
                                </span>
                            </div>
                        ) : (
                            <div className="w-8 h-8" /> // Empty div for balance
                        )}
                    </div>
                </nav>
            )}

            {/* Desktop Menu Button - Only visible on desktop when sidebar is closed */}
            {!isMobile && !isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            )}

            {/* Backdrop for mobile */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed inset-y-0 left-0 z-50
                    h-full 
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isMobile 
                        ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-64` 
                        : isOpen 
                            ? "w-64" 
                            : "w-20"
                    }
                    bg-gradient-to-b from-white/95 to-white/90
                    dark:from-gray-900/95 dark:to-gray-900/90
                    backdrop-blur-xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                    border-r border-white/20
                    flex flex-col
                    overflow-hidden
                    ${isMobile ? 'top-16' : 'top-0'} /* Mobile sidebar starts below navbar */
                `}
            >
                {/* Decorative gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeGradient}`} />

                {/* Mobile Close Button - Only show on mobile when open */}
                {isMobile && isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 z-50 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md"
                        aria-label="Close menu"
                    >
                        <Close className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                )}

                {/* Add padding-top to push all content down */}
                <div className="pt-4 flex flex-col h-full">
                    {/* HEADER - Logo Section (Desktop only) */}
                    {!isMobile && (
                        <div className={`flex items-center h-20 border-b border-gray-100 dark:border-gray-800 relative ${isOpen ? "px-4 justify-between" : "px-2 justify-center"}`}>
                            {!isOpen ? (
                                // Small logo when sidebar is closed
                                <div className="relative flex items-center justify-center w-full">
                                    <img 
                                        src={QPSmallLogo} 
                                        alt="QP Small Logo"
                                        className="h-10 w-auto object-contain"
                                        loading="lazy"
                                    />
                                    <button
                                        onClick={() => setIsOpen(true)}
                                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform z-10"
                                        aria-label="Expand sidebar"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">{">"}</span>
                                    </button>
                                </div>
                            ) : (
                                // Big Logo when sidebar is open
                                <>
                                    <div className="flex items-center justify-center flex-1">
                                        <img 
                                            src={QPBigLogo} 
                                            alt="QP Big Logo"
                                            className="h-14 w-auto object-contain transition-all duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform flex-shrink-0"
                                        aria-label="Collapse sidebar"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* User Profile Section - Show when sidebar is open or on mobile */}
                    {(isOpen || isMobile) && user && (
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeGradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                    <span className="text-white font-semibold text-sm">
                                        {getUserInitials()}
                                    </span>
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                        {user?.name || "User"}
                                    </h2>
                                    <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {roleInfo.icon}
                                        <span className="ml-1 truncate">{roleInfo.title}</span>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            </div>
                        </div>
                    )}

                    {/* MENU */}
                    <nav className="flex-1 overflow-y-auto py-3 hide-scrollbar">
                        <div className={isOpen || isMobile ? "px-3" : "px-2"}>
                            {menu.map((item, i) => {
                                const active = location.pathname === item.path;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleMenuItemClick(item.path)}
                                        className={`
                                            relative flex items-center rounded-xl mb-1 cursor-pointer transition-all duration-300
                                            ${(isOpen || isMobile) ? "px-3 py-2.5" : "p-2.5 justify-center"}
                                            ${active
                                                ? `bg-gradient-to-r ${activeGradient} text-white shadow-md`
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }
                                            group
                                            select-none
                                        `}
                                        role="button"
                                        tabIndex={0}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        {active && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                                        )}

                                        <span className={`
                                            w-5 h-5 flex items-center justify-center flex-shrink-0
                                            ${active 
                                                ? "text-white" 
                                                : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                                            }
                                        `}>
                                            {item.icon}
                                        </span>

                                        {(isOpen || isMobile) && (
                                            <span className={`
                                                ml-3 text-sm font-medium truncate
                                                transition-all duration-300
                                                ${active 
                                                    ? "text-white" 
                                                    : "text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                                                }
                                            `}>
                                                {item.name}
                                            </span>
                                        )}

                                        {!isOpen && !isMobile && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {/* FOOTER */}
                    <div className={`
                        flex-shrink-0
                        border-t border-gray-100 dark:border-gray-800
                        ${(isOpen || isMobile) ? "p-3" : "p-2"}
                        bg-inherit
                    `}>
                        {/* Theme toggle */}
                        <div
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`
                                flex items-center
                                rounded-xl
                                cursor-pointer
                                transition-all duration-300
                                ${(isOpen || isMobile) ? "px-3 py-2.5" : "p-2.5 justify-center"}
                                hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20
                                text-gray-600 dark:text-gray-400
                                hover:text-purple-600 dark:hover:text-purple-400
                                mb-1
                                group
                            `}
                            role="button"
                            tabIndex={0}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                {isDarkMode ? <LightMode className="w-4 h-4" /> : <DarkMode className="w-4 h-4" />}
                            </span>
                            {(isOpen || isMobile) && (
                                <span className="ml-3 text-sm font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                                </span>
                            )}
                        </div>

                        {/* Logout button */}
                        <div
                            onClick={handleLogoutClick}
                            className={`
                                flex items-center
                                rounded-xl
                                cursor-pointer
                                transition-all duration-300
                                ${(isOpen || isMobile) ? "px-3 py-2.5" : "p-2.5 justify-center"}
                                hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20
                                text-gray-600 dark:text-gray-400
                                hover:text-purple-600 dark:hover:text-purple-400
                                group
                            `}
                            role="button"
                            tabIndex={0}
                            aria-label="Logout"
                        >
                            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                <Logout className="w-4 h-4" />
                            </span>
                            {(isOpen || isMobile) && (
                                <span className="ml-3 text-sm font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                    Logout
                                </span>
                            )}
                        </div>

                        {/* Version info */}
                        {(isOpen || isMobile) && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-400 dark:text-gray-600">
                                    Version 2.0.0
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        ref={logoutConfirmRef}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slideUp"
                    >
                        {/* Modal Header */}
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mr-3">
                                    <Logout className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Confirm Logout</h3>
                                    <p className="text-sm text-gray-500 mt-1">Are you sure you want to log out?</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 md:p-6">
                            <p className="text-gray-600">
                                You will be signed out of your account. To access your account again,
                                you'll need to log in with your credentials.
                            </p>

                            {/* Current user info */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white mr-3`}>
                                        <Person className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleLogoutCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-3xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-3xl transition-colors cursor-pointer flex items-center gap-2"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }

                /* Hide scrollbar for Chrome, Safari and Opera */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                /* Hide scrollbar for IE, Edge and Firefox */
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                /* Better touch targets for mobile */
                @media (max-width: 1023px) {
                    button, [role="button"] {
                        min-height: 44px;
                        min-width: 44px;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;

