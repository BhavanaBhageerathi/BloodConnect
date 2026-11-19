import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';

function SubmitVerification() {

    const navigate = useNavigate();

    const [banks, setBanks] = useState([]);
    const [bloodBank, setBloodBank] = useState('');
    const [healthDetails, setHealthDetails] = useState('');

    const [loadingBanks, setLoadingBanks] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch approved blood banks
    useEffect(() => {

        const fetchBanks = async () => {
            try {
                const response = await API.get(
                    'accounts/approved-blood-banks/'
                );

                setBanks(response.data);

            } catch (error) {
                console.error(error);
                setError('Unable to load approved blood banks.');
            } finally {
                setLoadingBanks(false);
            }
        };

        fetchBanks();

    }, []);

    // Submit verification application
    const handleSubmit = async (e) => {

        e.preventDefault();
        setError('');

        if (!bloodBank || !healthDetails.trim()) {
            setError('Please select a blood bank and enter your health details.');
            return;
        }

        try {
            setSubmitting(true);

            await API.post('verification/submit/', {
                blood_bank: bloodBank,
                health_details: healthDetails
            });

            alert('Verification application submitted successfully!');

            navigate('/donor/verification');

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                'Unable to submit your application.'
            );

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-4">

            <Link to="/donor/verification" className="btn btn-outline-secondary mb-3">
                <i className="bi bi-arrow-left"></i> Back
            </Link>

            <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: '650px' }}>

                <div className="card-header bg-danger text-white py-3">
                    <h4 className="mb-0">
                        <i className="bi bi-file-earmark-check me-2"></i>
                        Submit Verification Application
                    </h4>
                </div>

                <div className="card-body p-4">

                    <p className="text-muted">
                        Select an approved blood bank and provide your
                        health details to submit your donor verification application.
                    </p>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Select Blood Bank
                            </label>

                            <select
                                className="form-select"
                                value={bloodBank}
                                onChange={(e) => setBloodBank(e.target.value)}
                                disabled={loadingBanks}
                            >

                                <option value="">
                                    {loadingBanks
                                        ? 'Loading blood banks...'
                                        : 'Select a blood bank'}
                                </option>

                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.blood_bank_name} - {bank.district}
                                    </option>
                                ))}

                            </select>

                            {!loadingBanks && banks.length === 0 && (
                                <small className="text-danger">
                                    No approved blood banks are currently available.
                                </small>
                            )}

                        </div>

                        <div className="mb-4">

                            <label className="form-label fw-semibold">
                                Health Details
                            </label>

                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Enter your relevant health details..."
                                value={healthDetails}
                                onChange={(e) => setHealthDetails(e.target.value)}
                            ></textarea>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-blood w-100"
                            disabled={submitting || loadingBanks || banks.length === 0}
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default SubmitVerification;