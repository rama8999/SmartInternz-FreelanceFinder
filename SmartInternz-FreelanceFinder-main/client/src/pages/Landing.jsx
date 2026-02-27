import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Landing-specific transparent navbar */}
            <nav className="navbar landing-navbar">
                <div className="navbar-brand">
                    <Link to="/" className="brand-link">
                        <span className="brand-text">SB Works</span>
                    </Link>
                </div>
                <div className="navbar-links">
                    <Link to="/auth" className="nav-link signin-btn">Sign In</Link>
                </div>
            </nav>

            <div className="landing-overlay"></div>
            <div className="landing-content">
                <h1 className="landing-title">
                    Empower Your Journey: Elevate<br />
                    Your Craft on SB Works
                </h1>
                <p className="landing-description">
                    Dive into a realm of endless possibilities with SB Works. Unleash your creativity, skills, and passion as you embark on a
                    freelancing journey like never before. Our platform is a thriving marketplace where innovation meets opportunity, connecting
                    talented freelancers with businesses seeking excellence.
                </p>
                <Link to="/auth" className="landing-btn">
                    Join Now
                </Link>
            </div>
        </div>
    );
};

export default Landing;

