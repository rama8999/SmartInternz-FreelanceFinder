import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext.jsx';
import '../styles/Auth.css';

const Register = ({ switchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('freelancer');
    const [error, setError] = useState('');
    const { register } = useContext(GeneralContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await register(username, email, password, role);
        if (result.success) {
            switch (result.user.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'client':
                    navigate('/client');
                    break;
                case 'freelancer':
                    navigate('/freelancer');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-form-container">
            <h2 className="auth-title">Register</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="form-input"
                    >
                        <option value="freelancer">Freelancer</option>
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="auth-btn">Register</button>
            </form>
            <p className="auth-switch">
                Already registered? <span onClick={switchToLogin} className="switch-link">Login</span>
            </p>
        </div>
    );
};

export default Register;
