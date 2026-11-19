import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Home() {

    return (
        <>
            <Navbar />

            {/* Hero Section */}

            <div className="container mt-5">

                <div className="row align-items-center">

                    <div className="col-md-7">

                        <h1 className="fw-bold display-5">
                            Donate Blood,
                            <span className="text-danger"> Save Lives!</span>
                        </h1>

                        <p className="text-secondary mt-3 fs-5">
                            BloodConnect connects blood donors, patients,
                            hospitals and blood banks through a simple
                            and reliable blood donation platform.
                        </p>

                        <div className="mt-4 d-flex flex-wrap gap-2">

                            <Link to="/register" className="btn btn-danger">
                                <i className="bi bi-heart-fill"></i> Become a Donor
                            </Link>

                            <Link to="/register" className="btn btn-danger">
                                <i className="bi bi-search"></i> Request Blood
                            </Link>

                            <Link to="/register" className="btn btn-danger">
                                <i className="bi bi-hospital-fill"></i> Blood Bank Registration
                            </Link>

                        </div>

                    </div>

                    <div className="col-md-5 text-center mt-4 mt-md-0">

                        <i
                            className="bi bi-droplet-fill text-danger"
                            style={{ fontSize: '180px' }}
                        ></i>

                        <h4 className="text-danger fw-bold mt-2">
                            Every Drop Counts!
                        </h4>

                    </div>

                </div>

            </div>


            {/* Features Section */}

            <div className="container mt-5 mb-5">

                <h2 className="text-center fw-bold">
                    How <span className="text-danger">BloodConnect</span> Works
                </h2>

                <p className="text-center text-secondary mt-2">
                    Connecting people to make blood donation easier.
                </p>

                <div className="row mt-4">

                    {/* Donor Card */}

                    <div className="col-md-4 mb-3">

                        <div className="dashboard-card text-center h-100">

                            <i className="bi bi-person-heart card-icon"></i>

                            <h5 className="mt-3 fw-bold">Become a Donor</h5>

                            <p className="text-secondary">
                                Register as a blood donor and help save
                                lives through blood donation.
                            </p>

                        </div>

                    </div>


                    {/* Requester Card */}

                    <div className="col-md-4 mb-3">

                        <div className="dashboard-card text-center h-100">

                            <i className="bi bi-droplet-fill card-icon"></i>

                            <h5 className="mt-3 fw-bold">Request Blood</h5>

                            <p className="text-secondary">
                                Find suitable blood donors and submit
                                blood requests when needed.
                            </p>

                        </div>

                    </div>


                    {/* Blood Bank Card */}

                    <div className="col-md-4 mb-3">

                        <div className="dashboard-card text-center h-100">

                            <i className="bi bi-hospital-fill card-icon"></i>

                            <h5 className="mt-3 fw-bold">Blood Banks</h5>

                            <p className="text-secondary">
                                Manage blood inventory and coordinate
                                blood donations efficiently.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </>
    );
}

export default Home;