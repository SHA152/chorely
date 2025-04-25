const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all template categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await query(
            "SELECT * FROM template_categories ORDER BY display_order"
        );
        
        res.json(categories);
    } catch (error) {
        console.error("Error fetching template categories:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get templates by category
router.get('/category/:category', async (req, res) => {
    const category = req.params.category;
    
    try {
        const templates = await query(
            "SELECT * FROM chore_templates WHERE category = ? ORDER BY template_name",
            [category]
        );
        
        res.json(templates);
    } catch (error) {
        console.error("Error fetching templates by category:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get all templates
router.get('/', async (req, res) => {
    try {
        const templates = await query(
            "SELECT * FROM chore_templates ORDER BY category, template_name"
        );
        
        res.json(templates);
    } catch (error) {
        console.error("Error fetching all templates:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get template by ID
router.get('/:template_id', async (req, res) => {
    const template_id = req.params.template_id;
    
    try {
        const templates = await query(
            "SELECT * FROM chore_templates WHERE template_id = ?",
            [template_id]
        );
        
        if (templates.length === 0) {
            return res.status(404).json({ error: "Template not found." });
        }
        
        res.json(templates[0]);
    } catch (error) {
        console.error("Error fetching template:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Create a task from a template
router.post('/:template_id/create-task', authenticateToken, async (req, res) => {
    const template_id = req.params.template_id;
    const { home_id } = req.body;
    
    if (!home_id) {
        return res.status(400).json({ error: "Home ID is required." });
    }
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get template details
        const templates = await query(
            "SELECT * FROM chore_templates WHERE template_id = ?",
            [template_id]
        );
        
        if (templates.length === 0) {
            return res.status(404).json({ error: "Template not found." });
        }
        
        const template = templates[0];
        
        // Check if the task name already exists in this home
        const existingTasks = await query(
            "SELECT task_id FROM tasks WHERE home_id = ? AND task_name = ?",
            [home_id, template.template_name]
        );
        
        if (existingTasks.length > 0) {
            return res.status(400).json({ 
                error: "A task with this name already exists in this home."
            });
        }
        
        // Insert task from template
        const result = await query(
            `INSERT INTO tasks 
            (home_id, task_name, description, difficulty_level, repeat_interval, task_type, points) 
            VALUES (?, ?, ?, ?, ?, 'regular', ?)`,
            [
                home_id, 
                template.template_name, 
                template.description || '', 
                template.difficulty_level,
                template.repeat_interval,
                template.points
            ]
        );
        
        res.status(201).json({
            message: "✅ Task created from template successfully!",
            task_id: result.insertId,
            task_name: template.template_name,
            points: template.points
        });
    } catch (error) {
        console.error("Error creating task from template:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Admin routes for managing templates
// These routes require admin authentication
// Add a middleware to check if user is a system admin

// Add a new template (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    const { 
        category, 
        template_name, 
        description, 
        difficulty_level, 
        estimated_time, 
        repeat_interval 
    } = req.body;
    
    // For MVP, we're skipping admin check, but would add it in production
    // In production, you would check if the user is a system admin
    
    // Validate required fields
    if (!category || !template_name || !difficulty_level) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    
    // Validate difficulty level
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty_level)) {
        return res.status(400).json({ error: "Difficulty level must be Easy, Medium, or Hard." });
    }
    
    try {
        // Calculate points based on difficulty
        let points = 10; // Default/Medium
        if (difficulty_level === "Easy") points = 5;
        else if (difficulty_level === "Hard") points = 20;
        
        // Insert new template
        const result = await query(
            `INSERT INTO chore_templates 
            (category, template_name, description, difficulty_level, estimated_time, repeat_interval, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                category, 
                template_name, 
                description || '', 
                difficulty_level, 
                estimated_time || null, 
                repeat_interval || null, 
                points
            ]
        );
        
        res.status(201).json({
            message: "Template created successfully!",
            template_id: result.insertId
        });
    } catch (error) {
        console.error("Error creating template:", error);
        
        // Check for duplicate category
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: "Category does not exist. Please use an existing category." });
        }
        
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;