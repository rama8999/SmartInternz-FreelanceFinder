import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Dashboard.css';

const Client = () => {
    const { API_URL } = useContext(GeneralContext);
    const [stats, setStats] = useState({
        totalProjects: 0,
        inProgress: 0,
        completed: 0
    });
    const navigate = useNavigate();

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/client/my`);
            const projects = res.data;

            setStats({
                totalProjects: projects.length,
                inProgress: projects.filter(p => p.status === 'in-progress').length,
                completed: projects.filter(p => p.status === 'completed').length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>All Projects</h3>
                        <p className="stat-number">{stats.totalProjects}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/client/applications')}
                        >
                            View Projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>In Progress</h3>
                        <p className="stat-number">{stats.inProgress}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/client/applications')}
                        >
                            View Projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Completed</h3>
                        <p className="stat-number">{stats.completed}</p>
                        <button
                            className="stat-btn"
                            onClick={() => navigate('/client/applications')}
                        >
                            View Projects
                        </button>
                    </div>
                </div>

                <div className="action-section">
                    <button className="action-btn" onClick={() => navigate('/client/new-project')}>
                        Post a New Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Client;
