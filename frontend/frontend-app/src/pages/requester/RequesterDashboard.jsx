import { Link } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';

function RequesterDashboard() {

    const user = JSON.parse(localStorage.getItem('user'));

    const dashboardItems = [
        {
            title: 'My Profile',
            description: 'View and manage your requester profile.',
            icon: 'bi-person-circle',
            link: '/requester/profile'
        },
        {
            title: 'Create Blood Request',
            description: 'Submit a new blood request.',
            icon: 'bi-plus-circle',
            link: '/requester/create-request'
        },
        {
            title: 'Track Blood Requests',
            description: 'Check the status of your active blood requests.',
            icon: 'bi-activity',
            link: '/requester/requests'
        },
        {
            title: 'Request History',
            description: 'View your previous blood requests.',
            icon: 'bi-clock-history',
            link: '/requester/history'
        },
        {
            title: 'Notifications',
            description: 'View your latest notifications.',
            icon: 'bi-bell',
            link: '/requester/notifications'
        }
    ];

    return (
        <div>

            {/* Top Navigation Bar */}
            <nav className="navbar bg-white shadow-sm">
                <div className="container d-flex justify-content-between align-items-center">

                    <Link to="/requester/dashboard" className="navbar-brand text-danger fw-bold fs-3">
                        <i className="bi bi-droplet-fill me-2"></i>
                        BloodConnect
                    </Link>

                    <LogoutButton />

                </div>
            </nav>


            {/* Dashboard Content */}
            <div className="container py-5">

                {/* Welcome Section */}
                <div className="mb-4">

                    <h2 className="fw-bold">
                        Welcome, {user?.username || 'Requester'}!
                    </h2>

                    <p className="text-muted">
                        Manage your blood requests and help save lives.
                    </p>

                </div>


                {/* Dashboard Feature Cards */}
                <div className="row g-4">

                    {dashboardItems.map((item, index) => (

                        <div className="col-md-6 col-lg-4" key={index}>

                            <Link
                                to={item.link}
                                className="text-decoration-none text-dark"
                            >

                                <div className="dashboard-card h-100">

                                    <div className="card-icon">
                                        <i className={`bi ${item.icon}`}></i>
                                    </div>

                                    <h5 className="fw-bold mt-2">
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

export default RequesterDashboard;