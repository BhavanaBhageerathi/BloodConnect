import { useEffect, useState } from 'react';
import API from '../../services/api';

function TrackBloodRequests() {

    const [requests, setRequests] = useState([]);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const statusLabels = {
        SUBMITTED: 'Request Submitted',
        VERIFIED: 'Request Verified',
        ACCEPTED: 'Request Accepted',
        REJECTED: 'Request Rejected',
        DONORS_NOTIFIED: 'Donors Notified',
        DONATION_COORDINATED: 'Donation Coordinated',
        PARTIALLY_FULFILLED: 'Partially Fulfilled',
        COMPLETED: 'Request Completed',
        CANCELLED: 'Request Cancelled'
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'REJECTED':
            case 'CANCELLED':
                return 'danger';
            case 'ACCEPTED':
            case 'DONATION_COORDINATED':
                return 'primary';
            case 'PARTIALLY_FULFILLED':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await API.get('blood-requests/my-requests/');

            const data = response.data.results || response.data;

            setRequests(data);
        } catch (error) {
            setError('Unable to load your blood requests.');
        } finally {
            setLoading(false);
        }
    };

    const trackRequest = async (id) => {
        try {
            const response = await API.get(
                `blood-requests/track/${id}/`
            );

            setTracking(response.data);

        } catch (error) {
            alert('Unable to load request tracking details.');
        }
    };

    const closeTracking = () => {
        setTracking(null);
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-danger"></div>
                <p className="mt-2">Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">

            <h3 className="text-danger mb-4">
                <i className="bi bi-clipboard2-pulse me-2"></i>
                Track Blood Requests
            </h3>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!tracking ? (

                <>
                    {requests.length === 0 ? (

                        <div className="dashboard-card text-center">
                            <i className="bi bi-inbox fs-1 text-secondary"></i>
                            <h5 className="mt-3">No Blood Requests Found</h5>
                            <p className="text-muted">
                                You haven't submitted any blood requests yet.
                            </p>
                        </div>

                    ) : (

                        <div className="dashboard-card">

                            <div className="table-responsive">

                                <table className="table table-hover align-middle">

                                    <thead className="table-light">
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Patient Name</th>
                                            <th>Blood Group</th>
                                            <th>Units</th>
                                            <th>Blood Bank ID</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {requests.map((request) => (

                                            <tr key={request.id}>

                                                <td>BR-{request.id}</td>

                                                <td>{request.patient_name}</td>

                                                <td>
                                                    <span className="badge bg-danger">
                                                        {request.blood_group}
                                                    </span>
                                                </td>

                                                <td>{request.units_required}</td>

                                                <td>{request.blood_bank}</td>

                                                <td>
                                                    <span className={`badge bg-${getStatusColor(request.status)}`}>
                                                        {statusLabels[request.status] || request.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => trackRequest(request.id)}
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        Track
                                                    </button>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}
                </>

            ) : (

                <div className="dashboard-card">

                    <button
                        className="btn btn-outline-secondary btn-sm mb-4"
                        onClick={closeTracking}
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back to Requests
                    </button>

                    <h5 className="text-danger">
                        Request BR-{tracking.request_id}
                    </h5>

                    <p className="mb-2">
                        <strong>Patient Name:</strong> {tracking.patient_name}
                    </p>

                    <p>
                        <strong>Current Status:</strong>{' '}
                        <span className={`badge bg-${getStatusColor(tracking.current_status)}`}>
                            {statusLabels[tracking.current_status] || tracking.current_status}
                        </span>
                    </p>

                    <hr />

                    <h5 className="mb-4">
                        <i className="bi bi-clock-history me-2"></i>
                        Request Timeline
                    </h5>

                    {tracking.status_history.length === 0 ? (

                        <p className="text-muted">
                            No tracking history available.
                        </p>

                    ) : (

                        <div className="list-group">

                            {tracking.status_history.map((item, index) => (

                                <div
                                    className="list-group-item"
                                    key={index}
                                >

                                    <div className="d-flex align-items-start">

                                        <i className="bi bi-check-circle-fill text-success fs-5 me-3"></i>

                                        <div>

                                            <h6 className="mb-1">
                                                {statusLabels[item.status] || item.status}
                                            </h6>

                                            <small className="text-muted">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </small>

                                            <p className="mb-0 small text-muted">
                                                Updated by: {item.updated_by}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default TrackBloodRequests;