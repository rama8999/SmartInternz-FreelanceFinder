import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext.jsx';
import '../styles/Auth.css';

const Login = ({ switchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(GeneralContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
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
            <h2 className="auth-title">Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
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
                <button type="submit" className="auth-btn">Sign in</button>
            </form>
            <p className="auth-switch">
                Not registered? <span onClick={switchToRegister} className="switch-link">Register</span>
            </p>
        </div>
    );
};

export default Login;
