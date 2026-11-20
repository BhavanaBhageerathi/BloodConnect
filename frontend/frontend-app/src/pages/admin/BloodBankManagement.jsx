import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function BloodBankManagement() {

    const [bloodBanks, setBloodBanks] = useState([]);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedBank, setSelectedBank] = useState(null);


    // Fetch blood banks
    useEffect(() => {
        fetchBloodBanks();
    }, [statusFilter]);


    // Fetch blood banks with pagination and filter
    const fetchBloodBanks = async (url = 'admin/blood-banks/') => {

        try {

            setLoading(true);
            setError('');

            let response;

            // First page with filter
            if (url === 'admin/blood-banks/') {

                response = await API.get(url, {
                    params: {
                        status: statusFilter || undefined
                    }
                });

            }

            // Next or previous page
            else {

                response = await API.get(url);

            }

            setBloodBanks(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count);

        }
        catch (error) {

            console.error(error);

            setError('Unable to fetch blood banks.');

        }
        finally {

            setLoading(false);

        }

    };


    // Approve or reject blood bank
    const handleReview = async (bank, newStatus) => {

        const action = newStatus === 'APPROVED'
            ? 'approve'
            : 'reject';

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${bank.blood_bank_name}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            const response = await API.patch(
                `admin/blood-banks/${bank.id}/review/`,
                {
                    verification_status: newStatus
                }
            );

            setBloodBanks(prevBanks =>
                prevBanks.map(item =>
                    item.id === bank.id
                        ? {
                            ...item,
                            verification_status: response.data.verification_status
                        }
                        : item
                )
            );

            setSuccess(response.data.message);
            setError('');

            if (selectedBank?.id === bank.id) {

                setSelectedBank({
                    ...selectedBank,
                    verification_status: newStatus
                });

            }

        }
        catch (error) {

            console.error(error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                'Unable to update blood bank status.'
            );

            setSuccess('');

        }

    };


    // Search blood banks on current page
    const filteredBanks = bloodBanks.filter(bank => {

        const searchValue = search.toLowerCase();

        const matchesSearch =
            (bank.blood_bank_name || '').toLowerCase().includes(searchValue) ||
            (bank.username || '').toLowerCase().includes(searchValue) ||
            (bank.registration_number || '').toLowerCase().includes(searchValue) ||
            (bank.district || '').toLowerCase().includes(searchValue);

        return matchesSearch;

    });


    return (

        <div className="min-vh-100 bg-light">

            {/* Header */}

            <nav className="navbar bg-white shadow-sm">

                <div className="container">

                    <Link
                        to="/admin/dashboard"
                        className="navbar-brand text-danger fw-bold fs-4"
                    >

                        <i className="bi bi-droplet-fill me-2"></i>
                        BloodConnect

                    </Link>

                    <Link
                        to="/admin/dashboard"
                        className="btn btn-outline-danger"
                    >

                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard

                    </Link>

                </div>

            </nav>


            {/* Main Content */}

            <div className="container py-5">

                {/* Heading */}

                <div className="mb-4">

                    <h2 className="fw-bold">
                        Blood Bank Management
                    </h2>

                    <p className="text-muted">
                        View and manage registered blood banks.
                        Review their registration applications.
                    </p>

                </div>


                {/* Success Message */}

                {success && (

                    <div className="alert alert-success alert-dismissible fade show">

                        <i className="bi bi-check-circle me-2"></i>
                        {success}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccess('')}
                        ></button>

                    </div>

                )}


                {/* Error Message */}

                {error && (

                    <div className="alert alert-danger alert-dismissible fade show">

                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError('')}
                        ></button>

                    </div>

                )}


                {/* Search and Filter */}

                <div className="dashboard-card mb-4">

                    <div className="row g-3">

                        {/* Search */}

                        <div className="col-md-6">

                            <label className="form-label fw-semibold">
                                Search Blood Banks
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search name, username, registration number or district"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>


                        {/* Status Filter */}

                        <div className="col-md-6">

                            <label className="form-label fw-semibold">
                                Filter by Verification Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >

                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* Blood Bank Table */}

                <div className="dashboard-card">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="fw-bold mb-0">
                            Registered Blood Banks
                        </h5>

                        <span className="badge bg-danger">
                            {filteredBanks.length} Blood Banks
                        </span>

                    </div>


                    {loading ? (

                        <div className="text-center py-5">

                            <div className="spinner-border text-danger"></div>

                            <p className="mt-2">
                                Loading blood banks...
                            </p>

                        </div>

                    ) : error && bloodBanks.length === 0 ? (

                        <div className="text-center text-muted py-4">
                            Unable to load blood banks.
                        </div>

                    ) : filteredBanks.length === 0 ? (

                        <div className="text-center py-5">

                            <i className="bi bi-hospital fs-1 text-muted"></i>

                            <p className="text-muted mt-2">
                                No blood banks found.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Blood Bank</th>
                                        <th>Registration No.</th>
                                        <th>District</th>
                                        <th>Contact Person</th>
                                        <th>Status</th>
                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredBanks.map(bank => (

                                        <tr key={bank.id}>

                                            <td>{bank.id}</td>

                                            <td className="fw-semibold">
                                                {bank.blood_bank_name}
                                            </td>

                                            <td>
                                                {bank.registration_number}
                                            </td>

                                            <td>
                                                {bank.district}
                                            </td>

                                            <td>
                                                {bank.contact_person}
                                            </td>

                                            <td>

                                                <span className={`badge ${
                                                    bank.verification_status === 'APPROVED'
                                                        ? 'bg-success'
                                                        : bank.verification_status === 'REJECTED'
                                                        ? 'bg-danger'
                                                        : 'bg-warning text-dark'
                                                }`}>

                                                    {bank.verification_status}

                                                </span>

                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    {/* View Details */}

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setSelectedBank(bank)}
                                                    >

                                                        <i className="bi bi-eye"></i>

                                                    </button>


                                                    {/* Approve and Reject */}

                                                    {bank.verification_status === 'PENDING' && (

                                                        <>

                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleReview(bank, 'APPROVED')}
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleReview(bank, 'REJECTED')}
                                                            >
                                                                Reject
                                                            </button>

                                                        </>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* Pagination */}

                    {!loading && bloodBanks.length > 0 && (

                        <div className="d-flex justify-content-between align-items-center mt-4">

                            <button
                                className="btn btn-outline-danger"
                                disabled={!previousPage}
                                onClick={() => fetchBloodBanks(previousPage)}
                            >

                                <i className="bi bi-arrow-left me-2"></i>
                                Previous

                            </button>


                            <span className="text-muted">
                                Showing {filteredBanks.length} blood banks
                            </span>


                            <button
                                className="btn btn-outline-danger"
                                disabled={!nextPage}
                                onClick={() => fetchBloodBanks(nextPage)}
                            >

                                Next
                                <i className="bi bi-arrow-right ms-2"></i>

                            </button>

                        </div>

                    )}

                </div>


                {/* Blood Bank Details Modal */}

                {selectedBank && (

                    <div
                        className="modal show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content">

                                <div className="modal-header">

                                    <h5 className="modal-title fw-bold">
                                        Blood Bank Details
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedBank(null)}
                                    ></button>

                                </div>


                                <div className="modal-body">

                                    <p>
                                        <strong>Blood Bank Name:</strong><br />
                                        {selectedBank.blood_bank_name}
                                    </p>

                                    <p>
                                        <strong>Username:</strong><br />
                                        {selectedBank.username}
                                    </p>

                                    <p>
                                        <strong>Email:</strong><br />
                                        {selectedBank.email}
                                    </p>

                                    <p>
                                        <strong>Phone:</strong><br />
                                        {selectedBank.phone || '-'}
                                    </p>

                                    <p>
                                        <strong>Registration Number:</strong><br />
                                        {selectedBank.registration_number}
                                    </p>

                                    <p>
                                        <strong>Contact Person:</strong><br />
                                        {selectedBank.contact_person}
                                    </p>

                                    <p>
                                        <strong>District:</strong><br />
                                        {selectedBank.district}
                                    </p>

                                    <p>
                                        <strong>Address:</strong><br />
                                        {selectedBank.address}
                                    </p>

                                    <p className="mb-0">

                                        <strong>Verification Status:</strong><br />

                                        <span className="badge bg-primary">
                                            {selectedBank.verification_status}
                                        </span>

                                    </p>

                                </div>


                                <div className="modal-footer">

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedBank(null)}
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}

export default BloodBankManagement;