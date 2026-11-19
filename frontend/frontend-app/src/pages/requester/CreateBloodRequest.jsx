import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { PublicAPI } from '../../services/api';

function CreateBloodRequest() {

    const navigate = useNavigate();

    const [bloodBanks, setBloodBanks] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        blood_bank: '',
        patient_name: '',
        patient_age: '',
        blood_group: '',
        units_required: '1',
        hospital_name: '',
        hospital_address: '',
        city: '',
        district: '',
        required_date: '',
        priority: 'NORMAL',
        requester_contact: '',
        doctor_contact: '',
        additional_info: '',
        supporting_document: null
    });

    // Fetch approved blood banks and districts
    useEffect(() => {

        const fetchDetails = async () => {

            try {

                const bankResponse = await API.get(
                    'accounts/approved-blood-banks/'
                );

                const districtResponse = await API.get(
                    'locations/districts/'
                );

                const banks = bankResponse.data.results || bankResponse.data;

                setBloodBanks(banks);
                setDistricts(districtResponse.data);

            }
            catch (error) {

                console.log('Error fetching details:', error);

                setError('Unable to load blood banks or districts.');

            }
            finally {

                setLoading(false);

            }

        };

        fetchDetails();

    }, []);

    // Handle input changes
    const handleChange = (e) => {

        const { name, value, files } = e.target;

        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });

    };

    // Submit blood request
    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError('');
        setSuccess('');

        try {

            const data = new FormData();

            Object.keys(formData).forEach((key) => {

                if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }

            });

            await API.post('blood-requests/create/', data);

            setSuccess('Blood request submitted successfully!');

            setTimeout(() => {
                navigate('/requester/requests');
            }, 1500);

        }
        catch (error) {

            console.log('Error submitting blood request:', error);

            if (error.response && error.response.data) {

                const errorData = error.response.data;

                const messages = Object.entries(errorData)
                    .map(([field, value]) => {
                        return `${field}: ${Array.isArray(value) ? value.join(' ') : value}`;
                    })
                    .join(' | ');

                setError(messages || 'Unable to submit blood request.');

            }
            else {

                setError('Something went wrong. Please try again.');

            }

        }
        finally {

            setSaving(false);

        }

    };

    // Get today's date for the date input
    const today = new Date();
    const minDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (loading) {
        return <div className="container py-5">Loading...</div>;
    }

    return (

        <div className="min-vh-100">

            {/* Header */}
            <nav className="navbar bg-white shadow-sm">

                <div className="container">

                    <Link
                        to="/requester/dashboard"
                        className="navbar-brand text-danger fw-bold"
                    >
                        <i className="bi bi-droplet-fill me-2"></i>
                        BloodConnect
                    </Link>

                    <Link
                        to="/requester/dashboard"
                        className="btn btn-outline-danger"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                    </Link>

                </div>

            </nav>

            <div className="container py-5">

                {/* Page Heading */}
                <div className="mb-4">

                    <h2 className="fw-bold">
                        <i className="bi bi-plus-circle text-danger me-2"></i>
                        Create Blood Request
                    </h2>

                    <p className="text-muted">
                        Fill in the details below to submit a blood request.
                    </p>

                </div>

                {/* Success Message */}
                {success && (
                    <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <div className="dashboard-card">

                    <form onSubmit={handleSubmit}>

                        {/* Blood Request Information */}
                        <h5 className="fw-bold text-danger mb-4">
                            Blood Request Information
                        </h5>

                        <div className="row g-3">

                            {/* Blood Bank */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Select Blood Bank *
                                </label>

                                <select
                                    name="blood_bank"
                                    className="form-select"
                                    value={formData.blood_bank}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">Select Blood Bank</option>

                                    {bloodBanks.map((bank) => (

                                        <option key={bank.id} value={bank.id}>
                                            {bank.blood_bank_name} - {bank.district}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Blood Group */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Blood Group *
                                </label>

                                <select
                                    name="blood_group"
                                    className="form-select"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">Select Blood Group</option>

                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (

                                        <option key={group} value={group}>
                                            {group}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Patient Name */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Patient Name *
                                </label>

                                <input
                                    type="text"
                                    name="patient_name"
                                    className="form-control"
                                    value={formData.patient_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* Patient Age */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Patient Age *
                                </label>

                                <input
                                    type="number"
                                    name="patient_age"
                                    className="form-control"
                                    min="0"
                                    max="120"
                                    value={formData.patient_age}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* Units Required */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Units Required *
                                </label>

                                <input
                                    type="number"
                                    name="units_required"
                                    className="form-control"
                                    min="1"
                                    max="10"
                                    value={formData.units_required}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* Priority */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Priority *
                                </label>

                                <select
                                    name="priority"
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="NORMAL">Normal</option>
                                    <option value="URGENT">Urgent</option>
                                    <option value="EMERGENCY">Emergency</option>

                                </select>

                            </div>

                            {/* Required Date */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Required Date *
                                </label>

                                <input
                                    type="date"
                                    name="required_date"
                                    className="form-control"
                                    min={minDate}
                                    value={formData.required_date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <hr className="my-4" />

                        {/* Hospital Information */}
                        <h5 className="fw-bold text-danger mb-4">
                            Hospital Information
                        </h5>

                        <div className="row g-3">

                            {/* Hospital Name */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Hospital Name *
                                </label>

                                <input
                                    type="text"
                                    name="hospital_name"
                                    className="form-control"
                                    value={formData.hospital_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* City */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    City *
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    className="form-control"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* District */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    District *
                                </label>

                                <select
                                    name="district"
                                    className="form-select"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">Select District</option>

                                    {districts.map((district) => (

                                        <option
                                            key={district.id}
                                            value={district.id}
                                        >
                                            {district.name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Hospital Address */}
                            <div className="col-12">

                                <label className="form-label">
                                    Hospital Address *
                                </label>

                                <textarea
                                    name="hospital_address"
                                    className="form-control"
                                    rows="3"
                                    value={formData.hospital_address}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <hr className="my-4" />

                        {/* Contact Information */}
                        <h5 className="fw-bold text-danger mb-4">
                            Contact Information
                        </h5>

                        <div className="row g-3">

                            {/* Requester Contact */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Requester Contact *
                                </label>

                                <input
                                    type="tel"
                                    name="requester_contact"
                                    className="form-control"
                                    value={formData.requester_contact}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    pattern="[6-9][0-9]{9}"
                                    maxLength="10"
                                    inputMode="numeric"
                                    required
                                />

                            </div>

                            {/* Doctor Contact */}
                            <div className="col-md-6">

                                <label className="form-label">
                                    Doctor Contact
                                </label>

                                <input
                                    type="tel"
                                    name="doctor_contact"
                                    className="form-control"
                                    value={formData.doctor_contact}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    pattern="[6-9][0-9]{9}"
                                    maxLength="10"
                                    inputMode="numeric"
                                />

                            </div>

                        </div>

                        <hr className="my-4" />

                        {/* Additional Information */}
                        <h5 className="fw-bold text-danger mb-4">
                            Additional Information
                        </h5>

                        <div className="row g-3">

                            {/* Additional Info */}
                            <div className="col-12">

                                <label className="form-label">
                                    Additional Information
                                </label>

                                <textarea
                                    name="additional_info"
                                    className="form-control"
                                    rows="3"
                                    value={formData.additional_info}
                                    onChange={handleChange}
                                />

                            </div>

                            {/* Supporting Document */}
                            <div className="col-12">

                                <label className="form-label">
                                    Supporting Document
                                </label>

                                <input
                                    type="file"
                                    name="supporting_document"
                                    className="form-control"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleChange}
                                />

                                <small className="text-muted">
                                    Optional: Upload a supporting document.
                                </small>

                            </div>

                        </div>

                        {/* Submit Button */}
                        <div className="mt-4">

                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={saving}
                            >

                                <i className="bi bi-send me-2"></i>

                                {saving ? 'Submitting...' : 'Submit Blood Request'}

                            </button>

                            <Link
                                to="/requester/dashboard"
                                className="btn btn-secondary ms-2"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default CreateBloodRequest;