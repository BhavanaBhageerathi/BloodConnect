import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicAPI } from '../../services/api';

function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await PublicAPI.post('accounts/login/', {
                username,
                password
            });

            // Store JWT tokens
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);

            // Store user details
            localStorage.setItem('user', JSON.stringify(response.data.user));

            const role = response.data.user.role;
            
            alert('Login successful!');

            if (role === 'DONOR') {
                navigate('/donor/dashboard');
            }
            else if (role === 'REQUESTER') {
                navigate('/requester/dashboard');
            }
            else if (role === 'BLOOD_BANK') {
                navigate('/bloodbank/dashboard');
            }
            else if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            }

            // Role-based navigation will be configured with the dashboards.

        }
        catch (error) {

            setError(
                error.response?.data?.detail ||
                'Invalid username or password'
            );

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="dashboard-card">

                        <div className="text-center mb-4">

                            <i className="bi bi-droplet-fill text-danger fs-1"></i>

                            <h3 className="text-danger fw-bold mt-2">
                                BloodConnect
                            </h3>

                            <p className="text-secondary">
                                Login to your account
                            </p>

                        </div>

                        <form onSubmit={handleLogin}>

                            {/* Error Message */}

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {/* Username */}

                            <div className="mb-3">

                                <label className="form-label">Username</label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />

                            </div>

                            {/* Password */}

                            <div className="mb-3">

                                <label className="form-label">Password</label>

                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                            </div>

                            <button type="submit" className="btn btn-danger w-100 mt-3">
                                <i className="bi bi-box-arrow-in-right"></i> Login
                            </button>

                        </form>

                        <div className="text-center mt-4">

                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="text-danger fw-bold">
                                    Register
                                </Link>
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Login;