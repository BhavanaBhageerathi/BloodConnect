import { useEffect, useState } from 'react';
import API from '../../services/api';

function DonorManagement() {

    const [donors, setDonors] = useState([]);
    const [donationRequests, setDonationRequests] = useState([]);

    const [search, setSearch] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [district, setDistrict] = useState('');

    const [selectedDonors, setSelectedDonors] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState('');

    const [loadingDonors, setLoadingDonors] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [sendingInvitations, setSendingInvitations] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [invitationResults, setInvitationResults] = useState(null);


    // Fetch eligible donors
    useEffect(() => {
        fetchDonors();
        fetchDonationRequests();
    }, []);


    const fetchDonors = async () => {

        try {

            const response = await API.get(
                'donations/bank/eligible-donors/'
            );

            setDonors(response.data.results || response.data);

        } catch (error) {

            setError(
                error.response?.data?.detail ||
                'Unable to load eligible donors.'
            );

        } finally {

            setLoadingDonors(false);
        }
    };


    // Fetch open donation requests
    const fetchDonationRequests = async () => {

        try {

            const response = await API.get(
                'donations/bank/donation-requests/'
            );

            setDonationRequests(
                response.data.results || response.data
            );

        } catch (error) {

            setError(
                error.response?.data?.detail ||
                'Unable to load donation requests.'
            );

        } finally {

            setLoadingRequests(false);
        }
    };


    // Filter donors
    const filteredDonors = donors.filter((donor) => {

        const matchesSearch = donor.full_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesBloodGroup =
            bloodGroup === '' ||
            donor.blood_group === bloodGroup;

        const matchesDistrict =
            district === '' ||
            String(donor.district) === district;

        const matchesRequestBloodGroup =
            selectedRequest === '' ||
            donor.blood_group ===
            donationRequests.find(
                request => String(request.id) === selectedRequest
            )?.blood_group;

        return (
            matchesSearch &&
            matchesBloodGroup &&
            matchesDistrict &&
            matchesRequestBloodGroup
        );
    });


    // Get unique districts
    const districts = [
        ...new Map(
            donors.map(donor => [
                donor.district,
                donor.district_name
            ])
        )
    ];


    // Select / deselect donor
    const handleDonorSelection = (donorId) => {

        setSelectedDonors((previous) => {

            if (previous.includes(donorId)) {

                return previous.filter(id => id !== donorId);

            } else {

                return [...previous, donorId];
            }
        });
    };


    // Select all filtered donors
    const handleSelectAll = () => {

        const filteredIds = filteredDonors.map(
            donor => donor.id
        );

        const allSelected = filteredIds.every(
            id => selectedDonors.includes(id)
        );

        if (allSelected) {

            setSelectedDonors((previous) =>
                previous.filter(id => !filteredIds.includes(id))
            );

        } else {

            setSelectedDonors((previous) => [
                ...new Set([
                    ...previous,
                    ...filteredIds
                ])
            ]);
        }
    };


    // Clear selections
    const clearSelection = () => {

        setSelectedDonors([]);
    };


    // Send invitations
    const handleSendInvitations = async () => {

        setError('');
        setSuccess('');
        setInvitationResults(null);

        if (!selectedRequest) {

            setError('Please select a donation request.');

            return;
        }

        if (selectedDonors.length === 0) {

            setError('Please select at least one donor.');

            return;
        }

        try {

            setSendingInvitations(true);

            const response = await API.post(
                'donations/bank/send-invitations/',
                {
                    donation_request_id: Number(selectedRequest),
                    donor_ids: selectedDonors
                }
            );

            setInvitationResults(response.data);

            setSuccess(
                response.data.message ||
                'Invitations processed successfully.'
            );

            setSelectedDonors([]);

        } catch (error) {

            setError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to send invitations.'
            );

        } finally {

            setSendingInvitations(false);
        }
    };


    // Loading state
    if (loadingDonors || loadingRequests) {

        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-danger"></div>
                    <p className="mt-3">
                        Loading donor information...
                    </p>
                </div>
            </div>
        );
    }


    return (

        <div className="container mt-4 mb-5">

            {/* Header */}
            <div className="mb-4">

                <h3 className="text-danger fw-bold">

                    <i className="bi bi-people-fill me-2"></i>

                    Donor Management

                </h3>

                <p className="text-muted">

                    Find eligible donors and send blood donation invitations.

                </p>

            </div>


            {/* Alerts */}
            {error && (

                <div className="alert alert-danger alert-dismissible">

                    <i className="bi bi-exclamation-circle me-2"></i>

                    {error}

                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>

                </div>

            )}


            {success && (

                <div className="alert alert-success alert-dismissible">

                    <i className="bi bi-check-circle-fill me-2"></i>

                    {success}

                    <button
                        className="btn-close"
                        onClick={() => setSuccess('')}
                    ></button>

                </div>

            )}


            {/* Donation Request Selection */}
            <div className="dashboard-card mb-4">

                <h5 className="text-danger mb-3">

                    <i className="bi bi-clipboard2-pulse me-2"></i>

                    Select Donation Request

                </h5>


                <div className="mb-3">

                    <label className="form-label fw-semibold">

                        Donation Request

                    </label>

                    <select
                        className="form-select"
                        value={selectedRequest}
                        onChange={(e) => {

                            setSelectedRequest(e.target.value);

                            setSelectedDonors([]);

                            setInvitationResults(null);

                        }}
                    >

                        <option value="">

                            Select a donation request

                        </option>

                        {donationRequests.map((request) => (

                            <option
                                key={request.id}
                                value={request.id}
                            >

                                {request.blood_group} | {request.units_required} Units |
                                {request.priority} | {request.district_name}

                            </option>

                        ))}

                    </select>

                </div>


                {selectedRequest && (

                    <div className="alert alert-info mb-0">

                        {(() => {

                            const request = donationRequests.find(
                                item => String(item.id) === selectedRequest
                            );

                            return (

                                <>

                                    <strong>Selected Request:</strong>

                                    <div className="mt-2">

                                        <span className="badge bg-danger me-2">

                                            {request.blood_group}

                                        </span>

                                        <span className="badge bg-primary me-2">

                                            {request.units_required} Units

                                        </span>

                                        <span className="badge bg-warning text-dark me-2">

                                            {request.priority}

                                        </span>

                                        <span className="badge bg-secondary">

                                            {request.district_name}

                                        </span>

                                    </div>

                                </>

                            );

                        })()}

                    </div>

                )}

            </div>


            {/* Donor Filters */}
            <div className="dashboard-card mb-4">

                <h5 className="mb-3">

                    <i className="bi bi-funnel me-2"></i>

                    Filter Donors

                </h5>


                <div className="row">

                    {/* Search */}
                    <div className="col-md-4 mb-3">

                        <label className="form-label">

                            Search Donor

                        </label>

                        <div className="input-group">

                            <span className="input-group-text">

                                <i className="bi bi-search"></i>

                            </span>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter donor name"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </div>


                    {/* Blood Group */}
                    <div className="col-md-4 mb-3">

                        <label className="form-label">

                            Blood Group

                        </label>

                        <select
                            className="form-select"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                        >

                            <option value="">All Blood Groups</option>

                            {[
                                'A+', 'A-', 'B+', 'B-',
                                'AB+', 'AB-', 'O+', 'O-'
                            ].map(group => (

                                <option key={group} value={group}>

                                    {group}

                                </option>

                            ))}

                        </select>

                    </div>


                    {/* District */}
                    <div className="col-md-4 mb-3">

                        <label className="form-label">

                            District

                        </label>

                        <select
                            className="form-select"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        >

                            <option value="">All Districts</option>

                            {districts.map(([districtId, districtName]) => (

                                <option
                                    key={districtId}
                                    value={districtId}
                                >

                                    {districtName}

                                </option>

                            ))}

                        </select>

                    </div>

                </div>


                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {

                        setSearch('');
                        setBloodGroup('');
                        setDistrict('');

                    }}
                >

                    <i className="bi bi-arrow-counterclockwise me-1"></i>

                    Clear Filters

                </button>

            </div>


            {/* Donor Selection */}
            <div className="dashboard-card mb-4">

                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

                    <h5 className="mb-2">

                        <i className="bi bi-person-check me-2"></i>

                        Eligible Donors

                    </h5>


                    <div>

                        <span className="badge bg-success me-2">

                            {filteredDonors.length} Donors

                        </span>

                        <span className="badge bg-primary">

                            {selectedDonors.length} Selected

                        </span>

                    </div>

                </div>


                {filteredDonors.length > 0 && (

                    <div className="mb-3">

                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleSelectAll}
                        >

                            <i className="bi bi-check2-square me-1"></i>

                            Select All Filtered Donors

                        </button>


                        <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={clearSelection}
                        >

                            Clear Selection

                        </button>

                    </div>

                )}


                <div className="table-responsive">

                    <table className="table table-bordered table-hover align-middle">

                        <thead className="table-light">

                            <tr>

                                <th>Select</th>

                                <th>Donor Name</th>

                                <th>Phone</th>

                                <th>Blood Group</th>

                                <th>District</th>

                                <th>Weight</th>

                                <th>Last Donation</th>

                                <th>Next Eligible Date</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredDonors.length > 0 ? (

                                filteredDonors.map((donor) => (

                                    <tr key={donor.id}>

                                        <td className="text-center">

                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selectedDonors.includes(donor.id)}
                                                onChange={() => handleDonorSelection(donor.id)}
                                            />

                                        </td>


                                        <td className="fw-semibold">

                                            {donor.full_name}

                                        </td>


                                        <td>

                                            {donor.phone}

                                        </td>


                                        <td>

                                            <span className="badge bg-danger">

                                                {donor.blood_group}

                                            </span>

                                        </td>


                                        <td>

                                            {donor.district_name}

                                        </td>


                                        <td>

                                            {donor.weight} kg

                                        </td>


                                        <td>

                                            {donor.last_donation_date || 'Never'}

                                        </td>


                                        <td>

                                            {donor.next_eligible_date || 'Eligible Now'}

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="text-center text-muted py-4"
                                    >

                                        No eligible donors found.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* Send Invitations */}
            <div className="dashboard-card mb-4">

                <div className="d-flex flex-wrap justify-content-between align-items-center">

                    <div>

                        <h5 className="text-danger mb-1">

                            <i className="bi bi-envelope-fill me-2"></i>

                            Send Donation Invitations

                        </h5>

                        <p className="text-muted mb-0">

                            {selectedDonors.length} donor(s) selected

                        </p>

                    </div>


                    <button
                        className="btn btn-danger"
                        onClick={handleSendInvitations}
                        disabled={
                            sendingInvitations ||
                            selectedDonors.length === 0 ||
                            !selectedRequest
                        }
                    >

                        {sendingInvitations ? (

                            <>

                                <span className="spinner-border spinner-border-sm me-2"></span>

                                Sending Invitations...

                            </>

                        ) : (

                            <>

                                <i className="bi bi-send-fill me-2"></i>

                                Send Invitations

                            </>

                        )}

                    </button>

                </div>

            </div>


            {/* Invitation Results */}
            {invitationResults && (

                <div className="dashboard-card">

                    <h5 className="text-danger mb-3">

                        <i className="bi bi-envelope-check me-2"></i>

                        Invitation Results

                    </h5>


                    {/* Successfully Invited */}
                    <div className="alert alert-success">

                        <h6 className="fw-bold">

                            <i className="bi bi-check-circle-fill me-2"></i>

                            Successfully Invited

                        </h6>

                        <p className="mb-2">

                            Total Invitations Sent:

                            <strong className="ms-2">

                                {invitationResults.total_invitations_sent}

                            </strong>

                        </p>


                        {invitationResults.invited_donors?.length > 0 && (

                            <ul className="mb-0">

                                {invitationResults.invited_donors.map((donor) => (

                                    <li key={donor.invitation_id}>

                                        {donor.donor_name}

                                    </li>

                                ))}

                            </ul>

                        )}

                    </div>


                    {/* Skipped Donors */}
                    {invitationResults.total_donors_skipped > 0 && (

                        <div className="alert alert-warning">

                            <h6 className="fw-bold">

                                <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                Skipped Donors

                            </h6>


                            <p>

                                Total Skipped:

                                <strong className="ms-2">

                                    {invitationResults.total_donors_skipped}

                                </strong>

                            </p>


                            <div className="table-responsive">

                                <table className="table table-sm table-bordered mb-0">

                                    <thead>

                                        <tr>

                                            <th>Donor ID</th>

                                            <th>Reason</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {invitationResults.skipped_donors.map((donor, index) => (

                                            <tr key={index}>

                                                <td>{donor.donor_id}</td>

                                                <td>{donor.reason}</td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>

    );
}

export default DonorManagement;