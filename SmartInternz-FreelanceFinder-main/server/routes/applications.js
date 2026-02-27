const express = require('express');
const Application = require('../models/Application');
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');
const { protect, client, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/applications
// @desc    Get all applications (admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('projectId', 'title budget')
            .populate('client', 'username email')
            .populate('freelancer', 'username email');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/applications
// @desc    Apply to a project (freelancer)
router.post('/', protect, async (req, res) => {
    try {
        const { projectId, proposal, budget } = req.body;

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            projectId,
            freelancer: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'Already applied to this project' });
        }

        const application = await Application.create({
            projectId,
            client: project.client,
            freelancer: req.user._id,
            proposal,
            budget,
            skills: project.skills,
            title: project.title,
            description: project.description
        });

        // Add bid to project
        await Project.findByIdAndUpdate(projectId, {
            $push: { bids: { freelancer: req.user._id, amount: budget } }
        });

        // Add application to freelancer profile
        await Freelancer.findOneAndUpdate(
            { userId: req.user._id },
            { $push: { applications: application._id } }
        );

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/applications/my
// @desc    Get freelancer's applications
router.get('/my', protect, async (req, res) => {
    try {
        const applications = await Application.find({ freelancer: req.user._id })
            .populate('projectId', 'title budget status')
            .populate('client', 'username email');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/applications/project/:projectId
// @desc    Get applications for a project (client)
router.get('/project/:projectId', protect, async (req, res) => {
    try {
        const applications = await Application.find({ projectId: req.params.projectId })
            .populate('freelancer', 'username email');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/applications/:id/accept
// @desc    Accept an application (client)
router.put('/:id/accept', protect, client, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Update application status
        application.status = 'accepted';
        await application.save();

        // Update project with freelancer and status
        await Project.findByIdAndUpdate(application.projectId, {
            freelancer: application.freelancer,
            status: 'in-progress'
        });

        // Add project to freelancer's profile
        await Freelancer.findOneAndUpdate(
            { userId: application.freelancer },
            { $push: { projects: application.projectId } }
        );

        // Reject other applications for this project
        await Application.updateMany(
            { projectId: application.projectId, _id: { $ne: application._id } },
            { status: 'rejected' }
        );

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/applications/:id/reject
// @desc    Reject an application (client)
router.put('/:id/reject', protect, client, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = 'rejected';
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/applications/stats
// @desc    Get application stats (admin)
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalApplications = await Application.countDocuments();
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const acceptedApplications = await Application.countDocuments({ status: 'accepted' });

        res.json({ totalApplications, pendingApplications, acceptedApplications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
