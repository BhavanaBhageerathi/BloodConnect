import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

function RequestHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await API.get('blood-requests/my-requests/');

                const data = response.data.results || response.data;

                const historyStatuses = [
                    'COMPLETED',
                    'REJECTED',
                    'CANCELLED',
                    'PARTIALLY_FULFILLED'
                ];

                const historyRequests = data.filter(request =>
                    historyStatuses.includes(request.status)
                );

                setRequests(historyRequests);
            } catch (error) {
                setError('Failed to load request history.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-success';
            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-danger';
            case 'PARTIALLY_FULFILLED':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="container py-4">

            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/requester/dashboard')}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>

            <div className="dashboard-card">

                <h3 className="text-danger mb-4">
                    <i className="bi bi-clock-history me-2"></i>
                    Request History
                </h3>

                {loading && (
                    <div className="text-center">
                        <div className="spinner-border text-danger"></div>
                        <p className="mt-2">Loading request history...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {!loading && !error && requests.length === 0 && (
                    <div className="alert alert-info text-center">
                        No request history available.
                    </div>
                )}

                {!loading && !error && requests.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Request ID</th>
                                    <th>Patient Name</th>
                                    <th>Blood Group</th>
                                    <th>Units</th>
                                    <th>Required Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.id}>
                                        <td>BR-{request.id}</td>
                                        <td>{request.patient_name}</td>
                                        <td>{request.blood_group}</td>
                                        <td>{request.units_required}</td>
                                        <td>{request.required_date}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(request.status)}`}>
                                                {request.status.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}

export default RequestHistory;