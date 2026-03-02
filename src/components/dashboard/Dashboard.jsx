import { Link } from 'react-router-dom';
import StatCard from "./StatCard";
import { Calendar, Users, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";

const Dashboard = () => {
    // Sample data
    const recentRegistrations = [
        { id: 1, name: "John Doe", event: "Tech Conference 2024", time: "10 min ago", status: "pending" },
        { id: 2, name: "Meena Sharma", event: "Startup Meetup", time: "25 min ago", status: "confirmed" },
        { id: 3, name: "Arjun Patel", event: "AI Workshop", time: "1 hour ago", status: "confirmed" },
        { id: 4, name: "Sarah Johnson", event: "DevOps Summit", time: "2 hours ago", status: "pending" },
        { id: 5, name: "Rahul Verma", event: "Tech Conference 2024", time: "3 hours ago", status: "cancelled" },
    ];

    const upcomingEvents = [
        { id: 1, name: "AI Workshop", date: "2024-03-15", registrations: 124, maxCapacity: 200 },
        { id: 2, name: "Startup Pitch Day", date: "2024-03-20", registrations: 89, maxCapacity: 150 },
        { id: 3, name: "Blockchain Summit", date: "2024-03-22", registrations: 203, maxCapacity: 300 },
    ];

    const eventManagers = [
        { id: 1, name: "Alex Johnson", events: 3, email: "alex@example.com" },
        { id: 2, name: "Priya Sharma", events: 2, email: "priya@example.com" },
        { id: 3, name: "Mike Chen", events: 1, email: "mike@example.com" },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const user = useSelector((state) => state.user.user);

    return (
        <div className="pt-7 pb-6 px-4 md:px-6">
            <div className="mb-8">
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl leading-none">
                        ✨
                    </span>

                    <div>
                        <h1 className="text-4xl md:text-4xl font-bold text-gray-800 leading-tight">
                            Hello, {user?.name || "System Admin"}!
                        </h1>

                        <p className="mt-4 text-lg md:text-xl text-gray-700 font-medium">
                            Everything you need to run events smoothly-right here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Events"
                    value="12"
                    growth={8}
                    icon={<Calendar className="w-5 h-5 text-purple-600" />}
                    trend="positive"
                />
                <StatCard
                    title="Total Registrations"
                    value="3,462"
                    growth={12}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend="positive"
                />
                <StatCard
                    title="Active Events"
                    value="5"
                    growth={4}
                    icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                    trend="positive"
                />
                <StatCard
                    title="Total Revenue"
                    value="₹1,03,430"
                    growth={15}
                    icon={<DollarSign className="w-5 h-5 text-orange-600" />}
                    trend="positive"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Create Event Card */}
                <div className="bg-white rounded-xl p-6 shadow border border-gray-200 lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-gray-900">Create New Event</h3>
                        <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Create and publish new event registration forms with customizable settings.
                    </p>
                    <Link to="/create-event">
                        <button className="w-full cursor-pointer bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-3xl font-semibold transition-all duration-200 hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-300">
                            Create New Event
                        </button>
                    </Link>
                    <div className="mt-4 text-xs text-gray-400">
                        <p>• Custom registration forms</p>
                        <p>• Automated confirmation emails</p>
                        <p>• Real-time analytics</p>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-xl p-6 shadow border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-gray-900">Upcoming Events</h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-4">
                        {upcomingEvents.map((event) => {
                            const progress = (event.registrations / event.maxCapacity) * 100;
                            return (
                                <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{event.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{event.registrations}/{event.maxCapacity}</span>
                                            <span className="text-gray-500">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${progress > 80 ? 'bg-red-500' : progress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-gray-900">Recent Registrations</h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentRegistrations.map((reg) => (
                            <div key={reg.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div>
                                    <h4 className="font-medium text-gray-900">{reg.name}</h4>
                                    <p className="text-sm text-gray-500">{reg.event}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400">{reg.time}</span>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                                        {getStatusIcon(reg.status)}
                                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Managers */}
                <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-gray-900">Event Managers</h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Assign Manager →
                        </button>
                    </div>
                    <div className="space-y-4">
                        {eventManagers.map((manager) => (
                            <div key={manager.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                        <span className="font-semibold text-purple-700">
                                            {manager.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{manager.name}</h4>
                                        <p className="text-sm text-gray-500">{manager.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">{manager.events} events</div>
                                    <button className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1">
                                        View Events
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                    <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Manage Attendees</span>
                </button>
                <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                    <DollarSign className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">View Reports</span>
                </button>
                <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                    <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Calendar View</span>
                </button>
                <button className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center">
                    <TrendingUp className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Analytics</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;