import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function RequesterNotifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {

        try {
            const response = await API.get('notifications/');

            setNotifications(
                response.data.results || response.data
            );

        } catch (error) {
            console.error(error);
            setError('Unable to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Count unread notifications
    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    // Format date and time
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Mark individual notification as read
    const handleMarkAsRead = async (notificationId) => {

        try {
            setActionLoading(true);
            setError('');

            await API.patch(
                `notifications/${notificationId}/read/`
            );

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );

        } catch (error) {
            console.error(error);
            setError('Unable to mark notification as read.');
        } finally {
            setActionLoading(false);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {

        try {
            setActionLoading(true);
            setError('');

            await API.patch('notifications/read-all/');

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );

            setMessage('All notifications marked as read.');

        } catch (error) {
            console.error(error);
            setError('Unable to mark all notifications as read.');
        } finally {
            setActionLoading(false);
        }
    };

    return (

        <div className="container mt-4">

            {/* Page Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">

                <div className="d-flex align-items-center">

                    <Link
                        to="/requester/dashboard"
                        className="btn btn-outline-secondary me-3"
                    >
                        <i className="bi bi-arrow-left"></i>
                    </Link>

                    <div>
                        <h3 className="text-danger mb-1">
                            Notifications
                        </h3>

                        <small className="text-muted">
                            You have {unreadCount} unread notification(s).
                        </small>
                    </div>

                </div>

                {unreadCount > 0 && (

                    <button
                        className="btn btn-outline-danger"
                        onClick={handleMarkAllAsRead}
                        disabled={actionLoading}
                    >
                        <i className="bi bi-check2-all me-2"></i>
                        Mark All as Read
                    </button>

                )}

            </div>

            {/* Success Message */}
            {message && (

                <div className="alert alert-success alert-dismissible fade show">

                    {message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage('')}
                    ></button>

                </div>

            )}

            {/* Error Message */}
            {error && (

                <div className="alert alert-danger alert-dismissible fade show">

                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>

                </div>

            )}

            {/* Loading */}
            {loading && (

                <div className="text-center mt-5">

                    <div className="spinner-border text-danger"></div>

                    <p className="mt-2">
                        Loading notifications...
                    </p>

                </div>

            )}

            {/* Empty Notifications */}
            {!loading && notifications.length === 0 && (

                <div className="dashboard-card text-center py-5">

                    <i className="bi bi-bell-slash text-muted fs-1"></i>

                    <h5 className="mt-3">
                        No Notifications
                    </h5>

                    <p className="text-muted mb-0">
                        You don't have any notifications yet.
                    </p>

                </div>

            )}

            {/* Notification List */}
            {!loading && notifications.length > 0 && (

                <div>

                    {notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className="dashboard-card mb-3"
                            style={{
                                borderLeft: notification.is_read
                                    ? '4px solid #dee2e6'
                                    : '4px solid #dc3545',
                                backgroundColor: notification.is_read
                                    ? '#ffffff'
                                    : '#fff8f8'
                            }}
                        >

                            <div className="d-flex justify-content-between align-items-start">

                                <div className="d-flex">

                                    <div className="me-3">

                                        <i
                                            className={`bi ${
                                                notification.is_read
                                                    ? 'bi-bell text-secondary'
                                                    : 'bi-bell-fill text-danger'
                                            } fs-4`}
                                        ></i>

                                    </div>

                                    <div>

                                        <h6 className="mb-1">
                                            {notification.title}
                                        </h6>

                                        <p className="text-muted mb-2">
                                            {notification.message}
                                        </p>

                                        <small className="text-secondary">
                                            <i className="bi bi-clock me-1"></i>
                                            {formatDate(notification.created_at)}
                                        </small>

                                        <div className="mt-2">

                                            <span className="badge bg-light text-dark border">
                                                {notification.notification_type}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <div className="ms-3">

                                    {!notification.is_read ? (

                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            disabled={actionLoading}
                                        >
                                            Mark as Read
                                        </button>

                                    ) : (

                                        <span className="badge bg-success">
                                            <i className="bi bi-check2 me-1"></i>
                                            Read
                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );
}

export default RequesterNotifications;