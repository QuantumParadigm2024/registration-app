// PaymentDetails.jsx
import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    TrendingUp,
    Users,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    Mail,
    Phone,
    Search,
    Download,
    Filter,
    ChevronDown,
    Eye,
    RefreshCw,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import axiosInstance from '../../helper/AxiosInstance';

const PaymentDetails = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showEventDropdown, setShowEventDropdown] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch payment stats and users when event or pagination changes
    useEffect(() => {
        if (selectedEvent) {
            fetchPaymentStats();
            fetchPaymentUsers();
        }
    }, [selectedEvent, currentPage, pageSize, statusFilter]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/events');
            
            if (response.data?.status === 'success' && response.data?.data) {
                setEvents(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedEvent(response.data.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentStats = async () => {
        if (!selectedEvent) return;
        
        try {
            const response = await axiosInstance.get(`/payment/event/${selectedEvent.eventId}/stats`);
            
            if (response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching payment stats:', err);
        }
    };

    const fetchPaymentUsers = async () => {
        if (!selectedEvent) return;
        
        setLoadingUsers(true);
        try {
            // Build URL with pagination parameters
            let url = `/payment/event/${selectedEvent.eventId}/users?page=${currentPage}&size=${pageSize}`;
            
            // Add status filter if not 'all'
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }
            
            const response = await axiosInstance.get(url);
            
            if (response.data?.status === 'success') {
                setUsers(response.data.data || []);
                setTotalItems(response.data.totalItems || 0);
                setTotalPages(response.data.totalPages || 0);
            } else {
                setUsers([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('Error fetching payment users:', err);
            setUsers([]);
            setTotalItems(0);
            setTotalPages(0);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleEventChange = (event) => {
        setSelectedEvent(event);
        setShowEventDropdown(false);
        setSearchTerm('');
        setStatusFilter('all');
        setCurrentPage(0); // Reset to first page when changing event
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to first page when changing page size
    };

    // Client-side search filtering (since backend might not support search)
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        
        return matchesSearch;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'SUCCESS':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Success
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} />
                        Pending
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} />
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-2 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading payment details...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    Payment Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage event payments</p>
            </div>

            {/* Event Selector */}
            <div className="mb-6 relative">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Event
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowEventDropdown(!showEventDropdown)}
                            className="w-full flex items-center justify-between px-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                    {selectedEvent ? selectedEvent.name : 'Select an event'}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showEventDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showEventDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                {events.map((event) => (
                                    <button
                                        key={event.eventId || event.id}
                                        onClick={() => handleEventChange(event)}
                                        className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between"
                                    >
                                        <span className="text-sm text-gray-700">{event.name}</span>
                                        {selectedEvent?.eventId === event.eventId && (
                                            <CheckCircle className="w-4 h-4 text-purple-600" />
                                        )}
                                    </button>
                                ))}
                                {events.length === 0 && (
                                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                        No events available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(stats?.totalRevenue || 0)}
                            icon={<DollarSign className="w-5 h-5 text-green-600" />}
                            color="bg-green-100"
                        />
                        <StatCard
                            title="Total Registrations"
                            value={stats?.totalRegistrations || 0}
                            icon={<Users className="w-5 h-5 text-blue-600" />}
                            color="bg-blue-100"
                            subtitle="Total form submissions"
                        />
                        <StatCard
                            title="Paid Users"
                            value={stats?.paidUsers || 0}
                            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                            color="bg-green-100"
                            subtitle="Successfully paid"
                        />
                        <StatCard
                            title="Pending Payments"
                            value={stats?.pendingPayments || 0}
                            icon={<Clock className="w-5 h-5 text-yellow-600" />}
                            color="bg-yellow-100"
                            subtitle="Awaiting payment"
                        />
                    </div>

                    {/* Users Table Section */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Table Header with Filters */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    Payment Transactions
                                    <span className="text-sm font-normal text-gray-500">
                                        ({filteredUsers.length} of {totalItems} records)
                                    </span>
                                </h2>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email or phone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(0); // Reset to first page when filter changes
                                        }}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="SUCCESS">Success</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="FAILED">Failed</option>
                                    </select>

                                    {/* Page Size Selector */}
                                    <select
                                        value={pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value={10}>10 per page</option>
                                        <option value={20}>20 per page</option>
                                        <option value={50}>50 per page</option>
                                        <option value={100}>100 per page</option>
                                    </select>

                                    {/* Refresh Button */}
                                    <button
                                        onClick={() => {
                                            setCurrentPage(0);
                                            fetchPaymentUsers();
                                        }}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        {loadingUsers ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-gray-600">Loading payment records...</span>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-1">No payment records found</h3>
                                <p className="text-sm text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'No payments have been processed for this event yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Attendee
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment ID
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredUsers.map((user, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-purple-600 font-medium text-sm">
                                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {user.name || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {user.email && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Mail size={12} />
                                                                    {user.email}
                                                                </div>
                                                            )}
                                                            {user.phone && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Phone size={12} />
                                                                    {user.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {user.type || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(user.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(user.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Calendar size={12} />
                                                            {formatDate(user.paidAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {user.paymentId || 'N/A'}
                                                        </code>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Showing page {currentPage + 1} of {totalPages}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                            >
                                                <ChevronLeft size={16} />
                                                Previous
                                            </button>
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i;
                                                    } else if (currentPage < 3) {
                                                        pageNum = i;
                                                    } else if (currentPage > totalPages - 3) {
                                                        pageNum = totalPages - 5 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                                                currentPage === pageNum
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                            >
                                                Next
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {!selectedEvent && events.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Events Found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        You don't have any events yet. Create an event to see payment details.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentDetails;