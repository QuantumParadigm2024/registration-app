import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StatCard from "./StatCard";
import { Calendar, Users, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, UserPlus, Settings, BarChart3, Mail } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from '../../helper/AxiosInstance';

const EventAdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sample data for other sections (keeping exactly as is)
    const myRecentRegistrations = [
        { id: 1, name: "John Doe", event: "AI Workshop", time: "10 min ago", status: "pending" },
        { id: 2, name: "Meena Sharma", event: "Tech Conference", time: "25 min ago", status: "confirmed" },
        { id: 3, name: "Arjun Patel", event: "AI Workshop", time: "1 hour ago", status: "confirmed" },
        { id: 4, name: "Sarah Johnson", event: "AI Workshop", time: "2 hours ago", status: "pending" },
        { id: 5, name: "Rahul Verma", event: "Startup Pitch Day", time: "3 hours ago", status: "cancelled" },
    ];

    const teamMembers = [
        { id: 1, name: "Alex Johnson", role: "Registration Manager", email: "alex@example.com", assignedTasks: 3 },
        { id: 2, name: "Priya Sharma", role: "Event Coordinator", email: "priya@example.com", assignedTasks: 2 },
        { id: 3, name: "Mike Chen", role: "Volunteer Lead", email: "mike@example.com", assignedTasks: 1 },
    ];

    const pendingTasks = [
        { id: 1, title: "Approve speaker bios", event: "AI Workshop", priority: "high", due: "Today" },
        { id: 2, title: "Finalize venue layout", event: "Startup Pitch Day", priority: "medium", due: "Tomorrow" },
        { id: 3, title: "Send reminder emails", event: "Developer Meetup", priority: "low", due: "Mar 18" },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch events
            const eventsResponse = await axiosInstance.get('/admin/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Fetch user analytics
            const analyticsResponse = await axiosInstance.get('/api/dashboard/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (eventsResponse.data.status === 'success') {
                setEvents(eventsResponse.data.data);
            }

            if (analyticsResponse.data) {
                setUserAnalytics(analyticsResponse.data);
            }

        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            case 'active': return 'text-blue-600 bg-blue-50';
            case 'draft': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'pending': return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'cancelled': return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'active': return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'draft': return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            default: return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const user = useSelector((state) => state.user.user);

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 -mt-2 pb-6 px-3 sm:px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 -mt-2 pb-6 px-3 sm:px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
                    <p className="mt-4 text-red-600">{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 -mt-2 pb-6 px-3 sm:px-4 md:px-6">
            {/* Welcome Header - EXACTLY SAME */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-3">
                    <span className="text-3xl sm:text-4xl leading-none">
                        🎯
                    </span>

                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                            Welcome back, {user?.name || "Event Admin"}!
                        </h1>

                        <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-700 font-medium">
                            Manage your events, team, and registrations all in one place.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid - SAME DESIGN, JUST UPDATED VALUES */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard
                    title="My Events"
                    value={events.length.toString()}
                    growth={2}
                    icon={<Calendar className="w-5 h-5 text-blue-600" />}
                    trend="positive"
                />
                <StatCard
                    title="Total Registrations"
                    value={userAnalytics?.totalRegistrations?.toString() || "0"}
                    growth={userAnalytics?.totalRegistrations > 0 ? 8 : 0}
                    icon={<Users className="w-5 h-5 text-green-600" />}
                    trend={userAnalytics?.totalRegistrations > 0 ? "positive" : "neutral"}
                />
                <StatCard
                    title="Check-in Rate"
                    value={`${userAnalytics?.overallCheckInRate?.toFixed(1) || "0"}%`}
                    growth={userAnalytics?.overallCheckInRate > 50 ? 5 : -2}
                    icon={<CheckCircle className="w-5 h-5 text-purple-600" />}
                    trend={userAnalytics?.overallCheckInRate >= 50 ? "positive" : "negative"}
                />
                <StatCard
                    title="Today's Scans"
                    value={userAnalytics?.todayScans?.toString() || "0"}
                    growth={userAnalytics?.todayScans > 0 ? 3 : -100}
                    icon={<Clock className="w-5 h-5 text-orange-600" />}
                    trend={userAnalytics?.todayScans > 0 ? "positive" : "negative"}
                />
            </div>

            {/* Main Content Grid - EXACTLY SAME STRUCTURE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Manage Events Card - EXACTLY SAME */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200 lg:col-span-1">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">Manage Events</h3>
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                        Configure event settings, manage registrations, and oversee event execution.
                    </p>
                    <Link to="/events" className="block">
                        <button className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-3xl font-semibold text-sm sm:text-base transition-all duration-200 hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300">
                            Manage My Events
                        </button>
                    </Link>
                    <div className="mt-4 text-xs text-gray-400 space-y-1">
                        <p>• View registration analytics</p>
                        <p>• Send bulk communications</p>
                        <p>• Update event details</p>
                        <p>• Export attendee lists</p>
                    </div>
                </div>

                {/* My Upcoming Events - UPDATED with registration/check-in data */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">My Upcoming Events</h3>
                        <Link to="/events">
                            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                                View All →
                            </button>
                        </Link>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {events.length > 0 ? (
                            events.map((event) => {
                                // Find analytics for this event
                                const eventAnalytics = userAnalytics?.eventPerformance?.find(
                                    e => e.eventName === event.name || e.eventId === event.eventId
                                );

                                const assignedUsers = event.assignedUsers?.length || 0;
                                const registrations = eventAnalytics?.registrations || 0;
                                const checkIns = eventAnalytics?.checkIns || 0;
                                const checkInRate = eventAnalytics?.checkInRate || 0;

                                // Use registrations as the max for progress bar
                                const progress = registrations ? (checkIns / registrations) * 100 : 0;

                                return (
                                    <div key={event.eventId} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors gap-3 sm:gap-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {event.logoUrl && (
                                                    <img
                                                        src={event.logoUrl}
                                                        alt={event.name}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                                <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{event.name}</h4>
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 whitespace-nowrap">
                                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="hidden xs:inline">Active</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="truncate">
                                                    {formatDate(event.startDate)}
                                                </span>
                                                {event.location && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="truncate">{event.location.split(',')[0]}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Analytics summary line */}
                                            {eventAnalytics && (
                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                    <span className="text-gray-600">
                                                        <span className="font-medium">{registrations}</span> regs •{' '}
                                                        <span className="font-medium">{checkIns}</span> check-ins
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${checkInRate >= 70 ? 'bg-green-50 text-green-700' :
                                                            checkInRate >= 40 ? 'bg-yellow-50 text-yellow-700' :
                                                                'bg-red-50 text-red-700'
                                                        }`}>
                                                        {checkInRate?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            )}

                                            {/* Assigned users info (now only shown as icon + count) */}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Users className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    {assignedUsers} assigned user{assignedUsers !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress bar showing check-in vs registrations */}
                                        <div className="w-full sm:w-48">
                                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-600 font-medium">{checkIns}</span>
                                                    <span className="text-gray-400">/</span>
                                                    <span className="text-gray-600">{registrations || 'No data'}</span>
                                                </div>
                                                <span className={`text-xs font-medium ${progress >= 70 ? 'text-green-600' :
                                                        progress >= 40 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {progress > 0 ? `${Math.round(progress)}%` : 'No data'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                                {registrations > 0 ? (
                                                    <div
                                                        className={`h-1.5 sm:h-2 rounded-full ${progress >= 70 ? 'bg-green-500' :
                                                                progress >= 40 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    ></div>
                                                ) : (
                                                    <div className="h-1.5 sm:h-2 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                check-ins vs registrations
                                            </p>
                                        </div>

                                        <Link to={`/manage-event/${event.eventId}`} className="sm:ml-4">
                                            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium text-left sm:text-right whitespace-nowrap">
                                                Manage Event →
                                            </button>
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No events found. Create your first event to get started!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid - EXACTLY SAME */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Registrations - EXACTLY SAME */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">Recent Registrations</h3>
                        <Link to="/registrations">
                            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                                View All →
                            </button>
                        </Link>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {myRecentRegistrations.map((reg) => (
                            <div key={reg.id} className="flex flex-col xs:flex-row xs:items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors gap-2 xs:gap-0">
                                <div className="min-w-0">
                                    <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{reg.name}</h4>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{reg.event}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 xs:gap-4">
                                    <span className="text-xs text-gray-400">{reg.time}</span>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reg.status)} whitespace-nowrap`}>
                                        {getStatusIcon(reg.status)}
                                        <span className="hidden xs:inline">{reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}</span>
                                    </div>
                                    <button className="text-xs text-blue-600 hover:text-blue-700">
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Management & Pending Tasks - EXACTLY SAME */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">Team & Tasks</h3>
                        <Link to="/team-management">
                            <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                                Manage Team →
                            </button>
                        </Link>
                    </div>

                    {/* Team Members Section */}
                    <div className="mb-4 sm:mb-6">
                        <h4 className="font-medium text-sm sm:text-base text-gray-700 mb-2 sm:mb-3">Team Members</h4>
                        <div className="space-y-2 sm:space-y-3">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="font-medium text-blue-700 text-xs sm:text-sm">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{member.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <div className="text-xs sm:text-sm text-gray-600">{member.assignedTasks} tasks</div>
                                        <button className="text-xs text-blue-600 hover:text-blue-700">
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Tasks Section */}
                    <div>
                        <h4 className="font-medium text-sm sm:text-base text-gray-700 mb-2 sm:mb-3">Pending Tasks</h4>
                        <div className="space-y-2">
                            {pendingTasks.map((task) => (
                                <div key={task.id} className="flex flex-col xs:flex-row xs:items-center justify-between p-2 hover:bg-gray-50 rounded-lg gap-2 xs:gap-0">
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{task.title}</h4>
                                        <p className="text-xs text-gray-500 truncate">{task.event} • Due: {task.due}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)} whitespace-nowrap self-start xs:self-auto`}>
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - UPDATED with User Analytics and User Report */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <Link to="analytics/team-management">
                    <button className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors text-center w-full">
                        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Manage Team</span>
                    </button>
                </Link>
                <Link to="analytics/communications">
                    <button className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors text-center w-full">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Communications</span>
                    </button>
                </Link>
                {/* UPDATED: Analytics button now points to User Analytics */}
                <Link to="/user-analytics">
                    <button className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors text-center w-full">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">User Analytics</span>
                    </button>
                </Link>
                {/* UPDATED: Reports button now points to User Report */}
                <Link to="/user-report">
                    <button className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors text-center w-full">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">User Report</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default EventAdminDashboard;