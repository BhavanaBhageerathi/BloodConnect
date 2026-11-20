import { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodRequestManagement() {

    const [requests, setRequests] = useState([]);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    const [selectedRequest, setSelectedRequest] = useState(null);


    // Fetch requests whenever filters change
    useEffect(() => {
        fetchRequests();
    }, [statusFilter, priorityFilter]);


    // Fetch blood requests
    const fetchRequests = async (url = 'admin/blood-requests/') => {

        try {

            setLoading(true);
            setError('');

            let response;

            // First page with filters
            if (url === 'admin/blood-requests/') {

                response = await API.get(url, {
                    params: {
                        status: statusFilter === 'ALL'
                            ? undefined
                            : statusFilter,

                        priority: priorityFilter === 'ALL'
                            ? undefined
                            : priorityFilter
                    }
                });

            }

            // Next or previous page
            else {

                response = await API.get(url);

            }

            setRequests(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count);

        }
        catch (err) {

            console.error(err);

            setError('Unable to load blood requests.');

        }
        finally {

            setLoading(false);

        }

    };


    // Search requests on current page
    const filteredRequests = requests.filter((request) => {

        const searchText = search.toLowerCase();

        const matchesSearch =
            (request.requester_name || '').toLowerCase().includes(searchText) ||
            (request.patient_name || '').toLowerCase().includes(searchText) ||
            (request.blood_group || '').toLowerCase().includes(searchText) ||
            (request.hospital_name || '').toLowerCase().includes(searchText) ||
            (request.blood_bank_name || '').toLowerCase().includes(searchText);

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

            case 'FULFILLED':
                return 'bg-primary';

            default:
                return 'bg-secondary';

        }

    };


    // Priority badge
    const getPriorityBadge = (priority) => {

        switch (priority) {

            case 'URGENT':
                return 'bg-danger';

            case 'HIGH':
                return 'bg-warning text-dark';

            case 'NORMAL':
                return 'bg-info text-dark';

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
                            Blood Request Management
                        </h3>

                        <p className="text-muted mb-0">
                            View and monitor blood requests submitted by requesters.
                        </p>

                    </div>


                    {/* Refresh */}

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchRequests()}
                    >

                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh

                    </button>

                </div>


                {/* Statistics */}

                <div className="row g-3 mb-4">


                    {/* Total Requests */}

                    <div className="col-md-3">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Total Requests
                            </h6>

                            <h3 className="fw-bold">
                                {totalCount}
                            </h3>

                        </div>

                    </div>


                    {/* Pending */}

                    <div className="col-md-3">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Pending on Current Page
                            </h6>

                            <h3 className="fw-bold text-warning">

                                {requests.filter(
                                    r => r.status === 'PENDING'
                                ).length}

                            </h3>

                        </div>

                    </div>


                    {/* Approved */}

                    <div className="col-md-3">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Approved on Current Page
                            </h6>

                            <h3 className="fw-bold text-success">

                                {requests.filter(
                                    r => r.status === 'APPROVED'
                                ).length}

                            </h3>

                        </div>

                    </div>


                    {/* Rejected */}

                    <div className="col-md-3">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Rejected on Current Page
                            </h6>

                            <h3 className="fw-bold text-danger">

                                {requests.filter(
                                    r => r.status === 'REJECTED'
                                ).length}

                            </h3>

                        </div>

                    </div>

                </div>


                {/* Search and Filters */}

                <div className="dashboard-card mb-4">

                    <div className="row g-3">


                        {/* Search */}

                        <div className="col-md-6">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search requester, patient, blood group, hospital..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>


                        {/* Status Filter */}

                        <div className="col-md-3">

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

                                <option value="FULFILLED">
                                    Fulfilled
                                </option>

                            </select>

                        </div>


                        {/* Priority Filter */}

                        <div className="col-md-3">

                            <select
                                className="form-select"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >

                                <option value="ALL">
                                    All Priorities
                                </option>

                                <option value="URGENT">
                                    Urgent
                                </option>

                                <option value="HIGH">
                                    High
                                </option>

                                <option value="NORMAL">
                                    Normal
                                </option>

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


                {/* Blood Requests Table */}

                <div className="dashboard-card">

                    <h5 className="fw-bold mb-3">
                        Blood Requests
                    </h5>


                    {loading ? (

                        <div className="text-center py-4">

                            <div className="spinner-border text-danger"></div>

                            <p className="mt-2">
                                Loading blood requests...
                            </p>

                        </div>

                    ) : filteredRequests.length === 0 ? (

                        <div className="text-center text-muted py-4">

                            No blood requests found.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">


                                {/* Table Header */}

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Requester</th>
                                        <th>Patient</th>
                                        <th>Blood Group</th>
                                        <th>Units</th>
                                        <th>Required Date</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                {/* Table Body */}

                                <tbody>

                                    {filteredRequests.map((request) => (

                                        <tr key={request.id}>

                                            <td>
                                                {request.id}
                                            </td>

                                            <td>
                                                {request.requester_name}
                                            </td>

                                            <td>
                                                {request.patient_name}
                                            </td>

                                            <td>
                                                {request.blood_group}
                                            </td>

                                            <td>
                                                {request.units_required}
                                            </td>

                                            <td>

                                                {request.required_date
                                                    ? new Date(request.required_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </td>

                                            <td>

                                                <span className={`badge ${getPriorityBadge(request.priority)}`}>

                                                    {request.priority || '-'}

                                                </span>

                                            </td>

                                            <td>

                                                <span className={`badge ${getStatusBadge(request.status)}`}>

                                                    {request.status}

                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedRequest(request)}
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

                    {!loading && requests.length > 0 && (

                        <div className="d-flex justify-content-between align-items-center mt-4">


                            {/* Previous */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!previousPage}
                                onClick={() => fetchRequests(previousPage)}
                            >

                                <i className="bi bi-arrow-left me-2"></i>
                                Previous

                            </button>


                            {/* Page Information */}

                            <span className="text-muted">

                                Showing {filteredRequests.length} requests

                            </span>


                            {/* Next */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!nextPage}
                                onClick={() => fetchRequests(nextPage)}
                            >

                                Next
                                <i className="bi bi-arrow-right ms-2"></i>

                            </button>

                        </div>

                    )}

                </div>


                {/* Request Details Modal */}

                {selectedRequest && (

                    <div
                        className="modal show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >

                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

                            <div className="modal-content">


                                {/* Modal Header */}

                                <div className="modal-header bg-danger text-white">

                                    <h5 className="modal-title">
                                        Blood Request Details
                                    </h5>

                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => setSelectedRequest(null)}
                                    ></button>

                                </div>


                                {/* Modal Body */}

                                <div className="modal-body">


                                    {/* Requester Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Requester Information
                                    </h6>


                                    <div className="row">

                                        <div className="col-md-6">

                                            <strong>Requester:</strong>

                                            <p>
                                                {selectedRequest.requester_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Email:</strong>

                                            <p>
                                                {selectedRequest.requester_email || '-'}
                                            </p>

                                        </div>

                                    </div>


                                    <hr />


                                    {/* Patient Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Patient Information
                                    </h6>


                                    <div className="row">

                                        <div className="col-md-6">

                                            <strong>Patient Name:</strong>

                                            <p>
                                                {selectedRequest.patient_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Patient Age:</strong>

                                            <p>
                                                {selectedRequest.patient_age || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Blood Group:</strong>

                                            <p>
                                                {selectedRequest.blood_group || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Units Required:</strong>

                                            <p>
                                                {selectedRequest.units_required || '-'}
                                            </p>

                                        </div>

                                    </div>


                                    <hr />


                                    {/* Hospital Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Hospital Information
                                    </h6>


                                    <div className="row">

                                        <div className="col-md-6">

                                            <strong>Hospital Name:</strong>

                                            <p>
                                                {selectedRequest.hospital_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Hospital Address:</strong>

                                            <p>
                                                {selectedRequest.hospital_address || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>City:</strong>

                                            <p>
                                                {selectedRequest.city || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>District:</strong>

                                            <p>
                                                {selectedRequest.district_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Assigned Blood Bank:</strong>

                                            <p>
                                                {selectedRequest.blood_bank_name || '-'}
                                            </p>

                                        </div>

                                    </div>


                                    <hr />


                                    {/* Request Details */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Request Details
                                    </h6>


                                    <div className="row">


                                        <div className="col-md-6">

                                            <strong>Required Date:</strong>

                                            <p>

                                                {selectedRequest.required_date
                                                    ? new Date(selectedRequest.required_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Priority:</strong>

                                            <p>

                                                <span className={`badge ${getPriorityBadge(selectedRequest.priority)}`}>

                                                    {selectedRequest.priority || '-'}

                                                </span>

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Requester Contact:</strong>

                                            <p>
                                                {selectedRequest.requester_contact || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Doctor Contact:</strong>

                                            <p>
                                                {selectedRequest.doctor_contact || '-'}
                                            </p>

                                        </div>


                                        <div className="col-12">

                                            <strong>Additional Information:</strong>

                                            <p>
                                                {selectedRequest.additional_info || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Status:</strong>

                                            <p>

                                                <span className={`badge ${getStatusBadge(selectedRequest.status)}`}>

                                                    {selectedRequest.status}

                                                </span>

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Created At:</strong>

                                            <p>

                                                {selectedRequest.created_at
                                                    ? new Date(selectedRequest.created_at).toLocaleString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        {selectedRequest.rejection_reason && (

                                            <div className="col-12">

                                                <strong>Rejection Reason:</strong>

                                                <p>
                                                    {selectedRequest.rejection_reason}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* Modal Footer */}

                                <div className="modal-footer">

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedRequest(null)}
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

export default BloodRequestManagement;