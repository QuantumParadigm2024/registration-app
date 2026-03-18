import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../contestAPI/NotificationProvider';
import { 
    ChevronLeft, 
    Download, 
    Filter, 
    Search,
    Calendar,
    User,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    Clock,
    Eye
} from 'lucide-react';
import axiosInstance from '../../helper/AxiosInstance';

const EventRegistrationsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { success, error } = useNotification();
    
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch event details and registrations
    useEffect(() => {
        fetchEventDetails();
        fetchRegistrations();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const response = await axiosInstance.get(`/admin/events/${eventId}`);
            setEvent(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching event details:', err);
        }
    };

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/event/${eventId}/registrations`);
            setRegistrations(response.data.data || response.data || []);
        } catch (err) {
            console.error('Error fetching registrations:', err);
            error('Failed to load registrations');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter registrations based on search and status
    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = 
            reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone?.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered On', 'Payment Status'];
        const csvData = filteredRegistrations.map(reg => [
            reg.fullName,
            reg.email,
            reg.phone,
            reg.status,
            new Date(reg.createdAt).toLocaleDateString(),
            reg.paymentStatus || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${event?.name || 'event'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        success('Registrations exported successfully!');
    };

    // View registration details
    const viewRegistrationDetails = (registration) => {
        setSelectedRegistration(registration);
        setShowDetailsModal(true);
    };

    // Update registration status
    const updateRegistrationStatus = async (registrationId, newStatus) => {
        try {
            await axiosInstance.patch(`/registration/${registrationId}/status`, {
                status: newStatus
            });
            
            setRegistrations(prev => prev.map(reg => 
                reg.id === registrationId ? { ...reg, status: newStatus } : reg
            ));
            
            success(`Registration ${newStatus} successfully!`);
        } catch (err) {
            console.error('Error updating registration status:', err);
            error('Failed to update registration status');
        }
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'pending':
                return <Clock size={16} className="text-yellow-600" />;
            case 'cancelled':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading registrations...</span>
            </div>
        );
    }

    return (
        <div className="pt-7 pb-6 px-4 md:px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate(`/manage-event/${eventId}`)}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-2 cursor-pointer text-sm"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Manage Event
                    </button>
                    <h1 className="text-2xl md:text-xl font-bold text-gray-800">Event Registrations</h1>
                    <p className="text-gray-600 mt-1">
                        {event?.name || 'Event'} • {filteredRegistrations.length} registrations
                    </p>
                </div>
                
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 cursor-pointer"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registrant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registered On
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                                    <User size={16} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{reg.fullName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {reg.email}
                                                </p>
                                                {reg.phone && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Phone size={14} className="text-gray-400" />
                                                        {reg.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(reg.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(reg.status)}`}>
                                                {getStatusIcon(reg.status)}
                                                {reg.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                reg.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {reg.paymentStatus || 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => viewRegistrationDetails(reg)}
                                                className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1 ml-auto cursor-pointer"
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No registrations found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Details Modal */}
            {showDetailsModal && selectedRegistration && (
                <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Registration Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-100 rounded-full p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">{selectedRegistration.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{selectedRegistration.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedRegistration.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Registration Date</p>
                                            <p className="font-medium">
                                                {new Date(selectedRegistration.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Payment */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Status & Payment</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Registration Status</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedRegistration.status)}`}>
                                                    {getStatusIcon(selectedRegistration.status)}
                                                    {selectedRegistration.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Payment Status</p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                                                selectedRegistration.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {selectedRegistration.paymentStatus || 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Responses */}
                                {selectedRegistration.responses && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Form Responses</h3>
                                        <div className="space-y-3">
                                            {Object.entries(selectedRegistration.responses).map(([key, value]) => (
                                                <div key={key} className="border-b border-gray-100 pb-2">
                                                    <p className="text-sm text-gray-500">{key}</p>
                                                    <p className="font-medium">{String(value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Update Status */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Update Status</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                updateRegistrationStatus(selectedRegistration.id, 'confirmed');
                                                setShowDetailsModal(false);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateRegistrationStatus(selectedRegistration.id, 'cancelled');
                                                setShowDetailsModal(false);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationsPage;