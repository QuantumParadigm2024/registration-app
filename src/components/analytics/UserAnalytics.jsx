// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
// import {
//     BarChart3, Users, CheckCircle, Clock, Calendar,
//     TrendingUp, Award, AlertCircle, Download,
//     ArrowLeft, Activity, Target, Zap,
//     PieChart, Eye, UserCheck, ScanLine,
//     TrendingDown, Star, Shield, Sparkles,
//     FileText // Added for Report button
// } from "lucide-react";
// import axiosInstance from '../../helper/AxiosInstance';
// import { useSelector } from "react-redux";

// const UserAnalytics = () => {
//     const navigate = useNavigate(); // Added for navigation
//     const [analytics, setAnalytics] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [dateRange, setDateRange] = useState('30days');

//     const user = useSelector((state) => state.user.user);

//     useEffect(() => {
//         fetchUserAnalytics();
//     }, []);

//     const fetchUserAnalytics = async () => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axiosInstance.get('/api/dashboard/user', {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             setAnalytics(response.data);
//         } catch (err) {
//             setError('Failed to fetch analytics');
//             console.error('Error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getPerformanceColor = (rate) => {
//         if (rate >= 70) return 'text-emerald-600 bg-emerald-50';
//         if (rate >= 40) return 'text-amber-600 bg-amber-50';
//         return 'text-rose-600 bg-rose-50';
//     };

//     const getProgressColor = (rate) => {
//         if (rate >= 70) return 'bg-emerald-500';
//         if (rate >= 40) return 'bg-amber-500';
//         return 'bg-rose-500';
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="relative">
//                         <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto"></div>
//                         <Sparkles className="w-6 h-6 text-indigo-600 absolute top-5 left-5 animate-pulse" />
//                     </div>
//                     <p className="mt-6 text-slate-600 font-medium">Loading your analytics...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !analytics) {
//         return (
//             <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
//                 <div className="text-center max-w-md">
//                     <div className="bg-rose-100 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//                         <AlertCircle className="w-10 h-10 text-rose-600" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to load analytics</h2>
//                     <p className="text-slate-600 mb-6">{error || 'No analytics data available'}</p>
//                     <button
//                         onClick={fetchUserAnalytics}
//                         className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium"
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
//             {/* Header */}
//             <div className="mb-8">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <Link to="/eventAdminDashboard" className="p-2 bg-white rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200">
//                             <ArrowLeft className="w-5 h-5 text-slate-600" />
//                         </Link>
//                         <div>
//                             <h1 className="text-3xl font-bold text-slate-800">Your Analytics</h1>
//                             <p className="text-sm text-slate-500 mt-1">Track your performance across all events</p>
//                         </div>
//                     </div>
                    
//                     {/* Report Button - Added here */}
//                     <button
//                         onClick={() => navigate('/user-report')}
//                         className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
//                     >
//                         <FileText className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
//                         <span className="text-sm font-medium text-slate-700">View Report</span>
//                     </button>
//                 </div>
//             </div>

//             {/* Key Metrics Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="bg-indigo-50 rounded-xl p-3">
//                             <Users className="w-6 h-6 text-indigo-600" />
//                         </div>
//                         <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Total</span>
//                     </div>
//                     <p className="text-3xl font-bold text-slate-800 mb-1">{analytics.totalRegistrations}</p>
//                     <p className="text-sm text-slate-500">Total Registrations</p>
//                     <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
//                         <TrendingUp className="w-3 h-3" />
//                         <span>Across all events</span>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="bg-emerald-50 rounded-xl p-3">
//                             <CheckCircle className="w-6 h-6 text-emerald-600" />
//                         </div>
//                         <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPerformanceColor(analytics.overallCheckInRate)}`}>
//                             {analytics.overallCheckInRate?.toFixed(1)}%
//                         </span>
//                     </div>
//                     <p className="text-3xl font-bold text-slate-800 mb-1">{analytics.totalCheckIns}</p>
//                     <p className="text-sm text-slate-500">Total Check-ins</p>
//                     <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
//                         <div
//                             className={`h-1.5 rounded-full ${getProgressColor(analytics.overallCheckInRate)}`}
//                             style={{ width: `${Math.min(analytics.overallCheckInRate || 0, 100)}%` }}
//                         ></div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="bg-amber-50 rounded-xl p-3">
//                             <ScanLine className="w-6 h-6 text-amber-600" />
//                         </div>
//                         <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Today: {analytics.todayScans}</span>
//                     </div>
//                     <p className="text-3xl font-bold text-slate-800 mb-1">{analytics.totalScans}</p>
//                     <p className="text-sm text-slate-500">Total Scans</p>
//                     <div className="mt-3 flex items-center gap-2">
//                         <div className={`w-2 h-2 rounded-full ${analytics.todayScans > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
//                         <span className="text-xs text-slate-500">
//                             {analytics.todayScans > 0 ? `${analytics.todayScans} scans today` : 'No scans today'}
//                         </span>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="bg-purple-50 rounded-xl p-3">
//                             <Calendar className="w-6 h-6 text-purple-600" />
//                         </div>
//                         <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
//                     </div>
//                     <p className="text-3xl font-bold text-slate-800 mb-1">{analytics.totalAssignedEvents}</p>
//                     <p className="text-sm text-slate-500">Assigned Events</p>
//                     <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
//                         <Shield className="w-3 h-3" />
//                         <span>{analytics.eventPerformance?.length || 0} with data</span>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white rounded-2xl p-6 mb-8 border-slate-50">
//                 <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-3">
//                         <Activity className="w-6 h-6 text-indigo-400" />
//                         <h3 className="text-lg font-semibold text-slate-700">Today's Activity Overview</h3>
//                     </div>
//                     <span className="bg-indigo-50 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-indigo-600">
//                         <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
//                         Live
//                     </span>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                         <p className="text-slate-500 text-sm mb-1">Today's Scans</p>
//                         <p className="text-3xl font-bold text-slate-800">{analytics.todayScans}</p>
//                     </div>

//                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                         <p className="text-slate-500 text-sm mb-1">Active Events</p>
//                         <p className="text-3xl font-bold text-slate-800">
//                             {analytics.eventPerformance?.filter(e => e.totalScans > 0).length || 0}
//                         </p>
//                     </div>

//                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                         <p className="text-slate-500 text-sm mb-1">Peak Time</p>
//                         <p className="text-2xl font-bold text-slate-800">10:30 AM</p>
//                     </div>

//                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                         <p className="text-slate-500 text-sm mb-1">Status</p>
//                         <p className="text-2xl font-bold flex items-center gap-2 text-slate-800">
//                             {analytics.todayScans > 0 ? (
//                                 <>
//                                     <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
//                                     Active
//                                 </>
//                             ) : (
//                                 <>
//                                     <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
//                                     Inactive
//                                 </>
//                             )}
//                         </p>
//                     </div>
//                 </div>
//             </div>
            
//             {/* Best & Worst Performers */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
//                 {analytics.bestPerformingEvent && (
//                     <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-emerald-500">
//                         <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="bg-emerald-100 rounded-lg p-2">
//                                     <Award className="w-5 h-5 text-emerald-600" />
//                                 </div>
//                                 <h3 className="font-semibold text-slate-800">Best Performing</h3>
//                             </div>
//                             <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Top Event</span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-lg font-semibold text-slate-800">{analytics.bestPerformingEvent}</p>
//                                 <div className="flex items-center gap-2 mt-1">
//                                     <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
//                                     <span className="text-sm text-slate-500">Highest check-in rate</span>
//                                 </div>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-3xl font-bold text-emerald-600">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.checkInRate?.toFixed(1)}%
//                                 </div>
//                                 <p className="text-xs text-slate-400 mt-1">check-in rate</p>
//                             </div>
//                         </div>

//                         <div className="mt-4 grid grid-cols-3 gap-3">
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Registrations</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.registrations}
//                                 </p>
//                             </div>
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Check-ins</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.checkIns}
//                                 </p>
//                             </div>
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Scans</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.totalScans || 0}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {analytics.worstPerformingEvent && analytics.worstPerformingEvent !== analytics.bestPerformingEvent && (
//                     <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-amber-500">
//                         <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="bg-amber-100 rounded-lg p-2">
//                                     <Target className="w-5 h-5 text-amber-600" />
//                                 </div>
//                                 <h3 className="font-semibold text-slate-800">Needs Attention</h3>
//                             </div>
//                             <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded-full">Improvement Area</span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-lg font-semibold text-slate-800">{analytics.worstPerformingEvent}</p>
//                                 <div className="flex items-center gap-2 mt-1">
//                                     <TrendingDown className="w-4 h-4 text-amber-500" />
//                                     <span className="text-sm text-slate-500">Opportunity for growth</span>
//                                 </div>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-3xl font-bold text-amber-600">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.checkInRate?.toFixed(1)}%
//                                 </div>
//                                 <p className="text-xs text-slate-400 mt-1">check-in rate</p>
//                             </div>
//                         </div>

//                         <div className="mt-4 grid grid-cols-3 gap-3">
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Registrations</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.registrations}
//                                 </p>
//                             </div>
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Check-ins</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.checkIns}
//                                 </p>
//                             </div>
//                             <div className="bg-slate-50 rounded-lg p-2 text-center">
//                                 <p className="text-xs text-slate-500">Scans</p>
//                                 <p className="font-semibold text-slate-800">
//                                     {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.totalScans || 0}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Event Performance Table */}
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="p-6 border-b border-slate-200">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                             <PieChart className="w-5 h-5 text-indigo-600" />
//                             <h3 className="font-semibold text-lg text-slate-800">Event Performance Breakdown</h3>
//                         </div>
//                         <span className="text-xs text-slate-400">Last {dateRange}</span>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Event</th>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Registrations</th>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Check-ins</th>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rate</th>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Scans</th>
//                                 <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {analytics.eventPerformance?.map((event, index) => (
//                                 <tr key={index} className="hover:bg-slate-50 transition-colors">
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
//                                                 {index + 1}
//                                             </div>
//                                             <span className="font-medium text-slate-800">{event.eventName}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm font-medium text-slate-800">{event.registrations}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm font-medium text-slate-800">{event.checkIns}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.checkInRate >= 70 ? 'bg-emerald-50 text-emerald-700' :
//                                                 event.checkInRate >= 40 ? 'bg-amber-50 text-amber-700' :
//                                                     'bg-rose-50 text-rose-700'
//                                             }`}>
//                                             {event.checkInRate?.toFixed(1)}%
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm text-slate-600">{event.totalScans || 0}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-2">
//                                             <span className={`w-2 h-2 rounded-full ${event.checkInRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
//                                                 }`}></span>
//                                             <span className="text-xs text-slate-600">
//                                                 {event.checkInRate >= 50 ? 'On Track' : 'Needs Improvement'}
//                                             </span>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
//                     <div className="flex items-center justify-between text-sm">
//                         <span className="text-slate-500">Showing {analytics.eventPerformance?.length || 0} events</span>
//                         <span className="text-slate-400">Last updated: {new Date().toLocaleTimeString()}</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Summary Footer */}
//             <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center gap-3">
//                         <div className="bg-indigo-100 rounded-lg p-2">
//                             <Eye className="w-5 h-5 text-indigo-600" />
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-500">Total Registrations</p>
//                             <p className="text-lg font-semibold text-slate-800">{analytics.totalRegistrations}</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center gap-3">
//                         <div className="bg-emerald-100 rounded-lg p-2">
//                             <UserCheck className="w-5 h-5 text-emerald-600" />
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-500">Average Check-in Rate</p>
//                             <p className="text-lg font-semibold text-slate-800">{analytics.overallCheckInRate?.toFixed(1)}%</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 border border-slate-200">
//                     <div className="flex items-center gap-3">
//                         <div className="bg-amber-100 rounded-lg p-2">
//                             <ScanLine className="w-5 h-5 text-amber-600" />
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-500">Total Scan Activity</p>
//                             <p className="text-lg font-semibold text-slate-800">{analytics.totalScans}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserAnalytics;


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, CheckCircle, Clock, Calendar,
    TrendingUp, Award, AlertCircle, Download,
    ArrowLeft, Activity, Target, Zap,
    PieChart, Eye, UserCheck, ScanLine,
    TrendingDown, Star, Shield, Sparkles,
    FileText, Menu, ChevronDown, ChevronUp
} from "lucide-react";
import axiosInstance from '../../helper/AxiosInstance';
import { useSelector } from "react-redux";

const UserAnalytics = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30days');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedEvents, setExpandedEvents] = useState([]);

    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        fetchUserAnalytics();
    }, []);

    const fetchUserAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get('/api/dashboard/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (rate) => {
        if (rate >= 70) return 'text-emerald-600 bg-emerald-50';
        if (rate >= 40) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50';
    };

    const getProgressColor = (rate) => {
        if (rate >= 70) return 'bg-emerald-500';
        if (rate >= 40) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const toggleEventExpand = (index) => {
        if (expandedEvents.includes(index)) {
            setExpandedEvents(expandedEvents.filter(i => i !== index));
        } else {
            setExpandedEvents([...expandedEvents, index]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto"></div>
                        <Sparkles className="w-4 sm:w-6 h-4 sm:h-6 text-indigo-600 absolute top-4 left-4 animate-pulse" />
                    </div>
                    <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-600 font-medium">Loading your analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="bg-rose-100 rounded-2xl p-3 sm:p-4 w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                        <AlertCircle className="w-6 sm:w-10 h-6 sm:h-10 text-rose-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Unable to load analytics</h2>
                    <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">{error || 'No analytics data available'}</p>
                    <button
                        onClick={fetchUserAnalytics}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm sm:text-base font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link 
                            to="/eventAdminDashboard" 
                            className="p-1.5 sm:p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                        >
                            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800">User Performance</h1>
                            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Track your performance across all events</p>
                        </div>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="sm:hidden p-1.5 bg-slate-50 rounded-lg"
                    >
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Report Button - Desktop */}
                    <button
                        onClick={() => navigate('/user-report')}
                        className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">Report</span>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="sm:hidden mt-3 pt-2 border-t border-slate-100">
                        <button
                            onClick={() => {
                                navigate('/user-report');
                                setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-50 rounded-lg text-indigo-700 font-medium"
                        >
                            <FileText className="w-5 h-5" />
                            <span>View Full Report</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content - Mobile Optimized Padding */}
            <div className="p-3 sm:p-4 md:p-6">
                {/* Key Metrics Grid - Responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 mb-4 sm:mb-6 md:mb-8">
                    {/* Metric Cards - Mobile Optimized */}
                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="bg-indigo-50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-3">
                                <Users className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-indigo-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Total</span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-0.5 sm:mb-1">{analytics.totalRegistrations}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Registrations</p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-3">
                                <CheckCircle className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-emerald-600" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getPerformanceColor(analytics.overallCheckInRate)}`}>
                                {analytics.overallCheckInRate?.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-0.5 sm:mb-1">{analytics.totalCheckIns}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Check-ins</p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="bg-amber-50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-3">
                                <ScanLine className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-amber-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                {analytics.todayScans} today
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-0.5 sm:mb-1">{analytics.totalScans}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Total scans</p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-3">
                                <Calendar className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-purple-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-purple-600 bg-purple-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Active</span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-0.5 sm:mb-1">{analytics.totalAssignedEvents}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Events</p>
                    </div>
                </div>

                {/* Today's Activity - Responsive */}
                <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-slate-100">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Activity className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-indigo-400" />
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-700">Today's Activity</h3>
                        </div>
                        <span className="bg-indigo-50 px-2 sm:px-3 py-1 rounded-full text-xs flex items-center gap-1.5 text-indigo-600">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5">Today's Scans</p>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">{analytics.todayScans}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5">Active Events</p>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
                                {analytics.eventPerformance?.filter(e => e.totalScans > 0).length || 0}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5">Peak Time</p>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800">10:30</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5">Status</p>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-1 sm:gap-2 text-slate-800">
                                {analytics.todayScans > 0 ? (
                                    <>
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full"></span>
                                        Inactive
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Best & Worst Performers - Side by side on desktop, stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-8">
                    {analytics.bestPerformingEvent && (
                        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border-l-4 border-emerald-500">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="bg-emerald-100 rounded-lg p-1.5 sm:p-2">
                                        <Award className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-800">Best Performing</h3>
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-600 px-2 sm:px-3 py-1 rounded-full">Top Event</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <div>
                                    <p className="text-base sm:text-lg font-semibold text-slate-800 break-words pr-2">{analytics.bestPerformingEvent}</p>
                                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <Star className="w-3 sm:w-4 h-3 sm:h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-xs sm:text-sm text-slate-500">Highest check-in rate</span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.checkInRate?.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Reg</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.registrations}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Check</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.checkIns}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Scans</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.bestPerformingEvent)?.totalScans || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {analytics.worstPerformingEvent && analytics.worstPerformingEvent !== analytics.bestPerformingEvent && (
                        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border-l-4 border-amber-500">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="bg-amber-100 rounded-lg p-1.5 sm:p-2">
                                        <Target className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-800">Needs Attention</h3>
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium bg-amber-50 text-amber-600 px-2 sm:px-3 py-1 rounded-full">Improvement Area</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <div>
                                    <p className="text-base sm:text-lg font-semibold text-slate-800 break-words pr-2">{analytics.worstPerformingEvent}</p>
                                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <TrendingDown className="w-3 sm:w-4 h-3 sm:h-4 text-amber-500" />
                                        <span className="text-xs sm:text-sm text-slate-500">Opportunity for growth</span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.checkInRate?.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Reg</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.registrations}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Check</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.checkIns}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Scans</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {analytics.eventPerformance?.find(e => e.eventName === analytics.worstPerformingEvent)?.totalScans || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Performance - Mobile Vertical Cards, Desktop Table */}
                <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <PieChart className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">Event Performance</h3>
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-400">Last {dateRange}</span>
                        </div>
                    </div>

                    {/* Mobile View - Vertical Cards */}
                    <div className="block sm:hidden divide-y divide-slate-200">
                        {analytics.eventPerformance?.map((event, index) => (
                            <div key={index} className="p-4">
                                {/* Event Header - Always Visible */}
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleEventExpand(index)}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 text-sm truncate">{event.eventName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    event.checkInRate >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                    event.checkInRate >= 40 ? 'bg-amber-50 text-amber-700' :
                                                    'bg-rose-50 text-rose-700'
                                                }`}>
                                                    {event.checkInRate?.toFixed(1)}% rate
                                                </span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${event.checkInRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedEvents.includes(index) ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {expandedEvents.includes(index) && (
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">Registrations</p>
                                                <p className="text-lg font-semibold text-slate-800">{event.registrations}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">Check-ins</p>
                                                <p className="text-lg font-semibold text-slate-800">{event.checkIns}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">Scans</p>
                                                <p className="text-lg font-semibold text-slate-800">{event.totalScans || 0}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Check-in Progress</span>
                                                <span className="font-medium text-slate-700">{event.checkIns}/{event.registrations}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(event.checkInRate)}`}
                                                    style={{ width: `${Math.min(event.checkInRate || 0, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Status</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                event.checkInRate >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {event.checkInRate >= 50 ? 'On Track' : 'Needs Improvement'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop View - Table (hidden on mobile) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Event</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Reg</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Check</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Rate</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Scans</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {analytics.eventPerformance?.map((event, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-xs md:text-sm">
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800 line-clamp-1">
                                                    {event.eventName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-800">{event.registrations}</td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-800">{event.checkIns}</td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                event.checkInRate >= 70 ? 'bg-emerald-50 text-emerald-700' :
                                                event.checkInRate >= 40 ? 'bg-amber-50 text-amber-700' :
                                                'bg-rose-50 text-rose-700'
                                            }`}>
                                                {event.checkInRate?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">{event.totalScans || 0}</td>
                                        <td className="px-4 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${event.checkInRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                <span className="text-xs text-slate-600">
                                                    {event.checkInRate >= 50 ? 'On Track' : 'Needs Improvement'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs">
                            <span className="text-slate-500">Showing {analytics.eventPerformance?.length || 0} events</span>
                            <span className="text-slate-400">Updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Footer - Stack on Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-indigo-100 rounded-lg p-1.5 sm:p-2">
                                <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500">Total Registrations</p>
                                <p className="text-base sm:text-lg font-semibold text-slate-800">{analytics.totalRegistrations}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-emerald-100 rounded-lg p-1.5 sm:p-2">
                                <UserCheck className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500">Avg Check-in Rate</p>
                                <p className="text-base sm:text-lg font-semibold text-slate-800">{analytics.overallCheckInRate?.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 sm:col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-amber-100 rounded-lg p-1.5 sm:p-2">
                                <ScanLine className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500">Total Scan Activity</p>
                                <p className="text-base sm:text-lg font-semibold text-slate-800">{analytics.totalScans}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;