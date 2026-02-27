import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Applications.css';

const MyApplications = () => {
    const { API_URL } = useContext(GeneralContext);
    const [applications, setApplications] = useState([]);

    const fetchApplications = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/applications/my`);
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'accepted': return 'status-accepted';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    return (
        <div className="applications-page">
            <Navbar />
            <div className="applications-container">
                <h2>My Applications</h2>

                <div className="applications-grid">
                    {applications.map((app) => (
                        <div key={app._id} className="application-card">
                            <div className="application-left">
                                <h3 className="app-title">{app.title}</h3>
                                <p className="app-description">{app.description}</p>
                                <div className="app-skills">
                                    <strong>Skills</strong>
                                    <div className="skills-list">
                                        {app.skills?.map((skill, index) => (
                                            <span key={index} className={`skill-tag skill-${skill.toLowerCase().replace('.', '')}`}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="app-budget">Budget - ₹ {app.budget}</p>
                            </div>

                            <div className="application-right">
                                <h4>Proposal</h4>
                                <p>{app.proposal}</p>
                                <div className="app-skills">
                                    <strong>Skills</strong>
                                    <div className="skills-list">
                                        {app.skills?.map((skill, index) => (
                                            <span key={index} className={`skill-tag skill-${skill.toLowerCase().replace('.', '')}`}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="proposed-budget">Proposed Budget - ₹ {app.budget}</p>
                                <p className={`app-status ${getStatusClass(app.status)}`}>
                                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {applications.length === 0 && (
                    <p className="no-applications">No applications yet</p>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
