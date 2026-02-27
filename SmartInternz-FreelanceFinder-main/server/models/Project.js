const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed'],
        default: 'open'
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    bids: [{
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    }],
    deadline: {
        type: Date
    },
    submission: {
        link: String,
        note: String,
        submittedAt: Date
    },
    postedDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
