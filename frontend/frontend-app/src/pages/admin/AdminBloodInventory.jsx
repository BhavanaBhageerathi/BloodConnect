import { useEffect, useState } from 'react';
import API from '../../services/api';

function AdminBloodInventory() {

    const [inventory, setInventory] = useState([]);

    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedUnit, setSelectedUnit] = useState(null);


    // Fetch inventory
    useEffect(() => {
        fetchInventory();
    }, []);


    // Fetch inventory with pagination
    const fetchInventory = async (url = 'admin/inventory/') => {

        try {

            setLoading(true);
            setError('');

            const response = await API.get(url);

            setInventory(response.data.results);
            setNextPage(response.data.next);
            setPreviousPage(response.data.previous);
            setTotalCount(response.data.count);

        }

        catch (err) {

            console.error(err);

            setError('Unable to load blood inventory.');

        }

        finally {

            setLoading(false);

        }

    };


    // Search and filter inventory on current page
    const filteredInventory = inventory.filter((unit) => {

        const searchText = search.toLowerCase();

        const matchesSearch =
            (unit.blood_bank_name || '').toLowerCase().includes(searchText) ||
            (unit.district_name || '').toLowerCase().includes(searchText) ||
            (unit.blood_group || '').toLowerCase().includes(searchText);

        const matchesBloodGroup =
            bloodGroupFilter === 'ALL' ||
            unit.blood_group === bloodGroupFilter;

        const matchesStatus =
            statusFilter === 'ALL' ||
            unit.status === statusFilter;

        return matchesSearch && matchesBloodGroup && matchesStatus;

    });


    // Status badge
    const getStatusBadge = (status) => {

        switch (status) {

            case 'AVAILABLE':
                return 'bg-success';

            case 'RESERVED':
                return 'bg-warning text-dark';

            case 'USED':
                return 'bg-secondary';

            case 'EXPIRED':
                return 'bg-danger';

            default:
                return 'bg-secondary';

        }

    };


    // Statistics
    const totalUnits = totalCount;

    const availableUnits = inventory.filter(
        unit => unit.status === 'AVAILABLE'
    ).length;

    const expiredUnits = inventory.filter(
        unit => unit.status === 'EXPIRED'
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
                            Blood Inventory Monitoring
                        </h3>

                        <p className="text-muted mb-0">
                            Monitor blood units across registered blood banks.
                        </p>

                    </div>


                    {/* Refresh */}

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => fetchInventory()}
                    >

                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh

                    </button>

                </div>


                {/* Statistics */}

                <div className="row g-3 mb-4">


                    {/* Total Blood Units */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Total Blood Units
                            </h6>

                            <h3 className="fw-bold">
                                {totalUnits}
                            </h3>

                        </div>

                    </div>


                    {/* Available Units */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Available Units
                            </h6>

                            <h3 className="fw-bold text-success">

                                {availableUnits}

                            </h3>

                        </div>

                    </div>


                    {/* Expired Units */}

                    <div className="col-md-4">

                        <div className="dashboard-card">

                            <h6 className="text-muted">
                                Expired Units
                            </h6>

                            <h3 className="fw-bold text-danger">

                                {expiredUnits}

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
                                placeholder="Search blood bank, district or blood group..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>


                        {/* Blood Group Filter */}

                        <div className="col-md-3">

                            <select
                                className="form-select"
                                value={bloodGroupFilter}
                                onChange={(e) => setBloodGroupFilter(e.target.value)}
                            >

                                <option value="ALL">
                                    All Blood Groups
                                </option>

                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>

                            </select>

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

                                <option value="AVAILABLE">
                                    Available
                                </option>

                                <option value="RESERVED">
                                    Reserved
                                </option>

                                <option value="USED">
                                    Used
                                </option>

                                <option value="EXPIRED">
                                    Expired
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


                {/* Inventory Table */}

                <div className="dashboard-card">

                    <h5 className="fw-bold mb-3">
                        Blood Inventory Records
                    </h5>


                    {loading ? (

                        <div className="text-center py-4">

                            <div className="spinner-border text-danger"></div>

                            <p className="mt-2">
                                Loading inventory...
                            </p>

                        </div>

                    ) : filteredInventory.length === 0 ? (

                        <div className="text-center text-muted py-4">

                            No inventory records found.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">


                                {/* Table Header */}

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Blood Bank</th>
                                        <th>District</th>
                                        <th>Blood Group</th>
                                        <th>Collection Date</th>
                                        <th>Expiry Date</th>
                                        <th>Status</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                {/* Table Body */}

                                <tbody>

                                    {filteredInventory.map((unit) => (

                                        <tr key={unit.id}>

                                            <td>
                                                {unit.id}
                                            </td>

                                            <td>
                                                {unit.blood_bank_name || '-'}
                                            </td>

                                            <td>
                                                {unit.district_name || '-'}
                                            </td>

                                            <td>

                                                <span className="badge bg-danger">
                                                    {unit.blood_group}
                                                </span>

                                            </td>

                                            <td>

                                                {unit.collection_date
                                                    ? new Date(unit.collection_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </td>

                                            <td>

                                                {unit.expiry_date
                                                    ? new Date(unit.expiry_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </td>

                                            <td>

                                                <span className={`badge ${getStatusBadge(unit.status)}`}>

                                                    {unit.status}

                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedUnit(unit)}
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

                    {!loading && inventory.length > 0 && (

                        <div className="d-flex justify-content-between align-items-center mt-4">


                            {/* Previous */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!previousPage}
                                onClick={() => fetchInventory(previousPage)}
                            >

                                <i className="bi bi-arrow-left me-2"></i>
                                Previous

                            </button>


                            {/* Page Information */}

                            <span className="text-muted">

                                Showing {filteredInventory.length} records

                            </span>


                            {/* Next */}

                            <button
                                className="btn btn-outline-danger"
                                disabled={!nextPage}
                                onClick={() => fetchInventory(nextPage)}
                            >

                                Next
                                <i className="bi bi-arrow-right ms-2"></i>

                            </button>

                        </div>

                    )}

                </div>


                {/* Inventory Details Modal */}

                {selectedUnit && (

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
                                        Blood Unit Details
                                    </h5>

                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => setSelectedUnit(null)}
                                    ></button>

                                </div>


                                {/* Modal Body */}

                                <div className="modal-body">


                                    {/* Blood Bank Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Blood Bank Information
                                    </h6>


                                    <div className="row">

                                        <div className="col-md-6">

                                            <strong>Blood Bank:</strong>

                                            <p>
                                                {selectedUnit.blood_bank_name || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>District:</strong>

                                            <p>
                                                {selectedUnit.district_name || '-'}
                                            </p>

                                        </div>

                                    </div>


                                    <hr />


                                    {/* Blood Unit Information */}

                                    <h6 className="fw-bold text-danger mb-3">
                                        Blood Unit Information
                                    </h6>


                                    <div className="row">

                                        <div className="col-md-6">

                                            <strong>Unit ID:</strong>

                                            <p>
                                                {selectedUnit.id}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Blood Group:</strong>

                                            <p>
                                                {selectedUnit.blood_group || '-'}
                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Collection Date:</strong>

                                            <p>

                                                {selectedUnit.collection_date
                                                    ? new Date(selectedUnit.collection_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Expiry Date:</strong>

                                            <p>

                                                {selectedUnit.expiry_date
                                                    ? new Date(selectedUnit.expiry_date).toLocaleDateString()
                                                    : '-'
                                                }

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Status:</strong>

                                            <p>

                                                <span className={`badge ${getStatusBadge(selectedUnit.status)}`}>

                                                    {selectedUnit.status}

                                                </span>

                                            </p>

                                        </div>


                                        <div className="col-md-6">

                                            <strong>Donation Record ID:</strong>

                                            <p>
                                                {selectedUnit.donation_record || '-'}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Modal Footer */}

                                <div className="modal-footer">

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedUnit(null)}
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

export default AdminBloodInventory;