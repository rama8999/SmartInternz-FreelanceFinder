import { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';
import '../styles/Auth.css';
import '../styles/Navbar.css';

const Authenticate = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-page">
            {/* Simple navbar with just Home link */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <Link to="/" className="brand-link">
                        <span className="brand-text">SB Works</span>
                    </Link>
                </div>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                </div>
            </nav>
            <div className="auth-container">
                {isLogin ? (
                    <Login switchToRegister={() => setIsLogin(false)} />
                ) : (
                    <Register switchToLogin={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    );
};

export default Authenticate;

