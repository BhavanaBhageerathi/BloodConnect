import { useEffect, useState } from 'react';
import API from '../../services/api';

function BloodBankDonationHistory() {
    const [donations, setDonations] = useState([]);
    const [search, setSearch] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [donationDate, setDonationDate] = useState('');
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await API.get('donations/bank/donations/history/');
            setDonations(response.data.results || response.data);
        } catch (error) {
            setError(error.response?.data?.detail || 'Unable to load donation records.');
        } finally {
            setLoading(false);
        }
    };

    const filteredDonations = donations.filter((donation) => {
        const matchesSearch = donation.donor_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesBloodGroup = bloodGroup === '' ||
            donation.blood_group === bloodGroup;

        const matchesDate = donationDate === '' ||
            donation.donation_date === donationDate;

        return matchesSearch && matchesBloodGroup && matchesDate;
    });

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-danger">
                    <i className="bi bi-droplet-fill me-2"></i>
                    Donation Management
                </h3>
            </div>

            <div className="dashboard-card">

                <h5 className="mb-3">Completed Donations</h5>

                {/* Search and Filters */}
                <div className="row mb-3">

                    <div className="col-md-4 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search donor name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="col-md-4 mb-2">
                        <select
                            className="form-select"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                        >
                            <option value="">All Blood Groups</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4 mb-2">
                        <input
                            type="date"
                            className="form-control"
                            value={donationDate}
                            onChange={(e) => setDonationDate(e.target.value)}
                        />
                    </div>

                </div>

                {loading ? (
                    <p className="text-center">Loading donations...</p>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Donor Name</th>
                                    <th>Blood Group</th>
                                    <th>Units Donated</th>
                                    <th>Donation Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDonations.length > 0 ? (
                                    filteredDonations.map((donation) => (
                                        <tr key={donation.id}>
                                            <td>{donation.donor_name}</td>
                                            <td>
                                                <span className="badge bg-danger">
                                                    {donation.blood_group}
                                                </span>
                                            </td>
                                            <td>{donation.units_donated}</td>
                                            <td>{donation.donation_date}</td>
                                            <td>
                                                <span className="badge bg-success">
                                                    {donation.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedDonation(donation)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No donation records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>

                    </div>
                )}
            </div>

            {/* Donation Details */}
            {selectedDonation && (
                <div className="dashboard-card mt-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="text-danger">Donation Details</h5>

                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setSelectedDonation(null)}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <p><strong>Donor Name:</strong> {selectedDonation.donor_name}</p>
                    <p><strong>Blood Group:</strong> {selectedDonation.blood_group}</p>
                    <p><strong>Units Donated:</strong> {selectedDonation.units_donated}</p>
                    <p><strong>Donation Date:</strong> {selectedDonation.donation_date}</p>
                    <p><strong>Status:</strong> {selectedDonation.status}</p>

                </div>
            )}

        </div>
    );
}

export default BloodBankDonationHistory;