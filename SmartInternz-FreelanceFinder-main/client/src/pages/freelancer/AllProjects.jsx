import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Projects.css';

const AllProjects = () => {
    const { API_URL } = useContext(GeneralContext);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const navigate = useNavigate();

    const skillsList = ['Python', 'Javascript', 'Django', 'HTML', 'MongoDB', 'Express.js', 'React.js', 'Node.js'];

    const fetchProjects = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects`);
            const openProjects = res.data.filter(p => p.status === 'open');
            setProjects(openProjects);
            setFilteredProjects(openProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (selectedSkills.length === 0) {
            setFilteredProjects(projects);
        } else {
            const filtered = projects.filter(project =>
                project.skills?.some(skill =>
                    selectedSkills.some(selected =>
                        skill.toLowerCase().includes(selected.toLowerCase())
                    )
                )
            );
            setFilteredProjects(filtered);
        }
    }, [selectedSkills, projects]);

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'undefined';
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
            <div className="projects-container">
                <div className="filters-sidebar">
                    <h3>Filters</h3>
                    <div className="filter-section">
                        <h4>Skills</h4>
                        {skillsList.map((skill) => (
                            <label key={skill} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill)}
                                    onChange={() => toggleSkill(skill)}
                                />
                                {skill}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="projects-list">
                    <h2>All projects</h2>
                    {filteredProjects.map((project) => (
                        <div key={project._id} className="project-card" onClick={() => navigate(`/freelancer/project/${project._id}`)}>
                            <div className="project-header">
                                <h3 className="project-title">{project.title}</h3>
                                <span className="project-date">{formatDate(project.postedDate)}</span>
                            </div>
                            <p className="project-budget">Budget: ₹ {project.budget}</p>
                            <p className="project-description">{project.description}</p>
                            <div className="project-skills">
                                {project.skills?.map((skill, index) => (
                                    <span key={index} className={`skill-tag skill-${skill.toLowerCase().replace('.', '')}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="project-bids">{project.bids?.length || 0} bids    ₹ {project.budget} (avg bid)</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllProjects;
