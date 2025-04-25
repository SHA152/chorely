const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Create a new home
router.post('/', authenticateToken, async (req, res) => {
    const { home_name } = req.body;
    
    if (!home_name) {
        return res.status(400).json({ error: "Home name is required." });
    }

    try {
        // Check if home with this name exists
        const existingHomes = await query(
            "SELECT home_id FROM homes WHERE home_name = ?", 
            [home_name]
        );

        if (existingHomes.length > 0) {
            return res.status(400).json({ 
                error: "A home with this name already exists. Choose a different name." 
            });
        }

        // Create new home
        const result = await query(
            "INSERT INTO homes (home_name, admin_id) VALUES (?, ?)", 
            [home_name, req.user.user_id]
        );

        // Add creator as admin in home_users table
        await query(
            "INSERT INTO home_users (home_id, user_id, role) VALUES (?, ?, 'admin')",
            [result.insertId, req.user.user_id]
        );
        
        res.status(201).json({ 
            message: "🏠 Home created successfully!", 
            home_id: result.insertId 
        });
    } catch (error) {
        console.error("Error creating home:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get homes for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const homes = await query(
            `SELECT h.* 
             FROM homes h
             JOIN home_users hu ON h.home_id = hu.home_id
             WHERE hu.user_id = ?`,
            [req.user.user_id]
        );
        res.json(homes);
    } catch (error) {
        console.error("Error fetching homes:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get a specific home by ID
router.get('/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            `SELECT h.* 
             FROM homes h
             JOIN home_users hu ON h.home_id = hu.home_id
             WHERE h.home_id = ? AND hu.user_id = ?`,
            [home_id, req.user.user_id]
        );

        if (homeAccess.length === 0) {
            return res.status(404).json({ error: "Home not found or access denied." });
        }

        res.json(homeAccess[0]);

    } catch (error) {
        console.error("Error fetching home:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Add a user to a home
router.post('/:home_id/users', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { user_email, role = 'member' } = req.body;
    
    if (!user_email) {
        return res.status(400).json({ error: "User email is required." });
    }
    
    // Validate role
    if (role !== 'admin' && role !== 'member') {
        return res.status(400).json({ error: "Role must be either 'admin' or 'member'." });
    }
    
    try {
        // Check if the current user is an admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Only home admins can add users." });
        }
        
        // Find the user by email
        const users = await query(
            "SELECT user_id FROM users WHERE email = ?",
            [user_email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        
        const userId = users[0].user_id;
        
        // Check if user is already in the home
        const existingMember = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, userId]
        );
        
        if (existingMember.length > 0) {
            return res.status(400).json({ error: "User is already a member of this home." });
        }
        
        // Add user to home
        await query(
            "INSERT INTO home_users (home_id, user_id, role) VALUES (?, ?, ?)",
            [home_id, userId, role]
        );
        
        // Create notification for the added user
        await query(
            "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
            [userId, `You have been added to a new home: ${home_id}`]
        );
        
        res.status(201).json({ message: "User added to home successfully." });
    } catch (error) {
        console.error("Error adding user to home:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Update a user's role or status in a home
router.put('/:home_id/users/:user_id', authenticateToken, async (req, res) => {
    const { home_id, user_id } = req.params;
    const { role, status } = req.body;
    const updates = {};
    
    // Build update object with only provided fields
    if (role !== undefined) {
        if (role !== 'admin' && role !== 'member') {
            return res.status(400).json({ error: "Role must be either 'admin' or 'member'." });
        }
        updates.role = role;
    }
    
    if (status !== undefined) {
        if (status !== 'active' && status !== 'paused') {
            return res.status(400).json({ error: "Status must be either 'active' or 'paused'." });
        }
        updates.status = status;
    }
    
    // If no fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update." });
    }
    
    try {
        // Check if the current user is an admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Only home admins can update user roles or status." });
        }
        
        // Convert updates object to SQL format
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        
        // Add home_id and user_id to values array
        values.push(home_id, user_id);
        
        // Update user role/status
        const result = await query(
            `UPDATE home_users SET ${fields} WHERE home_id = ? AND user_id = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found in this home." });
        }
        
        res.json({ message: "User updated successfully." });
    } catch (error) {
        console.error("Error updating home user:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get all users in a home
router.get('/:home_id/users', authenticateToken, async (req, res) => {
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
        
        // Get all users in the home
        const users = await query(
            `SELECT u.user_id, u.name, u.email, u.avatar_id, hu.role, hu.status
             FROM users u
             JOIN home_users hu ON u.user_id = hu.user_id
             WHERE hu.home_id = ?`,
            [home_id]
        );
        
        res.json(users);
    } catch (error) {
        console.error("Error fetching home users:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Remove a user from a home
router.delete('/:home_id/users/:user_id', authenticateToken, async (req, res) => {
    const { home_id, user_id } = req.params;
    
    try {
        // Check if the current user is an admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [home_id, req.user.user_id]
        );
        
        // Allow users to remove themselves
        const isSelfRemoval = parseInt(user_id) === req.user.user_id;
        
        if (adminCheck.length === 0 && !isSelfRemoval) {
            return res.status(403).json({ error: "Only home admins can remove users." });
        }
        
        // Check if user is in the home
        const memberCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, user_id]
        );
        
        if (memberCheck.length === 0) {
            return res.status(404).json({ error: "User is not a member of this home." });
        }
        
        // Remove user from home
        await query(
            "DELETE FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, user_id]
        );
        
        res.json({ message: "User removed from home successfully." });
    } catch (error) {
        console.error("Error removing user from home:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;