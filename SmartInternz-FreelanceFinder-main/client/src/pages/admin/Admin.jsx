import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Dashboard.css';

const Admin = () => {
    const { API_URL } = useContext(GeneralContext);
    const [stats, setStats] = useState({
        totalProjects: 0,
        completedProjects: 0,
        totalApplications: 0,
        totalUsers: 0
    });
    const navigate = useNavigate();

    const fetchStats = useCallback(async () => {
        try {
            const [projectsRes, applicationsRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/projects/admin/stats`),
                axios.get(`${API_URL}/applications/stats`),
                axios.get(`${API_URL}/users/stats`)
            ]);

            setStats({
                totalProjects: projectsRes.data.totalProjects,
                completedProjects: projectsRes.data.completedProjects,
                totalApplications: applicationsRes.data.totalApplications,
                totalUsers: usersRes.data.totalUsers
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="dashboard-page admin-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>All Projects</h3>
                        <p className="stat-number">{stats.totalProjects}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/admin/projects')}
                        >
                            View Projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Completed projects</h3>
                        <p className="stat-number">{stats.completedProjects}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/admin/projects')}
                        >
                            View projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Applications</h3>
                        <p className="stat-number">{stats.totalApplications}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/admin/applications')}
                        >
                            View Applications
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Users</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/admin/users')}
                        >
                            View Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
