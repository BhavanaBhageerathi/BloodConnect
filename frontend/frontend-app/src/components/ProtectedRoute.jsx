import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {

    const token = localStorage.getItem('access');
    const user = JSON.parse(localStorage.getItem('user'));

    // Check whether the user is logged in
    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    // Check whether the user has permission to access this page
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;