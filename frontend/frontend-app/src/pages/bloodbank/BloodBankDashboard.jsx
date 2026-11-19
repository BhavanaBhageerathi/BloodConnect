import { Link } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';


function BloodBankDashboard() {

    const user = JSON.parse(localStorage.getItem('user'));

    const dashboardItems = [
        {
            title: 'My Profile',
            description: 'View and manage your blood bank profile.',
            icon: 'bi-hospital',
            link: '/bloodbank/profile'
        },
        {
            title: 'Donor Verification',
            description: 'Review and manage donor verification applications.',
            icon: 'bi-patch-check',
            link: '/bloodbank/donor-verification'
        },
        {
            title: 'Blood Requests',
            description: 'View and process blood requests from patients.',
            icon: 'bi-clipboard2-pulse',
            link: '/bloodbank/requests'
        },
        {
            title: 'Donor Invitations',
            description: 'Manage donor requirements and invitations.',
            icon: 'bi-people',
            link: '/bloodbank/donors'
        },
        {
            title: 'Donation Management',
            description: 'Manage donor requirements and invitations.',
            icon: 'bi-people',
            link: '/bloodbank/donations'
        },
        {
            title: 'Donation History',
            description: 'Coordinate donations and manage donation records.',
            icon: 'bi-droplet-half',
            link: '/bloodbank/donation-history'
        },
        {
            title: 'Blood Inventory',
            description: 'Manage blood units, availability and expiry dates.',
            icon: 'bi-box-seam',
            link: '/bloodbank/inventory'
        },
        {
            title: 'Donation Camps',
            description: 'Organize and manage blood donation camps.',
            icon: 'bi-calendar-event',
            link: '/bloodbank/camps'
        },
        {
            title: 'Notifications',
            description: 'View your latest notifications and alerts.',
            icon: 'bi-bell',
            link: '/bloodbank/notifications'
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

                <div className="mb-4">

                    <h2 className="fw-bold">
                        Welcome, {user?.username}!
                    </h2>

                    <p className="text-muted">
                        Manage your blood bank activities and help save lives.
                    </p>

                </div>

                {/* Dashboard Cards */}
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

    );

}

export default BloodBankDashboard;