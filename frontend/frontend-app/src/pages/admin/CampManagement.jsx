import { useEffect, useState } from 'react';
import API from '../../services/api';

function CampManagement() {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedCamp, setSelectedCamp] = useState(null);

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            setLoading(true);

            const response = await API.get('admin/camps/');

            setCamps(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || []
            );

            setError('');
        } catch (err) {
            console.error(err);
            setError('Unable to load donation camps.');
        } finally {
            setLoading(false);
        }
    };

    // Search and filter camps
    const filteredCamps = camps.filter((camp) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (camp.camp_name || '').toLowerCase().includes(searchText) ||
            (camp.blood_bank_name || '').toLowerCase().includes(searchText) ||
            (camp.location || '').toLowerCase().includes(searchText) ||
            (camp.district_name || '').toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === 'ALL' ||
            camp.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get status values directly from backend records
    const statuses = [...new Set(
        camps.map(camp => camp.status).filter(Boolean)
    )];

    const getStatusBadge = (status) => {
        switch ((status || '').toUpperCase()) {
            case 'ACTIVE':
            case 'APPROVED':
            case 'COMPLETED':
                return 'bg-success';

            case 'UPCOMING':
            case 'SCHEDULED':
                return 'bg-primary';

            case 'CANCELLED':
                return 'bg-danger';

            default:
                return 'bg-secondary';
        }
    };

    // Statistics
    const totalCamps = camps.length;

    const totalRegistrations = camps.reduce(
        (total, camp) => total + (Number(camp.registrations_count) || 0),
        0
    );

    const activeCamps = camps.filter(
        camp => camp.status === 'ACTIVE'
    ).length;

    return (
        <div className="min-vh-100 bg-light">

            <div className="container py-4">

                {/* Back to Dashboard */}
                <button
                    className="btn btn-outline-danger mb-3"
                    onClick={() => window.location.href = '/admin/dashboard'}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                </button>

                {/* Page Heading */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">
                            Blood Donation Camp Management
                        </h3>
                        <p className="text-muted mb-0">
                            View and monitor donation camps organized by blood banks.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-danger"
                        onClick={fetchCamps}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Total Camps</h6>
                            <h3 className="fw-bold">{totalCamps}</h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Active Camps</h6>
                            <h3 className="fw-bold text-success">
                                {activeCamps}
                            </h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Total Registrations</h6>
                            <h3 className="fw-bold text-primary">
                                {totalRegistrations}
                            </h3>
                        </div>
                    </div>

                </div>

                {/* Search and Filter */}
                <div className="dashboard-card mb-4">
                    <div className="row g-3">

                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search camp, blood bank, location or district..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>

                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Camps Table */}
                <div className="dashboard-card">

                    <h5 className="fw-bold mb-3">
                        Donation Camps
                    </h5>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-danger"></div>
                            <p className="mt-2">Loading donation camps...</p>
                        </div>
                    ) : filteredCamps.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No donation camps found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">

                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Camp Name</th>
                                        <th>Blood Bank</th>
                                        <th>District</th>
                                        <th>Camp Date</th>
                                        <th>Registrations</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCamps.map((camp) => (
                                        <tr key={camp.id}>
                                            <td>{camp.id}</td>
                                            <td>{camp.camp_name}</td>
                                            <td>{camp.blood_bank_name || '-'}</td>
                                            <td>{camp.district_name || '-'}</td>
                                            <td>
                                                {camp.camp_date
                                                    ? new Date(camp.camp_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>
                                                <span className="badge bg-primary">
                                                    {camp.registrations_count ?? 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(camp.status)}`}>
                                                    {camp.status || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedCamp(camp)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
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

            {/* Camp Details Modal */}
            {selectedCamp && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    Donation Camp Details
                                </h5>

                                <button
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedCamp(null)}
                                ></button>
                            </div>

                            <div className="modal-body">

                                <h6 className="fw-bold text-danger mb-3">
                                    Camp Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-6">
                                        <strong>Camp ID:</strong>
                                        <p>{selectedCamp.id}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Camp Name:</strong>
                                        <p>{selectedCamp.camp_name || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Blood Bank:</strong>
                                        <p>{selectedCamp.blood_bank_name || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>District:</strong>
                                        <p>{selectedCamp.district_name || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Location:</strong>
                                        <p>{selectedCamp.location || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Registrations:</strong>
                                        <p>{selectedCamp.registrations_count ?? 0}</p>
                                    </div>

                                </div>

                                <hr />

                                <h6 className="fw-bold text-danger mb-3">
                                    Schedule Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-4">
                                        <strong>Camp Date:</strong>
                                        <p>
                                            {selectedCamp.camp_date
                                                ? new Date(selectedCamp.camp_date).toLocaleDateString()
                                                : '-'}
                                        </p>
                                    </div>

                                    <div className="col-md-4">
                                        <strong>Start Time:</strong>
                                        <p>{selectedCamp.start_time || '-'}</p>
                                    </div>

                                    <div className="col-md-4">
                                        <strong>End Time:</strong>
                                        <p>{selectedCamp.end_time || '-'}</p>
                                    </div>

                                </div>

                                <hr />

                                <h6 className="fw-bold text-danger mb-3">
                                    Additional Information
                                </h6>

                                <div className="mb-3">
                                    <strong>Description:</strong>
                                    <p>{selectedCamp.description || '-'}</p>
                                </div>

                                <div>
                                    <strong>Status:</strong>
                                    <p>
                                        <span className={`badge ${getStatusBadge(selectedCamp.status)}`}>
                                            {selectedCamp.status || '-'}
                                        </span>
                                    </p>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedCamp(null)}
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

export default CampManagement;