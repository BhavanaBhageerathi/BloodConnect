import { Link } from 'react-router-dom';
import LogoutButton from '../../components/LogoutButton';
import { useState, useEffect } from 'react';
import API from '../../services/api';

function DonorDashboard() {

    // Verification status
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loadingVerification, setLoadingVerification] = useState(true);
    const [verificationError, setVerificationError] = useState('');

    // Donor profile
    const [donorProfile, setDonorProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {

        // Fetch verification status
        const fetchVerificationStatus = async () => {
            try {
                const response = await API.get('verification/my-status/');
                setVerificationStatus(response.data);
            } catch (error) {
                setVerificationError('Unable to fetch verification status.');
                console.error(error);
            } finally {
                setLoadingVerification(false);
            }
        };

        // Fetch donor profile
        const fetchDonorProfile = async () => {
            try {
                const response = await API.get('accounts/me/');

                setDonorProfile(response.data.profile);

            } catch (error) {
                setProfileError('Unable to fetch donor profile.');
                console.error(error);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchVerificationStatus();
        fetchDonorProfile();

    }, []);

    const user = JSON.parse(localStorage.getItem('user'));

    // Format date
    const formatDate = (dateString) => {

        if (!dateString) {
            return '';
        }

        const [year, month, day] = dateString.split('-');

        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const dashboardItems = [
        {
            title: 'My Profile',
            description: 'View and manage your donor profile.',
            icon: 'bi-person-circle',
            link: '/donor/profile'
        },
        {
            title: 'Verification Status',
            description: 'Check your donor verification status.',
            icon: 'bi-patch-check',
            link: '/donor/verification'
        },
        {
            title: 'Donation Invitations',
            description: 'View blood donation invitations.',
            icon: 'bi-envelope-heart',
            link: '/donor/invitations'
        },
        {
            title: 'Donation History',
            description: 'View your previous donations.',
            icon: 'bi-clock-history',
            link: '/donor/donation-history'
        },
        {
            title: 'Blood Banks',
            description: 'Explore registered blood banks.',
            icon: 'bi-hospital',
            link: '/donor/blood-banks'
        },
        {
            title: 'Donation Camps',
            description: 'Explore upcoming donation camps.',
            icon: 'bi-calendar-event',
            link: '/donor/camps'
        },
        {
            title: 'Notifications',
            description: 'View your latest notifications.',
            icon: 'bi-bell',
            link: '/donor/notifications'
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
                        Manage your donor activities and save lives.
                    </p>

                </div>

                {/* Donor Status Boxes */}
                <div className="row g-3 mt-4">

                    {/* Donor Availability Status */}
                    {!loadingProfile && donorProfile && (

                        <div className="col-lg-4 col-md-6">

                            <div className={`alert ${
                                donorProfile.availability_status
                                    ? 'alert-success'
                                    : 'alert-secondary'
                            } h-100 mb-0`}>

                                <h5 className="mb-2">

                                    <i className={`bi ${
                                        donorProfile.availability_status
                                            ? 'bi-check-circle-fill'
                                            : 'bi-pause-circle-fill'
                                    } me-2`}></i>

                                    Donor Availability Status: {
                                        donorProfile.availability_status
                                            ? 'Available'
                                            : 'Unavailable'
                                    }

                                </h5>

                                <p className="mb-0">

                                    {donorProfile.availability_status
                                        ? 'You have marked yourself as available for donation.'
                                        : 'You have marked yourself as unavailable for donation.'
                                    }

                                </p>

                            </div>

                        </div>

                    )}

                    {/* Donation Cooldown Period */}
                    {!loadingProfile &&
                        donorProfile?.is_in_cooldown_period && (

                        <div className="col-lg-4 col-md-6">

                            <div className="alert alert-warning h-100 mb-0">

                                <h5 className="fw-bold mb-2">

                                    <i className="bi bi-clock-history me-2"></i>

                                    Donation Cooldown Period

                                </h5>

                                <p className="mb-2">
                                    Thank you for your previous blood donation!
                                    You are currently in your donation cooldown period.
                                </p>

                                <p className="mb-0">
                                    Your next eligible donation date is{' '}
                                    <strong>
                                        {formatDate(donorProfile.next_eligible_date)}
                                    </strong>.
                                </p>

                            </div>

                        </div>

                    )}

                    {/* Verification Status */}
                    <div className="col-lg-4 col-md-6">

                        {loadingVerification ? (

                            <div className="alert alert-light h-100 mb-0">

                                <div className="spinner-border spinner-border-sm me-2"></div>

                                Loading verification status...

                            </div>

                        ) : verificationError ? (

                            <div className="alert alert-danger h-100 mb-0">
                                {verificationError}
                            </div>

                        ) : !verificationStatus?.has_application ? (

                            <div className="alert alert-warning h-100 mb-0">

                                <h5>
                                    <i className="bi bi-exclamation-circle me-2"></i>
                                    Verification Required
                                </h5>

                                <p className="mb-0">
                                    You haven't submitted a donor verification application yet.
                                    Please submit an application to get verified.
                                </p>

                            </div>

                        ) : (

                            <div className={`alert ${
                                verificationStatus.status === 'APPROVED'
                                    ? 'alert-success'
                                    : verificationStatus.status === 'REJECTED'
                                    ? 'alert-danger'
                                    : 'alert-info'
                            } h-100 mb-0`}>

                                <h5>

                                    <i className="bi bi-shield-check me-2"></i>

                                    Verification Status: {verificationStatus.status}

                                </h5>

                                <p className="mb-1">
                                    <strong>Blood Bank:</strong> {verificationStatus.blood_bank}
                                </p>

                                {verificationStatus.remarks && (

                                    <p className="mb-1">
                                        <strong>Remarks:</strong> {verificationStatus.remarks}
                                    </p>

                                )}

                                {verificationStatus.status === 'PENDING' && (

                                    <p className="mb-0">
                                        Your application is awaiting review by the blood bank.
                                    </p>

                                )}

                                {verificationStatus.status === 'APPROVED' && (

                                    <p className="mb-0">
                                        Congratulations! Your donor verification has been approved.
                                    </p>

                                )}

                                {verificationStatus.status === 'MORE_INFO' && (

                                    <p className="mb-0">
                                        The blood bank requires additional information.
                                        Please check the remarks.
                                    </p>

                                )}

                                {verificationStatus.status === 'REJECTED' && (

                                    <p className="mb-0">
                                        Your verification application was rejected.
                                        Please review the remarks.
                                    </p>

                                )}

                            </div>

                        )}

                    </div>

                </div>

                {/* Profile Error */}
                {profileError && (

                    <div className="alert alert-danger">
                        {profileError}
                    </div>

                )}

                

                {/* Dashboard Cards */}
                <div className="row g-4">

                    {dashboardItems.map((item, index) => (

                        <div className="col-md-6 col-lg-4" key={index}>

                            {item.link ? (

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

                            ) : (

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

                            )}

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default DonorDashboard;