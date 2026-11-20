import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AboutUs from './pages/AboutUs';
import Chatbot from "./components/Chatbot";



import ProtectedRoute from './components/ProtectedRoute';
// DONOR IMPORTS
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import VerificationStatus from './pages/donor/VerificationStatus';
import SubmitVerification from './pages/donor/SubmitVerification';
import DonationInvitations from './pages/donor/DonationInvitations';
import DonationHistory from './pages/donor/DonationHistory';
import BloodBanks from './pages/donor/BloodBanks';
import DonationCamps from './pages/donor/DonationCamps';
import Notifications from './pages/donor/Notifications';

//BLOOD BANK IMPORTS
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import BloodBankProfile from './pages/bloodbank/BloodBankProfile';
import DonorVerification from './pages/bloodbank/DonorVerification';
import BloodRequests from './pages/bloodbank/BloodRequests';
import DonorHistory from './pages/bloodbank/DonorManagement';
import BloodBankDonationManagement from './pages/bloodbank/BloodBankDonationManagement';
import BloodBankDonationHistory from './pages/bloodbank/BloodBankDonationHistory';
import BloodInventory from './pages/bloodbank/BloodInventory';
import Camps from './pages/bloodbank/Camps';
import BloodBankNotifications from './pages/bloodbank/BloodBankNotifications';

//REQUESTER IMPORTS
import RequesterDashboard from './pages/requester/RequesterDashboard';
import RequesterProfile from './pages/requester/RequesterProfile';
import CreateBloodRequest from './pages/requester/CreateBloodRequest';
import TrackBloodRequests from './pages/requester/TrackBloodRequests';
import RequestHistory from './pages/requester/RequestHistory';
import RequesterNotifications from './pages/requester/RequesterNotifications';

//ADMIN IMPORTS
// ADMIN IMPORTS
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import BloodBankManagement from './pages/admin/BloodBankManagement';
import AdminDonorVerification from './pages/admin/AdminDonorVerification';
import BloodRequestManagement from './pages/admin/BloodRequestManagement';
import AdminBloodInventory from './pages/admin/AdminBloodInventory';
import DonationMonitoring from './pages/admin/DonationMonitoring';
import CampManagement from './pages/admin/CampManagement';
import CampRegistrationMonitoring from './pages/admin/CampRegistrationMonitoring';
import AdminNotifications from './pages/admin/AdminNotifications';


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<AboutUs />} />


                {/* DONOR MODULE */}

                {/* Donor Dashboard */}
                <Route
                    path="/donor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                             <DonorDashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Donor myProfile */}
                <Route path="/donor/profile" element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                        <DonorProfile />
                    </ProtectedRoute>
                } />

                {/* Donor Verification Status */}
                <Route
                    path="/donor/verification"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <VerificationStatus />
                        </ProtectedRoute>
                    }
                />
                {/* Donor Verification Submission form */}
                <Route
                    path="/donor/verification/submit"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <SubmitVerification />
                        </ProtectedRoute>
                    }
                />
                {/* Donation invitations */}
                <Route
                    path="/donor/invitations"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <DonationInvitations />
                        </ProtectedRoute>
                    }
                />
                {/* Donation history */}
                <Route
                    path="/donor/donation-history"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <DonationHistory />
                        </ProtectedRoute>
                    }
                />
                {/* blood banks */}
                <Route
                    path="/donor/blood-banks"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <BloodBanks />
                        </ProtectedRoute>
                    }
                />
                {/* camps */}
                <Route
                    path="/donor/camps"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <DonationCamps />
                        </ProtectedRoute>
                    }
                />
                {/* notification */}
                <Route
                    path="/donor/notifications"
                    element={
                        <ProtectedRoute allowedRoles={['DONOR']}>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />




                {/* REQUESTER MODULE */}
                {/* Requester Dashboard */}
                <Route
                    path="/requester/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <RequesterDashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Requester profile */}
                <Route
                    path="/requester/profile"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <RequesterProfile />
                        </ProtectedRoute>
                    }
                />
                {/* Requester createblood request */}
                <Route
                    path="/requester/create-request"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <CreateBloodRequest />
                        </ProtectedRoute>
                    }
                />
                {/* Requester trackblood request */}
                <Route
                    path="/requester/requests"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <TrackBloodRequests />
                        </ProtectedRoute>
                    }
                />
                {/* Requester requesthistory tracking */}
                <Route
                    path="/requester/history"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <RequestHistory />
                        </ProtectedRoute>
                    }
                />
                {/* RequesterNotifications */}
                <Route
                    path="/requester/notifications"
                    element={
                        <ProtectedRoute allowedRoles={['REQUESTER']}>
                            <RequesterNotifications />
                        </ProtectedRoute>
                    }
                />










                {/* BLOOD BANK MODULE */}

                {/* Blood Bank Dashboard */}
                <Route
                    path="/bloodbank/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                            <BloodBankDashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Blood Bank Profile */}
                    <Route
                        path="/bloodbank/profile"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <BloodBankProfile />
                            </ProtectedRoute>
                        }
                    />
                    {/* Blood Bank donor verification */}
                    <Route path="/bloodbank/donor-verification" element={
                        <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                            <DonorVerification />
                        </ProtectedRoute>
                    } />
                    {/* Blood Bank bloodrequests */}
                    <Route path="/bloodbank/requests" element={
                        <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                            <BloodRequests />
                        </ProtectedRoute>
                    } />
                    {/* Blood Bank donormanagement */}
                    <Route path="/bloodbank/donors" element={
                        <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                            <DonorHistory />
                        </ProtectedRoute>
                    } />
                    {/* Blood Bank donation management */}
                    <Route
                        path="/bloodbank/donations"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <BloodBankDonationManagement />
                            </ProtectedRoute>
                        }
                    />

                    {/* Blood Bank donation history */}
                    <Route
                        path="/bloodbank/donation-history"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <BloodBankDonationHistory />
                            </ProtectedRoute>
                        }
                    />
                    {/* Blood Bank bloodinventory */}
                    <Route
                        path="/bloodbank/inventory"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <BloodInventory />
                            </ProtectedRoute>
                        }
                    />
                    {/* Blood Bank camps */}
                    <Route
                        path="/bloodbank/camps"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <Camps />
                            </ProtectedRoute>
                        }
                    />
                    {/* Blood Bank notifications */}
                    <Route
                        path="/bloodbank/notifications"
                        element={
                            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
                                <BloodBankNotifications />
                            </ProtectedRoute>
                        }
                    />









                {/* ADMIN MODULE */}
                {/* Admin Dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Admin manageusers */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <ManageUsers />
                        </ProtectedRoute>
                    }
                />
                {/* Admin bloodbanks */}
                <Route
                    path="/admin/blood-banks"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <BloodBankManagement />
                        </ProtectedRoute>
                    }
                />
                {/* Admin donorverification */}
                <Route
                    path="/admin/verifications"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDonorVerification />
                        </ProtectedRoute>
                    }
                />
                {/* Admin bloodrequest management */}
                <Route
                    path="/admin/blood-requests"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <BloodRequestManagement />
                        </ProtectedRoute>
                    }
                />
                {/* Admin bloodinventory */}
                <Route
                    path="/admin/inventory"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminBloodInventory />
                        </ProtectedRoute>
                    }
                />
                {/* Admin donation monitoring */}
                <Route
                    path="/admin/donations"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <DonationMonitoring />
                        </ProtectedRoute>
                    }
                />
                {/* Admin CampManagement  */}
                <Route
                    path="/admin/camps"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <CampManagement />
                        </ProtectedRoute>
                    }
                />
                {/* Admin CampRegistrationMonitoring  */}
                <Route
                    path="/admin/camp-registrations"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <CampRegistrationMonitoring />
                        </ProtectedRoute>
                    }
                />
                {/* Admin AdminNotifications  */}
                <Route
                    path="/admin/notifications"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminNotifications />
                        </ProtectedRoute>
                    }
                />


            </Routes>
            <Chatbot />
        </BrowserRouter>
    );
}

export default App;