import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function DonationCamps() {

    const [camps, setCamps] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [actionLoading, setActionLoading] = useState(null);

    // Fetch available donation camps
    const fetchCamps = async () => {
        try {
            const response = await API.get('camps/');
            setCamps(response.data.results || response.data);
        } catch (error) {
            console.error(error);
            setError('Unable to load donation camps.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch donor's camp registrations
    const fetchRegistrations = async () => {
        try {
            const response = await API.get('camps/my-registrations/');
            setRegistrations(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching camp registrations:', error);
        }
    };

    useEffect(() => {
        fetchCamps();
        fetchRegistrations();
    }, []);

    // Find registration for a particular camp
    const getRegistration = (campId) => {
        return registrations.find(
            (registration) => Number(registration.camp) === Number(campId)
        );
    };

    // Format date
    const formatDate = (date) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format time
    const formatTime = (time) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Camp status badge
    const getStatusStyle = (status) => {
        if (status === 'UPCOMING') return 'bg-primary';
        if (status === 'ONGOING') return 'bg-success';
        return 'bg-secondary';
    };

    // Registration status badge
    const getRegistrationStyle = (status) => {
        if (status === 'REGISTERED') return 'bg-success';
        if (status === 'ATTENDED') return 'bg-primary';
        if (status === 'CANCELLED') return 'bg-secondary';
        return 'bg-warning text-dark';
    };

    // Get error message from API response
    const getErrorMessage = (error, defaultMessage) => {
        const data = error.response?.data;

        if (typeof data === 'string') {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.detail) {
            return data.detail;
        }

        if (data && typeof data === 'object') {
            return Object.entries(data)
                .map(([field, messages]) => {
                    const text = Array.isArray(messages)
                        ? messages.join(' ')
                        : String(messages);

                    return `${field}: ${text}`;
                })
                .join(' ');
        }

        return defaultMessage;
    };

    // Register for a donation camp
    const handleRegister = async (campId) => {

        setMessage('');
        setError('');
        setActionLoading(campId);

        try {
            const response = await API.post(`camps/${campId}/register/`);

            setMessage(
                response.data.message || 'Successfully registered for the camp.'
            );

            await fetchRegistrations();

        } catch (error) {
            console.error(error);

            setError(
                getErrorMessage(error, 'Unable to register for this camp.')
            );

        } finally {
            setActionLoading(null);
        }
    };

    // Cancel camp registration
    const handleCancel = async (registrationId) => {

        const confirmCancel = window.confirm(
            'Are you sure you want to cancel this camp registration?'
        );

        if (!confirmCancel) return;

        setMessage('');
        setError('');
        setActionLoading(registrationId);

        try {
            const response = await API.post(
                `camps/registrations/${registrationId}/cancel/`
            );

            setMessage(
                response.data.message || 'Camp registration cancelled successfully.'
            );

            await fetchRegistrations();

        } catch (error) {
            console.error(error);

            setError(
                getErrorMessage(error, 'Unable to cancel the registration.')
            );

        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="container mt-4">

            {/* Page Header */}
            <div className="d-flex align-items-center mb-4">

                <Link
                    to="/donor/dashboard"
                    className="btn btn-outline-secondary me-3"
                >
                    <i className="bi bi-arrow-left"></i>
                </Link>

                <h3 className="text-danger mb-0">
                    Donation Camps
                </h3>

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
                <p className="text-center">
                    Loading donation camps...
                </p>
            )}

            {/* Empty State */}
            {!loading && camps.length === 0 && (
                <div className="alert alert-info">
                    No donation camps are currently available.
                </div>
            )}

            {/* Camp Cards */}
            {!loading && camps.length > 0 && (

                <div className="row">

                    {camps.map((camp) => {

                        const registration = getRegistration(camp.id);

                        const isRegistered =
                            registration?.status === 'REGISTERED';

                        const isAttended =
                            registration?.status === 'ATTENDED';

                        const isCancelled =
                            registration?.status === 'CANCELLED';

                        const isActionLoading =
                            actionLoading === camp.id ||
                            actionLoading === registration?.id;

                        return (

                            <div
                                className="col-md-6 col-lg-4 mb-4"
                                key={camp.id}
                            >

                                <div className="dashboard-card h-100">

                                    {/* Camp Name and Status */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">

                                        <h5 className="text-danger mb-0">
                                            {camp.camp_name}
                                        </h5>

                                        <span className={`badge ${getStatusStyle(camp.status)}`}>
                                            {camp.status}
                                        </span>

                                    </div>

                                    {/* Blood Bank */}
                                    <p className="mb-2">
                                        <i className="bi bi-hospital text-danger me-2"></i>
                                        {camp.blood_bank_name}
                                    </p>

                                    {/* Location */}
                                    <p className="mb-2">
                                        <i className="bi bi-geo-alt text-danger me-2"></i>
                                        {camp.location}, {camp.district_name}
                                    </p>

                                    {/* Date */}
                                    <p className="mb-2">
                                        <i className="bi bi-calendar-event text-danger me-2"></i>
                                        {formatDate(camp.camp_date)}
                                    </p>

                                    {/* Time */}
                                    <p className="mb-2">
                                        <i className="bi bi-clock text-danger me-2"></i>
                                        {formatTime(camp.start_time)} - {formatTime(camp.end_time)}
                                    </p>

                                    <hr />

                                    {/* Description */}
                                    <p className="text-muted">
                                        {camp.description || 'No description available.'}
                                    </p>

                                    {/* Registration Details */}
                                    {registration && (

                                        <div className="mb-3">

                                            <span className="fw-semibold me-2">
                                                Your Registration:
                                            </span>

                                            <span className={`badge ${getRegistrationStyle(registration.status)}`}>
                                                {registration.status}
                                            </span>

                                        </div>

                                    )}

                                    {/* Registration Actions */}

                                    {isRegistered && (

                                        <button
                                            className="btn btn-outline-danger w-100"
                                            onClick={() => handleCancel(registration.id)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                'Please wait...'
                                            ) : (
                                                <>
                                                    <i className="bi bi-x-circle me-2"></i>
                                                    Cancel Registration
                                                </>
                                            )}
                                        </button>

                                    )}

                                    {isAttended && (

                                        <button
                                            className="btn btn-outline-primary w-100"
                                            disabled
                                        >
                                            <i className="bi bi-check-circle me-2"></i>
                                            Already Attended
                                        </button>

                                    )}

                                    {!registration && camp.status === 'UPCOMING' && (

                                        <button
                                            className="btn btn-blood w-100"
                                            onClick={() => handleRegister(camp.id)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                'Registering...'
                                            ) : (
                                                <>
                                                    <i className="bi bi-person-plus me-2"></i>
                                                    Register for Camp
                                                </>
                                            )}
                                        </button>

                                    )}

                                    {isCancelled && camp.status === 'UPCOMING' && (

                                        <button
                                            className="btn btn-blood w-100"
                                            onClick={() => handleRegister(camp.id)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                'Registering...'
                                            ) : (
                                                <>
                                                    <i className="bi bi-person-plus me-2"></i>
                                                    Register Again
                                                </>
                                            )}
                                        </button>

                                    )}

                                    {camp.status === 'ONGOING' && !isRegistered && !isAttended && (

                                        <button
                                            className="btn btn-secondary w-100"
                                            disabled
                                        >
                                            Registration Unavailable
                                        </button>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
}

export default DonationCamps;