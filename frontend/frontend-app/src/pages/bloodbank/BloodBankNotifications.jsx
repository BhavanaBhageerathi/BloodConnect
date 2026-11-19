import { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodBankNotifications() {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);

            const response = await API.get('notifications/');

            const data = response.data.results || response.data;

            setNotifications(data);

            const unread = data.filter(
                notification => !notification.is_read
            ).length;

            setUnreadCount(unread);

        } catch (error) {
            setError('Unable to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    // Mark individual notification as read
    const markAsRead = async (id) => {

        try {
            await API.patch(`notifications/${id}/read/`);

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            setError('Unable to mark notification as read.');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {

        try {
            await API.patch('notifications/read-all/');

            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    is_read: true
                }))
            );

            setUnreadCount(0);

            setSuccess('All notifications marked as read.');

        } catch (error) {
            setError('Unable to mark all notifications as read.');
        }
    };

    return (
        <div className="container mt-4 mb-5">

            {/* Page Heading */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h3 className="text-danger">
                        <i className="bi bi-bell-fill me-2"></i>
                        Notifications
                    </h3>

                    <p className="text-muted mb-0">
                        Stay updated with your blood bank activities.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        className="btn btn-outline-danger"
                        onClick={markAllAsRead}
                    >
                        <i className="bi bi-check-all me-1"></i>
                        Mark All as Read
                    </button>
                )}

            </div>

            {/* Unread Count */}
            <div className="dashboard-card mb-4">

                <h6 className="text-muted">Unread Notifications</h6>

                <h3 className="text-danger">
                    {unreadCount}
                </h3>

            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}

                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible">
                    {success}

                    <button
                        className="btn-close"
                        onClick={() => setSuccess('')}
                    ></button>
                </div>
            )}

            {/* Notification List */}
            <div className="dashboard-card">

                <h5 className="mb-3">All Notifications</h5>

                {loading ? (

                    <p className="text-center">Loading notifications...</p>

                ) : notifications.length > 0 ? (

                    notifications.map(notification => (

                        <div
                            key={notification.id}
                            className="border rounded p-3 mb-3"
                            style={{
                                borderLeft: notification.is_read
                                    ? '4px solid #dee2e6'
                                    : '4px solid #dc3545',
                                backgroundColor: notification.is_read
                                    ? '#ffffff'
                                    : '#fff5f5'
                            }}
                        >

                            <div className="d-flex justify-content-between align-items-start">

                                <div>

                                    <h6 className="mb-1">

                                        <i className="bi bi-bell me-2 text-danger"></i>

                                        {notification.title}

                                        {!notification.is_read && (
                                            <span className="badge bg-danger ms-2">
                                                New
                                            </span>
                                        )}

                                    </h6>

                                    <p className="mb-2 text-muted">
                                        {notification.message}
                                    </p>

                                    <small className="text-secondary">
                                        <i className="bi bi-clock me-1"></i>

                                        {new Date(
                                            notification.created_at
                                        ).toLocaleString()}
                                    </small>

                                </div>

                                {!notification.is_read && (

                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <i className="bi bi-check2 me-1"></i>
                                        Mark as Read
                                    </button>

                                )}

                            </div>

                        </div>

                    ))

                ) : (

                    <div className="text-center py-4">

                        <i className="bi bi-bell-slash text-muted fs-1"></i>

                        <p className="text-muted mt-2">
                            No notifications available.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default BloodBankNotifications;