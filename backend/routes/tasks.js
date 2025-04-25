const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
    const { home_id, task_name, description, difficulty_level, repeat_interval, task_type } = req.body;

    // Validate required fields
    if (!home_id || !task_name || !difficulty_level || !task_type) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Validate difficulty level
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty_level)) {
        return res.status(400).json({ error: "Difficulty level must be Easy, Medium, or Hard." });
    }

    // Validate task type
    if (!['regular', 'emergency'].includes(task_type)) {
        return res.status(400).json({ error: "Task type must be regular or emergency." });
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
        
        // Check if a task with the same name already exists in this home
        const existingTasks = await query(
            "SELECT task_id FROM tasks WHERE home_id = ? AND task_name = ?", 
            [home_id, task_name]
        );
        
        if (existingTasks.length > 0) {
            return res.status(400).json({ 
                error: "A task with this name already exists in this home. Choose a different name." 
            });
        }
        
        // Assign points based on difficulty level
        let points = 10; // Default/Medium
        if (difficulty_level === "Easy") points = 5;
        else if (difficulty_level === "Hard") points = 20;
        
        // Insert new task
        const result = await query(
            `INSERT INTO tasks 
            (home_id, task_name, description, difficulty_level, repeat_interval, task_type, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [home_id, task_name, description || '', difficulty_level, repeat_interval, task_type, points]
        );
        
        res.status(201).json({
            message: "✅ Task created successfully!",
            task_id: result.insertId,
            points: points
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get all tasks for a home
router.get('/home/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get all tasks for the home
        const tasks = await query(
            "SELECT * FROM tasks WHERE home_id = ?",
            [home_id]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get tasks assigned to the current user
router.get('/assigned', authenticateToken, async (req, res) => {
    try {
        const tasks = await query(
            `SELECT t.*, ta.assignment_id, ta.assigned_at, ta.status as assignment_status
             FROM tasks t
             JOIN task_assignments ta ON t.task_id = ta.task_id
             WHERE ta.assigned_user_id = ? AND ta.status != 'completed'`,
            [req.user.user_id]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching assigned tasks:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Assign a task to a user
router.post('/assign', authenticateToken, async (req, res) => {
    const { task_id, assigned_user_id } = req.body;
    
    if (!task_id || !assigned_user_id) {
        return res.status(400).json({ error: "Task ID and Assigned User ID are required." });
    }
    
    try {
        // Get task details to check if user has access to the home
        const tasks = await query(
            "SELECT home_id FROM tasks WHERE task_id = ?",
            [task_id]
        );
        
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        
        const home_id = tasks[0].home_id;
        
        // Check if current user has admin access to this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        // Allow self-assignment
        const isSelfAssignment = parseInt(assigned_user_id) === req.user.user_id;
        
        if (adminCheck.length === 0 && !isSelfAssignment) {
            return res.status(403).json({ error: "Only home admins can assign tasks to others." });
        }
        
        // Check if the assigned user is a member of the home
        const memberCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, assigned_user_id]
        );
        
        if (memberCheck.length === 0) {
            return res.status(400).json({ error: "User is not a member of this home." });
        }
        
        // Create assignment
        const result = await query(
            "INSERT INTO task_assignments (task_id, assigned_user_id, assigned_by) VALUES (?, ?, ?)",
            [task_id, assigned_user_id, req.user.user_id]
        );
        
        // Create notification for the assigned user
        if (!isSelfAssignment) {
            await query(
                "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
                [assigned_user_id, `You have been assigned a new task.`]
            );
        }
        
        res.status(201).json({ 
            message: "📌 Task assigned successfully!",
            assignment_id: result.insertId
        });
    } catch (error) {
        console.error("Error assigning task:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Mark a task as complete
router.put('/complete', authenticateToken, async (req, res) => {
    const { assignment_id, before_image_url, after_image_url } = req.body;
    
    if (!assignment_id) {
        return res.status(400).json({ error: "Assignment ID is required." });
    }
    
    try {
        // Check if the assignment exists and belongs to the current user
        const assignments = await query(
            `SELECT ta.*, t.points, t.home_id
             FROM task_assignments ta
             JOIN tasks t ON ta.task_id = t.task_id
             WHERE ta.assignment_id = ?`,
            [assignment_id]
        );
        
        if (assignments.length === 0) {
            return res.status(404).json({ error: "Assignment not found." });
        }
        
        const assignment = assignments[0];
        
        // Check if the current user is the assignee
        if (assignment.assigned_user_id !== req.user.user_id) {
            return res.status(403).json({ error: "You can only complete tasks assigned to you." });
        }
        
        // Check if the task is already completed
        if (assignment.status === 'completed') {
            return res.status(400).json({ error: "Task is already marked as completed." });
        }
        
        // Update assignment status
        await query(
            "UPDATE task_assignments SET status = 'completed' WHERE assignment_id = ?",
            [assignment_id]
        );
        
        // Record completion details
        await query(
            `INSERT INTO task_completion 
             (assignment_id, completed_by, before_image_url, after_image_url) 
             VALUES (?, ?, ?, ?)`,
            [assignment_id, req.user.user_id, before_image_url || null, after_image_url || null]
        );
        
        // Update leaderboard
        await query(
            `INSERT INTO leaderboard 
             (home_id, user_id, month, year, total_points) 
             VALUES (?, ?, MONTH(CURDATE()), YEAR(CURDATE()), ?) 
             ON DUPLICATE KEY UPDATE total_points = total_points + ?`,
            [assignment.home_id, req.user.user_id, assignment.points, assignment.points]
        );
        
        res.json({
            message: `✅ Task completed! ${assignment.points} points awarded.`,
            points_awarded: assignment.points
        });
    } catch (error) {
        console.error("Error completing task:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get detailed task information
router.get('/:task_id', authenticateToken, async (req, res) => {
    const task_id = req.params.task_id;
    
    try {
        // Get task with current assignments
        const tasks = await query(
            `SELECT t.*, h.home_name 
             FROM tasks t
             JOIN homes h ON t.home_id = h.home_id
             WHERE t.task_id = ?`,
            [task_id]
        );
        
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        
        const task = tasks[0];
        
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [task.home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this task." });
        }
        
        // Get current assignments for this task
        const assignments = await query(
            `SELECT ta.*, u.name as assigned_user_name, u.avatar_id
             FROM task_assignments ta
             JOIN users u ON ta.assigned_user_id = u.user_id
             WHERE ta.task_id = ? AND ta.status != 'completed'
             ORDER BY ta.assigned_at DESC`,
            [task_id]
        );
        
        // Get completion history
        const completions = await query(
            `SELECT tc.*, u.name as completed_by_name, u.avatar_id, ta.status
             FROM task_completion tc
             JOIN task_assignments ta ON tc.assignment_id = ta.assignment_id
             JOIN users u ON tc.completed_by = u.user_id
             WHERE ta.task_id = ?
             ORDER BY tc.completed_at DESC
             LIMIT 10`,
            [task_id]
        );
        
        // Combine data
        const taskData = {
            ...task,
            current_assignments: assignments,
            recent_completions: completions
        };
        
        res.json(taskData);
    } catch (error) {
        console.error("Error fetching task details:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Update task details
router.put('/:task_id', authenticateToken, async (req, res) => {
    const task_id = req.params.task_id;
    const { task_name, description, difficulty_level, repeat_interval, task_type } = req.body;
    const updates = {};
    
    // Build update object with only provided fields
    if (task_name !== undefined) updates.task_name = task_name;
    if (description !== undefined) updates.description = description;
    if (difficulty_level !== undefined) {
        if (!['Easy', 'Medium', 'Hard'].includes(difficulty_level)) {
            return res.status(400).json({ error: "Difficulty level must be Easy, Medium, or Hard." });
        }
        updates.difficulty_level = difficulty_level;
        
        // Update points based on difficulty
        if (difficulty_level === "Easy") updates.points = 5;
        else if (difficulty_level === "Medium") updates.points = 10;
        else if (difficulty_level === "Hard") updates.points = 20;
    }
    if (repeat_interval !== undefined) updates.repeat_interval = repeat_interval;
    if (task_type !== undefined) {
        if (!['regular', 'emergency'].includes(task_type)) {
            return res.status(400).json({ error: "Task type must be regular or emergency." });
        }
        updates.task_type = task_type;
    }
    
    // If no fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update." });
    }
    
    try {
        // Get task to check home_id
        const tasks = await query("SELECT home_id FROM tasks WHERE task_id = ?", [task_id]);
        
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        
        const home_id = tasks[0].home_id;
        
        // Check if user is admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Only home admins can update tasks." });
        }
        
        // If task_name is being updated, check for duplicates
        if (updates.task_name) {
            const existingTasks = await query(
                "SELECT task_id FROM tasks WHERE home_id = ? AND task_name = ? AND task_id != ?", 
                [home_id, updates.task_name, task_id]
            );
            
            if (existingTasks.length > 0) {
                return res.status(400).json({ 
                    error: "A task with this name already exists in this home. Choose a different name." 
                });
            }
        }
        
        // Convert updates object to SQL format
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        
        // Add task_id to values array
        values.push(task_id);
        
        // Update task
        await query(`UPDATE tasks SET ${fields} WHERE task_id = ?`, values);
        
        res.json({ message: "Task updated successfully." });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Delete a task
router.delete('/:task_id', authenticateToken, async (req, res) => {
    const task_id = req.params.task_id;
    
    try {
        // Get task to check home_id
        const tasks = await query("SELECT home_id FROM tasks WHERE task_id = ?", [task_id]);
        
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        
        const home_id = tasks[0].home_id;
        
        // Check if user is admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Only home admins can delete tasks." });
        }
        
        // Delete the task (cascade will handle related records)
        await query("DELETE FROM tasks WHERE task_id = ?", [task_id]);
        
        res.json({ message: "Task deleted successfully." });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get all unclaimed tasks for a home
router.get('/unclaimed/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get tasks that have no active assignments
        const unclaimedTasks = await query(
            `SELECT t.* 
             FROM tasks t
             LEFT JOIN (
                SELECT ta.task_id
                FROM task_assignments ta
                WHERE ta.status = 'pending'
             ) as a ON t.task_id = a.task_id
             WHERE t.home_id = ? AND a.task_id IS NULL`,
            [home_id]
        );
        
        res.json(unclaimedTasks);
    } catch (error) {
        console.error("Error fetching unclaimed tasks:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get tasks by type (emergency or regular)
router.get('/type/:task_type/home/:home_id', authenticateToken, async (req, res) => {
    const { task_type, home_id } = req.params;
    
    // Validate task type
    if (!['regular', 'emergency'].includes(task_type)) {
        return res.status(400).json({ error: "Task type must be regular or emergency." });
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
        
        // Get tasks by type
        const tasks = await query(
            "SELECT * FROM tasks WHERE home_id = ? AND task_type = ?",
            [home_id, task_type]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error(`Error fetching ${task_type} tasks:`, error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;