import { Link } from 'react-router-dom';

function Navbar() {

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">

            <div className="container">

                <Link className="navbar-brand text-danger fw-bold fs-4" to="/">
                    <i className="bi bi-droplet-fill"></i> BloodConnect
                </Link>

                <div className="navbar-nav ms-auto align-items-center">

                    <Link className="nav-link me-3" to="/">
                        <i className="bi bi-house-fill"></i> Home
                    </Link>

                    <Link className="nav-link me-3" to="/about">
                        <i className="bi bi-info-circle-fill"></i> About Us
                    </Link>

                    <Link className="btn btn-danger me-2" to="/login">
                        <i className="bi bi-box-arrow-in-right"></i> Login
                    </Link>

                    <Link className="btn btn-danger" to="/register">
                        <i className="bi bi-person-plus-fill"></i> Register
                    </Link>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;