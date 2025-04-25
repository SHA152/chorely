const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Toggle a user's break status in a home
router.put('/homes/:home_id/toggle-break', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { user_id, is_paused } = req.body;
    
    // Default to toggling the current user if no user_id is provided
    const targetUserId = user_id || req.user.user_id;
    
    // If not self-toggle, only admin can toggle other users
    const isSelfToggle = targetUserId === req.user.user_id;
    
    try {
        // If not toggling self, check admin permissions
        if (!isSelfToggle) {
            // Check if current user is an admin for this home
            const adminCheck = await query(
                "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
                [home_id, req.user.user_id]
            );
            
            if (adminCheck.length === 0) {
                return res.status(403).json({ error: "Only home admins can toggle break mode for other users." });
            }
        }
        
        // Check if target user exists in this home
        const userCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, targetUserId]
        );
        
        if (userCheck.length === 0) {
            return res.status(404).json({ error: "User not found in this home." });
        }
        
        const currentStatus = userCheck[0].status;
        
        // Determine new status
        let newStatus;
        if (is_paused !== undefined) {
            // Explicit setting based on request
            newStatus = is_paused ? 'paused' : 'active';
        } else {
            // Toggle current status
            newStatus = currentStatus === 'active' ? 'paused' : 'active';
        }
        
        // Update user status
        await query(
            "UPDATE home_users SET status = ? WHERE home_id = ? AND user_id = ?",
            [newStatus, home_id, targetUserId]
        );
        
        // If user is being paused, reassign their pending tasks
        if (newStatus === 'paused') {
            await reassignTasks(home_id, targetUserId);
        }
        
        res.json({ 
            message: `User ${newStatus === 'paused' ? 'paused' : 'activated'} successfully.`,
            user_id: targetUserId,
            status: newStatus
        });
    } catch (error) {
        console.error("Error toggling break mode:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Helper function to reassign tasks from a paused user to the lowest scorer
async function reassignTasks(home_id, pausedUserId) {
    try {
        // Get pending tasks assigned to the paused user
        const tasks = await query(
            `SELECT ta.assignment_id, ta.task_id
             FROM task_assignments ta
             JOIN tasks t ON ta.task_id = t.task_id
             WHERE t.home_id = ? AND ta.assigned_user_id = ? AND ta.status = 'pending'`,
            [home_id, pausedUserId]
        );
        
        if (tasks.length === 0) {
            return; // No tasks to reassign
        }
        
        // Find the lowest-scoring active user who is not the paused user
        const lowestScorers = await query(
            `SELECT hu.user_id, 
                    COALESCE(SUM(l.total_points), 0) as total_points
             FROM home_users hu
             LEFT JOIN leaderboard l ON hu.user_id = l.user_id 
                AND l.home_id = ? 
                AND l.month = MONTH(CURDATE()) 
                AND l.year = YEAR(CURDATE())
             WHERE hu.home_id = ? 
                AND hu.status = 'active' 
                AND hu.user_id != ?
             GROUP BY hu.user_id
             ORDER BY total_points ASC
             LIMIT 1`,
            [home_id, home_id, pausedUserId]
        );
        
        if (lowestScorers.length === 0) {
            return; // No active users to reassign to
        }
        
        const newAssigneeId = lowestScorers[0].user_id;
        
        // Reassign each task to the lowest scorer
        for (const task of tasks) {
            await query(
                `UPDATE task_assignments 
                 SET assigned_user_id = ?, 
                     assigned_by = NULL,
                     assigned_at = CURRENT_TIMESTAMP
                 WHERE assignment_id = ?`,
                [newAssigneeId, task.assignment_id]
            );
            
            // Create notification for the new assignee
            await query(
                "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
                [newAssigneeId, `A task has been reassigned to you because another user is on break.`]
            );
        }
        
        return tasks.length; // Return number of reassigned tasks
    } catch (error) {
        console.error("Error reassigning tasks:", error);
        throw error;
    }
}

module.exports = router;