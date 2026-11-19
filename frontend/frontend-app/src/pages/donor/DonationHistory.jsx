import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function DonationHistory() {

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch donation history
    useEffect(() => {

        const fetchDonationHistory = async () => {

            try {
                const response = await API.get('donations/my-history/');

                setDonations(response.data.results || response.data);

            } catch (error) {
                console.error(error);
                setError('Unable to load donation history.');
            } finally {
                setLoading(false);
            }

        };

        fetchDonationHistory();

    }, []);

    // Format Date
    const formatDate = (date) => {

        if (!date) return 'Not available';

        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    };

    // Status Badge Colors
    const getStatusStyle = (status) => {

        switch (status) {
            case 'COMPLETED':
                return 'success';

            case 'PENDING':
                return 'warning';

            case 'CANCELLED':
                return 'danger';

            default:
                return 'secondary';
        }

    };

    return (

        <div className="container py-4">

            {/* Header */}
            <div className="d-flex align-items-center mb-4">

                <Link
                    to="/donor/dashboard"
                    className="btn btn-outline-danger me-3"
                >
                    <i className="bi bi-arrow-left"></i>
                </Link>

                <div>
                    <h3 className="mb-1">Donation History</h3>

                    <p className="text-muted mb-0">
                        View your previous blood donations
                    </p>
                </div>

            </div>

            {/* Loading */}
            {loading && (

                <div className="text-center py-5">

                    <div className="spinner-border text-danger"></div>

                    <p className="mt-2">
                        Loading donation history...
                    </p>

                </div>

            )}

            {/* Error */}
            {!loading && error && (

                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>

            )}

            {/* No Donations */}
            {!loading && !error && donations.length === 0 && (

                <div className="card dashboard-card text-center py-5">

                    <i
                        className="bi bi-droplet text-muted mb-3"
                        style={{ fontSize: '50px' }}
                    ></i>

                    <h5>No Donation History</h5>

                    <p className="text-muted mb-0">
                        You haven't completed any blood donations yet.
                        Your donation records will appear here.
                    </p>

                </div>

            )}

            {/* Donation Records */}
            {!loading && !error && donations.length > 0 && (

                <div>

                    <p className="text-muted mb-3">
                        Total Donation Records: {donations.length}
                    </p>

                    <div className="row">

                        {donations.map((donation) => (

                            <div
                                className="col-md-6 mb-3"
                                key={donation.id}
                            >

                                <div className="card dashboard-card h-100">

                                    {/* Card Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                        <h5 className="text-danger mb-0">

                                            <i className="bi bi-droplet-fill me-2"></i>

                                            {donation.blood_group}

                                        </h5>

                                        <span className={`badge bg-${getStatusStyle(donation.status)}`}>

                                            {donation.status.replace('_', ' ')}

                                        </span>

                                    </div>

                                    {/* Blood Bank */}
                                    <h6 className="mb-3">
                                        {donation.blood_bank_name}
                                    </h6>

                                    {/* Donation Details */}
                                    <div className="mb-2">

                                        <i className="bi bi-droplet text-danger me-2"></i>

                                        Units Donated: {donation.units_donated}

                                    </div>

                                    <div className="mb-2">

                                        <i className="bi bi-calendar3 text-danger me-2"></i>

                                        Donation Date: {formatDate(donation.donation_date)}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>

    );

}

export default DonationHistory;