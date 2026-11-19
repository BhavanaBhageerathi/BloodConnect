import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function ManageUsers() {

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {

        try {

            const response = await API.get('admin/users/');

            setUsers(response.data);

        }
        catch (error) {

            console.error(error);

            setError('Unable to fetch users.');

        }
        finally {

            setLoading(false);

        }

    };


    // Activate or deactivate a user
    const handleStatusChange = async (user) => {

        const newStatus = !user.is_active;

        const action = newStatus ? 'activate' : 'deactivate';

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.username}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            const response = await API.patch(
                `admin/users/${user.id}/status/`,
                {
                    is_active: newStatus
                }
            );

            setUsers(prevUsers =>
                prevUsers.map(item =>
                    item.id === user.id
                        ? { ...item, is_active: response.data.is_active }
                        : item
                )
            );

            setSuccess(response.data.message);
            setError('');

        }
        catch (error) {

            console.error(error);

            setError(
                error.response?.data?.error ||
                'Unable to update user status.'
            );

            setSuccess('');

        }

    };


    // Search and filter users
    const filteredUsers = users.filter(user => {

        const searchValue = search.toLowerCase();

        const matchesSearch =
            user.username.toLowerCase().includes(searchValue) ||
            user.full_name.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue);

        const matchesRole =
            !roleFilter || user.role === roleFilter;

        const matchesStatus =
            !statusFilter ||
            user.is_active.toString() === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;

    });


    return (

        <div className="min-vh-100 bg-light">

            {/* Header */}

            <nav className="navbar bg-white shadow-sm">

                <div className="container">

                    <Link
                        to="/admin/dashboard"
                        className="navbar-brand text-danger fw-bold fs-4"
                    >

                        <i className="bi bi-droplet-fill me-2"></i>
                        BloodConnect

                    </Link>

                    <Link
                        to="/admin/dashboard"
                        className="btn btn-outline-danger"
                    >

                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard

                    </Link>

                </div>

            </nav>


            {/* Main Content */}

            <div className="container py-5">

                {/* Page Heading */}

                <div className="mb-4">

                    <h2 className="fw-bold">
                        Manage Users
                    </h2>

                    <p className="text-muted">
                        View and manage all registered BloodConnect users.
                    </p>

                </div>


                {/* Success Message */}

                {success && (

                    <div className="alert alert-success alert-dismissible fade show">

                        <i className="bi bi-check-circle me-2"></i>
                        {success}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccess('')}
                        ></button>

                    </div>

                )}


                {/* Error Message */}

                {error && (

                    <div className="alert alert-danger alert-dismissible fade show">

                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError('')}
                        ></button>

                    </div>

                )}


                {/* Search and Filters */}

                <div className="dashboard-card mb-4">

                    <div className="row g-3">

                        {/* Search */}

                        <div className="col-md-4">

                            <label className="form-label fw-semibold">
                                Search Users
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search username, name or email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>


                        {/* Role Filter */}

                        <div className="col-md-4">

                            <label className="form-label fw-semibold">
                                Filter by Role
                            </label>

                            <select
                                className="form-select"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >

                                <option value="">All Roles</option>
                                <option value="DONOR">Donor</option>
                                <option value="REQUESTER">Requester</option>
                                <option value="BLOOD_BANK">Blood Bank</option>
                                <option value="ADMIN">Admin</option>

                            </select>

                        </div>


                        {/* Status Filter */}

                        <div className="col-md-4">

                            <label className="form-label fw-semibold">
                                Filter by Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >

                                <option value="">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* Users Table */}

                <div className="dashboard-card">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h5 className="fw-bold mb-0">
                            Registered Users
                        </h5>

                        <span className="badge bg-danger">
                            {filteredUsers.length} Users
                        </span>

                    </div>


                    {loading ? (

                        <div className="text-center py-5">

                            <div className="spinner-border text-danger"></div>

                            <p className="mt-2">
                                Loading users...
                            </p>

                        </div>

                    ) : error && users.length === 0 ? (

                        <div className="text-center py-4 text-muted">
                            Unable to load users.
                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className="text-center py-5">

                            <i className="bi bi-people fs-1 text-muted"></i>

                            <p className="text-muted mt-2 mb-0">
                                No users found.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-light">

                                    <tr>

                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredUsers.map(user => (

                                        <tr key={user.id}>

                                            <td>{user.id}</td>

                                            <td className="fw-semibold">
                                                {user.full_name}
                                            </td>

                                            <td>{user.username}</td>

                                            <td>{user.email || '-'}</td>

                                            <td>{user.phone || '-'}</td>

                                            <td>

                                                <span className="badge bg-primary">
                                                    {user.role}
                                                </span>

                                            </td>

                                            <td>

                                                <span className={`badge ${
                                                    user.is_active
                                                        ? 'bg-success'
                                                        : 'bg-secondary'
                                                }`}>

                                                    {user.is_active ? 'Active' : 'Inactive'}

                                                </span>

                                            </td>

                                            <td>

                                                {user.id === currentUser.id ? (

                                                    <span className="text-muted small">
                                                        Current Account
                                                    </span>

                                                ) : (

                                                    <button
                                                        className={`btn btn-sm ${
                                                            user.is_active
                                                                ? 'btn-outline-danger'
                                                                : 'btn-outline-success'
                                                        }`}
                                                        onClick={() => handleStatusChange(user)}
                                                    >

                                                        {user.is_active
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                        }

                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default ManageUsers;