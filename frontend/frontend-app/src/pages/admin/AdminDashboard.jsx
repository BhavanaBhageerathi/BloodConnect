import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../../services/api';
import LogoutButton from '../../components/LogoutButton';

function AdminDashboard() {

    const user = JSON.parse(localStorage.getItem('user'));

    const [dashboard, setDashboard] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch dashboard statistics
    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const response = await API.get('admin/dashboard/');

                setDashboard(response.data);

            }
            catch (error) {

                setError('Unable to load dashboard statistics.');

                console.error(error);

            }
            finally {

                setLoading(false);

            }

        };

        fetchDashboard();

    }, []);


    // Non-clickable statistics
    const statistics = [
        {
            title: 'Total Users',
            value: dashboard.total_users,
            icon: 'bi-people-fill'
        },
        {
            title: 'Total Donors',
            value: dashboard.total_donors,
            icon: 'bi-person-heart'
        },
        {
            title: 'Total Requesters',
            value: dashboard.total_requesters,
            icon: 'bi-person-fill'
        },
        {
            title: 'Total Blood Banks',
            value: dashboard.total_blood_banks,
            icon: 'bi-hospital'
        },
        {
            title: 'Pending Blood Banks',
            value: dashboard.pending_blood_banks,
            icon: 'bi-hourglass-split'
        },
        {
            title: 'Pending Verifications',
            value: dashboard.pending_verifications,
            icon: 'bi-shield-check'
        },
        {
            title: 'Total Blood Requests',
            value: dashboard.total_blood_requests,
            icon: 'bi-droplet-fill'
        },
        {
            title: 'Completed Requests',
            value: dashboard.completed_blood_requests,
            icon: 'bi-check-circle-fill'
        },
        {
            title: 'Total Donations',
            value: dashboard.total_donations,
            icon: 'bi-heart-pulse-fill'
        },
        {
            title: 'Available Blood Units',
            value: dashboard.available_blood_units,
            icon: 'bi-droplet'
        },
        {
            title: 'Total Camps',
            value: dashboard.total_camps,
            icon: 'bi-calendar-event'
        },
        {
            title: 'Active Users',
            value: dashboard.active_users,
            icon: 'bi-person-check-fill'
        }
    ];


    // Clickable Admin dashboard options
    const dashboardItems = [
        {
            title: 'Manage Users',
            description: 'View, activate and deactivate user accounts.',
            icon: 'bi-people-fill',
            link: '/admin/users'
        },
        {
            title: 'Blood Bank Management',
            description: 'Review and approve registered blood banks.',
            icon: 'bi-hospital',
            link: '/admin/blood-banks'
        },
        {
            title: 'Donor Verifications',
            description: 'Monitor donor verification applications.',
            icon: 'bi-patch-check',
            link: '/admin/verifications'
        },
        {
            title: 'Blood Requests',
            description: 'View and monitor all blood requests.',
            icon: 'bi-droplet-fill',
            link: '/admin/blood-requests'
        },
        {
            title: 'Blood Inventory',
            description: 'Monitor blood inventory across the system.',
            icon: 'bi-box-seam',
            link: '/admin/inventory'
        },
        {
            title: 'Donation Records',
            description: 'View donation records across blood banks.',
            icon: 'bi-clock-history',
            link: '/admin/donations'
        },
        {
            title: 'Donation Camps',
            description: 'View and monitor registered donation camps.',
            icon: 'bi-calendar-event',
            link: '/admin/camps'
        },
        {
            title: 'Camp Registrations',
            description: 'View donor registrations for donation camps.',
            icon: 'bi-person-check-fill',
            link: '/admin/camp-registrations'
        },
        {
            title: 'Notifications',
            description: 'View system notifications.',
            icon: 'bi-bell',
            link: '/admin/notifications'
        }
    ];


    return (

        <div className="min-vh-100">

            {/* Header */}

            <nav className="navbar bg-white shadow-sm">

                <div className="container">

                    <Link to="/" className="navbar-brand text-danger fw-bold fs-4">

                        <i className="bi bi-droplet-fill me-2"></i>

                        BloodConnect

                    </Link>

                    <LogoutButton />

                </div>

            </nav>


            {/* Dashboard */}

            <div className="container py-5">

                {/* Welcome Section */}

                <div className="mb-4">

                    <h2 className="fw-bold">

                        Welcome, {user?.username}!

                    </h2>

                    <p className="text-muted">

                        Manage BloodConnect activities and monitor the platform.

                    </p>

                </div>


                {/* Statistics Section */}

                <div className="mb-4">

                    <h5 className="fw-bold mb-3">

                        Platform Overview

                    </h5>

                    <div className="dashboard-card">

                        {loading ? (

                            <div className="text-center py-4">

                                <div className="spinner-border text-danger"></div>

                                <p className="mt-2 mb-0">

                                    Loading dashboard statistics...

                                </p>

                            </div>

                        ) : error ? (

                            <div className="alert alert-danger mb-0">

                                {error}

                            </div>

                        ) : (

                            <div className="row g-4">

                                {statistics.map((item, index) => (

                                    <div className="col-md-6 col-lg-4" key={index}>

                                        <div className="d-flex align-items-center">

                                            <i className={`bi ${item.icon} card-icon me-3`}></i>

                                            <div>

                                                <h5 className="fw-bold mb-1">

                                                    {item.value ?? 0}

                                                </h5>

                                                <p className="text-muted mb-0">

                                                    {item.title}

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>


                {/* Admin Management Cards */}

                <div className="mt-5">

                    <h5 className="fw-bold mb-3">

                        Administration

                    </h5>

                    <div className="row g-4">

                        {dashboardItems.map((item, index) => (

                            <div className="col-md-6 col-lg-4" key={index}>

                                <Link

                                    to={item.link}

                                    className="text-decoration-none text-dark"

                                >

                                    <div className="dashboard-card h-100">

                                        <div className="mb-3">

                                            <i className={`bi ${item.icon} card-icon`}></i>

                                        </div>

                                        <h5 className="fw-bold">

                                            {item.title}

                                        </h5>

                                        <p className="text-muted mb-0">

                                            {item.description}

                                        </p>

                                    </div>

                                </Link>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AdminDashboard;