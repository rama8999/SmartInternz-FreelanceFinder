import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar.jsx';
import { GeneralContext } from '../../context/GeneralContext.jsx';
import '../../styles/Admin.css';

const AllApplications = () => {
    const { API_URL } = useContext(GeneralContext);
    const [applications, setApplications] = useState([]);

    const fetchApplications = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/applications`);
            setApplications(res.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-container">
                <h2>All Applications</h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Freelancer</th>
                            <th>Client</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app._id}>
                                <td>{app.projectId?.title || app.title}</td>
                                <td>{app.freelancer?.username}</td>
                                <td>{app.client?.username}</td>
                                <td>₹ {app.budget}</td>
                                <td className={`status-${app.status}`}>{app.status}</td>
                                <td>{formatDate(app.appliedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllApplications;
