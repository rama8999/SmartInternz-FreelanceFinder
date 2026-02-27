import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Applications.css';

const ProjectApplications = () => {
    const { API_URL } = useContext(GeneralContext);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applications, setApplications] = useState([]);
    const navigate = useNavigate();

    const fetchProjects = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/client/my`);
            setProjects(res.data);
            if (res.data.length > 0) {
                setSelectedProject(res.data[0]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, [API_URL]);

    const fetchApplications = useCallback(async () => {
        if (!selectedProject) return;
        try {
            const res = await axios.get(`${API_URL}/applications/project/${selectedProject._id}`);
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [API_URL, selectedProject]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleAccept = async (applicationId) => {
        try {
            await axios.put(`${API_URL}/applications/${applicationId}/accept`);
            fetchProjects();
            fetchApplications();
        } catch (error) {
            console.error('Error accepting application:', error);
        }
    };

    const handleReject = async (applicationId) => {
        try {
            await axios.put(`${API_URL}/applications/${applicationId}/reject`);
            fetchApplications();
        } catch (error) {
            console.error('Error rejecting application:', error);
        }
    };

    return (
        <div className="applications-page">
            <Navbar />
            <div className="client-applications-container">
                <div className="projects-sidebar">
                    <h3>My Projects</h3>
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            className={`project-item ${selectedProject?._id === project._id ? 'active' : ''}`}
                            onClick={() => setSelectedProject(project)}
                        >
                            <h4>{project.title}</h4>
                            <p>₹ {project.budget}</p>
                            <span className={`status status-${project.status}`}>{project.status}</span>
                        </div>
                    ))}
                </div>

                <div className="applications-main">
                    {selectedProject && (
                        <>
                            <h2>Applications for: {selectedProject.title}</h2>

                            {selectedProject.status === 'in-progress' || selectedProject.status === 'completed' ? (
                                <div className="project-in-progress">
                                    <p>This project has an assigned freelancer</p>
                                    <button
                                        className="view-work-btn"
                                        onClick={() => navigate(`/client/working/${selectedProject._id}`)}
                                    >
                                        View Progress
                                    </button>
                                </div>
                            ) : (
                                <div className="applications-list">
                                    {applications.map((app) => (
                                        <div key={app._id} className="application-item">
                                            <div className="applicant-info">
                                                <h4>{app.freelancer?.username}</h4>
                                                <p className="proposal">{app.proposal}</p>
                                                <p className="bid-amount">Bid: ₹ {app.budget}</p>
                                            </div>
                                            <div className="application-actions">
                                                {app.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAccept(app._id)}
                                                            className="accept-btn"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(app._id)}
                                                            className="reject-btn"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`status-badge status-${app.status}`}>
                                                        {app.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {applications.length === 0 && (
                                        <p className="no-applications">No applications yet</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectApplications;
