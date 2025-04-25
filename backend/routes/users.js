const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const users = await query(
            "SELECT user_id, name, email, avatar_id, created_at FROM users WHERE user_id = ?", 
            [req.user.user_id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, avatar_id } = req.body;
    const updates = {};
    
    // Build update object with only provided fields
    if (name !== undefined) updates.name = name;
    if (avatar_id !== undefined) updates.avatar_id = avatar_id;
    
    // If no fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update." });
    }
    
    try {
        // Convert updates object to SQL format
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        
        // Add user_id to values array
        values.push(req.user.user_id);
        
        await query(`UPDATE users SET ${fields} WHERE user_id = ?`, values);
        
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get all users (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await query(
            "SELECT user_id, name, email, avatar_id, created_at FROM users"
        );
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;