import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function AboutUs() {

    return (
        <>
            <Navbar />

            <div className="bg-white">

                {/* Hero Section */}
                <section className="bg-light py-5">

                    <div className="container py-4">

                        <div className="row align-items-center">

                            {/* Left Content */}
                            <div className="col-lg-6 mb-4 mb-lg-0">

                                <span className="badge bg-danger-subtle text-danger px-3 py-2 mb-3">
                                    About BloodConnect
                                </span>

                                <h1 className="display-5 fw-bold mb-3">
                                    Connecting Donors.
                                    <span className="text-danger">
                                        {' '}Saving Lives.
                                    </span>
                                </h1>

                                <p className="lead text-secondary mb-4">
                                    BloodConnect is a platform designed to connect
                                    blood donors, patients, and blood banks,
                                    making the process of finding and donating
                                    blood easier, faster, and more efficient.
                                </p>

                                

                            </div>

                            {/* Right Illustration */}
                            <div className="col-lg-6 text-center">

                                <div className="position-relative d-inline-flex align-items-center justify-content-center">

                                    <div
                                        className="rounded-circle bg-danger-subtle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '280px',
                                            height: '280px'
                                        }}
                                    >

                                        <i
                                            className="bi bi-heart-pulse-fill text-danger"
                                            style={{ fontSize: '100px' }}
                                        ></i>

                                    </div>

                                    <div
                                        className="position-absolute bg-white rounded-circle shadow d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            top: '10px',
                                            right: '10px'
                                        }}
                                    >

                                        <i className="bi bi-droplet-fill text-danger fs-1"></i>

                                    </div>

                                    <div
                                        className="position-absolute bg-white rounded-circle shadow d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            bottom: '10px',
                                            left: '10px'
                                        }}
                                    >

                                        <i className="bi bi-hospital text-danger fs-1"></i>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* Mission Section */}
                <section className="container py-5">

                    <div className="row justify-content-center text-center">

                        <div className="col-lg-9">

                            <div className="mb-3">

                                <i className="bi bi-bullseye text-danger fs-1"></i>

                            </div>

                            <h2 className="fw-bold mb-3">
                                Our <span className="text-danger">Mission</span>
                            </h2>

                            <p className="text-secondary fs-5">

                                Our mission is to simplify blood donation and
                                blood request management by creating a centralized
                                platform that brings donors, patients, and blood
                                banks together.

                                We aim to improve coordination, increase
                                accessibility to blood resources, and encourage
                                voluntary blood donation through technology.

                            </p>

                        </div>

                    </div>

                </section>


                {/* How BloodConnect Works */}
                <section className="bg-light py-5">

                    <div className="container">

                        <div className="text-center mb-5">

                            <h2 className="fw-bold">
                                How <span className="text-danger">BloodConnect</span> Works
                            </h2>

                            <p className="text-secondary">
                                Connecting three important parts of the blood donation ecosystem.
                            </p>

                        </div>

                        <div className="row g-4">

                            {/* Donors */}
                            <div className="col-md-4">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body text-center p-4">

                                        <div
                                            className="bg-danger-subtle text-danger rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: '75px',
                                                height: '75px'
                                            }}
                                        >

                                            <i className="bi bi-person-heart fs-1"></i>

                                        </div>

                                        <h4 className="fw-bold">
                                            Blood Donors
                                        </h4>

                                        <p className="text-secondary">

                                            Individuals can register as donors,
                                            complete verification, receive donation
                                            invitations, and participate in donation camps.

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Blood Banks */}
                            <div className="col-md-4">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body text-center p-4">

                                        <div
                                            className="bg-danger-subtle text-danger rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: '75px',
                                                height: '75px'
                                            }}
                                        >

                                            <i className="bi bi-hospital fs-1"></i>

                                        </div>

                                        <h4 className="fw-bold">
                                            Blood Banks
                                        </h4>

                                        <p className="text-secondary">

                                            Blood banks can manage donor verification,
                                            blood inventory, donation invitations,
                                            blood requests, and blood allocations.

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Requesters */}
                            <div className="col-md-4">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body text-center p-4">

                                        <div
                                            className="bg-danger-subtle text-danger rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: '75px',
                                                height: '75px'
                                            }}
                                        >

                                            <i className="bi bi-person-plus-fill fs-1"></i>

                                        </div>

                                        <h4 className="fw-bold">
                                            Patients & Requesters
                                        </h4>

                                        <p className="text-secondary">

                                            Patients and requesters can submit blood
                                            requests, find registered blood banks,
                                            and track their request status.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* Why BloodConnect */}
                <section className="container py-5">

                    <div className="text-center mb-5">

                        <h2 className="fw-bold">
                            Why <span className="text-danger">BloodConnect?</span>
                        </h2>

                        <p className="text-secondary">
                            Technology bringing people together for a life-saving cause.
                        </p>

                    </div>

                    <div className="row g-4">

                        {/* Easy Access */}
                        <div className="col-md-6 col-lg-3">

                            <div className="card border h-100">

                                <div className="card-body p-4">

                                    <i className="bi bi-search text-danger fs-1"></i>

                                    <h5 className="fw-bold mt-3">
                                        Easy Access
                                    </h5>

                                    <p className="text-secondary mb-0">

                                        Find registered blood banks and connect
                                        with the blood donation network.

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Coordination */}
                        <div className="col-md-6 col-lg-3">

                            <div className="card border h-100">

                                <div className="card-body p-4">

                                    <i className="bi bi-arrow-left-right text-danger fs-1"></i>

                                    <h5 className="fw-bold mt-3">
                                        Efficient Coordination
                                    </h5>

                                    <p className="text-secondary mb-0">

                                        Simplify communication between donors,
                                        requesters, and blood banks.

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Verification */}
                        <div className="col-md-6 col-lg-3">

                            <div className="card border h-100">

                                <div className="card-body p-4">

                                    <i className="bi bi-shield-check text-danger fs-1"></i>

                                    <h5 className="fw-bold mt-3">
                                        Verified Donors
                                    </h5>

                                    <p className="text-secondary mb-0">

                                        Support a reliable donation network
                                        through donor verification.

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Inventory */}
                        <div className="col-md-6 col-lg-3">

                            <div className="card border h-100">

                                <div className="card-body p-4">

                                    <i className="bi bi-box-seam text-danger fs-1"></i>

                                    <h5 className="fw-bold mt-3">
                                        Inventory Management
                                    </h5>

                                    <p className="text-secondary mb-0">

                                        Help blood banks manage blood stock
                                        and available resources efficiently.

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* Vision Section */}
                <section className="bg-danger text-white py-5">

                    <div className="container">

                        <div className="row justify-content-center text-center">

                            <div className="col-lg-9">

                                <i className="bi bi-heart-fill fs-1 mb-3"></i>

                                <h2 className="fw-bold mb-3">
                                    Our Vision
                                </h2>

                                <p className="fs-5">

                                    A world where no patient has to struggle
                                    to find blood when they need it most.

                                    We envision a connected community where
                                    voluntary donors, patients, and blood banks
                                    work together to make blood donation more
                                    accessible and efficient.

                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* Call To Action */}
                <section className="container py-5">

                    <div className="bg-light rounded-4 p-5 text-center border">

                        <i className="bi bi-droplet-fill text-danger fs-1"></i>

                        <h2 className="fw-bold mt-3">
                            Every Drop Matters
                        </h2>

                        <p className="text-secondary fs-5">

                            Your willingness to donate blood can make
                            a difference in someone's life.

                        </p>

                        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">

                            <Link
                                to="/register"
                                className="btn btn-danger btn-lg"
                            >

                                <i className="bi bi-heart-fill me-2"></i>

                                Join BloodConnect

                            </Link>

                            <Link
                                to="/"
                                className="btn btn-outline-danger btn-lg"
                            >
                                Go to Home
                            </Link>

                        </div>

                    </div>

                </section>

            </div>

        </>

    );

}


export default AboutUs;