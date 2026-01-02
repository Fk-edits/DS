const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'exam', 'holiday', 'event', 'announcement'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    targetAudience: {
        type: [String],
        enum: ['all', 'students', 'teachers', 'parents', 'staff'],
        default: ['all']
    },
    attachments: [{
        filename: String,
        url: String,
        fileType: String
    }],
    publishedBy: {
        type: String,
        default: 'Administrator'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1, isActive: 1 });

const News = mongoose.model('News', newsSchema);

module.exports = News;