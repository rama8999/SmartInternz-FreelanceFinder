import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Working.css';

const ProjectWorking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { API_URL } = useContext(GeneralContext);
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        skills: ''
    });

    const handleEdit = () => {
        setFormData({
            title: project.title,
            description: project.description,
            budget: project.budget,
            skills: project.skills?.join(', ') || ''
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project? This will verify related applications.')) {
            try {
                await axios.delete(`${API_URL}/projects/${id}`);
                navigate('/client/dashboard');
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
            const res = await axios.put(`${API_URL}/projects/${id}`, {
                ...formData,
                budget: parseFloat(formData.budget),
                skills: skillsArray
            });
            setProject(res.data);
            setShowModal(false);
        } catch (error) {
            console.error('Error updating project:', error);
            alert(error.response?.data?.message || 'Error updating project');
        }
    };

    const fetchProject = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    }, [API_URL, id]);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/messages/${id}`);
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [API_URL, id]);

    useEffect(() => {
        fetchProject();
        fetchMessages();

        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('joinProject', id);

        socketRef.current.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id, fetchProject, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`${API_URL}/messages`, {
                projectId: id,
                text: newMessage,
                senderRole: 'client'
            });
            socketRef.current?.emit('sendMessage', {
                projectId: id,
                text: newMessage,
                senderRole: 'client',
                timestamp: new Date()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="working-page">
            <Navbar />
            <div className="working-container">
                <div className="project-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <h2 style={{ marginBottom: 0 }}>{project.title}</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleEdit}
                                style={{
                                    padding: '6px 12px',
                                    border: '1px solid #3498db',
                                    color: '#3498db',
                                    background: 'transparent',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '6px 12px',
                                    border: '1px solid #e74c3c',
                                    color: '#e74c3c',
                                    background: 'transparent',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <p className="project-description">{project.description}</p>
                    <p className="project-budget">Budget: ₹ {project.budget}</p>

                    <div className="freelancer-info">
                        <h4>Assigned Freelancer</h4>
                        <p>{project.freelancer?.username || 'Not assigned'}</p>
                    </div>

                    {project.submission?.link && (
                        <div className="submission-info">
                            <h4>Submission</h4>
                            <p><a href={project.submission.link} target="_blank" rel="noopener noreferrer">
                                {project.submission.link}
                            </a></p>
                            <p>{project.submission.description}</p>
                        </div>
                    )}

                    <div className="project-status-badge">
                        Status: {project.status}
                    </div>
                </div>

                <div className="chat-section">
                    <h3>Chat with Freelancer</h3>
                    <div className="messages-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message message-${msg.senderRole}`}>
                                <p className="message-text">{msg.text}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="message-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="message-input"
                        />
                        <button type="submit" className="send-btn">Send</button>
                    </form>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="working-modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Edit Project</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="working-form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="working-form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="working-form-group">
                                <label>Budget (₹)</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="working-form-group">
                                <label>Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
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

export default ProjectWorking;
