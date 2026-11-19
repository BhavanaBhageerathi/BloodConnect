import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function VerificationStatus() {

    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVerificationStatus = async () => {
            try {
                const response = await API.get('verification/my-status/');
                setVerification(response.data);
            } catch (error) {
                console.error(error);
                setError('Unable to load verification status. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationStatus();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'danger';
            case 'PENDING':
                return 'warning';
            case 'MORE_INFO':
                return 'info';
            default:
                return 'secondary';
        }
    };

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
                <Link to="/donor/dashboard" className="btn btn-outline-danger me-3">
                    <i className="bi bi-arrow-left"></i>
                </Link>

                <div>
                    <h3 className="mb-1">Verification Status</h3>
                    <p className="text-muted mb-0">
                        Track your donor verification application
                    </p>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-danger"></div>
                    <p className="mt-2">Loading verification details...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            {/* Verification Details */}
            {!loading && !error && verification && (

                !verification.has_application ? (

                    <div className="card dashboard-card text-center py-5">

                        <div className="mb-3">
                            <i className="bi bi-shield-exclamation text-warning"
                                style={{ fontSize: '55px' }}>
                            </i>
                        </div>

                        <h4>Verification Not Submitted</h4>

                        <p className="text-muted">
                            You haven't submitted a donor verification application yet.
                            Submit an application to get verified.
                        </p>

                        {/* Submit Application Button */}
                        <div>
                            <Link
                                to="/donor/verification/submit"
                                className="btn btn-blood mt-3"
                            >
                                <i className="bi bi-file-earmark-check me-2"></i>
                                Submit Verification Application
                            </Link>
                        </div>

                    </div>

                ) : (

                    <div className="card dashboard-card">

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Application Details</h5>

                            <span className={`badge bg-${getStatusStyle(verification.status)} fs-6`}>
                                {verification.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="row mb-3">

                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Application Date</small>
                                <p className="fw-semibold mb-0">
                                    {formatDate(verification.application_date)}
                                </p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Selected Blood Bank</small>
                                <p className="fw-semibold mb-0">
                                    {verification.blood_bank || 'Not available'}
                                </p>
                            </div>

                        </div>

                        <hr />

                        <div>
                            <h6>Verification Remarks</h6>

                            {verification.remarks ? (
                                <p className="text-muted mb-0">
                                    {verification.remarks}
                                </p>
                            ) : (
                                <p className="text-muted mb-0">
                                    No remarks provided by the blood bank yet.
                                </p>
                            )}
                        </div>

                        {/* Status Messages */}
                        <div className={`alert alert-${getStatusStyle(verification.status)} mt-4 mb-0`}>

                            {verification.status === 'PENDING' &&
                                'Your application has been submitted and is awaiting review by the blood bank.'
                            }

                            {verification.status === 'APPROVED' &&
                                'Congratulations! Your donor verification has been approved.'
                            }

                            {verification.status === 'REJECTED' &&
                                'Your verification application has been rejected. You can submit a new application.'
                            }

                            {verification.status === 'MORE_INFO' &&
                                'The blood bank requires additional information. Please review the remarks.'
                            }

                        </div>

                        {/* Submit New Application - Only for Rejected Applications */}
                        {verification.status === 'REJECTED' && (
                            <div className="mt-3">
                                <Link
                                    to="/donor/verification/submit"
                                    className="btn btn-blood"
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Submit New Application
                                </Link>
                            </div>
                        )}

                    </div>
                )
            )}

        </div>
    );
}

export default VerificationStatus;