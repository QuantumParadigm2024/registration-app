import { Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Register from './auth/Register.jsx'
import Login from './auth/Login.jsx'
import Dashboard from './components/dashboard/Dashboard'
import Home from './staticPages/home/Home'
import PrivateRoute from './helper/PrivateRoute'
import CreateEvent from './components/events/CreateEvent'
import EventAdminManagement from './components/events/EventAdminManagement'
import AdminLayout from './components/commonClasses/AdminLayout'
import Analytics from './components/analytics/Analytics'
import Settings from './components/settings/Settings'
import AboutUs from './staticPages/aboutUs/AboutUs'
import { setUser, clearUser } from "./redux/userSlice";
import axiosInstance, { setNavigate, setNotification } from "./helper/AxiosInstance";
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import EventAdminDashboard from './components/dashboard/EventAdminDashboard'
import PrivacyPolicy from './staticPages/privacyPolicy/PrivacyPolicy'
import ManageEvent from './components/events/ManageEvent'
import PublicRegistrationForm from './components/events/PublicRegistrationForm'
import EventTracking from './components/events/tracking/EventTracking';
import EventRegistrationsPage from './components/events/EventRegistrationsPage'
import { useNotification } from './contestAPI/NotificationProvider'
import Cookies from 'js-cookie';
import UserAnalytics from './/components/analytics/UserAnalytics'
import UserReport from './components/analytics/UserReport'
import EventAnalytics from './components/analytics/EventAnalytics'
import QRScanPage from './components/events/tracking/QRScanPage'
import ContactUs from './staticPages/contactus'
import NotFoundPage from './NotFoundPage'
import BookDemoPage from './staticPages/home/BookDemoPage'
import VerifyEmail from './auth/VerifyEmail.jsx'

// Loading component
const LoadingSpinner = () => (
    <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

// Root route handler component
// const RootRoute = () => {
//     const user = useSelector(state => state.user);
//     const token = sessionStorage.getItem("00y");
//     const { showSessionExpired } = useNotification();
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     console.log("🏠 RootRoute - User:", user);
//     console.log("🏠 RootRoute - Token:", !!token);

//     useEffect(() => {
//         const checkAuthAndRedirect = async () => {
//             // If no token, stay on home page
//             if (!token) {
//                 console.log("🏠 No token, staying on home");
//                 return;
//             }

//             // If we have token but no user data, try to fetch it
//             if (token && !user?.userId) {
//                 console.log("🏠 Token exists but no user data, fetching...");
//                 try {
//                     const res = await axiosInstance.get("/user/auth/me");
//                     console.log("🏠 User fetched:", res.data);
//                     dispatch(setUser(res.data));
                    
//                     // After fetching user, determine redirect
//                     const EVENT_ADMIN_ROLES = [
//                         "ROLE_EVENT_ADMIN",
//                         "ROLE_ADMIN",
//                         "ROLE_COORDINATOR"
//                     ];

//                     const hasEventAdminRole = (
//                         EVENT_ADMIN_ROLES.includes(res.data.platformRole) ||
//                         (res.data.highestEventRole && EVENT_ADMIN_ROLES.includes(res.data.highestEventRole))
//                     );

//                     console.log("🏠 Has event admin role:", hasEventAdminRole);
                    
//                     if (hasEventAdminRole) {
//                         navigate('/eventAdminDashboard', { replace: true });
//                     } else {
//                         navigate('/dashboard', { replace: true });
//                     }
//                 } catch (error) {
//                     console.log("🏠 Failed to fetch user:", error);
//                     if (error.response?.status === 401) {
//                         sessionStorage.removeItem("00y");
//                         Cookies.remove("00x", { path: "/" });
//                         dispatch(clearUser());
//                     }
//                 }
//                 return;
//             }

//             // If we have user data, redirect immediately
//             if (token && user?.userId) {
//                 console.log("🏠 User data exists, redirecting...");
//                 const EVENT_ADMIN_ROLES = [
//                     "ROLE_EVENT_ADMIN",
//                     "ROLE_ADMIN",
//                     "ROLE_COORDINATOR"
//                 ];

//                 const hasEventAdminRole = (
//                     EVENT_ADMIN_ROLES.includes(user.platformRole) ||
//                     (user.highestEventRole && EVENT_ADMIN_ROLES.includes(user.highestEventRole))
//                 );

//                 console.log("🏠 Has event admin role:", hasEventAdminRole);
                
//                 if (hasEventAdminRole) {
//                     navigate('/eventAdminDashboard', { replace: true });
//                 } else {
//                     navigate('/dashboard', { replace: true });
//                 }
//             }
//         };

//         checkAuthAndRedirect();
//     }, [token, user, dispatch, navigate]);

//     // Show loading while checking/redirecting
//     if (token && !user?.userId) {
//         return <LoadingSpinner />;
//     }

//     // If no token, show home page
//     return <Home />;
// };

// Root route handler component
const RootRoute = () => {
    const user = useSelector(state => state.user);
    const token = sessionStorage.getItem("00y");
    const refreshToken = Cookies.get("00x");
    const { showSessionExpired } = useNotification();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    console.log("🏠 RootRoute - User:", user);
    console.log("🏠 RootRoute - Token:", !!token);
    console.log("🏠 RootRoute - Refresh Token:", !!refreshToken);

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            // Case 1: No tokens at all - show home
            if (!token && !refreshToken) {
                console.log("🏠 No tokens, staying on home");
                setIsChecking(false);
                return;
            }

            // Case 2: Have refresh token but no access token (new tab)
            if (!token && refreshToken) {
                console.log("🏠 New tab detected - attempting token refresh...");
                try {
                    // This will trigger the axios interceptor to refresh the token
                    const res = await axiosInstance.get("/user/auth/me");
                    console.log("🏠 Token refresh successful, user data:", res.data);
                    dispatch(setUser(res.data));
                    
                    // Now redirect based on role
                    const EVENT_ADMIN_ROLES = [
                        "ROLE_EVENT_ADMIN",
                        "ROLE_ADMIN",
                        "ROLE_COORDINATOR"
                    ];

                    const hasEventAdminRole = (
                        EVENT_ADMIN_ROLES.includes(res.data.platformRole) ||
                        (res.data.highestEventRole && EVENT_ADMIN_ROLES.includes(res.data.highestEventRole))
                    );

                    console.log("🏠 Has event admin role:", hasEventAdminRole);
                    
                    if (hasEventAdminRole) {
                        navigate('/eventAdminDashboard', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                } catch (error) {
                    console.log("🏠 Token refresh failed:", error);
                    // Clear invalid tokens
                    sessionStorage.removeItem("00y");
                    Cookies.remove("00x", { path: "/" });
                    dispatch(clearUser());
                    setIsChecking(false); // Show home page
                }
                return;
            }

            // Case 3: Have token but no user data - fetch user
            if (token && !user?.userId) {
                console.log("🏠 Token exists but no user data, fetching...");
                try {
                    const res = await axiosInstance.get("/user/auth/me");
                    console.log("🏠 User fetched:", res.data);
                    dispatch(setUser(res.data));
                    
                    const EVENT_ADMIN_ROLES = [
                        "ROLE_EVENT_ADMIN",
                        "ROLE_ADMIN",
                        "ROLE_COORDINATOR"
                    ];

                    const hasEventAdminRole = (
                        EVENT_ADMIN_ROLES.includes(res.data.platformRole) ||
                        (res.data.highestEventRole && EVENT_ADMIN_ROLES.includes(res.data.highestEventRole))
                    );

                    console.log("🏠 Has event admin role:", hasEventAdminRole);
                    
                    if (hasEventAdminRole) {
                        navigate('/eventAdminDashboard', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                } catch (error) {
                    console.log("🏠 Failed to fetch user:", error);
                    if (error.response?.status === 401) {
                        sessionStorage.removeItem("00y");
                        Cookies.remove("00x", { path: "/" });
                        dispatch(clearUser());
                    }
                    setIsChecking(false);
                }
                return;
            }

            // Case 4: Have token and user data - redirect immediately
            if (token && user?.userId) {
                console.log("🏠 User data exists, redirecting...");
                const EVENT_ADMIN_ROLES = [
                    "ROLE_EVENT_ADMIN",
                    "ROLE_ADMIN",
                    "ROLE_COORDINATOR"
                ];

                const hasEventAdminRole = (
                    EVENT_ADMIN_ROLES.includes(user.platformRole) ||
                    (user.highestEventRole && EVENT_ADMIN_ROLES.includes(user.highestEventRole))
                );

                console.log("🏠 Has event admin role:", hasEventAdminRole);
                
                if (hasEventAdminRole) {
                    navigate('/eventAdminDashboard', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
                return;
            }

            // Default: show home
            setIsChecking(false);
        };

        checkAuthAndRedirect();
    }, [token, refreshToken, user, dispatch, navigate]);

    // Show loading while checking/redirecting or during token refresh
    if (isChecking || (refreshToken && !token) || (token && !user?.userId)) {
        return <LoadingSpinner />;
    }

    // If no tokens or all checks failed, show home page
    return <Home />;
};

const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(state => state.user);
    const { showSessionExpired } = useNotification();
    const [isLoading, setIsLoading] = useState(true);

    console.log("📍 App rendering, current path:", location.pathname);
    console.log("📍 User from Redux:", user);

    // Set navigate and notification functions for axios interceptor
    useEffect(() => {
        setNavigate(navigate);
        setNotification(showSessionExpired);
    }, [navigate, showSessionExpired]);

    // 🔥 Listen for logout events from other tabs
    useEffect(() => {
        const broadcastChannel = new BroadcastChannel('auth_channel');
        
        broadcastChannel.onmessage = (event) => {
            if (event.data.type === 'LOGOUT') {
                console.log("🔔 Logout detected in another tab - logging out this tab too");
                
                // Clear all tokens
                sessionStorage.removeItem("00y");
                Cookies.remove("00x", { path: "/" });
                
                // Clear Redux state
                dispatch(clearUser());
                
                // Show notification if you have one
                if (showSessionExpired) {
                    showSessionExpired();
                }
                
                // Redirect to home/login
                navigate('/');
            }
        };

        return () => {
            broadcastChannel.close();
        };
    }, [dispatch, navigate, showSessionExpired]);

    // Load user data for non-root paths
    useEffect(() => {
        const loadUser = async () => {
            // Skip if we're at root path - RootRoute will handle it
            if (location.pathname === '/') {
                setIsLoading(false);
                return;
            }

            const accessToken = sessionStorage.getItem("00y");
            const refreshToken = Cookies.get("00x");
            
            console.log("🔍 Storage check:", {
                accessToken: !!accessToken,
                refreshToken: !!refreshToken,
                path: location.pathname
            });

            // Case 1: No tokens at all
            if (!accessToken && !refreshToken) {
                console.log("❌ No tokens found");
                dispatch(clearUser());
                setIsLoading(false);
                return;
            }

            // Case 2: Have refresh token but no access token (new tab scenario)
            if (!accessToken && refreshToken) {
                console.log("🔄 New tab detected - refresh token exists, waiting for auto-refresh");
                
                try {
                    await axiosInstance.get("/user/auth/me");
                    console.log("✅ Auto-refresh triggered successfully");
                } catch (error) {
                    console.log("⚠️ Auto-refresh failed:", error.message);
                    if (error.response?.data?.message?.includes("Refresh token expired")) {
                        Cookies.remove("00x", { path: "/" });
                        dispatch(clearUser());
                    }
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // Case 3: Have access token - load user normally
            if (accessToken) {
                try {
                    console.log("📡 Loading user data...");
                    const res = await axiosInstance.get("/user/auth/me");
                    console.log("✅ User loaded:", res.data);
                    dispatch(setUser(res.data));
                } catch (error) {
                    console.log("⚠️ User load failed:", error.message);
                    if (error.response?.status !== 401) {
                        dispatch(clearUser());
                    }
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(false);
        };

        loadUser();
    }, [dispatch, location.pathname]);

    // Show loading only for non-root paths while loading
    if (isLoading && location.pathname !== '/') {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            {/* Root path uses special handler */}
            <Route path="/" element={<RootRoute />} />
            
            {/* Other public routes */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path='*' element={<NotFoundPage/>}/>
            <Route path='/book-demo' element={<BookDemoPage/>}/>


            {/* Public registration form routes */}
            <Route path="/:eventName/register/:eventKey" element={<PublicRegistrationForm />} />
            <Route path="/register/:eventKey" element={<PublicRegistrationForm />} />
            <Route path="/event-registrations/:eventId" element={<EventRegistrationsPage />} />

            {/* Protected routes - only these require authentication */}
            <Route element={<PrivateRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/eventAdminDashboard" element={<EventAdminDashboard />} />
                    <Route path="/create-event" element={<CreateEvent />} />
                    <Route path="/events" element={<EventAdminManagement />} />
                    <Route path="/manage-event/:eventId" element={<ManageEvent />} />
                    <Route path="/track-event/:eventId" element={<EventTracking />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user-analytics" element={<UserAnalytics />} />
                    <Route path="/user-report" element={<UserReport />} />
                    <Route path="/event-analytics/:eventId" element={<EventAnalytics />} />
                    <Route path="/qr-scan/:eventId" element={<QRScanPage />} />
                    
                </Route>
            </Route>
        </Routes>
    )
}

export default App