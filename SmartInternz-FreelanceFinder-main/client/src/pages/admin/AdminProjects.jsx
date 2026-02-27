import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Admin.css';

const AdminProjects = () => {
    const { API_URL } = useContext(GeneralContext);
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        skills: '',
        status: 'open'
    });

    const fetchProjects = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/admin/all`);
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const handleEdit = (project) => {
        setEditProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            budget: project.budget,
            skills: project.skills?.join(', ') || '',
            status: project.status
        });
        setShowModal(true);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? This will also delete all related applications.')) {
            try {
                await axios.delete(`${API_URL}/projects/admin/${projectId}`);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
                alert(error.response?.data?.message || 'Error deleting project');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            await axios.put(`${API_URL}/projects/admin/${editProject._id}`, {
                ...formData,
                budget: parseFloat(formData.budget),
                skills: skillsArray
            });
            setShowModal(false);
            fetchProjects();
        } catch (error) {
            console.error('Error updating project:', error);
            alert(error.response?.data?.message || 'Error updating project');
        }
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-container">
                <div className="admin-header">
                    <h2>All Projects</h2>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Client</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Posted Date</th>
                            <th>Freelancer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project._id}>
                                <td>{project.title}</td>
                                <td>{project.client?.username}</td>
                                <td>₹ {project.budget}</td>
                                <td className={`status-${project.status}`}>{project.status}</td>
                                <td>{formatDate(project.postedDate)}</td>
                                <td>{project.freelancer?.username || '-'}</td>
                                <td className="action-btns">
                                    <button className="edit-btn" onClick={() => handleEdit(project)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(project._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Edit Project</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Budget (₹)</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjects;
