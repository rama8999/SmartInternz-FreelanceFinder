import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Projects.css';

const ProjectData = () => {
    const { id } = useParams();
    const { API_URL } = useContext(GeneralContext);
    const [project, setProject] = useState(null);
    const [proposal, setProposal] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');

    const fetchProject = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    }, [API_URL, id]);

    const checkIfApplied = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/applications/my`);
            const application = res.data.find(app => app.projectId === id);
            if (application) {
                setHasApplied(true);
                setApplicationStatus(application.status);
            }
        } catch (error) {
            console.error('Error checking application:', error);
        }
    }, [API_URL, id]);

    useEffect(() => {
        fetchProject();
        checkIfApplied();
    }, [fetchProject, checkIfApplied]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/applications`, {
                projectId: id,
                proposal,
                budget: parseFloat(bidAmount)
            });
            setHasApplied(true);
            setApplicationStatus('pending');
        } catch (error) {
            console.error('Error applying:', error);
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="project-data-page">
            <Navbar />
            <div className="project-data-container">
                <h2>{project.title}</h2>
                <p className="project-description">{project.description}</p>

                <div className="required-skills">
                    <h4>Skills required</h4>
                    <div className="skills-list">
                        {project.skills?.map((skill, index) => (
                            <span key={index} className={`skill-tag skill-${skill.toLowerCase().replace('.', '')}`}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="budget-label">Client's budget (₹)</p>
                <p className="budget-amount">₹ {project.budget}</p>

                {hasApplied ? (
                    <div className="already-applied">
                        <p>You have already applied to this project</p>
                        <p>Status: {applicationStatus}</p>
                    </div>
                ) : (
                    <div className="apply-section">
                        <h3>Apply for this project</h3>
                        <form onSubmit={handleApply} className="apply-form">
                            <textarea
                                value={proposal}
                                onChange={(e) => setProposal(e.target.value)}
                                placeholder="Write your proposal..."
                                required
                                className="proposal-input"
                            />
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder="Your bid amount (₹)"
                                required
                                className="bid-input"
                            />
                            <button type="submit" className="apply-btn">Submit Proposal</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectData;
