import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GeneralProvider, GeneralContext } from './context/GeneralContext.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Authenticate from './pages/Authenticate.jsx';

// Freelancer Pages
import Freelancer from './pages/freelancer/Freelancer.jsx';
import AllProjects from './pages/freelancer/AllProjects.jsx';
import MyProjects from './pages/freelancer/MyProjects.jsx';
import MyApplications from './pages/freelancer/MyApplications.jsx';
import WorkingProject from './pages/freelancer/WorkingProject.jsx';
import ProjectData from './pages/freelancer/ProjectData.jsx';

// Client Pages
import Client from './pages/client/Client.jsx';
import NewProject from './pages/client/NewProject.jsx';
import ProjectApplications from './pages/client/ProjectApplications.jsx';
import ProjectWorking from './pages/client/ProjectWorking.jsx';

// Admin Pages
import Admin from './pages/admin/Admin.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import AllApplications from './pages/admin/AllApplications.jsx';
import AllUsers from './pages/admin/AllUsers.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(GeneralContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Authenticate />} />

            {/* Freelancer Routes */}
            <Route path="/freelancer" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <Freelancer />
                </ProtectedRoute>
            } />
            <Route path="/freelancer/projects" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <AllProjects />
                </ProtectedRoute>
            } />
            <Route path="/freelancer/my-projects" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <MyProjects />
                </ProtectedRoute>
            } />
            <Route path="/freelancer/applications" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <MyApplications />
                </ProtectedRoute>
            } />
            <Route path="/freelancer/working/:id" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <WorkingProject />
                </ProtectedRoute>
            } />
            <Route path="/freelancer/project/:id" element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                    <ProjectData />
                </ProtectedRoute>
            } />

            {/* Client Routes */}
            <Route path="/client" element={
                <ProtectedRoute allowedRoles={['client']}>
                    <Client />
                </ProtectedRoute>
            } />
            <Route path="/client/new-project" element={
                <ProtectedRoute allowedRoles={['client']}>
                    <NewProject />
                </ProtectedRoute>
            } />
            <Route path="/client/applications" element={
                <ProtectedRoute allowedRoles={['client']}>
                    <ProjectApplications />
                </ProtectedRoute>
            } />
            <Route path="/client/projects" element={
                <ProtectedRoute allowedRoles={['client']}>
                    <ProjectApplications />
                </ProtectedRoute>
            } />
            <Route path="/client/working/:id" element={
                <ProtectedRoute allowedRoles={['client']}>
                    <ProjectWorking />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProjects />
                </ProtectedRoute>
            } />
            <Route path="/admin/applications" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AllApplications />
                </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AllUsers />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <GeneralProvider>
            <Router>
                <AppRoutes />
            </Router>
        </GeneralProvider>
    );
}

export default App;
