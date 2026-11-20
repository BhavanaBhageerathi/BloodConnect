
import { useEffect, useState } from 'react';
import API from '../../services/api';

function DonationMonitoring() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedDonation, setSelectedDonation] = useState(null);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async (url = 'admin/donations/') => {
        try {
            setLoading(true);

            const response = await API.get(url);

            setDonations(response.data.results || []);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count || 0);

            setError('');
        } catch (err) {
            console.error(err);
            setError('Unable to load donation records.');
        } finally {
            setLoading(false);
        }
    };

    // Search and filter donations
    const filteredDonations = donations.filter((donation) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (donation.donor_name || '').toLowerCase().includes(searchText) ||
            (donation.donor_email || '').toLowerCase().includes(searchText) ||
            (donation.blood_bank_name || '').toLowerCase().includes(searchText) ||
            (donation.blood_group || '').toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === 'ALL' ||
            donation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get unique statuses from current page
    const statuses = [...new Set(
        donations.map(donation => donation.status).filter(Boolean)
    )];

    const getStatusBadge = (status) => {
        switch ((status || '').toUpperCase()) {
            case 'COMPLETED':
            case 'APPROVED':
                return 'bg-success';

            case 'PENDING':
                return 'bg-warning text-dark';

            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-danger';

            default:
                return 'bg-secondary';
        }
    };

    // Statistics for current page
    const totalUnitsDonated = donations.reduce(
        (total, donation) => total + (Number(donation.units_donated) || 0),
        0
    );

    const uniqueDonors = new Set(
        donations.map(donation => donation.donor_email).filter(Boolean)
    ).size;

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
                            Donation Records Monitoring
                        </h3>
                        <p className="text-muted mb-0">
                            View and monitor donation records across blood banks.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchDonations()}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Total Donation Records</h6>
                            <h3 className="fw-bold">{totalCount}</h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Total Units Donated</h6>
                            <h3 className="fw-bold text-success">
                                {totalUnitsDonated}
                            </h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="dashboard-card">
                            <h6 className="text-muted">Unique Donors</h6>
                            <h3 className="fw-bold text-primary">
                                {uniqueDonors}
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
                                placeholder="Search donor, email, blood bank or blood group..."
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

                {/* Donations Table */}
                <div className="dashboard-card">

                    <h5 className="fw-bold mb-3">
                        Donation Records
                    </h5>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-danger"></div>
                            <p className="mt-2">Loading donation records...</p>
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No donation records found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">

                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Donor Name</th>
                                        <th>Email</th>
                                        <th>Blood Bank</th>
                                        <th>Blood Group</th>
                                        <th>Units Donated</th>
                                        <th>Donation Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredDonations.map((donation) => (
                                        <tr key={donation.id}>
                                            <td>{donation.id}</td>
                                            <td>{donation.donor_name || '-'}</td>
                                            <td>{donation.donor_email || '-'}</td>
                                            <td>{donation.blood_bank_name || '-'}</td>
                                            <td>
                                                <span className="badge bg-danger">
                                                    {donation.blood_group || '-'}
                                                </span>
                                            </td>
                                            <td>{donation.units_donated ?? '-'}</td>
                                            <td>
                                                {donation.donation_date
                                                    ? new Date(donation.donation_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(donation.status)}`}>
                                                    {donation.status || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedDonation(donation)}
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

                    {/* Pagination */}
                    {!loading && donations.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">

                            <span className="text-muted">
                                Total Records: {totalCount}
                            </span>

                            <div>
                                <button
                                    className="btn btn-outline-danger me-2"
                                    disabled={!previousPage}
                                    onClick={() => fetchDonations(previousPage)}
                                >
                                    <i className="bi bi-chevron-left me-1"></i>
                                    Previous
                                </button>

                                <button
                                    className="btn btn-outline-danger"
                                    disabled={!nextPage}
                                    onClick={() => fetchDonations(nextPage)}
                                >
                                    Next
                                    <i className="bi bi-chevron-right ms-1"></i>
                                </button>
                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* Donation Details Modal */}
            {selectedDonation && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    Donation Details
                                </h5>

                                <button
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedDonation(null)}
                                ></button>
                            </div>

                            <div className="modal-body">

                                <h6 className="fw-bold text-danger mb-3">
                                    Donor Information
                                </h6>

                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>Donor Name:</strong>
                                        <p>{selectedDonation.donor_name || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Email:</strong>
                                        <p>{selectedDonation.donor_email || '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Blood Group:</strong>
                                        <p>{selectedDonation.blood_group || '-'}</p>
                                    </div>
                                </div>

                                <hr />

                                <h6 className="fw-bold text-danger mb-3">
                                    Donation Information
                                </h6>

                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>Donation ID:</strong>
                                        <p>{selectedDonation.id}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Units Donated:</strong>
                                        <p>{selectedDonation.units_donated ?? '-'}</p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Donation Date:</strong>
                                        <p>
                                            {selectedDonation.donation_date
                                                ? new Date(selectedDonation.donation_date).toLocaleDateString()
                                                : '-'}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Status:</strong>
                                        <p>
                                            <span className={`badge ${getStatusBadge(selectedDonation.status)}`}>
                                                {selectedDonation.status || '-'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <hr />

                                <h6 className="fw-bold text-danger mb-3">
                                    Blood Bank Information
                                </h6>

                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>Blood Bank:</strong>
                                        <p>{selectedDonation.blood_bank_name || '-'}</p>
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedDonation(null)}
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

export default DonationMonitoring;
