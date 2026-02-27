import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Projects.css';

const MyProjects = () => {
    const { API_URL } = useContext(GeneralContext);
    const [projects, setProjects] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    const fetchMyProjects = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/freelancer/my`);
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    const filteredProjects = statusFilter === 'all'
        ? projects
        : projects.filter(p => p.status === statusFilter);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="projects-page">
            <Navbar />
            <div className="my-projects-container">
                <div className="my-projects-header">
                    <h2>My projects</h2>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="my-projects-list">
                    {filteredProjects.map((project) => (
                        <div key={project._id} className="my-project-card">
                            <h3 className="project-title">{project.title}</h3>
                            <p className="project-budget">Budget - ₹ {project.budget}</p>
                            <p className="project-description">{project.description}</p>
                            <p className="project-date">{formatDate(project.postedDate)}</p>
                            <p className="project-status">Status - {project.status}</p>
                            {project.status === 'in-progress' && (
                                <button
                                    className="work-btn"
                                    onClick={() => navigate(`/freelancer/working/${project._id}`)}
                                >
                                    Continue Working
                                </button>
                            )}
                        </div>
                    ))}
                    {filteredProjects.length === 0 && (
                        <p className="no-projects">No projects found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProjects;
