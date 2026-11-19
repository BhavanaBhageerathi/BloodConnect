
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { PublicAPI } from '../../services/api';

function DonorProfile() {

    const [user, setUser] = useState({});
    const [profile, setProfile] = useState({});
    const [districts, setDistricts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({});

    // Fetch donor profile and district details
    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const profileResponse = await API.get('accounts/me/');

                const districtResponse = await PublicAPI.get('locations/districts/');

                setUser(profileResponse.data.user);
                setProfile(profileResponse.data.profile);
                setFormData(profileResponse.data.profile);
                setDistricts(districtResponse.data);

            }
            catch (error) {

                console.log('Error fetching profile:', error);

                setError('Unable to load donor profile.');

            }
            finally {
                setLoading(false);
            }
        };

        fetchProfile();

    }, []);

    // Get district name using district ID
    const getDistrictName = (districtId) => {

        const district = districts.find(
            (item) => item.id === districtId
        );

        return district ? district.name : 'Not available';
    };

    // Handle form input changes
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

    };

    // Cancel editing
    const handleCancel = () => {

        setFormData(profile);
        setIsEditing(false);
        setError('');
        setSuccess('');

    };

    // Save updated profile
    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError('');
        setSuccess('');

        try {

            const payload = {
                full_name: formData.full_name,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                blood_group: formData.blood_group,
                district: formData.district,
                address: formData.address,
                weight: formData.weight,
                availability_status: formData.availability_status
            };

            const response = await API.patch('accounts/me/', payload);

            setProfile(response.data.profile);
            setFormData(response.data.profile);

            setIsEditing(false);
            setSuccess('Profile updated successfully!');

        }
        catch (error) {

            console.log('Error updating profile:', error);

            if (error.response && error.response.data) {

                const errorData = error.response.data;

                const messages = Object.values(errorData)
                    .flat()
                    .join(' ');

                setError(messages || 'Unable to update profile.');

            }
            else {

                setError('Something went wrong. Please try again.');

            }

        }
        finally {
            setSaving(false);
        }

    };

    if (loading) {
        return <div className="container py-5">Loading profile...</div>;
    }

    if (error && !profile.id) {
        return <div className="container py-5 alert alert-danger">{error}</div>;
    }

    return (

        <div className="min-vh-100">

            {/* Header */}
            <nav className="navbar bg-white shadow-sm">

                <div className="container">

                    <Link to="/donor/dashboard" className="navbar-brand text-danger fw-bold">
                        <i className="bi bi-droplet-fill me-2"></i>
                        BloodConnect
                    </Link>

                    <Link to="/donor/dashboard" className="btn btn-outline-danger">
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                    </Link>

                </div>

            </nav>

            <div className="container py-5">

                {/* Page Heading */}
                <div className="d-flex justify-content-between align-items-center mb-4">

                    <h2 className="fw-bold mb-0">
                        <i className="bi bi-person-circle text-danger me-2"></i>
                        My Profile
                    </h2>

                    {!isEditing && (

                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                setFormData(profile);
                                setIsEditing(true);
                                setError('');
                                setSuccess('');
                            }}
                        >
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit Profile
                        </button>

                    )}

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

                {/* Edit Profile Form */}
                {isEditing && (

                    <div className="dashboard-card mb-4">

                        <h5 className="fw-bold text-danger mb-4">
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit Profile Information
                        </h5>

                        <form onSubmit={handleSubmit}>

                            <div className="row g-3">

                                {/* Full Name */}
                                <div className="col-md-6">

                                    <label className="form-label">Full Name</label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        className="form-control"
                                        value={formData.full_name || ''}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Date of Birth */}
                                <div className="col-md-6">

                                    <label className="form-label">Date of Birth</label>

                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        className="form-control"
                                        value={formData.date_of_birth || ''}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Gender */}
                                <div className="col-md-6">

                                    <label className="form-label">Gender</label>

                                    <select
                                        name="gender"
                                        className="form-select"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>

                                </div>

                                {/* Blood Group */}
                                <div className="col-md-6">

                                    <label className="form-label">Blood Group</label>

                                    <select
                                        name="blood_group"
                                        className="form-select"
                                        value={formData.blood_group || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Blood Group</option>
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

                                {/* District */}
                                <div className="col-md-6">

                                    <label className="form-label">District</label>

                                    <select
                                        name="district"
                                        className="form-select"
                                        value={formData.district || ''}
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

                                {/* Weight */}
                                <div className="col-md-6">

                                    <label className="form-label">Weight (kg)</label>

                                    <input
                                        type="number"
                                        name="weight"
                                        className="form-control"
                                        value={formData.weight ?? ''}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />

                                </div>

                                {/* Address */}
                                <div className="col-12">

                                    <label className="form-label">Address</label>

                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows="3"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Availability Status */}
                                <div className="col-12">

                                    <div className="form-check form-switch">

                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="availability"
                                            name="availability_status"
                                            checked={Boolean(formData.availability_status)}
                                            onChange={handleChange}
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="availability"
                                        >
                                            Available for blood donation
                                        </label>

                                    </div>

                                </div>

                            </div>

                            {/* Form Buttons */}
                            <div className="mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-danger me-2"
                                    disabled={saving}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                )}

                {/* Personal Information */}
                {!isEditing && (

                    <>

                        <div className="dashboard-card mb-4">

                            <h5 className="fw-bold text-danger mb-4">
                                Personal Information
                            </h5>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="text-muted">Full Name</label>
                                    <p className="fw-semibold">{profile.full_name}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Username</label>
                                    <p className="fw-semibold">{user.username}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Email</label>
                                    <p className="fw-semibold">{user.email}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Phone</label>
                                    <p className="fw-semibold">{user.phone || 'Not provided'}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Date of Birth</label>
                                    <p className="fw-semibold">{profile.date_of_birth}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Gender</label>
                                    <p className="fw-semibold">{profile.gender}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">District</label>
                                    <p className="fw-semibold">
                                        {getDistrictName(profile.district)}
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Address</label>
                                    <p className="fw-semibold">{profile.address}</p>
                                </div>

                            </div>

                        </div>

                        {/* Donation Information */}
                        <div className="dashboard-card mb-4">

                            <h5 className="fw-bold text-danger mb-4">
                                Donation Information
                            </h5>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="text-muted">Blood Group</label>
                                    <p className="fw-semibold">{profile.blood_group}</p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Weight</label>
                                    <p className="fw-semibold">
                                        {profile.weight ?? 'Not provided'} kg
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Last Donation Date</label>
                                    <p className="fw-semibold">
                                        {profile.last_donation_date || 'No previous donation'}
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">Availability Status</label>
                                    <p className="fw-semibold">
                                        {profile.availability_status ? 'Available' : 'Unavailable'}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </>

                )}

                {/* Donation Eligibility - Always Read Only */}
                <div className="dashboard-card">

                    <h5 className="fw-bold text-danger mb-4">
                        Donation Eligibility
                    </h5>

                    <div className="row g-3">

                        <div className="col-md-6">

                            <label className="text-muted">Age Eligible</label>

                            <p className={profile.is_age_eligible ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {profile.is_age_eligible ? 'Eligible' : 'Not Eligible'}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <label className="text-muted">Weight Eligible</label>

                            <p className={profile.is_weight_eligible ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {profile.is_weight_eligible ? 'Eligible' : 'Not Eligible'}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <label className="text-muted">Eligible to Donate</label>

                            <p className={profile.is_eligible_to_donate ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {profile.is_eligible_to_donate ? 'Yes' : 'No'}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <label className="text-muted">Available for Donation</label>

                            <p className={profile.is_available_for_donation ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {profile.is_available_for_donation ? 'Available' : 'Not Available'}
                            </p>

                        </div>

                        <div className="col-md-6">

                            <label className="text-muted">Next Eligible Date</label>

                            <p className="fw-semibold">
                                {profile.next_eligible_date || 'Not applicable'}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DonorProfile;