const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Get all active news (public)
router.get('/', async (req, res) => {
    try {
        const { category, limit = 20, page = 1 } = req.query;
        const query = { isActive: true };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const news = await News.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await News.countDocuments(query);
        
        res.json({
            success: true,
            news,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Get latest 5 news for notifications (public)
router.get('/latest', async (req, res) => {
    try {
        const news = await News.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5);
            
        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get single news item (public)
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news || !news.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: 'News not found' 
            });
        }
        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Admin routes - require authentication
router.use(authenticateAdmin);

// Create news (admin only)
router.post('/', async (req, res) => {
    try {
        const newsData = req.body;
        
        // Validate required fields
        if (!newsData.title || !newsData.content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and content are required' 
            });
        }
        
        const news = new News(newsData);
        await news.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'News created successfully',
            news 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating news',
            error: error.message 
        });
    }
});

// Update news (admin only)
router.put('/:id', async (req, res) => {
    try {
        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedNews) {
            return res.status(404).json({ 
                success: false, 
                message: 'News not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'News updated successfully',
            news: updatedNews 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating news',
            error: error.message 
        });
    }
});

// Delete/Archive news (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!news) {
            return res.status(404).json({ 
                success: false, 
                message: 'News not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'News archived successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error archiving news',
            error: error.message 
        });
    }
});

// Get all news including inactive (admin only)
router.get('/admin/all', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;