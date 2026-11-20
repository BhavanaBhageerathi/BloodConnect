import { useEffect, useState } from 'react';
import API from '../../services/api';

function CampRegistrationMonitoring() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async (url = 'admin/camp-registrations/') => {
        try {
            setLoading(true);

            const response = await API.get(url);

            setRegistrations(response.data.results || []);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count || 0);

            setError('');
        } catch (err) {
            console.error('Error fetching camp registrations:', err);
            setError('Failed to load camp registrations.');
        } finally {
            setLoading(false);
        }
    };

    // Get unique registration statuses from current page
    const statuses = [
        ...new Set(registrations.map(item => item.status).filter(Boolean))
    ];

    // Filter registrations
    const filteredRegistrations = registrations.filter(item => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (item.donor_name || '').toLowerCase().includes(searchText) ||
            (item.camp_name || '').toLowerCase().includes(searchText) ||
            (item.blood_bank_name || '').toLowerCase().includes(searchText) ||
            (item.donor_blood_group || '').toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === 'ALL' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Statistics for current page
    const pendingRegistrations = registrations.filter(
        item => item.status === 'PENDING'
    ).length;

    const confirmedRegistrations = registrations.filter(
        item => ['CONFIRMED', 'APPROVED'].includes(item.status)
    ).length;

    const getStatusBadge = (status) => {
        const statusStyles = {
            CONFIRMED: 'bg-success',
            APPROVED: 'bg-success',
            PENDING: 'bg-warning text-dark',
            REJECTED: 'bg-danger',
            CANCELLED: 'bg-secondary',
            COMPLETED: 'bg-primary'
        };

        return statusStyles[status] || 'bg-secondary';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="container-fluid py-4">

            {/* Back Button */}
            <button
                className="btn btn-outline-danger mb-4"
                onClick={() => window.location.href = '/admin/dashboard'}
            >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
            </button>

            {/* Page Heading */}
            <div className="mb-4">
                <h3 className="fw-bold">
                    <i className="bi bi-clipboard-check text-danger me-2"></i>
                    Camp Registration Monitoring
                </h3>
                <p className="text-muted">
                    Monitor donor registrations across all blood donation camps.
                </p>
            </div>

            {/* Statistics */}
            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">Total Registrations</p>
                                <h3 className="fw-bold mb-0">
                                    {totalCount}
                                </h3>
                            </div>
                            <i className="bi bi-people card-icon"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">Pending Registrations</p>
                                <h3 className="fw-bold mb-0 text-warning">
                                    {pendingRegistrations}
                                </h3>
                            </div>
                            <i className="bi bi-clock-history card-icon"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="text-muted mb-1">Confirmed Registrations</p>
                                <h3 className="fw-bold mb-0 text-success">
                                    {confirmedRegistrations}
                                </h3>
                            </div>
                            <i className="bi bi-check-circle card-icon"></i>
                        </div>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="dashboard-card mb-4">

                <div className="row g-3">

                    <div className="col-md-8">
                        <label className="form-label fw-semibold">
                            Search Registrations
                        </label>

                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search donor, camp, blood bank or blood group..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-semibold">
                            Filter by Status
                        </label>

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

            {/* Registration Table */}
            <div className="dashboard-card">

                <h5 className="fw-bold mb-3">
                    Camp Registrations
                </h5>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger"></div>
                        <p className="mt-2 text-muted">
                            Loading registrations...
                        </p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-clipboard-x fs-1 text-muted"></i>
                        <p className="text-muted mt-2">
                            No camp registrations found.
                        </p>
                    </div>
                ) : (

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Donor</th>
                                    <th>Blood Group</th>
                                    <th>Camp Name</th>
                                    <th>Blood Bank</th>
                                    <th>Camp Date</th>
                                    <th>Registration Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRegistrations.map(item => (
                                    <tr key={item.id}>

                                        <td>{item.id}</td>

                                        <td className="fw-semibold">
                                            {item.donor_name}
                                        </td>

                                        <td>
                                            <span className="badge bg-danger">
                                                {item.donor_blood_group}
                                            </span>
                                        </td>

                                        <td>{item.camp_name}</td>

                                        <td>{item.blood_bank_name}</td>

                                        <td>{formatDate(item.camp_date)}</td>

                                        <td>{formatDate(item.registration_date)}</td>

                                        <td>
                                            <span className={`badge ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setSelectedRegistration(item)}
                                                title="View Details"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && registrations.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">

                        <p className="text-muted small mb-0">
                            Total Registrations: {totalCount}
                        </p>

                        <div>
                            <button
                                className="btn btn-outline-danger me-2"
                                disabled={!previousPage}
                                onClick={() => fetchRegistrations(previousPage)}
                            >
                                <i className="bi bi-chevron-left me-1"></i>
                                Previous
                            </button>

                            <button
                                className="btn btn-outline-danger"
                                disabled={!nextPage}
                                onClick={() => fetchRegistrations(nextPage)}
                            >
                                Next
                                <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        </div>

                    </div>
                )}

            </div>

            {/* Registration Details Modal */}
            {selectedRegistration && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    Camp Registration Details
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedRegistration(null)}
                                ></button>
                            </div>

                            <div className="modal-body">

                                <h6 className="text-danger fw-bold mb-3">
                                    Donor Information
                                </h6>

                                <p>
                                    <strong>Donor Name:</strong>{' '}
                                    {selectedRegistration.donor_name}
                                </p>

                                <p>
                                    <strong>Blood Group:</strong>{' '}
                                    {selectedRegistration.donor_blood_group}
                                </p>

                                <hr />

                                <h6 className="text-danger fw-bold mb-3">
                                    Camp Information
                                </h6>

                                <p>
                                    <strong>Camp Name:</strong>{' '}
                                    {selectedRegistration.camp_name}
                                </p>

                                <p>
                                    <strong>Blood Bank:</strong>{' '}
                                    {selectedRegistration.blood_bank_name}
                                </p>

                                <p>
                                    <strong>Camp Date:</strong>{' '}
                                    {formatDate(selectedRegistration.camp_date)}
                                </p>

                                <hr />

                                <h6 className="text-danger fw-bold mb-3">
                                    Registration Information
                                </h6>

                                <p>
                                    <strong>Registration ID:</strong>{' '}
                                    {selectedRegistration.id}
                                </p>

                                <p>
                                    <strong>Registration Date:</strong>{' '}
                                    {formatDate(selectedRegistration.registration_date)}
                                </p>

                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span className={`badge ${getStatusBadge(selectedRegistration.status)}`}>
                                        {selectedRegistration.status}
                                    </span>
                                </p>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedRegistration(null)}
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

export default CampRegistrationMonitoring;