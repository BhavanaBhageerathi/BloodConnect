import { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodBankDonationManagement() {

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchDonations = async () => {
        try {
            const response = await API.get(
                'donations/bank/donation-management/'
            );

            setDonations(response.data);
            setError('');

        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to fetch donation details.'
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    // Health Verification
    const handleHealthVerification = async (invitationId) => {

        try {
            setProcessingId(invitationId);

            await API.post(
                'donations/bank/health-verification/',
                {
                    invitation_id: invitationId
                }
            );

            alert('Donor health verified successfully!');

            fetchDonations();

        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to verify donor health.'
            );

        } finally {
            setProcessingId(null);
        }
    };

    // Blood Collection
    const handleBloodCollection = async (invitationId) => {

        try {
            setProcessingId(invitationId);

            await API.post(
                'donations/bank/donations/complete/',
                {
                    invitation_id: invitationId,
                    donation_date: new Date()
                        .toISOString()
                        .split('T')[0]
                }
            );

            alert(
                'Blood collection completed successfully!'
            );

            fetchDonations();

        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to complete blood collection.'
            );

        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="container mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold text-danger">
                        Donation Management
                    </h2>

                    <p className="text-muted">
                        Manage donor health verification and blood collection.
                    </p>
                </div>

                <button
                    className="btn btn-outline-danger"
                    onClick={fetchDonations}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-danger"></div>
                    <p className="mt-2">Loading donations...</p>
                </div>
            ) : donations.length === 0 ? (

                <div className="card dashboard-card text-center py-5">

                    <i className="bi bi-droplet display-4 text-danger"></i>

                    <h5 className="mt-3">
                        No Donations Pending
                    </h5>

                    <p className="text-muted">
                        There are currently no selected donors awaiting
                        health verification or blood collection.
                    </p>

                </div>

            ) : (

                <div className="card dashboard-card">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Donor</th>
                                    <th>Blood Group</th>
                                    <th>District</th>
                                    <th>Request ID</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {donations.map((donation) => (

                                    <tr key={donation.id}>

                                        <td className="fw-semibold">
                                            {donation.donor_name}
                                        </td>

                                        <td>
                                            <span className="badge bg-danger">
                                                {donation.donor_blood_group}
                                            </span>
                                        </td>

                                        <td>
                                            {donation.donor_district}
                                        </td>

                                        <td>
                                            #{donation.donation_request}
                                        </td>

                                        <td>
                                            <span className={`badge ${
                                                donation.priority === 'EMERGENCY'
                                                    ? 'bg-danger'
                                                    : donation.priority === 'URGENT'
                                                    ? 'bg-warning text-dark'
                                                    : 'bg-secondary'
                                            }`}>
                                                {donation.priority}
                                            </span>
                                        </td>

                                        <td>

                                            {donation.status === 'SELECTED' && (
                                                <span className="badge bg-warning text-dark">
                                                    Selected
                                                </span>
                                            )}

                                            {donation.status === 'HEALTH_VERIFIED' && (
                                                <span className="badge bg-info text-dark">
                                                    Health Verified
                                                </span>
                                            )}

                                        </td>

                                        <td>

                                            {donation.status === 'SELECTED' && (

                                                <button
                                                    className="btn btn-success btn-sm"
                                                    disabled={
                                                        processingId === donation.id
                                                    }
                                                    onClick={() =>
                                                        handleHealthVerification(
                                                            donation.id
                                                        )
                                                    }
                                                >

                                                    {processingId === donation.id
                                                        ? 'Processing...'
                                                        : 'Health Verified'
                                                    }

                                                </button>

                                            )}

                                            {donation.status === 'HEALTH_VERIFIED' && (

                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    disabled={
                                                        processingId === donation.id
                                                    }
                                                    onClick={() =>
                                                        handleBloodCollection(
                                                            donation.id
                                                        )
                                                    }
                                                >

                                                    {processingId === donation.id
                                                        ? 'Processing...'
                                                        : 'Blood Collected'
                                                    }

                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

export default BloodBankDonationManagement;