import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Users, 
    CheckCircle, 
    Calendar, 
    Activity,
    AlertCircle,
    Target,
    MapPin,
    Download,
    Sparkles,
    ChevronDown,
    ChevronUp,
    QrCode,
    Zap,
    Filter,
    Menu,
    X,
    Info
} from 'lucide-react';
import axiosInstance from '../../helper/AxiosInstance';
import { useSelector } from 'react-redux';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const EventAnalytics = ({ eventId: propEventId }) => {
    const { eventId: paramEventId } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCheckpoints, setExpandedCheckpoints] = useState([]);
    const [dateRange, setDateRange] = useState('all');
    const [activePieIndex, setActivePieIndex] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    
    const effectiveEventId = propEventId || paramEventId;
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (effectiveEventId) {
            fetchEventAnalytics();
        }
        
        // Handle window resize for responsive adjustments
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [effectiveEventId]);

    const fetchEventAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axiosInstance.get(`/api/dashboard/event/${effectiveEventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAnalytics(response.data);
            
            try {
                const eventResponse = await axiosInstance.get(`/admin/events/${effectiveEventId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (eventResponse.data) {
                    setEvent(eventResponse.data.data || eventResponse.data);
                }
            } catch (eventErr) {
                console.error('Error fetching event details:', eventErr);
                setEvent({ name: `Event ${effectiveEventId}` });
            }
            
        } catch (err) {
            setError('Failed to fetch event analytics');
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

    const getChartColors = () => ({
        registration: '#6366f1',
        checkin: '#10b981',
        scan: '#8b5cf6',
        pie: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#14b8a6', '#06b6d4']
    });

    const colors = getChartColors();

    // Prepare data for registration trend chart
    const prepareRegistrationTrendData = () => {
        if (!analytics?.registrationTrend) return [];
        
        const sorted = [...analytics.registrationTrend].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        if (dateRange === 'all') {
            return sorted.map(item => ({
                ...item,
                displayDate: new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })
            }));
        } else {
            const days = dateRange === '7days' ? 7 : 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            return sorted
                .filter(item => new Date(item.date) >= cutoffDate)
                .map(item => ({
                    ...item,
                    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    })
                }));
        }
    };

    // Prepare data for checkpoint pie chart
    const prepareCheckpointPieData = () => {
        if (!analytics?.checkpointTotalUsage) return [];
        
        return analytics.checkpointTotalUsage.map((cp, index) => ({
            name: cp.checkpointName,
            value: cp.totalScans,
            uniqueAttendees: cp.uniqueAttendees,
            todayScans: cp.todayScans,
            color: colors.pie[index % colors.pie.length]
        }));
    };

    // Prepare data for daily checkpoint usage
    const prepareDailyCheckpointData = () => {
        if (!analytics?.checkpointDailyUsage) return [];
        
        const checkpointMap = new Map();
        
        analytics.checkpointDailyUsage.forEach(item => {
            const date = new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (!checkpointMap.has(date)) {
                checkpointMap.set(date, { date });
            }
            
            const dayData = checkpointMap.get(date);
            dayData[item.checkpointName] = item.totalScans;
        });
        
        return Array.from(checkpointMap.values());
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-100 max-w-[200px] sm:max-w-none">
                    <p className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                            <div 
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-600">{entry.name}:</span>
                            <span className="font-medium text-slate-800">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom pie chart tooltip
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-100 min-w-[180px] sm:min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                            style={{ backgroundColor: data.color }}
                        />
                        <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">{data.name}</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-600">Total Scans:</span>
                            <span className="font-medium text-slate-800">{data.value}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-600">Unique Attendees:</span>
                            <span className="font-medium text-slate-800">{data.uniqueAttendees}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-600">Today's Scans:</span>
                            <span className={`font-medium ${data.todayScans > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {data.todayScans}
                            </span>
                        </div>
                        <div className="pt-1 sm:pt-2 mt-1 sm:mt-2 border-t border-slate-100">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-slate-600">Scan/Person:</span>
                                <span className="font-medium text-slate-800">
                                    {(data.value / data.uniqueAttendees).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const toggleCheckpointExpand = (index) => {
        if (expandedCheckpoints.includes(index)) {
            setExpandedCheckpoints(expandedCheckpoints.filter(i => i !== index));
        } else {
            setExpandedCheckpoints([...expandedCheckpoints, index]);
        }
    };

    const registrationTrendData = prepareRegistrationTrendData();
    const checkpointPieData = prepareCheckpointPieData();
    const dailyCheckpointData = prepareDailyCheckpointData();

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    // Handle case when no eventId is provided
    if (!effectiveEventId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="bg-amber-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">No Event Selected</h2>
                    <p className="text-slate-600 mb-6 sm:mb-8 text-base sm:text-lg">Please select an event to view analytics</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Loading event analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="bg-rose-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-rose-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">Unable to load analytics</h2>
                    <p className="text-slate-600 mb-6 sm:mb-8 text-base sm:text-lg">{error || 'No analytics data available'}</p>
                    <button
                        onClick={fetchEventAnalytics}
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-200 font-medium inline-flex items-center gap-2 text-sm sm:text-base"
                    >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 pb-6 sm:pb-8">
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Mobile Side Menu */}
            {showMobileMenu && (
                <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden transform transition-transform">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Quick Actions</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <button className="w-full px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-left font-medium hover:bg-indigo-100 transition-all">
                            Export Data
                        </button>
                        <button className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-xl text-left font-medium hover:bg-purple-100 transition-all">
                            Share Report
                        </button>
                        <button className="w-full px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-left font-medium hover:bg-emerald-100 transition-all">
                            View Event Details
                        </button>
                        <button className="w-full px-4 py-3 bg-amber-50 text-amber-600 rounded-xl text-left font-medium hover:bg-amber-100 transition-all">
                            Download PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Key Metrics Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    {/* Total Registrations */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="p-1.5 sm:p-2 lg:p-3 bg-indigo-100 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-indigo-600" />
                            </div>
                            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                analytics.registrationGrowth.direction === 'UP' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-rose-100 text-rose-700'
                            }`}>
                                {analytics.registrationGrowth.direction === 'UP' ? '↑' : '↓'}
                                {Math.abs(analytics.registrationGrowth.percentage).toFixed(0)}%
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Registrations</p>
                        <p className="text-lg sm:text-xl lg:text-3xl font-bold text-slate-800">{analytics.totalRegistrations}</p>
                        <p className="text-[8px] sm:text-xs text-slate-400 mt-1 sm:mt-2 flex items-center gap-1">
                            <Zap className="w-2 h-2 sm:w-3 sm:h-3 text-amber-500" />
                            <span>{analytics.todayRegistrations} today</span>
                        </p>
                    </div>

                    {/* Total Check-ins */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="p-1.5 sm:p-2 lg:p-3 bg-emerald-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform w-fit">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Check-ins</p>
                        <p className="text-lg sm:text-xl lg:text-3xl font-bold text-slate-800">{analytics.totalCheckIns}</p>
                        <div className="mt-1 sm:mt-2">
                            <div className="flex items-center justify-between text-[8px] sm:text-xs mb-0.5">
                                <span className="text-slate-400">Rate</span>
                                <span className={`font-medium ${getPerformanceColor(analytics.checkInRate)}`}>
                                    {analytics.checkInRate.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 sm:h-1.5">
                                <div 
                                    className={`h-1 sm:h-1.5 rounded-full ${getProgressColor(analytics.checkInRate)}`}
                                    style={{ width: `${analytics.checkInRate}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Scans */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="p-1.5 sm:p-2 lg:p-3 bg-purple-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform w-fit">
                            <QrCode className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Total Scans</p>
                        <p className="text-lg sm:text-xl lg:text-3xl font-bold text-slate-800">{analytics.totalScans}</p>
                        <p className="text-[8px] sm:text-xs text-slate-400 mt-1 sm:mt-2 flex items-center gap-1">
                            <Activity className="w-2 h-2 sm:w-3 sm:h-3 text-purple-500" />
                            <span>{(analytics.totalScans / analytics.totalCheckIns || 0).toFixed(1)}/person</span>
                        </p>
                    </div>

                    {/* Today's Activity */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="p-1.5 sm:p-2 lg:p-3 bg-amber-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform w-fit">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-amber-600" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Today</p>
                        <p className="text-lg sm:text-xl lg:text-3xl font-bold text-slate-800">{analytics.todayScans + analytics.todayRegistrations}</p>
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-indigo-50 text-indigo-600 rounded text-[8px] sm:text-xs">
                                R:{analytics.todayRegistrations}
                            </span>
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-50 text-emerald-600 rounded text-[8px] sm:text-xs">
                                C:{analytics.todayCheckIns}
                            </span>
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-50 text-purple-600 rounded text-[8px] sm:text-xs">
                                S:{analytics.todayScans}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Charts Row - Responsive Stacking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Registration Trend Line Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Registration Trend</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Days with activity only</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-600 rounded-full"></div>
                                    <span className="text-[10px] sm:text-xs text-slate-600">Registrations</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-48 sm:h-56 lg:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={registrationTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="displayDate" 
                                        tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        interval={isMobile ? 1 : 0}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        width={isMobile ? 25 : 30}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="registrations" 
                                        stroke={colors.registration}
                                        strokeWidth={isMobile ? 2 : 3}
                                        dot={{ 
                                            fill: colors.registration, 
                                            strokeWidth: 2, 
                                            r: isMobile ? 4 : 6,
                                            stroke: '#fff'
                                        }}
                                        activeDot={{ 
                                            r: isMobile ? 6 : 8, 
                                            fill: colors.registration, 
                                            stroke: '#fff',
                                            strokeWidth: 2
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Registration Stats - Responsive Grid */}
                        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-[8px] sm:text-xs text-slate-500">Peak Day</p>
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                    {registrationTrendData.reduce((max, item) => 
                                        item.registrations > (max?.registrations || 0) ? item : max
                                    , registrationTrendData[0])?.displayDate || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] sm:text-xs text-slate-500">Peak Reg</p>
                                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                    {registrationTrendData.reduce((max, item) => 
                                        Math.max(max, item.registrations), 0
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] sm:text-xs text-slate-500">Active Days</p>
                                <p className="text-xs sm:text-sm font-semibold text-slate-800">{registrationTrendData.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Checkpoint Distribution Pie Chart */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Checkpoint Distribution</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Scans by checkpoint</p>
                            </div>
                            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                        </div>
                        
                        <div className="h-48 sm:h-56 lg:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={checkpointPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isMobile ? 40 : 60}
                                        outerRadius={isMobile ? 60 : 90}
                                        dataKey="value"
                                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                                        onMouseLeave={() => setActivePieIndex(null)}
                                    >
                                        {checkpointPieData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color}
                                                stroke="#fff"
                                                strokeWidth={2}
                                                opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.6}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Color Legend - Scrollable on mobile */}
                        <div className="mt-3 sm:mt-4 max-h-24 sm:max-h-none overflow-y-auto sm:overflow-visible">
                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                {checkpointPieData.map((cp, index) => (
                                    <div 
                                        key={cp.name} 
                                        className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg hover:bg-slate-50 transition-all cursor-default"
                                        onMouseEnter={() => setActivePieIndex(index)}
                                        onMouseLeave={() => setActivePieIndex(null)}
                                    >
                                        <div 
                                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: cp.color }}
                                        />
                                        <span className="text-[8px] sm:text-xs text-slate-600 truncate flex-1">{cp.name}</span>
                                        <span className="text-[8px] sm:text-xs font-medium text-slate-800">{cp.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Daily Checkpoint Usage */}
                    <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Daily Checkpoint Activity</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Scans per checkpoint by day</p>
                            </div>
                        </div>
                        
                        <div className="h-48 sm:h-56 lg:h-64 w-full relative" style={{ minHeight: '200px' }}>
                            {dailyCheckpointData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                                    <BarChart 
                                        data={dailyCheckpointData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            tickLine={false}
                                            interval={isMobile ? 'preserveStartEnd' : 0}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            tickLine={false}
                                            width={30}
                                            allowDecimals={false}
                                        />
                                        <Tooltip 
                                            content={<CustomTooltip />}
                                            animationDuration={0}
                                        />
                                        <Legend 
                                            wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', paddingTop: '10px' }}
                                            iconSize={8}
                                            verticalAlign="top"
                                            height={36}
                                        />
                                        {checkpointPieData.slice(0, isMobile ? 3 : undefined).map((cp, index) => (
                                            <Bar 
                                                key={`bar-${cp.name}-${index}`} 
                                                dataKey={cp.name} 
                                                fill={cp.color}
                                                radius={[4, 4, 0, 0]}
                                                isAnimationActive={false}
                                                maxBarSize={50}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-400 text-sm">No checkpoint data available</p>
                                </div>
                            )}
                        </div>
                        {isMobile && checkpointPieData.length > 3 && (
                            <p className="text-[8px] text-slate-400 mt-2 text-center">
                                Showing top 3 checkpoints. {checkpointPieData.length - 3} more not shown.
                            </p>
                        )}
                    </div>

                    {/* Checkpoint Performance - Scrollable on mobile */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Checkpoint Performance</h3>
                            <span className="text-[8px] sm:text-xs text-slate-500">{checkpointPieData.length} active</span>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar pr-1">
                            {analytics.checkpointTotalUsage.map((cp, index) => {
                                const color = colors.pie[index % colors.pie.length];
                                return (
                                    <div 
                                        key={cp.checkpointName} 
                                        className="p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                                        onClick={() => toggleCheckpointExpand(index)}
                                        onMouseEnter={() => setActivePieIndex(index)}
                                        onMouseLeave={() => setActivePieIndex(null)}
                                    >
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                                <div 
                                                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="font-medium text-slate-800 text-xs sm:text-sm truncate">{cp.checkpointName}</span>
                                            </div>
                                            {expandedCheckpoints.includes(index) ? 
                                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" /> : 
                                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                                            }
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                                            <div>
                                                <p className="text-[8px] sm:text-xs text-slate-500">Scans</p>
                                                <p className="text-xs sm:text-sm font-bold text-slate-800">{cp.totalScans}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] sm:text-xs text-slate-500">Unique</p>
                                                <p className="text-xs sm:text-sm font-bold text-slate-800">{cp.uniqueAttendees}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] sm:text-xs text-slate-500">S/P</p>
                                                <p className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {(cp.totalScans / cp.uniqueAttendees).toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {expandedCheckpoints.includes(index) && (
                                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200">
                                                <p className="text-[8px] sm:text-xs text-slate-500 mb-1 sm:mb-2">Recent activity</p>
                                                {analytics.checkpointDailyUsage
                                                    .filter(usage => usage.checkpointName === cp.checkpointName)
                                                    .slice(0, 2)
                                                    .map((usage, i) => (
                                                        <div key={i} className="flex items-center justify-between text-[8px] sm:text-xs py-0.5 sm:py-1">
                                                            <span className="text-slate-600">
                                                                {new Date(usage.date).toLocaleDateString('en-US', { 
                                                                    month: 'short', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </span>
                                                            <span className="font-medium text-slate-800">{usage.totalScans} scans</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Insights Section - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Performance Insights */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            <h3 className="font-semibold text-sm sm:text-base">Performance Insights</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                    <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-[10px] sm:text-sm">Reg → Check-in</span>
                                </div>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1">{analytics.checkInRate.toFixed(1)}%</p>
                                <p className="text-[8px] sm:text-xs text-indigo-200">
                                    {analytics.checkInRate >= 70 ? 'Excellent' : 
                                     analytics.checkInRate >= 40 ? 'Average' : 'Low'}
                                </p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                    <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-[10px] sm:text-sm">Scan Engagement</span>
                                </div>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1">
                                    {(analytics.totalScans / analytics.totalCheckIns || 0).toFixed(1)}
                                </p>
                                <p className="text-[8px] sm:text-xs text-indigo-200">Scans per attendee</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-[10px] sm:text-sm">Most Active</span>
                                </div>
                                <p className="text-sm sm:text-base lg:text-lg font-bold mb-0.5 sm:mb-1 truncate">{analytics.mostActiveCheckpoint}</p>
                                <p className="text-[8px] sm:text-xs text-indigo-200">
                                    {checkpointPieData.find(c => c.name === analytics.mostActiveCheckpoint)?.value || 0} scans
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-indigo-100/20 border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm sm:text-base">Quick Stats</h3>
                        
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] sm:text-xs text-slate-600">Check-in Rate</span>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                        {analytics.checkInRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1 sm:h-1.5">
                                    <div 
                                        className={`h-1 sm:h-1.5 rounded-full ${getProgressColor(analytics.checkInRate)}`}
                                        style={{ width: `${analytics.checkInRate}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs text-slate-600">Total Registrations</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-800">{analytics.totalRegistrations}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs text-slate-600">Total Check-ins</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-800">{analytics.totalCheckIns}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs text-slate-600">Total Scans</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-800">{analytics.totalScans}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs text-slate-600">Active Checkpoints</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-800">{checkpointPieData.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts - Responsive */}
                {analytics.checkInRate < 50 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-800 text-xs sm:text-sm">Low check-in rate detected</h4>
                            <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5 sm:mt-1">
                                Only {analytics.checkInRate.toFixed(1)}% of registered attendees have checked in.
                            </p>
                        </div>
                    </div>
                )}
                
                {analytics.totalScans / analytics.totalCheckIns < 1 && analytics.totalCheckIns > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-purple-800 text-xs sm:text-sm">Low scan activity</h4>
                            <p className="text-[10px] sm:text-xs text-purple-700 mt-0.5 sm:mt-1">
                                Attendees average less than 1 scan per person.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                    height: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                @media (min-width: 640px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventAnalytics;