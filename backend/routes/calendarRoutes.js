const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Get events for a specific month (public)
router.get('/', async (req, res) => {
    try {
        const { year, month, type } = req.query;
        let query = { isActive: true };
        
        // Filter by month/year
        if (year && month) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 1);
            
            query.$or = [
                { 
                    startDate: { $gte: startDate, $lt: endDate } 
                },
                {
                    $and: [
                        { startDate: { $lt: startDate } },
                        { endDate: { $gte: startDate } }
                    ]
                }
            ];
        }
        
        // Filter by type
        if (type && type !== 'all') {
            query.type = type;
        }
        
        const events = await CalendarEvent.find(query)
            .sort({ startDate: 1 });
            
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Get events for today (public)
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const events = await CalendarEvent.find({
            isActive: true,
            $or: [
                { startDate: { $gte: today, $lt: tomorrow } },
                { 
                    $and: [
                        { startDate: { $lt: today } },
                        { endDate: { $gte: today } }
                    ]
                }
            ]
        }).sort({ startDate: 1 });
        
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = await CalendarEvent.find({
            isActive: true,
            startDate: { $gte: today }
        })
        .sort({ startDate: 1 })
        .limit(10);
        
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Admin routes - require authentication
router.use(authenticateAdmin);

// Create event (admin only)
router.post('/', async (req, res) => {
    try {
        const eventData = req.body;
        
        // Validate required fields
        if (!eventData.title || !eventData.type || !eventData.startDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title, type, and start date are required' 
            });
        }
        
        // Set color based on type
        if (!eventData.color) {
            const colors = {
                exam: '#ff6b6b',
                holiday: '#4caf50',
                event: '#2196f3',
                deadline: '#ff9800',
                meeting: '#9c27b0',
                sports: '#00bcd4'
            };
            eventData.color = colors[eventData.type] || '#1a237e';
        }
        
        const event = new CalendarEvent(eventData);
        await event.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully',
            event 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating event',
            error: error.message 
        });
    }
});

// Update event (admin only)
router.put('/:id', async (req, res) => {
    try {
        const updatedEvent = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Event updated successfully',
            event: updatedEvent 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating event',
            error: error.message 
        });
    }
});

// Delete event (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting event',
            error: error.message 
        });
    }
});

// Get all events including inactive (admin only)
router.get('/admin/all', async (req, res) => {
    try {
        const events = await CalendarEvent.find().sort({ startDate: 1 });
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;