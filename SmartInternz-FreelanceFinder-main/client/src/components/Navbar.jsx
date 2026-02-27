import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext.jsx';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(GeneralContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderNavLinks = () => {
        if (!user) {
            return (
                <Link to="/auth" className="nav-link">Sign In</Link>
            );
        }

        switch (user.role) {
            case 'freelancer':
                return (
                    <>
                        <Link to="/freelancer" className="nav-link">Dashboard</Link>
                        <Link to="/freelancer/projects" className="nav-link">All Projects</Link>
                        <Link to="/freelancer/my-projects" className="nav-link">My Projects</Link>
                        <Link to="/freelancer/applications" className="nav-link">Applications</Link>
                        <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                    </>
                );
            case 'client':
                return (
                    <>
                        <Link to="/client" className="nav-link">Dashboard</Link>
                        <Link to="/client/new-project" className="nav-link">New Project</Link>
                        <Link to="/client/applications" className="nav-link">Applications</Link>
                        <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Link to="/admin" className="nav-link">Home</Link>
                        <Link to="/admin/users" className="nav-link">All users</Link>
                        <Link to="/admin/projects" className="nav-link">Projects</Link>
                        <Link to="/admin/applications" className="nav-link">Applications</Link>
                        <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">
                    <span className="brand-text">SB Works</span>
                    {user?.role === 'admin' && <span className="admin-badge">(admin)</span>}
                </Link>
            </div>
            <div className="navbar-links">
                {renderNavLinks()}
            </div>
        </nav>
    );
};

export default Navbar;
