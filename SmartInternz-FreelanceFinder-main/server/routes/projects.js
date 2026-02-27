const express = require('express');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Freelancer = require('../models/Freelancer');
const { protect, client, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects with optional filters
router.get('/', protect, async (req, res) => {
    try {
        const { skills, status } = req.query;
        let filter = {};

        if (skills) {
            const skillArray = skills.split(',');
            filter.skills = { $in: skillArray };
        }

        if (status) {
            filter.status = status;
        }

        const projects = await Project.find(filter)
            .populate('client', 'username email')
            .populate('freelancer', 'username email')
            .sort({ postedDate: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'username email')
            .populate('freelancer', 'username email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/projects
// @desc    Create a new project (client only)
router.post('/', protect, client, async (req, res) => {
    try {
        const { title, description, budget, skills, deadline } = req.body;

        // Handle skills - can be array or comma-separated string
        let skillsArray = [];
        if (skills) {
            if (Array.isArray(skills)) {
                skillsArray = skills.map(s => s.trim()).filter(s => s);
            } else if (typeof skills === 'string') {
                skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        const project = await Project.create({
            client: req.user._id,
            title,
            description,
            budget,
            skills: skillsArray,
            deadline
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/client/my
// @desc    Get client's projects
router.get('/client/my', protect, client, async (req, res) => {
    try {
        const projects = await Project.find({ client: req.user._id })
            .populate('freelancer', 'username email')
            .sort({ postedDate: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/freelancer/my
// @desc    Get freelancer's assigned projects
router.get('/freelancer/my', protect, async (req, res) => {
    try {
        const projects = await Project.find({ freelancer: req.user._id })
            .populate('client', 'username email')
            .sort({ postedDate: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id/submit
// @desc    Submit project work (freelancer)
router.put('/:id/submit', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        project.submission = {
            link: req.body.link,
            note: req.body.note,
            submittedAt: new Date()
        };
        project.status = 'completed';

        await project.save();

        // Update freelancer stats and funds
        await Freelancer.findOneAndUpdate(
            { userId: req.user._id },
            {
                $inc: { completedProjects: 1, funds: project.budget }
            }
        );

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/stats
// @desc    Get project stats (admin)
router.get('/admin/stats', protect, admin, async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const openProjects = await Project.countDocuments({ status: 'open' });
        const completedProjects = await Project.countDocuments({ status: 'completed' });
        const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });

        res.json({ totalProjects, openProjects, completedProjects, inProgressProjects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/admin/all
// @desc    Get all projects (admin)
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('client', 'username email')
            .populate('freelancer', 'username email')
            .sort({ postedDate: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/admin/:id
// @desc    Update a project (admin only)
router.put('/admin/:id', protect, admin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.budget = req.body.budget || project.budget;
        project.status = req.body.status || project.status;

        if (req.body.skills) {
            project.skills = Array.isArray(req.body.skills)
                ? req.body.skills
                : req.body.skills.split(',').map(s => s.trim());
        }

        const updatedProject = await project.save();

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/projects/admin/:id
// @desc    Delete a project (admin only)
router.delete('/admin/:id', protect, admin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete all applications for this project
        await Application.deleteMany({ projectId: req.params.id });

        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update a project (client)
router.put('/:id', protect, client, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.budget = req.body.budget || project.budget;

        if (req.body.skills) {
            project.skills = Array.isArray(req.body.skills)
                ? req.body.skills
                : req.body.skills.split(',').map(s => s.trim());
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (client)
router.delete('/:id', protect, client, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Application.deleteMany({ projectId: req.params.id });
        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id/optout
// @desc    Opt out of a project (freelancer)
router.put('/:id/optout', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.freelancer || project.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized or not assigned to this project' });
        }

        if (project.status === 'completed') {
            return res.status(400).json({ message: 'Cannot opt out of completed project' });
        }

        project.freelancer = undefined;
        project.status = 'open';

        await project.save();

        res.json({ message: 'Successfully opted out of project' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

