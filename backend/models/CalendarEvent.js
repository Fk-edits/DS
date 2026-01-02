const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['exam', 'holiday', 'event', 'deadline', 'meeting', 'sports'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    allDay: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: '#1a237e'
    },
    location: {
        type: String
    },
    targetAudience: {
        type: [String],
        enum: ['all', 'students', 'teachers', 'parents', 'staff'],
        default: ['all']
    },
    recurring: {
        frequency: {
            type: String,
            enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
            default: 'none'
        },
        endDate: Date
    },
    createdBy: {
        type: String,
        default: 'Administrator'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ type: 1, isActive: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;