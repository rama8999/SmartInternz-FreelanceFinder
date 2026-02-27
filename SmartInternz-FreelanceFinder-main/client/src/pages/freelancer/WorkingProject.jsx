import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Working.css';

const WorkingProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { API_URL } = useContext(GeneralContext);
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [submission, setSubmission] = useState({ link: '', description: '' });
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

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
                senderRole: 'freelancer'
            });
            socketRef.current?.emit('sendMessage', {
                projectId: id,
                text: newMessage,
                senderRole: 'freelancer',
                timestamp: new Date()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/projects/${id}/submit`, submission);
            fetchProject();
        } catch (error) {
            console.error('Error submitting:', error);
        }
    };

    const handleOptOut = async () => {
        if (window.confirm('Are you sure you want to opt out of this project? This cannot be undone.')) {
            try {
                await axios.put(`${API_URL}/projects/${id}/optout`);
                navigate('/freelancer/dashboard');
            } catch (error) {
                console.error('Error opting out:', error);
                alert(error.response?.data?.message || 'Error opting out');
            }
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="working-page">
            <Navbar />
            <div className="working-container">
                <div className="project-details">
                    <h2>{project.title}</h2>
                    <p className="project-description">{project.description}</p>

                    <div className="required-skills">
                        <h4>Required skills</h4>
                        <div className="skills-list">
                            {project.skills?.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="budget-section">
                        <h4>Budget</h4>
                        <p className="budget-amount">₹ {project.budget}</p>
                    </div>

                    <div className="submit-section">
                        <h4>Submit the project</h4>
                        {project.status === 'completed' ? (
                            <p>Project completed</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="url"
                                    value={submission.link}
                                    onChange={(e) => setSubmission({ ...submission, link: e.target.value })}
                                    placeholder="Project link (GitHub, Drive, etc.)"
                                    required
                                    className="submit-input"
                                />
                                <textarea
                                    value={submission.description}
                                    onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                                    placeholder="Description of your submission..."
                                    className="submit-textarea"
                                />
                                <button type="submit" className="submit-btn">Submit Work</button>
                            </form>
                        )}
                    </div>

                    {project.status !== 'completed' && (
                        <div className="opt-out-section" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <button
                                onClick={handleOptOut}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#e74c3c',
                                    border: '1px solid #e74c3c',
                                    padding: '10px 15px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontWeight: '500'
                                }}
                            >
                                Opt Out of Project
                            </button>
                        </div>
                    )}
                </div>

                <div className="chat-section">
                    <h3>Chat with the client</h3>
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
                            placeholder="Enter something..."
                            className="message-input"
                        />
                        <button type="submit" className="send-btn">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WorkingProject;
