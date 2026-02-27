const express = require('express');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user.role === 'freelancer') {
            const freelancerProfile = await Freelancer.findOne({ userId: user._id });
            return res.json({ user, freelancerProfile });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Update freelancer profile if freelancer
            if (user.role === 'freelancer' && (req.body.bio || req.body.skills)) {
                await Freelancer.findOneAndUpdate(
                    { userId: user._id },
                    {
                        bio: req.body.bio,
                        skills: req.body.skills
                    }
                );
            }

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/freelancer/:id
// @desc    Get freelancer profile by user ID
router.get('/freelancer/:id', protect, async (req, res) => {
    try {
        const freelancer = await Freelancer.findOne({ userId: req.params.id })
            .populate('userId', 'username email')
            .populate('projects')
            .populate('applications');

        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        res.json(freelancer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/stats
// @desc    Get admin stats
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const freelancers = await User.countDocuments({ role: 'freelancer' });
        const clients = await User.countDocuments({ role: 'client' });

        res.json({ totalUsers, freelancers, clients });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users
// @desc    Create a new user (admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role
        });

        // Create freelancer profile if role is freelancer
        if (role === 'freelancer') {
            await Freelancer.create({
                userId: user._id,
                skills: [],
                bio: ''
            });
        }

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update a user (admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Delete freelancer profile if exists
        if (user.role === 'freelancer') {
            await Freelancer.findOneAndDelete({ userId: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

