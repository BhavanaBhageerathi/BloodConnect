import { useEffect, useState } from 'react';
import API from '../../services/api';

function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [readFilter, setReadFilter] = useState('ALL');
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await API.get('admin/notifications/');
            setNotifications(response.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(item => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (item.title || '').toLowerCase().includes(searchText) ||
            (item.message || '').toLowerCase().includes(searchText) ||
            (item.notification_type || '').toLowerCase().includes(searchText);

        const matchesReadStatus =
            readFilter === 'ALL' ||
            (readFilter === 'READ' && item.is_read) ||
            (readFilter === 'UNREAD' && !item.is_read);

        return matchesSearch && matchesReadStatus;
    });

    // Statistics
    const totalNotifications = notifications.length;

    const readNotifications = notifications.filter(
        item => item.is_read
    ).length;

    const unreadNotifications = notifications.filter(
        item => !item.is_read
    ).length;

    // Format date and time
    const formatDateTime = (date) => {
        if (!date) return 'N/A';

        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Notification type badge
    const getTypeBadge = (type) => {
        const styles = {
            INFO: 'bg-primary',
            SUCCESS: 'bg-success',
            WARNING: 'bg-warning text-dark',
            ERROR: 'bg-danger'
        };

        return styles[type] || 'bg-secondary';
    };

    return (
        <div className="container-fluid py-4">

            {/* Back Button */}
            <button
                className="btn btn-outline-danger mb-4"
                onClick={() => window.location.href = '/admin/dashboard'}
            >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
            </button>

            {/* Page Heading */}
            <div className="mb-4">
                <h3 className="fw-bold">
                    <i className="bi bi-bell-fill text-danger me-2"></i>
                    Admin Notifications
                </h3>

                <p className="text-muted">
                    Monitor system notifications and their read status.
                </p>
            </div>

            {/* Statistics */}
            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">
                                    Total Notifications
                                </p>
                                <h3 className="fw-bold mb-0">
                                    {totalNotifications}
                                </h3>
                            </div>

                            <i className="bi bi-bell card-icon"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">
                                    Read Notifications
                                </p>
                                <h3 className="fw-bold mb-0 text-success">
                                    {readNotifications}
                                </h3>
                            </div>

                            <i className="bi bi-check-circle card-icon"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">
                                    Unread Notifications
                                </p>
                                <h3 className="fw-bold mb-0 text-danger">
                                    {unreadNotifications}
                                </h3>
                            </div>

                            <i className="bi bi-envelope card-icon"></i>
                        </div>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="dashboard-card mb-4">

                <div className="row g-3">

                    <div className="col-md-8">
                        <label className="form-label fw-semibold">
                            Search Notifications
                        </label>

                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by title, message or notification type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-semibold">
                            Filter by Read Status
                        </label>

                        <select
                            className="form-select"
                            value={readFilter}
                            onChange={(e) => setReadFilter(e.target.value)}
                        >
                            <option value="ALL">All Notifications</option>
                            <option value="READ">Read</option>
                            <option value="UNREAD">Unread</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Notifications Table */}
            <div className="dashboard-card">

                <h5 className="fw-bold mb-3">
                    Notification Records
                </h5>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger"></div>
                        <p className="text-muted mt-2">
                            Loading notifications...
                        </p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-bell-slash fs-1 text-muted"></i>
                        <p className="text-muted mt-2">
                            No notifications found.
                        </p>
                    </div>
                ) : (

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Notification Type</th>
                                    <th>Date</th>
                                    <th>Read Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredNotifications.map(item => (
                                    <tr key={item.id}>

                                        <td>{item.id}</td>

                                        <td className="fw-semibold">
                                            {item.title}
                                        </td>

                                        <td>
                                            <span className={`badge ${getTypeBadge(item.notification_type)}`}>
                                                {item.notification_type}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDateTime(item.created_at)}
                                        </td>

                                        <td>
                                            {item.is_read ? (
                                                <span className="badge bg-success">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    Read
                                                </span>
                                            ) : (
                                                <span className="badge bg-warning text-dark">
                                                    <i className="bi bi-envelope me-1"></i>
                                                    Unread
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                title="View Details"
                                                onClick={() => setSelectedNotification(item)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

                {!loading && !error && filteredNotifications.length > 0 && (
                    <p className="text-muted small mt-3 mb-0">
                        Showing {filteredNotifications.length} of {totalNotifications} notifications.
                    </p>
                )}

            </div>

            {/* Notification Details Modal */}
            {selectedNotification && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    Notification Details
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedNotification(null)}
                                ></button>
                            </div>

                            <div className="modal-body">

                                <p>
                                    <strong>Notification ID:</strong>{' '}
                                    {selectedNotification.id}
                                </p>

                                <p>
                                    <strong>Title:</strong>{' '}
                                    {selectedNotification.title}
                                </p>

                                <p>
                                    <strong>Notification Type:</strong>{' '}
                                    <span className={`badge ${getTypeBadge(selectedNotification.notification_type)}`}>
                                        {selectedNotification.notification_type}
                                    </span>
                                </p>

                                <hr />

                                <h6 className="text-danger fw-bold">
                                    Message
                                </h6>

                                <p className="text-break">
                                    {selectedNotification.message || 'No message available.'}
                                </p>

                                <hr />

                                <p>
                                    <strong>Created At:</strong>{' '}
                                    {formatDateTime(selectedNotification.created_at)}
                                </p>

                                <p>
                                    <strong>Read Status:</strong>{' '}
                                    {selectedNotification.is_read ? (
                                        <span className="badge bg-success">Read</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Unread</span>
                                    )}
                                </p>

                                <p>
                                    <strong>Related Request ID:</strong>{' '}
                                    {selectedNotification.related_request || 'N/A'}
                                </p>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedNotification(null)}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminNotifications;