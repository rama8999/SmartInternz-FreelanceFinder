import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const GeneralContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const GeneralProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [freelancerProfile, setFreelancerProfile] = useState(null);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/users/profile`);
                    setUser(res.data.user);
                    if (res.data.freelancerProfile) {
                        setFreelancerProfile(res.data.freelancerProfile);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            setToken(res.data.token);
            setUser(res.data);
            localStorage.setItem('token', res.data.token);
            return { success: true, user: res.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { username, email, password, role });
            setToken(res.data.token);
            setUser(res.data);
            localStorage.setItem('token', res.data.token);
            return { success: true, user: res.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setFreelancerProfile(null);
        localStorage.removeItem('token');
    };

    const updateProfile = async (data) => {
        try {
            const res = await axios.put(`${API_URL}/users/profile`, data);
            setUser(res.data);
            if (data.bio || data.skills) {
                const profileRes = await axios.get(`${API_URL}/users/profile`);
                if (profileRes.data.freelancerProfile) {
                    setFreelancerProfile(profileRes.data.freelancerProfile);
                }
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
    };

    return (
        <GeneralContext.Provider value={{
            user,
            token,
            loading,
            freelancerProfile,
            login,
            register,
            logout,
            updateProfile,
            API_URL
        }}>
            {children}
        </GeneralContext.Provider>
    );
};
