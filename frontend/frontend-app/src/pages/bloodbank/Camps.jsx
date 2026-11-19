import { useEffect, useState } from 'react';
import API, { PublicAPI } from '../../services/api';

function Camps() {

    const [camps, setCamps] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        camp_name: '',
        description: '',
        location: '',
        district: '',
        camp_date: '',
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchCamps();
        fetchDistricts();
    }, []);

    // Fetch blood bank camps
    const fetchCamps = async () => {
        try {
            setLoading(true);

            const response = await API.get('camps/');
            setCamps(response.data.results || response.data);

        } catch (error) {
            setError('Unable to load donation camps.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch districts
    const fetchDistricts = async () => {
        try {
            const response = await PublicAPI.get('locations/districts/');
            setDistricts(response.data.results || response.data);
        } catch (error) {
            setError('Unable to load districts.');
        }
    };

    // Handle form input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            camp_name: '',
            description: '',
            location: '',
            district: '',
            camp_date: '',
            start_time: '',
            end_time: ''
        });

        setEditingId(null);
        setShowForm(false);
    };

    // Create or update camp
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        try {
            if (editingId) {

                await API.patch(`camps/${editingId}/`, formData);
                setSuccess('Donation camp updated successfully.');

            } else {

                await API.post('camps/', formData);
                setSuccess('Donation camp created successfully.');

            }

            resetForm();
            fetchCamps();

        } catch (error) {
            const errors = error.response?.data;

            setError(
                errors?.camp_date?.[0] ||
                errors?.end_time?.[0] ||
                errors?.district?.[0] ||
                errors?.detail ||
                'Unable to save donation camp.'
            );
        }
    };

    // Edit camp
    const editCamp = (camp) => {

        setEditingId(camp.id);

        setFormData({
            camp_name: camp.camp_name,
            description: camp.description,
            location: camp.location,
            district: camp.district,
            camp_date: camp.camp_date,
            start_time: camp.start_time,
            end_time: camp.end_time
        });

        setShowForm(true);
        setSelectedCamp(null);
    };

    // View camp registrations
    const viewRegistrations = async (camp) => {

        setError('');
        setSelectedCamp(camp);

        try {
            const response = await API.get(`camps/${camp.id}/registrations/`);

            setRegistrations(
                response.data.results || response.data
            );

        } catch (error) {
            setError('Unable to load camp registrations.');
            setRegistrations([]);
        }
    };

    // Mark donor attendance
    const markAttendance = async (registrationId) => {

        const confirmAttendance = window.confirm(
            'Are you sure you want to mark this donor as attended?'
        );

        if (!confirmAttendance) return;

        setError('');
        setSuccess('');

        try {
            const response = await API.post(
                `camps/registrations/${registrationId}/attendance/`
            );

            setSuccess(response.data.message);

            viewRegistrations(selectedCamp);

        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Unable to update attendance.'
            );
        }
    };

    // Cancel camp
    const cancelCamp = async (campId) => {

        const confirmCancel = window.confirm(
            'Are you sure you want to cancel this camp?'
        );

        if (!confirmCancel) return;

        setError('');
        setSuccess('');

        try {
            const response = await API.post(
                `camps/${campId}/cancel/`
            );

            setSuccess(response.data.message);

            setSelectedCamp(null);
            fetchCamps();

        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Unable to cancel camp.'
            );
        }
    };

    return (

        <div className="container mt-4 mb-5">

            {/* Page Heading */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <h3 className="text-danger">
                    <i className="bi bi-calendar-event me-2"></i>
                    Donation Camps
                </h3>

                <button
                    className="btn btn-blood"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                        setSelectedCamp(null);
                    }}
                >
                    <i className="bi bi-plus-circle me-1"></i>
                    Create Camp
                </button>

            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    ></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible">
                    {success}
                    <button
                        className="btn-close"
                        onClick={() => setSuccess('')}
                    ></button>
                </div>
            )}

            {/* Create / Edit Camp Form */}
            {showForm && (

                <div className="dashboard-card mb-4">

                    <h5 className="text-danger mb-3">
                        {editingId ? 'Edit Donation Camp' : 'Create Donation Camp'}
                    </h5>

                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Camp Name</label>

                                <input
                                    type="text"
                                    name="camp_name"
                                    className="form-control"
                                    value={formData.camp_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Location</label>

                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">District</label>

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

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Camp Date</label>

                                <input
                                    type="date"
                                    name="camp_date"
                                    className="form-control"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.camp_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Time</label>

                                <input
                                    type="time"
                                    name="start_time"
                                    className="form-control"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">End Time</label>

                                <input
                                    type="time"
                                    name="end_time"
                                    className="form-control"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12 mb-3">
                                <label className="form-label">Description</label>

                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                        </div>

                        <button type="submit" className="btn btn-blood me-2">
                            {editingId ? 'Update Camp' : 'Create Camp'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>

                    </form>

                </div>

            )}

            {/* Camps Table */}
            <div className="dashboard-card mb-4">

                <h5 className="mb-3">My Donation Camps</h5>

                {loading ? (

                    <p className="text-center">Loading camps...</p>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Camp Name</th>
                                    <th>District</th>
                                    <th>Camp Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {camps.length > 0 ? (

                                    camps.map((camp) => (

                                        <tr key={camp.id}>

                                            <td>{camp.camp_name}</td>

                                            <td>{camp.district_name}</td>

                                            <td>{camp.camp_date}</td>

                                            <td>
                                                {camp.start_time} - {camp.end_time}
                                            </td>

                                            <td>
                                                <span className={`badge ${
                                                    camp.status === 'UPCOMING'
                                                        ? 'bg-primary'
                                                        : camp.status === 'ONGOING'
                                                        ? 'bg-success'
                                                        : camp.status === 'COMPLETED'
                                                        ? 'bg-secondary'
                                                        : 'bg-danger'
                                                }`}>
                                                    {camp.status}
                                                </span>
                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1 mb-1"
                                                    onClick={() => viewRegistrations(camp)}
                                                >
                                                    <i className="bi bi-people me-1"></i>
                                                    Registrations
                                                </button>

                                                {camp.status === 'UPCOMING' && (

                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning me-1 mb-1"
                                                            onClick={() => editCamp(camp)}
                                                        >
                                                            <i className="bi bi-pencil me-1"></i>
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-danger mb-1"
                                                            onClick={() => cancelCamp(camp.id)}
                                                        >
                                                            <i className="bi bi-x-circle me-1"></i>
                                                            Cancel
                                                        </button>
                                                    </>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No donation camps found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* Camp Registrations */}
            {selectedCamp && (

                <div className="dashboard-card">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="text-danger">
                            Registrations - {selectedCamp.camp_name}
                        </h5>

                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setSelectedCamp(null)}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                    </div>

                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Donor Name</th>
                                    <th>Blood Group</th>
                                    <th>District</th>
                                    <th>Registration Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {registrations.length > 0 ? (

                                    registrations.map((registration) => (

                                        <tr key={registration.id}>

                                            <td>{registration.donor_name}</td>

                                            <td>
                                                <span className="badge bg-danger">
                                                    {registration.donor_blood_group}
                                                </span>
                                            </td>

                                            <td>{registration.donor_district}</td>

                                            <td>
                                                {new Date(
                                                    registration.registration_date
                                                ).toLocaleDateString()}
                                            </td>

                                            <td>
                                                <span className={`badge ${
                                                    registration.status === 'ATTENDED'
                                                        ? 'bg-success'
                                                        : registration.status === 'REGISTERED'
                                                        ? 'bg-primary'
                                                        : 'bg-secondary'
                                                }`}>
                                                    {registration.status}
                                                </span>
                                            </td>

                                            <td>

                                                {registration.status === 'REGISTERED' && (

                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => markAttendance(registration.id)}
                                                    >
                                                        <i className="bi bi-check-circle me-1"></i>
                                                        Mark Attended
                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No donors have registered for this camp.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Camps;