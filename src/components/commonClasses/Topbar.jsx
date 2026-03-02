import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const Topbar = () => {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const profileMenuRef = useRef(null);
    const logoutConfirmRef = useRef(null);
    const user = useSelector((state) => state.user.user);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (logoutConfirmRef.current && !logoutConfirmRef.current.contains(event.target)) {
                setShowLogoutConfirm(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle profile click
    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    // Handle menu item click
    const handleMenuItemClick = (action) => {
        setShowProfileMenu(false);

        switch (action) {
            case "settings":
                navigate("/settings");
                break;
            case "logout":
                setShowLogoutConfirm(true);
                break;
            default:
                break;
        }
    };

    // Handle logout confirmation
    const handleLogoutConfirm = () => {
        sessionStorage.removeItem("00y");
        Cookies.remove("00x", { path: "/" });
        navigate("/login");
    };

    // Handle logout cancel
    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <div className="bg-white shadow-md sticky top-0 z-50">
                {/* Reduce vertical padding to keep same overall height */}
                <div className="flex justify-between items-center py-2 px-4 md:px-6">
                    {/* Larger Logo with right margin */}
                    <div
                        className="cursor-pointer ml-4 md:ml-6"
                        onClick={() => navigate("/dashboard")}
                    >
                        <img
                            src="https://play-lh.googleusercontent.com/zIXM3XtuIdpqOG1QtqgcxqjVx_-AM99y50kslkXDGW0YBR880wbduOoN3BQ4GPO3Sg=w240-h480-rw"
                            alt="AI Lume"
                            className="h-14 md:h-16 object-contain"
                        />
                    </div>

                    {/* Profile Section with Dropdown */}
                    <div className="relative" ref={profileMenuRef}>
                        {/* Profile Icon Button */}
                        <button
                            onClick={handleProfileClick}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
                            aria-label="Profile menu"
                        >
                            <PersonIcon className="w-6 h-6" />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                {/* User Info Section */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email}
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => handleMenuItemClick("settings")}
                                        className="w-full flex items-center px-4 py-2.5 text-base font-semibold text-gray-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                    >
                                        <SettingsIcon className="w-5 h-5 mr-3 text-gray-500" />
                                        Settings
                                    </button>

                                    <button
                                        onClick={() => handleMenuItemClick("logout")}
                                        className="w-full flex items-center px-4 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <LogoutIcon className="w-5 h-5 mr-3" />
                                        Logout
                                    </button>
                                </div>

                                {/* Arrow pointing to profile button */}
                                <div className="absolute -top-2 right-2 w-4 h-4 transform rotate-45 bg-white border-t border-l border-gray-200"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    <LogoutIcon className="w-6 h-6 text-red-600" />
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
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mr-3">
                                        <PersonIcon className="w-4 h-4" />
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
                                {/* <LogoutIcon className="w-4 h-4" /> */}
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Topbar;