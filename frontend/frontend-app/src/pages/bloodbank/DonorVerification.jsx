import { useEffect, useState } from 'react';
import API from '../../services/api';

function DonorVerification() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await API.get('verification/bank/applications/');

            const data = response.data.results || response.data;
            setApplications(data);
        } catch (err) {
            setError('Failed to load verification applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!status) {
            setError('Please select a review decision.');
            return;
        }

        if (status === 'MORE_INFO' && !remarks.trim()) {
            setError('Please enter remarks when requesting more information.');
            return;
        }

        try {
            await API.patch(
                `verification/bank/applications/${selectedApplication.id}/review/`,
                {
                    status: status,
                    remarks: remarks
                }
            );

            setSuccess('Application reviewed successfully!');
            setError('');
            setSelectedApplication(null);
            setStatus('');
            setRemarks('');

            fetchApplications();

        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Failed to review the application.'
            );
        }
    };

    if (loading) {
        return <div className="container mt-4">Loading applications...</div>;
    }

    return (
        <div className="container mt-4 mb-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-danger">
                    <i className="bi bi-person-check me-2"></i>
                    Donor Verification
                </h3>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {applications.length === 0 ? (
                <div className="alert alert-info">
                    No pending verification applications found.
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="card-body">

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Donor Name</th>
                                        <th>Blood Group</th>
                                        <th>District</th>
                                        <th>Application Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {applications.map((application) => (
                                        <tr key={application.id}>
                                            <td>
                                                {application.donor_details?.full_name || 'N/A'}
                                            </td>

                                            <td>
                                                {application.donor_details?.blood_group || 'N/A'}
                                            </td>

                                            <td>
                                                {application.donor_details?.district || 'N/A'}
                                            </td>

                                            <td>
                                                {application.application_date
                                                    ? new Date(application.application_date).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>

                                            <td>
                                                <span className="badge bg-warning text-dark">
                                                    {application.status}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        setSelectedApplication(application);
                                                        setError('');
                                                        setSuccess('');
                                                    }}
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            )}

            {selectedApplication && (
                <div className="card shadow-sm border-0 mt-4">

                    <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">
                            Review Donor Application
                        </h5>
                    </div>

                    <div className="card-body">

                        <h6 className="text-danger mb-3">Donor Details</h6>

                        <div className="row mb-3">
                            <div className="col-md-4 mb-2">
                                <strong>Name:</strong>
                                <p>{selectedApplication.donor_details?.full_name || 'N/A'}</p>
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Blood Group:</strong>
                                <p>{selectedApplication.donor_details?.blood_group || 'N/A'}</p>
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Gender:</strong>
                                <p>{selectedApplication.donor_details?.gender || 'N/A'}</p>
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Date of Birth:</strong>
                                <p>{selectedApplication.donor_details?.date_of_birth || 'N/A'}</p>
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>Weight:</strong>
                                <p>
                                    {selectedApplication.donor_details?.weight
                                        ? `${selectedApplication.donor_details.weight} kg`
                                        : 'N/A'}
                                </p>
                            </div>

                            <div className="col-md-4 mb-2">
                                <strong>District:</strong>
                                <p>{selectedApplication.donor_details?.district || 'N/A'}</p>
                            </div>

                            <div className="col-md-12 mb-2">
                                <strong>Address:</strong>
                                <p>{selectedApplication.donor_details?.address || 'N/A'}</p>
                            </div>
                        </div>

                        <hr />

                        <h6 className="text-danger mb-3">Health Details</h6>

                        <p>
                            {selectedApplication.health_details || 'No health details provided.'}
                        </p>

                        <hr />

                        <h6 className="text-danger mb-3">Review Application</h6>

                        <div className="mb-3">
                            <label className="form-label">Decision</label>

                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Select decision</option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                                <option value="MORE_INFO">Request More Information</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Remarks</label>

                            <textarea
                                className="form-control"
                                rows="3"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter remarks for the donor..."
                            ></textarea>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-danger"
                                onClick={handleReview}
                            >
                                Submit Review
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setSelectedApplication(null);
                                    setStatus('');
                                    setRemarks('');
                                    setError('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default DonorVerification;