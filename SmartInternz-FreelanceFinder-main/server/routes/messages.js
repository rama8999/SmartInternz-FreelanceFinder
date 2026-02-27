const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:projectId
// @desc    Get messages for a project
router.get('/:projectId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ projectId: req.params.projectId })
            .populate('sender', 'username')
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/messages
// @desc    Send a message
router.post('/', protect, async (req, res) => {
    try {
        const { projectId, text, senderRole } = req.body;

        const message = await Message.create({
            projectId,
            sender: req.user._id,
            senderRole,
            text
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
