import { useEffect, useState } from 'react';
import API from '../../services/api';
import LogoutButton from '../../components/LogoutButton';

function AdminDonorVerification() {

    const [applications, setApplications] = useState([]);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedApplication, setSelectedApplication] = useState(null);


    // Fetch applications
    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);


    // Fetch applications with pagination and status filter
    const fetchApplications = async (url = 'admin/verifications/') => {

        try {

            setLoading(true);
            setError('');

            let response;

            // First page with status filter
            if (url === 'admin/verifications/') {

                response = await API.get(url, {
                    params: {
                        status: statusFilter === 'ALL'
                            ? undefined
                            : statusFilter
                    }
                });

            }

            // Next or previous page
            else {

                response = await API.get(url);

            }

            setApplications(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count);

        }
        catch (err) {

            console.error(err);

            setError('Unable to load donor verification applications.');

        }
        finally {

            setLoading(false);

        }

    };


    // Search applications on the current page
    const filteredApplications = applications.filter((application) => {

        const searchText = search.toLowerCase();

        const matchesSearch =
            (application.donor_name || '').toLowerCase().includes(searchText) ||
            (application.donor_email || '').toLowerCase().includes(searchText) ||
            (application.donor_blood_group || '').toLowerCase().includes(searchText) ||
            (application.blood_bank_name || '').toLowerCase().includes(searchText);

        return matchesSearch;

    });


    // Status badge
    const getStatusBadge = (status) => {

        switch (status) {

            case 'APPROVED':
                return 'bg-success';

            case 'REJECTED':
                return 'bg-danger';

            case 'PENDING':
                return 'bg-warning text-dark';

            default:
                return 'bg-secondary';

        }

    };


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
                            Donor Verification Monitoring
                        </h3>

                        <p className="text-muted mb-0">
                            View and monitor donor verification applications.
                        </p>

                    </div>


                    {/* Refresh Button */}

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchApplications()}
                    >

                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh

                    </button>

                </div>


                {/* Statistics */}

                <div className="row g-3 mb-4">


                    {/* Total Applications */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Total Applications
                            </h6>

                            <h3 className="fw-bold">
                                {totalCount}
                            </h3>

                        </div>

                    </div>


                    {/* Pending */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Pending on Current Page
                            </h6>

                            <h3 className="fw-bold text-warning">

                                {applications.filter(
                                    app => app.status === 'PENDING'
                                ).length}

                            </h3>

                        </div>

                    </div>


                    {/* Approved */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Approved on Current Page
                            </h6>

                            <h3 className="fw-bold text-success">

                                {applications.filter(
                                    app => app.status === 'APPROVED'
                                ).length}

                            </h3>

                        </div>

                    </div>

                </div>


                {/* Search and Filter */}

                <div className="dashboard-card mb-4">

                    <div className="row g-3">


                        {/* Search */}

                        <div className="col-md-8">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search donor, email, blood group or blood bank..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>


                        {/* Status Filter */}

                        <div className="col-md-4">

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >

                                <option value="ALL">
                                    All Statuses
                                </option>

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="APPROVED">
                                    Approved
                                </option>

                                <option value="REJECTED">
                                    Rejected
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* Error */}

                {error && (

                    <div className="alert alert-danger">
                        {error}
                    </div>

                )}


                {/* Applications Table */}

                <div className="dashboard-card">

                    <h5 className="fw-bold mb-3">
                        Verification Applications
                    </h5>


                    {loading ? (

                        <div className="text-center py-4">

                            <div className="spinner-border text-danger"></div>

                            <p className="mt-2">
                                Loading applications...
                            </p>

                        </div>

                    ) : filteredApplications.length === 0 ? (

                        <div className="text-center text-muted py-4">

                            No verification applications found.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">


                                {/* Table Header */}

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Donor Name</th>
                                        <th>Email</th>
                                        <th>Blood Group</th>
                                        <th>Blood Bank</th>
                                        <th>Application Date</th>
                                        <th>Status</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                {/* Table Body */}

                                <tbody>

                                    {filteredApplications.map((application) => (

                                        <tr key={application.id}>

                                            <td>
                                                {application.id}
                                            </td>

                                            <td>
                                                {application.donor_name}
                                            </td>

                                            <td>
                                                {application.donor_email}
                                            </td>

                                            <td>
                                                {application.donor_blood_group}
                                            </td>

                                            <td>
                                                {application.blood_bank_name}
                                            </td>

                                            <td>

                                                {application.application_date
                                                    ? new Date(application.application_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </td>

                                            <td>

                                                <span className={`badge ${getStatusBadge(application.status)}`}>

                                                    {application.status}

                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Details"
                                                    onClick={() => setSelectedApplication(application)}
                                                >

                                                    <i className="bi bi-eye"></i>

                                                    <span className="ms-1">
                                                        View
                                                    </span>

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* Pagination */}

                    {!loading && applications.length > 0 && (

                        <div className="d-flex justify-content-between align-items-center mt-4">


                            {/* Previous */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!previousPage}
                                onClick={() => fetchApplications(previousPage)}
                            >

                                <i className="bi bi-arrow-left me-2"></i>
                                Previous

                            </button>


                            {/* Page Information */}

                            <span className="text-muted">

                                Showing {filteredApplications.length} applications

                            </span>


                            {/* Next */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!nextPage}
                                onClick={() => fetchApplications(nextPage)}
                            >

                                Next
                                <i className="bi bi-arrow-right ms-2"></i>

                            </button>

                        </div>

                    )}

                </div>


                {/* Application Details Modal */}

                {selectedApplication && (

                    <div
                        className="modal show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >

                        <div className="modal-dialog modal-lg modal-dialog-centered">

                            <div className="modal-content">


                                {/* Modal Header */}

                                <div className="modal-header bg-danger text-white">

                                    <h5 className="modal-title">
                                        Donor Verification Details
                                    </h5>

                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => setSelectedApplication(null)}
                                    ></button>

                                </div>


                                {/* Modal Body */}

                                <div className="modal-body">


                                    {/* Donor Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Donor Information
                                    </h6>


                                    <div className="row mb-3">

                                        <div className="col-md-6">

                                            <strong>Donor Name:</strong>

                                            <p>
                                                {selectedApplication.donor_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Email:</strong>

                                            <p>
                                                {selectedApplication.donor_email || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Blood Group:</strong>

                                            <p>
                                                {selectedApplication.donor_blood_group || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Blood Bank:</strong>

                                            <p>
                                                {selectedApplication.blood_bank_name || '-'}
                                            </p>

                                        </div>

                                    </div>


                                    <hr />


                                    {/* Verification Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Verification Information
                                    </h6>


                                    <div className="row">


                                        <div className="col-md-6">

                                            <strong>Application Date:</strong>

                                            <p>

                                                {selectedApplication.application_date
                                                    ? new Date(selectedApplication.application_date).toLocaleString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Status:</strong>

                                            <p>

                                                <span className={`badge ${getStatusBadge(selectedApplication.status)}`}>

                                                    {selectedApplication.status}

                                                </span>

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Reviewed By:</strong>

                                            <p>
                                                {selectedApplication.reviewed_by || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Review Date:</strong>

                                            <p>

                                                {selectedApplication.review_date
                                                    ? new Date(selectedApplication.review_date).toLocaleString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        <div className="col-12">

                                            <strong>Health Details:</strong>

                                            <p>
                                                {selectedApplication.health_details || '-'}
                                            </p>

                                        </div>


                                        <div className="col-12">

                                            <strong>Remarks:</strong>

                                            <p>
                                                {selectedApplication.remarks || '-'}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Modal Footer */}

                                <div className="modal-footer">

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedApplication(null)}
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

export default AdminDonorVerification;