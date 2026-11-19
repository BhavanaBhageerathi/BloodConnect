import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function DonationInvitations() {

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [responseError, setResponseError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Fetch invitations
    const fetchInvitations = async () => {
        try {
            const response = await API.get('donations/my-invitations/');
            setInvitations(response.data.results || response.data);
        } catch (error) {
            console.error(error);
            setError('Unable to load donation invitations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    // Accept or Decline Invitation
    const handleResponse = async (id, status) => {

        setResponseError('');

        try {
            setProcessingId(id);

            const response = await API.patch(
                `donations/my-invitations/${id}/respond/`,
                { status: status }
            );

            // Update invitation status without reloading the page
            setInvitations((prevInvitations) =>
                prevInvitations.map((invitation) =>
                    invitation.id === id
                        ? { ...invitation, status: response.data.status }
                        : invitation
                )
            );

        } catch (error) {
            console.error(error);

            setResponseError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Unable to submit your response. Please try again.'
            );

        } finally {
            setProcessingId(null);
        }
    };

    // Status Badge Colors
    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'ACCEPTED':
                return 'primary';
            case 'SELECTED':
                return 'success';
            case 'DECLINED':
                return 'danger';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    // Format Date
    const formatDate = (date) => {
        if (!date) return 'Not available';

        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="container py-4">

            {/* Header */}
            <div className="d-flex align-items-center mb-4">

                <Link
                    to="/donor/dashboard"
                    className="btn btn-outline-danger me-3"
                >
                    <i className="bi bi-arrow-left"></i>
                </Link>

                <div>
                    <h3 className="mb-1">Donation Invitations</h3>
                    <p className="text-muted mb-0">
                        View and manage your donation invitations
                    </p>
                </div>

            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger"></div>
                    <p className="mt-2">Loading invitations...</p>
                </div>
            )}

            {/* Fetch Error */}
            {!loading && error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            {/* Response Error */}
            {!loading && responseError && (
                <div className="alert alert-danger">
                    {responseError}
                </div>
            )}

            {/* No Invitations */}
            {!loading && !error && invitations.length === 0 && (
                <div className="card dashboard-card text-center py-5">

                    <i
                        className="bi bi-envelope-open text-muted mb-3"
                        style={{ fontSize: '50px' }}
                    ></i>

                    <h5>No Donation Invitations</h5>

                    <p className="text-muted mb-0">
                        You haven't received any donation invitations yet.
                        New invitations will appear here.
                    </p>

                </div>
            )}

            {/* Invitation Cards */}
            {!loading && !error && invitations.length > 0 && (

                <div>

                    <p className="text-muted mb-3">
                        Total Invitations: {invitations.length}
                    </p>

                    <div className="row">

                        {invitations.map((invitation) => (

                            <div className="col-md-6 mb-3" key={invitation.id}>

                                <div className="card dashboard-card h-100">

                                    {/* Card Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                        <h5 className="mb-0 text-danger">
                                            <i className="bi bi-droplet-fill me-2"></i>
                                            {invitation.blood_group}
                                        </h5>

                                        <span className={`badge bg-${getStatusStyle(invitation.status)}`}>
                                            {invitation.status.replace('_', ' ')}
                                        </span>

                                    </div>

                                    {/* Blood Bank */}
                                    <h6 className="mb-3">
                                        {invitation.blood_bank_name}
                                    </h6>

                                    {/* Invitation Details */}
                                    <div className="mb-2">
                                        <i className="bi bi-geo-alt text-danger me-2"></i>
                                        {invitation.district}
                                    </div>

                                    <div className="mb-2">
                                        <i className="bi bi-droplet text-danger me-2"></i>
                                        Units Required: {invitation.units_required}
                                    </div>

                                    <div className="mb-2">
                                        <i className="bi bi-exclamation-circle text-danger me-2"></i>
                                        Priority: {invitation.priority}
                                    </div>

                                    <div className="mb-3">
                                        <i className="bi bi-calendar3 text-danger me-2"></i>
                                        Invitation Date: {formatDate(invitation.sent_at)}
                                    </div>

                                    <hr />

                                    {/* Accept and Decline Buttons */}
                                    {invitation.status === 'PENDING' && (

                                        <div className="d-flex gap-2">

                                            <button
                                                className="btn btn-success flex-fill"
                                                onClick={() => handleResponse(invitation.id, 'ACCEPTED')}
                                                disabled={processingId !== null}
                                            >
                                                {processingId === invitation.id
                                                    ? 'Processing...'
                                                    : 'Accept'}
                                            </button>

                                            <button
                                                className="btn btn-outline-danger flex-fill"
                                                onClick={() => handleResponse(invitation.id, 'DECLINED')}
                                                disabled={processingId !== null}
                                            >
                                                Decline
                                            </button>

                                        </div>

                                    )}

                                    {/* Status Messages */}
                                    {invitation.status === 'SELECTED' && (
                                        <p className="text-success small mb-0">
                                            <i className="bi bi-check-circle me-1"></i>
                                            You have been selected for this donation.
                                        </p>
                                    )}

                                    {invitation.status === 'ACCEPTED' && (
                                        <p className="text-primary small mb-0">
                                            You accepted this invitation. Await further updates.
                                        </p>
                                    )}

                                    {invitation.status === 'DECLINED' && (
                                        <p className="text-danger small mb-0">
                                            You declined this invitation.
                                        </p>
                                    )}

                                    {invitation.status === 'COMPLETED' && (
                                        <p className="text-success small mb-0">
                                            Donation completed successfully.
                                        </p>
                                    )}

                                    {invitation.status === 'CANCELLED' && (
                                        <p className="text-muted small mb-0">
                                            This invitation has been cancelled.
                                        </p>
                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>
    );
}

export default DonationInvitations;