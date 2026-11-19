import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { PublicAPI } from '../../services/api';

function Register() {

    const navigate = useNavigate();

    const [districts, setDistricts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirm_password: '',
        role: 'DONOR',

        date_of_birth: '',
        gender: '',
        blood_group: '',
        weight: '',

        district: '',
        address: '',

        blood_bank_name: '',
        registration_number: '',
        contact_person: ''
    });

    // Fetch districts from backend
    useEffect(() => {

        const fetchDistricts = async () => {
            try {
                const response = await PublicAPI.get('locations/districts/');
                setDistricts(response.data); 
            }
            catch (error) {
                console.log('Error fetching districts:', error);
                setError('Unable to load districts.');
            }
        };

        fetchDistricts();

    }, []);

    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError('');
        setSuccess('');
    };
    const formatName = (value) => {
        return value
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
        };
    // Handle registration
    const handleRegister = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        // Check password confirmation
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return;
        }

        // Prepare common registration data
        const registrationData = {
            username: formData.username,
            email: formData.email,
            first_name: formatName(formData.first_name),
            last_name: formatName(formData.last_name),
            phone: formData.phone,
            password: formData.password,
            role: formData.role
        };

        // Add role-specific fields
        if (formData.role === 'DONOR') {

            Object.assign(registrationData, {
                full_name: `${formatName(formData.first_name)} ${formatName(formData.last_name)}`,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                blood_group: formData.blood_group,
                weight: formData.weight,
                district: formData.district,
                address: formData.address
            });

        }
        else if (formData.role === 'REQUESTER') {

            Object.assign(registrationData, {
                full_name: `${formatName(formData.first_name)} ${formatName(formData.last_name)}`,
                district: formData.district,
                address: formData.address
            });

        }
        else if (formData.role === 'BLOOD_BANK') {

            Object.assign(registrationData, {
                blood_bank_name: formatName(formData.blood_bank_name),
                registration_number: formData.registration_number,
                contact_person: formatName(formData.contact_person),
                district: formData.district,
                address: formData.address
            });

        }

        try {

            const response = await PublicAPI.post(
                'accounts/register/',
                registrationData
            );

            setSuccess('Registration successful! Please login.');

            alert('Registration successful!');

            navigate('/login');

        }
        catch (error) {

            const errorData = error.response?.data;

            if (errorData) {

                const errorMessages = Object.values(errorData)
                    .flat()
                    .join(' ');

                setError(errorMessages);

            }
            else {
                setError('Registration failed. Please try again.');
            }

        }
    };

    return (

        <div className="container mt-5 mb-5">

            <div className="row justify-content-center">

                <div className="col-md-8 col-lg-7">

                    <div className="dashboard-card">

                        {/* Heading */}
                        <div className="text-center mb-4">

                            <i className="bi bi-droplet-fill text-danger fs-1"></i>

                            <h3 className="text-danger fw-bold mt-2">
                                BloodConnect
                            </h3>

                            <p className="text-secondary">
                                Create your account
                            </p>

                        </div>

                        <form onSubmit={handleRegister}>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            {/* Role Selection */}
                            <div className="mb-4">

                                <label className="form-label fw-semibold">
                                    Register As
                                </label>

                                <select
                                    name="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="DONOR">Donor</option>
                                    <option value="REQUESTER">Requester</option>
                                    <option value="BLOOD_BANK">Blood Bank</option>
                                </select>

                            </div>

                            <h5 className="text-danger mb-3">
                                Account Information
                            </h5>

                            <div className="row">

                                {/* Username */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Email */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        required
                                    />

                                </div>

                                {/* First Name */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Last Name */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Phone */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter 10-digit mobile number"
                                        pattern="[6-9][0-9]{9}"
                                        maxLength="10"
                                        inputMode="numeric"
                                    
                                    />

                                </div>

                                {/* Password */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* Confirm Password */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirm_password"
                                        className="form-control"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>

                            {/* Donor Fields */}
                            {formData.role === 'DONOR' && (

                                <>

                                    <hr />

                                    <h5 className="text-danger mb-3">
                                        Donor Information
                                    </h5>

                                    <div className="row">

                                        {/* Date of Birth */}
                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Date of Birth
                                            </label>

                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                className="form-control"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                        {/* Gender */}
                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Gender
                                            </label>

                                            <select
                                                name="gender"
                                                className="form-select"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Gender
                                                </option>

                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>

                                            </select>

                                        </div>

                                        {/* Blood Group */}
                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Blood Group
                                            </label>

                                            <select
                                                name="blood_group"
                                                className="form-select"
                                                value={formData.blood_group}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Blood Group
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

                                        {/* Weight */}
                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Weight (kg)
                                            </label>

                                            <input
                                                type="number"
                                                name="weight"
                                                className="form-control"
                                                min="45"
                                                step="0.01"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                    </div>

                                </>

                            )}

                            {/* Blood Bank Fields */}
                            {formData.role === 'BLOOD_BANK' && (

                                <>

                                    <hr />

                                    <h5 className="text-danger mb-3">
                                        Blood Bank Information
                                    </h5>

                                    <div className="row">

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Blood Bank Name
                                            </label>

                                            <input
                                                type="text"
                                                name="blood_bank_name"
                                                className="form-control"
                                                value={formData.blood_bank_name}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label">
                                                Registration Number
                                            </label>

                                            <input
                                                type="text"
                                                name="registration_number"
                                                className="form-control"
                                                value={formData.registration_number}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                        <div className="col-md-12 mb-3">

                                            <label className="form-label">
                                                Contact Person
                                            </label>

                                            <input
                                                type="text"
                                                name="contact_person"
                                                className="form-control"
                                                value={formData.contact_person}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                    </div>

                                </>

                            )}

                            {/* Common Profile Fields */}
                            <hr />

                            <h5 className="text-danger mb-3">
                                {formData.role === 'BLOOD_BANK'
                                    ? 'Blood Bank Address'
                                    : 'Address Information'}
                            </h5>

                            <div className="mb-3">

                                <label className="form-label">
                                    District
                                </label>

                                <select
                                    name="district"
                                    className="form-select"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select District
                                    </option>

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

                            <div className="mb-3">

                                <label className="form-label">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    className="form-control"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                className="btn btn-danger w-100 mt-3"
                            >
                                <i className="bi bi-person-plus-fill me-2"></i>
                                Register
                            </button>

                        </form>

                        <div className="text-center mt-4">

                            <p>
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-danger fw-bold"
                                >
                                    Login
                                </Link>
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Register;