import React, { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodInventory() {

    // ==============================
    // STATE VARIABLES
    // ==============================

    const [units, setUnits] = useState([]);
    const [summary, setSummary] = useState({});
    const [thresholds, setThresholds] = useState([]);
    const [allocations, setAllocations] = useState([]);

    // Stores which request groups are expanded
    const [expandedRequests, setExpandedRequests] = useState({});

    // Inventory filters
    const [bloodGroup, setBloodGroup] = useState('');
    const [inventoryStatus, setInventoryStatus] = useState('');

    // Stock threshold form
    const [selectedGroup, setSelectedGroup] = useState('');
    const [minimumUnits, setMinimumUnits] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Loading and messages
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Add blood modal
    const [showAddBloodModal, setShowAddBloodModal] = useState(false);

    const [newBloodGroup, setNewBloodGroup] = useState('');
    const [newUnits, setNewUnits] = useState('');
    const [collectionDate, setCollectionDate] = useState('');

    const [addingBlood, setAddingBlood] = useState(false);

    // Blood groups
    const bloodGroups = [
        'A+', 'A-',
        'B+', 'B-',
        'AB+', 'AB-',
        'O+', 'O-'
    ];


    // ==============================
    // LOAD DATA WHEN PAGE OPENS
    // ==============================

    useEffect(() => {

        fetchInventory();
        fetchSummary();
        fetchThresholds();
        fetchAllocations();

    }, []);


    // ==============================
    // FETCH INVENTORY
    // ==============================

    const fetchInventory = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                'inventory/bank/units/',
                {
                    params: {
                        blood_group: bloodGroup,
                        status: inventoryStatus
                    }
                }
            );

            setUnits(
                response.data.results || response.data
            );

        } catch (error) {

            setError('Unable to load blood inventory.');

        } finally {

            setLoading(false);

        }

    };


    // ==============================
    // FETCH AVAILABLE STOCK SUMMARY
    // ==============================

    const fetchSummary = async () => {

        try {

            const response = await API.get(
                'inventory/bank/inventory/summary/'
            );

            setSummary(response.data);

        } catch (error) {

            setError('Unable to load stock summary.');

        }

    };


    // ==============================
    // FETCH STOCK THRESHOLDS
    // ==============================

    const fetchThresholds = async () => {

        try {

            const response = await API.get(
                'inventory/bank/inventory/thresholds/'
            );

            setThresholds(
                response.data.results || response.data
            );

        } catch (error) {

            setError('Unable to load stock thresholds.');

        }

    };


    // ==============================
    // FETCH RESERVED ALLOCATIONS
    // ==============================

    const fetchAllocations = async () => {

        try {

            const response = await API.get(
                'inventory/bank/allocations/'
            );

            setAllocations(
                response.data.results || response.data
            );

        } catch (error) {

            setError('Unable to load reserved allocations.');

        }

    };


    // ==============================
    // APPLY INVENTORY FILTERS
    // ==============================

    const applyFilters = () => {

        fetchInventory();

    };


    // ==============================
    // RESET INVENTORY FILTERS
    // ==============================

    const resetFilters = () => {

        setBloodGroup('');
        setInventoryStatus('');

        API.get('inventory/bank/units/')

            .then(response => {

                setUnits(
                    response.data.results || response.data
                );

            })

            .catch(() => {

                setError('Unable to load blood inventory.');

            });

    };


    // ==============================
    // ADD OR UPDATE STOCK THRESHOLD
    // ==============================

    const saveThreshold = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        try {

            // If editing an existing threshold
            if (editingId) {

                await API.patch(
                    `inventory/bank/inventory/thresholds/${editingId}/`,
                    {
                        minimum_units: minimumUnits
                    }
                );

                setSuccess(
                    'Stock threshold updated successfully.'
                );

            }

            // If adding a new threshold
            else {

                await API.post(
                    'inventory/bank/inventory/manage-thresholds/',
                    {
                        blood_group: selectedGroup,
                        minimum_units: minimumUnits
                    }
                );

                setSuccess(
                    'Stock threshold added successfully.'
                );

            }

            // Reset form
            setSelectedGroup('');
            setMinimumUnits('');
            setEditingId(null);

            // Refresh thresholds
            fetchThresholds();

        } catch (error) {

            setError(
                error.response?.data?.blood_group?.[0] ||
                error.response?.data?.minimum_units?.[0] ||
                error.response?.data?.detail ||
                'Unable to save stock threshold.'
            );

        }

    };


    // ==============================
    // EDIT STOCK THRESHOLD
    // ==============================

    const editThreshold = (threshold) => {

        setEditingId(threshold.id);

        setSelectedGroup(
            threshold.blood_group
        );

        setMinimumUnits(
            threshold.minimum_units
        );

    };


    // ==============================
    // CANCEL THRESHOLD EDITING
    // ==============================

    const cancelEdit = () => {

        setEditingId(null);

        setSelectedGroup('');
        setMinimumUnits('');

    };


    // ==============================
    // ISSUE RESERVED BLOOD UNIT
    // ==============================

    const issueAllocation = async (id) => {

        const confirmIssue = window.confirm(
            'Are you sure you want to issue this blood unit?'
        );

        if (!confirmIssue) {
            return;
        }

        setError('');
        setSuccess('');

        try {

            const response = await API.post(
                `inventory/bank/allocations/${id}/issue/`
            );

            setSuccess(
                response.data.message
            );

            // Refresh all relevant data
            fetchAllocations();
            fetchInventory();
            fetchSummary();

        } catch (error) {

            setError(
                error.response?.data?.error ||
                'Unable to issue blood unit.'
            );

        }

    };


    // ==============================
    // ADD BLOOD UNITS MANUALLY
    // ==============================

    const addBloodUnits = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        try {

            setAddingBlood(true);

            const response = await API.post(
                'inventory/bank/add-blood/',
                {
                    blood_group: newBloodGroup,
                    units: newUnits,
                    collection_date: collectionDate
                }
            );

            setSuccess(
                response.data.message
            );

            // Close modal
            setShowAddBloodModal(false);

            // Reset form
            setNewBloodGroup('');
            setNewUnits('');
            setCollectionDate('');

            // Refresh inventory and summary
            fetchInventory();
            fetchSummary();

        } catch (error) {

            const errorData = error.response?.data;

            setError(
                errorData?.error ||
                errorData?.detail ||
                'Unable to add blood units.'
            );

        } finally {

            setAddingBlood(false);

        }

    };


    // ==============================
    // GROUP ALLOCATIONS BY REQUEST ID
    // ==============================

    const groupedAllocations = allocations.reduce(
        (groups, allocation) => {

            // Each Blood Request gets its own group
            const requestId = allocation.blood_request_id;

            // Create a group if it doesn't exist
            if (!groups[requestId]) {

                groups[requestId] = [];

            }

            // Add this allocation to the group
            groups[requestId].push(allocation);

            return groups;

        },
        {}
    );


    // ==============================
    // EXPAND OR COLLAPSE REQUEST
    // ==============================

    const toggleRequest = (requestId) => {

        setExpandedRequests(previousState => ({

            ...previousState,

            [requestId]: !previousState[requestId]

        }));

    };


    // ==============================
    // JSX
    // ==============================

    return (

        <div className="container mt-4 mb-5">


            {/* PAGE HEADING */}

            <h3 className="text-danger mb-4">

                <i className="bi bi-droplet-fill me-2"></i>

                Blood Inventory Management

            </h3>


            {/* ERROR MESSAGE */}

            {error && (

                <div className="alert alert-danger alert-dismissible">

                    {error}

                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>

                </div>

            )}


            {/* SUCCESS MESSAGE */}

            {success && (

                <div className="alert alert-success alert-dismissible">

                    {success}

                    <button
                        className="btn-close"
                        onClick={() => setSuccess('')}
                    ></button>

                </div>

            )}



            {/* ==============================
                AVAILABLE BLOOD STOCK
            ============================== */}

            {/* Stock Summary */}
            <div className="dashboard-card mb-4">

                <h5 className="mb-3">Available Blood Stock</h5>

                <div className="row">

                    {bloodGroups.map((group) => {

                        const availableUnits = summary[group] ?? 0;

                        // Find configured threshold for this blood group
                        const threshold = thresholds.find(
                            t => t.blood_group === group
                        );

                        // Check whether stock is below the configured threshold
                        const isLowStock = threshold
                            ? availableUnits < threshold.minimum_units
                            : false;

                        return (

                            <div className="col-md-3 col-6 mb-3" key={group}>

                                <div className="border rounded p-3 text-center">

                                    <h5 className="text-danger">

                                        {group}

                                        {/* Low Stock Warning */}
                                        {isLowStock && (

                                            <i
                                                className="bi bi-exclamation-triangle-fill text-warning ms-2"
                                                title="Low Stock"
                                            ></i>

                                        )}

                                    </h5>

                                    <h4>{availableUnits}</h4>

                                    <small className="text-muted">
                                        Available Units
                                    </small>

                                </div>

                            </div>

                        );

                    })}

                </div>
            </div>


            {/* ==============================
                BLOOD INVENTORY
            ============================== */}

            <div className="dashboard-card mb-4">


                {/* HEADER */}

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="mb-0">

                        Blood Inventory

                    </h5>


                    <button
                        className="btn btn-blood"
                        onClick={() => setShowAddBloodModal(true)}
                    >

                        <i className="bi bi-plus-circle me-2"></i>

                        Add Blood

                    </button>

                </div>



                {/* FILTERS */}

                <div className="row mb-3">


                    {/* BLOOD GROUP FILTER */}

                    <div className="col-md-4 mb-2">

                        <select
                            className="form-select"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                        >

                            <option value="">

                                All Blood Groups

                            </option>


                            {bloodGroups.map((group) => (

                                <option
                                    key={group}
                                    value={group}
                                >

                                    {group}

                                </option>

                            ))}

                        </select>

                    </div>



                    {/* STATUS FILTER */}

                    <div className="col-md-4 mb-2">

                        <select
                            className="form-select"
                            value={inventoryStatus}
                            onChange={(e) => setInventoryStatus(e.target.value)}
                        >

                            <option value="">

                                All Statuses

                            </option>

                            <option value="AVAILABLE">

                                Available

                            </option>

                            <option value="RESERVED">

                                Reserved

                            </option>

                            <option value="ISSUED">

                                Issued

                            </option>

                            <option value="EXPIRED">

                                Expired

                            </option>

                        </select>

                    </div>



                    {/* FILTER BUTTONS */}

                    <div className="col-md-4 mb-2">

                        <button
                            className="btn btn-blood me-2"
                            onClick={applyFilters}
                        >

                            <i className="bi bi-funnel me-1"></i>

                            Apply

                        </button>


                        <button
                            className="btn btn-secondary"
                            onClick={resetFilters}
                        >

                            Reset

                        </button>

                    </div>

                </div>



                {/* INVENTORY TABLE */}

                {loading ? (

                    <p className="text-center">

                        Loading inventory...

                    </p>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">


                            {/* TABLE HEADER */}

                            <thead className="table-light">

                                <tr>

                                    <th>Unit ID</th>

                                    <th>Blood Group</th>

                                    <th>Collection Date</th>

                                    <th>Expiry Date</th>

                                    <th>Status</th>

                                </tr>

                            </thead>



                            {/* TABLE BODY */}

                            <tbody>

                                {units.length > 0 ? (

                                    units.map((unit) => (

                                        <tr key={unit.id}>


                                            {/* UNIT ID */}

                                            <td>

                                                {unit.id}

                                            </td>



                                            {/* BLOOD GROUP */}

                                            <td>

                                                <span className="badge bg-danger">

                                                    {unit.blood_group}

                                                </span>

                                            </td>



                                            {/* COLLECTION DATE */}

                                            <td>

                                                {unit.collection_date}

                                            </td>



                                            {/* EXPIRY DATE */}

                                            <td>

                                                {unit.expiry_date}

                                            </td>



                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        unit.status === 'AVAILABLE'
                                                            ? 'bg-success'
                                                            : unit.status === 'RESERVED'
                                                            ? 'bg-warning text-dark'
                                                            : unit.status === 'ISSUED'
                                                            ? 'bg-primary'
                                                            : 'bg-secondary'
                                                    }`}
                                                >

                                                    {unit.status}

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center text-muted"
                                        >

                                            No blood units found.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>



            {/* ==============================
                STOCK THRESHOLD MANAGEMENT
            ============================== */}

            <div className="dashboard-card mb-4">


                <h5 className="mb-3">

                    Stock Threshold Management

                </h5>



                {/* THRESHOLD FORM */}

                <form onSubmit={saveThreshold}>


                    <div className="row align-items-end">


                        {/* BLOOD GROUP */}

                        <div className="col-md-4 mb-2">

                            <label className="form-label">

                                Blood Group

                            </label>


                            <select
                                className="form-select"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                required
                                disabled={editingId !== null}
                            >

                                <option value="">

                                    Select Blood Group

                                </option>


                                {bloodGroups

                                    .filter(group =>

                                        editingId !== null ||

                                        !thresholds.some(
                                            threshold =>
                                                threshold.blood_group === group
                                        )

                                    )

                                    .map(group => (

                                        <option
                                            key={group}
                                            value={group}
                                        >

                                            {group}

                                        </option>

                                    ))}

                            </select>

                        </div>



                        {/* MINIMUM UNITS */}

                        <div className="col-md-4 mb-2">

                            <label className="form-label">

                                Minimum Units

                            </label>


                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={minimumUnits}
                                onChange={(e) => setMinimumUnits(e.target.value)}
                                required
                            />

                        </div>



                        {/* FORM BUTTONS */}

                        <div className="col-md-4 mb-2">


                            <button
                                type="submit"
                                className="btn btn-blood me-2"
                            >

                                {editingId
                                    ? 'Update Threshold'
                                    : 'Add Threshold'
                                }

                            </button>


                            {editingId && (

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelEdit}
                                >

                                    Cancel

                                </button>

                            )}

                        </div>

                    </div>

                </form>



                <hr />



                {/* CONFIGURED THRESHOLDS */}

                <h6 className="mb-3">

                    Configured Stock Thresholds

                </h6>



                <div className="table-responsive">

                    <table className="table table-bordered table-hover">


                        <thead className="table-light">

                            <tr>

                                <th>Blood Group</th>

                                <th>Minimum Units</th>

                                <th>Action</th>

                            </tr>

                        </thead>



                        <tbody>

                            {thresholds.length > 0 ? (

                                thresholds.map((threshold) => (

                                    <tr key={threshold.id}>


                                        <td>

                                            {threshold.blood_group}

                                        </td>


                                        <td>

                                            {threshold.minimum_units}

                                        </td>


                                        <td>

                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => editThreshold(threshold)}
                                            >

                                                <i className="bi bi-pencil me-1"></i>

                                                Edit

                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="3"
                                        className="text-center text-muted"
                                    >

                                        No stock thresholds configured.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* ==============================
                RESERVED BLOOD ALLOCATIONS
            ============================== */}

            <div className="dashboard-card">


                <h5 className="mb-3">

                    Reserved Blood Allocations

                </h5>



                <div className="table-responsive">

                    <table className="table table-bordered table-hover align-middle">


                        {/* MAIN TABLE HEADER */}

                        <thead className="table-light">

                            <tr>

                                <th>Request ID</th>

                                <th>Patient Name</th>

                                <th>Hospital</th>

                                <th>Blood Group</th>

                                <th>Units Reserved</th>

                                <th>Action</th>

                            </tr>

                        </thead>



                        {/* MAIN TABLE BODY */}

                        <tbody>


                            {Object.keys(groupedAllocations).length > 0 ? (


                                Object.entries(groupedAllocations).map(
                                    ([requestId, requestAllocations]) => {


                                        // Get the first allocation
                                        // to display request details

                                        const firstAllocation =
                                            requestAllocations[0];


                                        // Check if this request is expanded

                                        const isExpanded =
                                            expandedRequests[requestId];


                                        return (

                                            <React.Fragment key={requestId}>


                                                {/* GROUPED REQUEST ROW */}

                                                <tr>


                                                    <td>

                                                        {requestId}

                                                    </td>


                                                    <td>

                                                        {firstAllocation.patient_name}

                                                    </td>


                                                    <td>

                                                        {firstAllocation.hospital_name}

                                                    </td>


                                                    <td>

                                                        <span className="badge bg-danger">

                                                            {firstAllocation.blood_group}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="badge bg-primary">

                                                            {requestAllocations.length} Units

                                                        </span>

                                                    </td>


                                                    <td>


                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() =>
                                                                toggleRequest(requestId)
                                                            }
                                                        >


                                                            <i
                                                                className={`bi ${
                                                                    isExpanded
                                                                        ? 'bi-chevron-up'
                                                                        : 'bi-chevron-down'
                                                                } me-1`}
                                                            ></i>


                                                            {isExpanded
                                                                ? 'Hide Units'
                                                                : 'View Units'
                                                            }


                                                        </button>

                                                    </td>

                                                </tr>



                                                {/* EXPANDED UNIT DETAILS */}

                                                {isExpanded && (


                                                    <tr>


                                                        <td colSpan="6">


                                                            <div className="p-3 bg-light rounded">


                                                                <h6 className="mb-3">

                                                                    Reserved Units for Request #{requestId}

                                                                </h6>



                                                                <div className="table-responsive">


                                                                    <table className="table table-bordered table-sm table-hover align-middle mb-0">


                                                                        {/* UNIT TABLE HEADER */}

                                                                        <thead className="table-secondary">

                                                                            <tr>

                                                                                <th>Allocation ID</th>

                                                                                <th>Unit ID</th>

                                                                                <th>Expiry Date</th>

                                                                                <th>Reserved Date</th>

                                                                                <th>Action</th>

                                                                            </tr>

                                                                        </thead>



                                                                        {/* UNIT TABLE BODY */}

                                                                        <tbody>


                                                                            {requestAllocations.map(
                                                                                (allocation) => (


                                                                                    <tr key={allocation.id}>


                                                                                        <td>

                                                                                            {allocation.id}

                                                                                        </td>


                                                                                        <td>

                                                                                            {allocation.blood_unit_id}

                                                                                        </td>


                                                                                        <td>

                                                                                            {allocation.expiry_date}

                                                                                        </td>


                                                                                        <td>

                                                                                            {new Date(
                                                                                                allocation.reserved_at
                                                                                            ).toLocaleDateString()}

                                                                                        </td>


                                                                                        <td>


                                                                                            <button
                                                                                                className="btn btn-sm btn-success"
                                                                                                onClick={() =>
                                                                                                    issueAllocation(
                                                                                                        allocation.id
                                                                                                    )
                                                                                                }
                                                                                            >


                                                                                                <i className="bi bi-check-circle me-1"></i>


                                                                                                Issue


                                                                                            </button>

                                                                                        </td>

                                                                                    </tr>

                                                                                )

                                                                            )}

                                                                        </tbody>

                                                                    </table>

                                                                </div>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )}

                                            </React.Fragment>

                                        );

                                    }

                                )

                            ) : (


                                <tr>


                                    <td
                                        colSpan="6"
                                        className="text-center text-muted"
                                    >

                                        No reserved allocations found.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* ==============================
                ADD BLOOD MODAL
            ============================== */}

            {showAddBloodModal && (


                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                >


                    <div className="modal-dialog modal-dialog-centered">


                        <div className="modal-content">


                            {/* MODAL HEADER */}

                            <div className="modal-header">


                                <h5 className="modal-title">

                                    Add Blood Units

                                </h5>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAddBloodModal(false)}
                                ></button>

                            </div>



                            {/* MODAL BODY */}

                            <div className="modal-body">


                                <form onSubmit={addBloodUnits}>


                                    {/* BLOOD GROUP */}

                                    <div className="mb-3">


                                        <label className="form-label">

                                            Blood Group

                                        </label>


                                        <select
                                            className="form-select"
                                            value={newBloodGroup}
                                            onChange={(e) => setNewBloodGroup(e.target.value)}
                                            required
                                        >


                                            <option value="">

                                                Select Blood Group

                                            </option>


                                            {bloodGroups.map(group => (

                                                <option
                                                    key={group}
                                                    value={group}
                                                >

                                                    {group}

                                                </option>

                                            ))}

                                        </select>

                                    </div>



                                    {/* NUMBER OF UNITS */}

                                    <div className="mb-3">


                                        <label className="form-label">

                                            Number of Units

                                        </label>


                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={newUnits}
                                            onChange={(e) => setNewUnits(e.target.value)}
                                            required
                                        />

                                    </div>



                                    {/* COLLECTION DATE */}

                                    <div className="mb-3">


                                        <label className="form-label">

                                            Collection Date

                                        </label>


                                        <input
                                            type="date"
                                            className="form-control"
                                            value={collectionDate}
                                            onChange={(e) => setCollectionDate(e.target.value)}
                                            required
                                        />

                                    </div>



                                    {/* MODAL BUTTONS */}

                                    <div className="d-flex justify-content-end">


                                        <button
                                            type="button"
                                            className="btn btn-secondary me-2"
                                            onClick={() => setShowAddBloodModal(false)}
                                            disabled={addingBlood}
                                        >

                                            Cancel

                                        </button>


                                        <button
                                            type="submit"
                                            className="btn btn-blood"
                                            disabled={addingBlood}
                                        >


                                            {addingBlood
                                                ? 'Adding...'
                                                : 'Add Blood Units'
                                            }


                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default BloodInventory;