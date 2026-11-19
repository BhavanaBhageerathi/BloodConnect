import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function BloodBanks() {
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBloodBanks = async () => {
            try {
                const response = await API.get('accounts/approved-blood-banks/');
                setBloodBanks(response.data);
            } catch (error) {
                console.error(error);
                setError('Unable to load blood banks.');
            } finally {
                setLoading(false);
            }
        };

        fetchBloodBanks();
    }, []);

    return (
        <div className="container mt-4">

            <div className="d-flex align-items-center mb-4">
                <Link to="/donor/dashboard" className="btn btn-outline-secondary me-3">
                    <i className="bi bi-arrow-left"></i>
                </Link>

                <h3 className="text-danger mb-0">Approved Blood Banks</h3>
            </div>

            {loading && (
                <p className="text-center">Loading blood banks...</p>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && bloodBanks.length === 0 && (
                <div className="alert alert-info">
                    No approved blood banks are currently available.
                </div>
            )}

            <div className="row">
                {bloodBanks.map((bank) => (
                    <div className="col-md-6 col-lg-4 mb-3" key={bank.id}>
                        <div className="dashboard-card h-100">

                            <div className="d-flex align-items-center mb-3">
                                <i className="bi bi-hospital text-danger fs-3 me-3"></i>

                                <h5 className="mb-0">
                                    {bank.blood_bank_name}
                                </h5>
                            </div>

                            <p className="text-muted mb-0">
                                <i className="bi bi-geo-alt me-2"></i>
                                {bank.district}
                            </p>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default BloodBanks;