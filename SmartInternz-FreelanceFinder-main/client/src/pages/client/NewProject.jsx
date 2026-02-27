import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/NewProject.css';

const NewProject = () => {
    const { API_URL } = useContext(GeneralContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        skills: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            await axios.post(`${API_URL}/projects`, {
                ...formData,
                budget: parseFloat(formData.budget),
                skills: skillsArray
            });
            navigate('/client/applications');
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div className="new-project-page">
            <Navbar />
            <div className="new-project-container">
                <form onSubmit={handleSubmit} className="project-form">
                    <h2>Post new project</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Project title"
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="form-textarea"
                            placeholder="Description"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group half">
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Budget (in ₹)"
                            />
                        </div>
                        <div className="form-group half">
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Required skills (seperate each with ,)"
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default NewProject;

