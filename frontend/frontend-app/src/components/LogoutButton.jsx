import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function LogoutButton() {

    const navigate = useNavigate();

    const handleLogout = async () => {

        const refresh = localStorage.getItem('refresh');

        try {
            await API.post('accounts/logout/', {
                refresh: refresh
            });
        }
        catch (error) {
            console.log('Logout API error:', error);
        }
        finally {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');

            alert('Logged out successfully!');

            window.location.href = '/login'; 
            // causes a refresh which is a fix for our chatbot
        }
    };

    return (
        <button className="btn btn-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
        </button>
    );
}

export default LogoutButton;