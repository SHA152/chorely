const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
    const { limit = 20, offset = 0, unread_only = false } = req.query;
    
    try {
        let sql = "SELECT * FROM notifications WHERE user_id = ?";
        const params = [req.user.user_id];
        
        // Filter by unread if requested
        if (unread_only === 'true') {
            sql += " AND is_read = FALSE";
        }
        
        // Add sorting and pagination
        sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));
        
        const notifications = await query(sql, params);
        
        // Get total count for pagination
        const countResult = await query(
            `SELECT COUNT(*) as total FROM notifications WHERE user_id = ? ${unread_only === 'true' ? 'AND is_read = FALSE' : ''}`,
            [req.user.user_id]
        );
        
        res.json({
            notifications,
            total: countResult[0].total,
            has_more: notifications.length + parseInt(offset) < countResult[0].total
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Mark notifications as read
router.put('/read', authenticateToken, async (req, res) => {
    const { notification_ids } = req.body;
    
    // Validate input
    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({ error: "Please provide an array of notification IDs." });
    }
    
    try {
        // Make sure all notifications belong to the current user
        const notificationCheck = await query(
            "SELECT notification_id FROM notifications WHERE notification_id IN (?) AND user_id = ?",
            [notification_ids, req.user.user_id]
        );
        
        if (notificationCheck.length !== notification_ids.length) {
            return res.status(403).json({ error: "Some notifications don't belong to the current user." });
        }
        
        // Mark notifications as read
        await query(
            "UPDATE notifications SET is_read = TRUE WHERE notification_id IN (?)",
            [notification_ids]
        );
        
        res.json({ message: "Notifications marked as read successfully." });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        await query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
            [req.user.user_id]
        );
        
        res.json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Delete a notification
router.delete('/:notification_id', authenticateToken, async (req, res) => {
    const notification_id = req.params.notification_id;
    
    try {
        // Check if notification belongs to the current user
        const notificationCheck = await query(
            "SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?",
            [notification_id, req.user.user_id]
        );
        
        if (notificationCheck.length === 0) {
            return res.status(404).json({ error: "Notification not found." });
        }
        
        // Delete the notification
        await query(
            "DELETE FROM notifications WHERE notification_id = ?",
            [notification_id]
        );
        
        res.json({ message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get unread notification count
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const countResult = await query(
            "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE",
            [req.user.user_id]
        );
        
        res.json({ unread_count: countResult[0].unread_count });
    } catch (error) {
        console.error("Error counting unread notifications:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;