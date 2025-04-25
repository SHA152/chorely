const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get messages for a specific home
router.get('/homes/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { limit = 50, before } = req.query;
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Build query based on whether 'before' timestamp is provided
        let sql = `
            SELECT m.*, u.name as user_name, u.avatar_id 
            FROM chat_messages m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.home_id = ?
        `;
        
        const params = [home_id];
        
        // Add timestamp filter if 'before' is provided
        if (before) {
            sql += " AND m.created_at < ?";
            params.push(new Date(before));
        }
        
        // Add order and limit
        sql += " ORDER BY m.created_at DESC LIMIT ?";
        params.push(parseInt(limit));
        
        const messages = await query(sql, params);
        
        // Reverse to get chronological order (oldest first)
        messages.reverse();
        
        res.json(messages);
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Send a new message
router.post('/homes/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { message_text } = req.body;
    
    if (!message_text || message_text.trim() === '') {
        return res.status(400).json({ error: "Message text is required." });
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
        
        // Insert the message
        const result = await query(
            "INSERT INTO chat_messages (home_id, user_id, message_text) VALUES (?, ?, ?)",
            [home_id, req.user.user_id, message_text.trim()]
        );
        
        // Get the inserted message with user details
        const messages = await query(
            `SELECT m.*, u.name as user_name, u.avatar_id 
             FROM chat_messages m
             JOIN users u ON m.user_id = u.user_id
             WHERE m.message_id = ?`,
            [result.insertId]
        );
        
        res.status(201).json(messages[0]);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Delete a message (only the sender can delete)
router.delete('/:message_id', authenticateToken, async (req, res) => {
    const message_id = req.params.message_id;
    
    try {
        // Check if message exists and belongs to the user
        const messages = await query(
            "SELECT * FROM chat_messages WHERE message_id = ?",
            [message_id]
        );
        
        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found." });
        }
        
        const message = messages[0];
        
        // Check if user is the sender
        if (message.user_id !== req.user.user_id) {
            return res.status(403).json({ error: "You can only delete your own messages." });
        }
        
        // Delete the message
        await query(
            "DELETE FROM chat_messages WHERE message_id = ?",
            [message_id]
        );
        
        res.json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;