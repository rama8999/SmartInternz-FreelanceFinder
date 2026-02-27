import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Dashboard.css';

const Freelancer = () => {
    const { freelancerProfile, updateProfile, API_URL } = useContext(GeneralContext);
    const [stats, setStats] = useState({
        currentProjects: 0,
        completedProjects: 0,
        applications: 0,
        funds: 0
    });
    const [skills, setSkills] = useState('');
    const [bio, setBio] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const projectsRes = await axios.get(`${API_URL}/projects/freelancer/my`);
            const applicationsRes = await axios.get(`${API_URL}/applications/my`);

            const currentProjects = projectsRes.data.filter(p => p.status === 'in-progress').length;
            const completedProjects = projectsRes.data.filter(p => p.status === 'completed').length;

            setStats({
                currentProjects,
                completedProjects,
                applications: applicationsRes.data.length,
                funds: freelancerProfile?.funds || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [API_URL, freelancerProfile?.funds]);

    useEffect(() => {
        fetchStats();
        if (freelancerProfile) {
            setSkills(freelancerProfile.skills?.join(', ') || '');
            setBio(freelancerProfile.bio || '');
        }
    }, [freelancerProfile, fetchStats]);

    const handleUpdate = async () => {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
        await updateProfile({ bio, skills: skillsArray });
        setIsEditing(false);
    };

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Current projects</h3>
                        <p className="stat-number">{stats.currentProjects}</p>
                        <button className="stat-btn" onClick={() => window.location.href = '/freelancer/my-projects'}>
                            View projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Completed projects</h3>
                        <p className="stat-number">{stats.completedProjects}</p>
                        <button className="stat-btn" onClick={() => window.location.href = '/freelancer/my-projects'}>
                            View projects
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Applications</h3>
                        <p className="stat-number">{stats.applications}</p>
                        <button className="stat-btn" onClick={() => window.location.href = '/freelancer/applications'}>
                            View Applications
                        </button>
                    </div>
                    <div className="stat-card">
                        <h3>Funds</h3>
                        <p className="stat-number">Available: ₹ {stats.funds}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h3 className="section-title">My Skills</h3>
                    <div className="skills-container">
                        {freelancerProfile?.skills?.map((skill, index) => (
                            <span key={index} className={`skill-tag skill-${skill.toLowerCase().replace('.', '')}`}>
                                {skill}
                            </span>
                        ))}
                    </div>

                    <h3 className="section-title">Description</h3>
                    {isEditing ? (
                        <div className="edit-section">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Enter your bio..."
                                className="bio-input"
                            />
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="Skills (comma separated)"
                                className="skills-input"
                            />
                            <button onClick={handleUpdate} className="save-btn">Save</button>
                            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                        </div>
                    ) : (
                        <div className="description-section">
                            <p>{freelancerProfile?.bio || 'No description yet. Click Update to add one.'}</p>
                            <button onClick={() => setIsEditing(true)} className="update-btn">Update</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Freelancer;
