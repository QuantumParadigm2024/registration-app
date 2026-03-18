import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    FileText, Download, Calendar, Users, CheckCircle, 
    Clock, ArrowLeft, Printer, Award,
    TrendingUp, BarChart3, ChevronDown, ChevronUp,
    AlertCircle, Sparkles
} from "lucide-react";
import axiosInstance from '../../helper/AxiosInstance';
import { useSelector } from "react-redux";

const UserReport = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedEvents, setExpandedEvents] = useState([]);
    
    const reportRef = useRef(null);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get('/api/dashboard/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch report data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadAsPDF = () => {
        // Create a stylesheet for print optimization
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body * {
                    visibility: hidden;
                }
                #report-content, #report-content * {
                    visibility: visible;
                }
                #report-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white;
                    padding: 20px;
                }
                .no-print {
                    display: none !important;
                }
                button, .print\\:hidden {
                    display: none !important;
                }
                .bg-gradient-to-r {
                    background: #f8fafc !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-red-50, .bg-gray-50 {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `;
        document.head.appendChild(style);

        // Trigger print dialog
        window.print();

        // Remove the style after printing
        setTimeout(() => {
            document.head.removeChild(style);
        }, 1000);
    };

    const printReport = () => {
        window.print();
    };

    const formatDate = (date) => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const toggleEventExpand = (index) => {
        if (expandedEvents.includes(index)) {
            setExpandedEvents(expandedEvents.filter(i => i !== index));
        } else {
            setExpandedEvents([...expandedEvents, index]);
        }
    };

    const getPerformanceColor = (rate) => {
        if (rate >= 70) return 'bg-green-100 text-green-700';
        if (rate >= 40) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getProgressColor = (rate) => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                        <Sparkles className="w-4 sm:w-6 h-4 sm:h-6 text-blue-600 absolute top-4 left-4 animate-pulse" />
                    </div>
                    <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 font-medium">Loading your report...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 rounded-2xl p-3 sm:p-4 w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                        <AlertCircle className="w-6 sm:w-10 h-6 sm:h-10 text-red-600" />
                    </div>
                    <p className="text-sm sm:text-base text-red-600 mb-4">{error || 'No report data available'}</p>
                    <button 
                        onClick={fetchData}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm sm:text-base font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 no-print">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link 
                            to="/eventAdminDashboard" 
                            className="p-1.5 sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                        >
                            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">User Report</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Generated on {formatDate()}</p>
                        </div>
                    </div>
                    
                    {/* Report Actions - Stack on Mobile */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={downloadAsPDF}
                            className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2"
                            title="Download PDF"
                        >
                            <Download className="w-4 sm:w-4 h-4 sm:h-4" />
                            <span className="hidden sm:inline text-sm">Download PDF</span>
                        </button>
                        <button 
                            onClick={printReport}
                            className="p-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-2"
                            title="Print"
                        >
                            <Printer className="w-4 sm:w-4 h-4 sm:h-4" />
                            <span className="hidden sm:inline text-sm">Print</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div id="report-content" ref={reportRef} className="p-3 sm:p-4 md:p-6">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none">
                    {/* Report Header */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">User Performance Report</h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Report for: {user?.name || 'Event Admin'}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Report ID: REP-{Date.now().toString().slice(-8)}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-500">Generated: {formatDate()}</p>
                                <p className="text-xs sm:text-sm text-gray-500">Period: Last 30 days</p>
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <Award className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                            Executive Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500">Total Registrations</p>
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{analytics.totalRegistrations}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500">Total Check-ins</p>
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{analytics.totalCheckIns}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500">Check-in Rate</p>
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{analytics.overallCheckInRate?.toFixed(1)}%</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500">Total Scans</p>
                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{analytics.totalScans}</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                            Performance Summary
                        </h3>
                        
                        {/* Mobile: Vertical Stack */}
                        <div className="block sm:hidden space-y-4">
                            {/* Event Performance - Mobile */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Event Performance</h4>
                                <div className="space-y-2">
                                    {analytics.eventPerformance?.map((event, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-gray-800 text-sm">{event.eventName}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(event.checkInRate)}`}>
                                                    {event.checkInRate?.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Reg: {event.registrations}</span>
                                                <span>Check: {event.checkIns}</span>
                                                <span>Scans: {event.totalScans || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Highlights - Mobile */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Key Highlights</h4>
                                <div className="space-y-2">
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-700 font-medium">Best Performance</p>
                                        <p className="text-sm font-semibold text-gray-800">{analytics.bestPerformingEvent}</p>
                                    </div>
                                    {analytics.worstPerformingEvent !== analytics.bestPerformingEvent && (
                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <p className="text-xs text-yellow-700 font-medium">Area for Improvement</p>
                                            <p className="text-sm font-semibold text-gray-800">{analytics.worstPerformingEvent}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium">Today's Activity</p>
                                        <p className="text-sm font-semibold text-gray-800">{analytics.todayScans} scans</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Grid Layout */}
                        <div className="hidden sm:grid sm:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Event Performance</h4>
                                <div className="space-y-3">
                                    {analytics.eventPerformance?.map((event, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{event.eventName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {event.registrations} registrations • {event.checkIns} check-ins
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(event.checkInRate)}`}>
                                                {event.checkInRate?.toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Key Highlights</h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <p className="text-sm text-green-700 font-medium">Best Performance</p>
                                        <p className="text-lg font-semibold text-gray-800">{analytics.bestPerformingEvent}</p>
                                    </div>
                                    {analytics.worstPerformingEvent !== analytics.bestPerformingEvent && (
                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <p className="text-sm text-yellow-700 font-medium">Area for Improvement</p>
                                            <p className="text-lg font-semibold text-gray-800">{analytics.worstPerformingEvent}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 font-medium">Today's Activity</p>
                                        <p className="text-lg font-semibold text-gray-800">{analytics.todayScans} scans</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Event Breakdown */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                            Detailed Event Breakdown
                        </h3>

                        {/* Mobile: Vertical Cards */}
                        <div className="block sm:hidden space-y-3">
                            {analytics.eventPerformance?.map((event, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Card Header - Always Visible */}
                                    <div 
                                        className="p-3 bg-white flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleEventExpand(index)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    #{index + 1}
                                                </span>
                                                <h4 className="font-medium text-gray-800 text-sm">{event.eventName}</h4>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(event.checkInRate)}`}>
                                                    {event.checkInRate?.toFixed(1)}%
                                                </span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${event.checkInRate >= 50 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                <span className="text-xs text-gray-500">
                                                    {event.checkInRate >= 50 ? 'On Track' : 'Needs Attention'}
                                                </span>
                                            </div>
                                        </div>
                                        {expandedEvents.includes(index) ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedEvents.includes(index) && (
                                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                <div className="bg-white rounded p-2 text-center">
                                                    <p className="text-[10px] text-gray-500">Registrations</p>
                                                    <p className="text-sm font-semibold text-gray-800">{event.registrations}</p>
                                                </div>
                                                <div className="bg-white rounded p-2 text-center">
                                                    <p className="text-[10px] text-gray-500">Check-ins</p>
                                                    <p className="text-sm font-semibold text-gray-800">{event.checkIns}</p>
                                                </div>
                                                <div className="bg-white rounded p-2 text-center">
                                                    <p className="text-[10px] text-gray-500">Scans</p>
                                                    <p className="text-sm font-semibold text-gray-800">{event.totalScans || 0}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Check-in Progress</span>
                                                    <span className="font-medium text-gray-700">
                                                        {((event.checkIns / event.registrations) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${getProgressColor(event.checkInRate)}`}
                                                        style={{ width: `${Math.min(event.checkInRate || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg</th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Check</th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Scans</th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analytics.eventPerformance?.map((event, index) => (
                                        <tr key={index}>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 text-sm">{event.eventName}</td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm">{event.registrations}</td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm">{event.checkIns}</td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(event.checkInRate)}`}>
                                                    {event.checkInRate?.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 text-sm">{event.totalScans || 0}</td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        event.checkInRate >= 50 ? 'bg-green-500' : 'bg-orange-500'
                                                    }`}></span>
                                                    <span className="text-xs text-gray-600">
                                                        {event.checkInRate >= 50 ? 'On Track' : 'Needs Attention'}
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                <span>Total Events: {analytics.eventPerformance?.length || 0}</span>
                                <span>Report Generated: {new Date().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReport;