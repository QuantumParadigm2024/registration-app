// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Calendar,
//     MapPin,
//     ChevronDown,
//     BarChart3,
//     Users,
//     Globe,
//     UserCircle,
//     Sparkles,
//     AlertCircle,
//     ChevronLeft,
//     ChevronRight,
//     Menu,
//     X,
//     Award,
//     TrendingUp,
//     ChevronUp,
//     Image
// } from 'lucide-react';
// import axiosInstance from '../../helper/AxiosInstance';
// import { useSelector } from 'react-redux';
// import EventAnalytics from './EventAnalytics';

// const Analytics = () => {
//     const navigate = useNavigate();
//     const [events, setEvents] = useState([]);
//     const [selectedEvent, setSelectedEvent] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showEventDropdown, setShowEventDropdown] = useState(false);
//     const [showMobileMenu, setShowMobileMenu] = useState(false);
//     const [expandedDetails, setExpandedDetails] = useState(false);
//     const [imageErrors, setImageErrors] = useState({});
//     const dropdownRef = useRef(null);
//     const mobileMenuRef = useRef(null);

//     const user = useSelector((state) => state.user.user);

//     useEffect(() => {
//         fetchAllEvents();
        
//         // Close dropdown when clicking outside
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setShowEventDropdown(false);
//             }
//             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
//                 setShowMobileMenu(false);
//             }
//         };
        
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // Prevent body scroll when mobile menu is open
//     useEffect(() => {
//         if (showMobileMenu) {
//             document.body.style.overflow = 'hidden';
//         } else {
//             document.body.style.overflow = 'unset';
//         }
//         return () => {
//             document.body.style.overflow = 'unset';
//         };
//     }, [showMobileMenu]);

//     const fetchAllEvents = async () => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axiosInstance.get("/admin/events", {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let eventsList = [];
//             if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
//                 eventsList = response.data.data;
//             } else if (Array.isArray(response.data)) {
//                 eventsList = response.data;
//             } else if (response.data && response.data.events) {
//                 eventsList = response.data.events;
//             }

//             setEvents(eventsList);
            
//             // Auto-select first event if available
//             if (eventsList.length > 0) {
//                 setSelectedEvent(eventsList[0]);
//             }
//         } catch (err) {
//             console.error('Error fetching events:', err);
//             setError('Failed to load events');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEventChange = (event) => {
//         setSelectedEvent(event);
//         setShowEventDropdown(false);
//         setShowMobileMenu(false);
//         setExpandedDetails(false);
//     };

//     const handleImageError = (eventId) => {
//         setImageErrors(prev => ({ ...prev, [eventId]: true }));
//     };

//     const handlePreviousEvent = () => {
//         const currentIndex = events.findIndex(e => 
//             (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
//         );
//         if (currentIndex > 0) {
//             setSelectedEvent(events[currentIndex - 1]);
//             setExpandedDetails(false);
//         }
//     };

//     const handleNextEvent = () => {
//         const currentIndex = events.findIndex(e => 
//             (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
//         );
//         if (currentIndex < events.length - 1) {
//             setSelectedEvent(events[currentIndex + 1]);
//             setExpandedDetails(false);
//         }
//     };

//     const currentIndex = events.findIndex(e => 
//         (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
//     );

//     const formatDate = (dateString) => {
//         if (!dateString) return 'Date TBD';
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const getInitials = (name) => {
//         if (!name) return '?';
//         return name
//             .split(' ')
//             .map(word => word[0])
//             .join('')
//             .toUpperCase()
//             .slice(0, 2);
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//                 <div className="text-center">
//                     <div className="relative">
//                         <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
//                         </div>
//                     </div>
//                     <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                         Loading your events...
//                     </p>
//                     <p className="text-sm text-slate-500 mt-2">Please wait while we fetch your data</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     <div className="bg-rose-100 rounded-3xl p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
//                         <AlertCircle className="w-12 h-12 text-rose-600" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to load events</h2>
//                     <p className="text-slate-600 mb-8">{error}</p>
//                     <button
//                         onClick={fetchAllEvents}
//                         className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-medium inline-flex items-center gap-2"
//                     >
//                         <TrendingUp className="w-4 h-4" />
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (events.length === 0) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
//                 <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
//                     <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <Calendar className="w-10 h-10 text-indigo-600" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-slate-800 mb-3">No Events Found</h2>
//                     <p className="text-slate-500 mb-8">Create your first event to start tracking analytics and insights</p>
//                     <button
//                         onClick={() => navigate('/create-event')}
//                         className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
//                     >
//                         <Sparkles className="w-4 h-4" />
//                         Create Your First Event
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
//             {/* Mobile Menu Overlay */}
//             {showMobileMenu && (
//                 <div 
//                     className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
//                     onClick={() => setShowMobileMenu(false)}
//                 />
//             )}

//             {/* Header */}
//             <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6">
//         <div className="flex items-center justify-between h-16 sm:h-20">
//             {/* Left Section */}
//             <div className="flex items-center gap-3 sm:gap-4">
//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-200">
//                         <BarChart3 className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                         <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                             Analytics Dashboard
//                         </h1>
//                         <p className="text-xs text-slate-500 hidden sm:block">
//                             Track performance across your events
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </header>

            

//             {/* Main Content */}
//             <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
//                 {/* Event Selector Card */}
//                 {selectedEvent && (
//                     <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden mb-6">
//                         {/* Navigation Bar */}
//                         <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 px-4 sm:px-6 py-3 border-b border-slate-200">
//                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
//                                 {/* Navigation Controls */}
//                                 <div className="flex items-center justify-between sm:justify-start gap-3">
//                                     <div className="flex items-center gap-1">
//                                         <button
//                                             onClick={handlePreviousEvent}
//                                             disabled={currentIndex <= 0}
//                                             className={`p-2 rounded-xl transition-all ${
//                                                 currentIndex > 0 
//                                                     ? 'hover:bg-white text-indigo-600 hover:shadow-md' 
//                                                     : 'opacity-30 cursor-not-allowed'
//                                             }`}
//                                         >
//                                             <ChevronLeft className="w-4 h-4" />
//                                         </button>
                                        
//                                         <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
//                                             <span className="text-sm font-medium text-slate-700">
//                                                 {currentIndex + 1} / {events.length}
//                                             </span>
//                                         </div>
                                        
//                                         <button
//                                             onClick={handleNextEvent}
//                                             disabled={currentIndex >= events.length - 1}
//                                             className={`p-2 rounded-xl transition-all ${
//                                                 currentIndex < events.length - 1 
//                                                     ? 'hover:bg-white text-indigo-600 hover:shadow-md' 
//                                                     : 'opacity-30 cursor-not-allowed'
//                                             }`}
//                                         >
//                                             <ChevronRight className="w-4 h-4" />
//                                         </button>
//                                     </div>

//                                     <span className="text-xs text-slate-500 sm:hidden">
//                                         {selectedEvent.name}
//                                     </span>
//                                 </div>

//                                 {/* Event Dropdown - Highlighted */}
//                                 <div className="relative" ref={dropdownRef}>
//                                     <button
//                                         onClick={() => setShowEventDropdown(!showEventDropdown)}
//                                         className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-200 transition-all text-sm group font-medium"
//                                     >
//                                         <span>Switch Event</span>
//                                         <ChevronDown className={`w-4 h-4 text-white/90 transition-all duration-300 ${
//                                             showEventDropdown ? 'rotate-180' : ''
//                                         }`} />
//                                     </button>

//                                     {/* Dropdown Menu */}
//                                     {showEventDropdown && (
//                                         <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2">
//                                             <div className="max-h-96 overflow-y-auto">
//                                                 {events.map((event) => {
//                                                     const isSelected = (event.eventId || event.id) === (selectedEvent?.eventId || selectedEvent?.id);
//                                                     return (
//                                                         <button
//                                                             key={event.eventId || event.id}
//                                                             onClick={() => handleEventChange(event)}
//                                                             className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all ${
//                                                                 isSelected ? 'bg-indigo-50/50' : ''
//                                                             }`}
//                                                         >
//                                                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
//                                                                 isSelected 
//                                                                     ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md' 
//                                                                     : 'bg-gradient-to-br from-slate-400 to-slate-500'
//                                                             }`}>
//                                                                 {event.name?.charAt(0) || 'E'}
//                                                             </div>
//                                                             <div className="flex-1 text-left min-w-0">
//                                                                 <p className="text-sm font-medium text-slate-800 truncate">
//                                                                     {event.name}
//                                                                 </p>
//                                                                 <p className="text-xs text-slate-500 flex items-center gap-1">
//                                                                     <Calendar className="w-3 h-3" />
//                                                                     {formatDate(event.startDate)}
//                                                                 </p>
//                                                             </div>
//                                                             {isSelected && (
//                                                                 <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
//                                                             )}
//                                                         </button>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Event Details */}
//                         <div className="p-4 sm:p-6">
//                             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
//                                 {/* Logo/Icon - Fixed to handle rectangular images */}
//                                 <div className="flex-shrink-0 flex justify-center sm:justify-start">
//                                     {selectedEvent.logoUrl && !imageErrors[selectedEvent.eventId || selectedEvent.id] ? (
//                                         <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-slate-100 flex items-center justify-center">
//                                             <img 
//                                                 src={selectedEvent.logoUrl} 
//                                                 alt={selectedEvent.name}
//                                                 className="max-w-full max-h-full w-auto h-auto object-contain"
//                                                 onError={() => handleImageError(selectedEvent.eventId || selectedEvent.id)}
//                                                 loading="lazy"
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
//                                             {getInitials(selectedEvent.name)}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Event Info */}
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-start justify-between gap-2 mb-3">
//                                         <h2 className="text-xl sm:text-2xl font-bold text-slate-800 break-words">
//                                             {selectedEvent.name}
//                                         </h2>
                                        
//                                         {/* Mobile Event Dropdown - Highlighted */}
//                                         <div className="sm:hidden">
//                                             <button
//                                                 onClick={() => setShowEventDropdown(!showEventDropdown)}
//                                                 className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md"
//                                             >
//                                                 <ChevronDown className="w-4 h-4" />
//                                             </button>
//                                             {showEventDropdown && (
//                                                 <div className="absolute right-4 top-20 left-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-80 overflow-y-auto">
//                                                     {events.map((event) => (
//                                                         <button
//                                                             key={event.eventId || event.id}
//                                                             onClick={() => handleEventChange(event)}
//                                                             className="w-full px-4 py-3 text-left border-b last:border-0 hover:bg-slate-50"
//                                                         >
//                                                             <p className="font-medium text-slate-800">{event.name}</p>
//                                                             <p className="text-xs text-slate-500">{formatDate(event.startDate)}</p>
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Description - Collapsible on mobile */}
//                                     {selectedEvent.description && (
//                                         <div className="mb-4">
//                                             <div className={`text-sm text-slate-600 bg-slate-50 rounded-xl p-4 transition-all ${
//                                                 !expandedDetails ? 'line-clamp-2' : ''
//                                             }`}>
//                                                 {selectedEvent.description}
//                                             </div>
//                                             <button
//                                                 onClick={() => setExpandedDetails(!expandedDetails)}
//                                                 className="text-xs text-indigo-600 mt-2 flex items-center gap-1 sm:hidden"
//                                             >
//                                                 {expandedDetails ? 'Show less' : 'Read more'}
//                                                 {expandedDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
//                                             </button>
//                                         </div>
//                                     )}

//                                     {/* Event Details Grid */}
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                         <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
//                                             <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
//                                             <span className="text-sm truncate">{selectedEvent.location || 'No location set'}</span>
//                                         </div>
                                        
//                                         <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
//                                             <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
//                                             <span className="text-sm truncate">{formatDate(selectedEvent.startDate)}</span>
//                                         </div>

//                                         <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
//                                             <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
//                                             <span className="text-xs font-mono truncate">{selectedEvent.eventKey || 'No key'}</span>
//                                         </div>

//                                         <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
//                                             <UserCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
//                                             <span className="text-sm truncate">Created by: {selectedEvent.createdBy?.name || 'System'}</span>
//                                         </div>
//                                     </div>

//                                     {/* Team Members */}
//                                     {selectedEvent.assignedUsers && selectedEvent.assignedUsers.length > 0 && (
//                                         <div className="mt-4 flex items-center gap-2">
//                                             <span className="text-xs font-medium text-slate-500">Team:</span>
//                                             <div className="flex -space-x-2">
//                                                 {selectedEvent.assignedUsers.slice(0, 5).map((user, idx) => (
//                                                     <div
//                                                         key={user.userId || idx}
//                                                         className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-md hover:scale-110 transition-transform cursor-default"
//                                                         title={user.name || user.email}
//                                                     >
//                                                         {getInitials(user.name || user.email)}
//                                                     </div>
//                                                 ))}
//                                                 {selectedEvent.assignedUsers.length > 5 && (
//                                                     <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white shadow-md">
//                                                         +{selectedEvent.assignedUsers.length - 5}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Event Analytics Component */}
//                 {selectedEvent && (
//                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                         <EventAnalytics 
//                             key={selectedEvent.eventId || selectedEvent.id}
//                             eventId={(selectedEvent.eventId || selectedEvent.id).toString()}
//                         />
//                     </div>
//                 )}
//             </main>

//             {/* Add custom animations */}
//             <style jsx>{`
//                 @keyframes slideInFromTop {
//                     from {
//                         opacity: 0;
//                         transform: translateY(-10px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }
//                 }
                
//                 .animate-in {
//                     animation: slideInFromTop 0.5s ease-out;
//                 }
                
//                 .line-clamp-2 {
//                     display: -webkit-box;
//                     -webkit-line-clamp: 2;
//                     -webkit-box-orient: vertical;
//                     overflow: hidden;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default Analytics;


import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    ChevronDown,
    BarChart3,
    Users,
    Globe,
    UserCircle,
    Sparkles,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Award,
    TrendingUp,
    ChevronUp,
    Image
} from 'lucide-react';
import axiosInstance from '../../helper/AxiosInstance';
import { useSelector } from 'react-redux';
import EventAnalytics from './EventAnalytics';

const Analytics = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEventDropdown, setShowEventDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        fetchAllEvents();
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowEventDropdown(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showMobileMenu]);

    const fetchAllEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get("/admin/events", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let eventsList = [];
            if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
                eventsList = response.data.data;
            } else if (Array.isArray(response.data)) {
                eventsList = response.data;
            } else if (response.data && response.data.events) {
                eventsList = response.data.events;
            }

            setEvents(eventsList);
            
            if (eventsList.length > 0) {
                setSelectedEvent(eventsList[0]);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleEventChange = (event) => {
        setSelectedEvent(event);
        setShowEventDropdown(false);
        setShowMobileMenu(false);
        setExpandedDetails(false);
    };

    const handleImageError = (eventId) => {
        setImageErrors(prev => ({ ...prev, [eventId]: true }));
    };

    const handlePreviousEvent = () => {
        const currentIndex = events.findIndex(e => 
            (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
        );
        if (currentIndex > 0) {
            setSelectedEvent(events[currentIndex - 1]);
            setExpandedDetails(false);
        }
    };

    const handleNextEvent = () => {
        const currentIndex = events.findIndex(e => 
            (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
        );
        if (currentIndex < events.length - 1) {
            setSelectedEvent(events[currentIndex + 1]);
            setExpandedDetails(false);
        }
    };

    const currentIndex = events.findIndex(e => 
        (e.eventId || e.id) === (selectedEvent?.eventId || selectedEvent?.id)
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Loading your events...
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md px-4">
                    <div className="bg-rose-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-rose-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Unable to load events</h2>
                    <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">{error}</p>
                    <button
                        onClick={fetchAllEvents}
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-medium inline-flex items-center gap-2 text-sm sm:text-base"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">No Events Found</h2>
                    <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">Create your first event to start tracking analytics and insights</p>
                    <button
                        onClick={() => navigate('/create-event')}
                        className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Create Your First Event
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Section */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-200">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <p className="text-xs text-slate-500 hidden sm:block">
                            Track performance across your events
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 pb-20">
                {/* Event Selector Card */}
                {selectedEvent && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden mb-4 sm:mb-6">
                        {/* Navigation Bar */}
                        <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                                {/* Left side - Navigation */}
                                <div className="flex items-center gap-1 sm:gap-3">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handlePreviousEvent}
                                            disabled={currentIndex <= 0}
                                            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                                                currentIndex > 0 
                                                    ? 'hover:bg-white text-indigo-600 hover:shadow-md' 
                                                    : 'opacity-30 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                        
                                        <div className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg shadow-sm">
                                            <span className="text-xs sm:text-sm font-medium text-slate-700">
                                                {currentIndex + 1}/{events.length}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={handleNextEvent}
                                            disabled={currentIndex >= events.length - 1}
                                            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                                                currentIndex < events.length - 1 
                                                    ? 'hover:bg-white text-indigo-600 hover:shadow-md' 
                                                    : 'opacity-30 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>

                                    {/* Current Event Name - Mobile */}
                                    <span className="text-xs sm:hidden text-slate-600 truncate max-w-[100px]">
                                        {selectedEvent.name}
                                    </span>
                                </div>

                                {/* Right side - Switch Button */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowEventDropdown(!showEventDropdown)}
                                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-200 transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
                                    >
                                        <span>Switch</span>
                                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white/90 transition-all duration-300 ${
                                            showEventDropdown ? 'rotate-180' : ''
                                        }`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showEventDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                                            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                                                {events.map((event) => {
                                                    const isSelected = (event.eventId || event.id) === (selectedEvent?.eventId || selectedEvent?.id);
                                                    return (
                                                        <button
                                                            key={event.eventId || event.id}
                                                            onClick={() => handleEventChange(event)}
                                                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-50 transition-all ${
                                                                isSelected ? 'bg-indigo-50/50' : ''
                                                            }`}
                                                        >
                                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0 ${
                                                                isSelected 
                                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md' 
                                                                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                                            }`}>
                                                                {event.name?.charAt(0) || 'E'}
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                                                                    {event.name}
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
                                                                    <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                                                                    {formatDate(event.startDate)}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-3 sm:p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                                {/* Logo/Icon */}
                                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                                    {selectedEvent.logoUrl && !imageErrors[selectedEvent.eventId || selectedEvent.id] ? (
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-slate-100 flex items-center justify-center">
                                            <img 
                                                src={selectedEvent.logoUrl} 
                                                alt={selectedEvent.name}
                                                className="max-w-full max-h-full w-auto h-auto object-contain"
                                                onError={() => handleImageError(selectedEvent.eventId || selectedEvent.id)}
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl">
                                            {getInitials(selectedEvent.name)}
                                        </div>
                                    )}
                                </div>

                                {/* Event Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                        <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-slate-800 break-words">
                                            {selectedEvent.name}
                                        </h2>
                                    </div>

                                    {/* Description */}
                                    {selectedEvent.description && (
                                        <div className="mb-3 sm:mb-4">
                                            <div className={`text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all ${
                                                !expandedDetails ? 'line-clamp-2 sm:line-clamp-3' : ''
                                            }`}>
                                                {selectedEvent.description}
                                            </div>
                                            <button
                                                onClick={() => setExpandedDetails(!expandedDetails)}
                                                className="text-xs text-indigo-600 mt-1 sm:mt-2 flex items-center gap-1 sm:hidden"
                                            >
                                                {expandedDetails ? 'Show less' : 'Read more'}
                                                {expandedDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    )}

                                    {/* Event Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm truncate">{selectedEvent.location || 'No location'}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm truncate">{formatDate(selectedEvent.startDate)}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs font-mono truncate">{selectedEvent.eventKey || 'No key'}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 bg-slate-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                                            <UserCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm truncate">Created by: {selectedEvent.createdBy?.name || 'System'}</span>
                                        </div>
                                    </div>

                                    {/* Team Members */}
                                    {selectedEvent.assignedUsers && selectedEvent.assignedUsers.length > 0 && (
                                        <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-[10px] sm:text-xs font-medium text-slate-500">Team:</span>
                                            <div className="flex -space-x-1.5 sm:-space-x-2">
                                                {selectedEvent.assignedUsers.slice(0, 5).map((user, idx) => (
                                                    <div
                                                        key={user.userId || idx}
                                                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium border-2 border-white shadow-md hover:scale-110 transition-transform cursor-default"
                                                        title={user.name || user.email}
                                                    >
                                                        {getInitials(user.name || user.email)}
                                                    </div>
                                                ))}
                                                {selectedEvent.assignedUsers.length > 5 && (
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] sm:text-xs font-medium border-2 border-white shadow-md">
                                                        +{selectedEvent.assignedUsers.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Analytics Component */}
                {selectedEvent && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 sm:duration-500">
                        <EventAnalytics 
                            key={selectedEvent.eventId || selectedEvent.id}
                            eventId={(selectedEvent.eventId || selectedEvent.id).toString()}
                        />
                    </div>
                )}
            </main>

            {/* Styles */}
            <style jsx>{`
                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-in {
                    animation: slideInFromTop 0.3s ease-out;
                }
                
                @media (min-width: 640px) {
                    .animate-in {
                        animation-duration: 0.5s;
                    }
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @media (min-width: 640px) {
                    .line-clamp-3 {
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                }
            `}</style>
        </div>
    );
};

export default Analytics;