const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    funds: {
        type: Number,
        default: 0
    },
    completedProjects: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Freelancer', freelancerSchema);
