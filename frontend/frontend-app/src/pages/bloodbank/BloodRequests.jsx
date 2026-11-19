import { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [decision, setDecision] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await API.get('blood-requests/bank/requests/');

            const data = response.data.results || response.data;
            setRequests(data);
        } catch (err) {
            setError('Failed to load blood requests.');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!decision) {
            setError('Please select a decision.');
            return;
        }

        if (decision === 'REJECTED' && !rejectionReason.trim()) {
            setError('Please provide a rejection reason.');
            return;
        }

        try {
            const response = await API.patch(
                `blood-requests/bank/requests/${selectedRequest.id}/review/`,
                {
                    status: decision,
                    rejection_reason: rejectionReason
                }
            );

            setSuccess(
                response.data.message || 'Request reviewed successfully.'
            );

            setError('');
            setSelectedRequest(null);
            setDecision('');
            setRejectionReason('');

            await fetchRequests();

        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                'Failed to review the request.'
            );
        }
    };

    if (loading) {
        return <div className="container mt-4">Loading blood requests...</div>;
    }

    return (
        <div className="container mt-4 mb-5">

            <h3 className="text-danger mb-4">
                <i className="bi bi-droplet-fill me-2"></i>
                Blood Requests
            </h3>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {success && (
                <div className="alert alert-success">{success}</div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-body">

                    {requests.length === 0 ? (
                        <div className="alert alert-info mb-0">
                            No blood requests found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">

                                <thead className="table-light">
                                    <tr>
                                        <th>Patient</th>
                                        <th>Blood Group</th>
                                        <th>Units</th>
                                        <th>Hospital</th>
                                        <th>Required Date</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{request.patient_name}</td>
                                            <td>
                                                <span className="badge bg-danger">
                                                    {request.blood_group}
                                                </span>
                                            </td>
                                            <td>{request.units_required}</td>
                                            <td>{request.hospital_name}</td>
                                            <td>{request.required_date}</td>
                                            <td>{request.priority}</td>
                                            <td>
                                                <span className={`badge ${
                                                    request.status === 'ACCEPTED'
                                                        ? 'bg-success'
                                                        : request.status === 'REJECTED'
                                                        ? 'bg-danger'
                                                        : request.status === 'CANCELLED'
                                                        ? 'bg-secondary'
                                                        : 'bg-warning text-dark'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setDecision('');
                                                        setRejectionReason('');
                                                        setError('');
                                                        setSuccess('');
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}

                </div>
            </div>

            {selectedRequest && (
                <div className="card shadow-sm border-0 mt-4">

                    <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">Blood Request Details</h5>
                    </div>

                    <div className="card-body">

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <strong>Patient Name:</strong>
                                <p>{selectedRequest.patient_name}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Patient Age:</strong>
                                <p>{selectedRequest.patient_age}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Blood Group:</strong>
                                <p>{selectedRequest.blood_group}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Units Required:</strong>
                                <p>{selectedRequest.units_required}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Hospital:</strong>
                                <p>{selectedRequest.hospital_name}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Hospital Address:</strong>
                                <p>{selectedRequest.hospital_address}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>City:</strong>
                                <p>{selectedRequest.city}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>District:</strong>
                                <p>{selectedRequest.district_name}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Required Date:</strong>
                                <p>{selectedRequest.required_date}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Priority:</strong>
                                <p>{selectedRequest.priority}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Requester Contact:</strong>
                                <p>{selectedRequest.requester_contact}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <strong>Doctor Contact:</strong>
                                <p>{selectedRequest.doctor_contact || 'N/A'}</p>
                            </div>

                            <div className="col-md-12 mb-3">
                                <strong>Additional Information:</strong>
                                <p>{selectedRequest.additional_info || 'N/A'}</p>
                            </div>

                            <div className="col-md-12 mb-3">
                                <strong>Supporting Document:</strong>
                                <p>
                                    {selectedRequest.supporting_document ? (
                                        <a
                                            href={selectedRequest.supporting_document}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Document
                                        </a>
                                    ) : (
                                        'No document uploaded'
                                    )}
                                </p>
                            </div>

                            {selectedRequest.status === 'REJECTED' && (
                                <div className="col-md-12 mb-3">
                                    <strong>Rejection Reason:</strong>
                                    <p>{selectedRequest.rejection_reason}</p>
                                </div>
                            )}

                        </div>

                        {selectedRequest.status === 'SUBMITTED' && (
                            <>
                                <hr />

                                <h6 className="text-danger mb-3">
                                    Review Request
                                </h6>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Decision
                                    </label>

                                    <select
                                        className="form-select"
                                        value={decision}
                                        onChange={(e) => setDecision(e.target.value)}
                                    >
                                        <option value="">Select Decision</option>
                                        <option value="ACCEPTED">Accept Request</option>
                                        <option value="REJECTED">Reject Request</option>
                                    </select>
                                </div>

                                {decision === 'REJECTED' && (
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Rejection Reason
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Enter reason for rejection"
                                        />
                                    </div>
                                )}

                                <button
                                    className="btn btn-danger me-2"
                                    onClick={handleReview}
                                >
                                    Submit Review
                                </button>
                            </>
                        )}

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setSelectedRequest(null);
                                setDecision('');
                                setRejectionReason('');
                                setError('');
                            }}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default BloodRequests;