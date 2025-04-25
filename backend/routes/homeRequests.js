const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

/**
 * Search for homes by name
 * This endpoint allows users to find homes they might want to join
 */
router.get('/search', authenticateToken, async (req, res) => {
    const { name } = req.query;
    
    if (!name || name.length < 3) {
        return res.status(400).json({ error: "Please provide at least 3 characters for search." });
    }
    
    try {
        // Get homes matching the search term, including member count
        const homes = await query(
            `SELECT h.home_id, h.home_name, COUNT(hu.user_id) as member_count, 
                    h.created_at, u.name as admin_name
             FROM homes h
             LEFT JOIN home_users hu ON h.home_id = hu.home_id
             LEFT JOIN users u ON h.admin_id = u.user_id
             WHERE h.home_name LIKE ?
             GROUP BY h.home_id
             ORDER BY h.home_name
             LIMIT 15`,
            [`%${name}%`]
        );
        
        // Check if user has pending requests for any of these homes
        if (homes.length > 0) {
            const homeIds = homes.map(home => home.home_id);
            
            const pendingRequests = await query(
                `SELECT home_id FROM home_join_requests 
                 WHERE user_id = ? AND home_id IN (?) AND status = 'pending'`,
                [req.user.user_id, homeIds]
            );
            
            // Create a set of home_ids with pending requests for faster lookup
            const pendingHomeIds = new Set(pendingRequests.map(req => req.home_id));
            
            // Add a flag to each home indicating if there's a pending request
            homes.forEach(home => {
                home.has_pending_request = pendingHomeIds.has(home.home_id);
            });
        }
        
        res.json(homes);
    } catch (error) {
        console.error("Error searching homes:", error);
        res.status(500).json({ error: "Database error." });
    }
});

/**
 * Request to join a home
 * Users can submit a request with an optional message to join a home
 */
router.post('/:home_id/request', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { request_message } = req.body;
    
    try {
        // Check if home exists
        const homes = await query("SELECT * FROM homes WHERE home_id = ?", [home_id]);
        
        if (homes.length === 0) {
            return res.status(404).json({ error: "Home not found." });
        }
        
        // Check if user is already a member
        const membership = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (membership.length > 0) {
            return res.status(400).json({ error: "You are already a member of this home." });
        }
        
        // Check if there's already a pending request
        const existingRequests = await query(
            "SELECT * FROM home_join_requests WHERE home_id = ? AND user_id = ? AND status = 'pending'",
            [home_id, req.user.user_id]
        );
        
        if (existingRequests.length > 0) {
            return res.status(400).json({ error: "You already have a pending request for this home." });
        }
        
        // Create the request
        await query(
            "INSERT INTO home_join_requests (home_id, user_id, request_message) VALUES (?, ?, ?)",
            [home_id, req.user.user_id, request_message || null]
        );
        
        // Notify home admins about the new request
        const admins = await query(
            "SELECT user_id FROM home_users WHERE home_id = ? AND role = 'admin'",
            [home_id]
        );
        
        for (const admin of admins) {
            await query(
                "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
                [admin.user_id, `${req.user.name} has requested to join your home "${homes[0].home_name}".`]
            );
        }
        
        res.status(201).json({ 
            message: "Join request sent successfully. You'll be notified when an admin responds." 
        });
    } catch (error) {
        console.error("Error creating join request:", error);
        res.status(500).json({ error: "Database error." });
    }
});

/**
 * Get user's pending requests
 * Users can view all their pending requests to join homes
 */
router.get('/my-requests', authenticateToken, async (req, res) => {
    try {
        const requests = await query(
            `SELECT r.*, h.home_name, h.admin_id, u.name as admin_name
             FROM home_join_requests r
             JOIN homes h ON r.home_id = h.home_id
             JOIN users u ON h.admin_id = u.user_id
             WHERE r.user_id = ? AND r.status = 'pending'
             ORDER BY r.created_at DESC`,
            [req.user.user_id]
        );
        
        res.json(requests);
    } catch (error) {
        console.error("Error fetching user's requests:", error);
        res.status(500).json({ error: "Database error." });
    }
});

/**
 * Cancel a pending join request
 * Users can cancel their own pending requests
 */
router.delete('/my-requests/:request_id', authenticateToken, async (req, res) => {
    const request_id = req.params.request_id;
    
    try {
        // Check if request exists and belongs to user
        const requests = await query(
            "SELECT * FROM home_join_requests WHERE request_id = ? AND user_id = ? AND status = 'pending'",
            [request_id, req.user.user_id]
        );
        
        if (requests.length === 0) {
            return res.status(404).json({ error: "Request not found or already processed." });
        }
        
        // Delete the request
        await query(
            "DELETE FROM home_join_requests WHERE request_id = ?",
            [request_id]
        );
        
        res.json({ message: "Request cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling request:", error);
        res.status(500).json({ error: "Database error." });
    }
});

/**
 * Get pending requests for admin
 * Admins can view all pending requests for homes they manage
 */
router.get('/pending-requests', authenticateToken, async (req, res) => {
    try {
        // Get homes where user is admin
        const adminHomes = await query(
            "SELECT home_id FROM home_users WHERE user_id = ? AND role = 'admin'",
            [req.user.user_id]
        );
        
        if (adminHomes.length === 0) {
            return res.json({ 
                message: "You don't have admin access to any homes.",
                requests: [] 
            });
        }
        
        // Get home IDs as array
        const homeIds = adminHomes.map(home => home.home_id);
        
        // Get pending requests for these homes
        const requests = await query(
            `SELECT r.*, h.home_name, u.name as user_name, u.email, u.avatar_id
             FROM home_join_requests r
             JOIN homes h ON r.home_id = h.home_id
             JOIN users u ON r.user_id = u.user_id
             WHERE r.home_id IN (?) AND r.status = 'pending'
             ORDER BY r.created_at DESC`,
            [homeIds]
        );
        
        res.json({
            count: requests.length,
            requests: requests
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: "Database error." });
    }
});

/**
 * Respond to a join request
 * Admins can accept or reject membership requests
 */
router.put('/request/:request_id', authenticateToken, async (req, res) => {
    const request_id = req.params.request_id;
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Status must be either 'accepted' or 'rejected'." });
    }
    
    try {
        // Get request details
        const requests = await query(
            "SELECT r.*, h.home_name FROM home_join_requests r JOIN homes h ON r.home_id = h.home_id WHERE r.request_id = ?",
            [request_id]
        );
        
        if (requests.length === 0) {
            return res.status(404).json({ error: "Request not found." });
        }
        
        const request = requests[0];
        
        // Check if user is admin of this home
        const adminCheck = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ? AND role = 'admin'",
            [request.home_id, req.user.user_id]
        );
        
        if (adminCheck.length === 0) {
            return res.status(403).json({ error: "Only home admins can respond to join requests." });
        }
        
        // Update request status
        await query(
            "UPDATE home_join_requests SET status = ? WHERE request_id = ?",
            [status, request_id]
        );
        
        if (status === 'accepted') {
            // Check if user is already a member (maybe added by another admin)
            const existingMember = await query(
                "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
                [request.home_id, request.user_id]
            );
            
            if (existingMember.length === 0) {
                // Add user to home
                await query(
                    "INSERT INTO home_users (home_id, user_id, role) VALUES (?, ?, 'member')",
                    [request.home_id, request.user_id]
                );
            }
        }
        
        // Get user name for notification
        const users = await query(
            "SELECT name FROM users WHERE user_id = ?",
            [request.user_id]
        );
        
        const userName = users[0]?.name || "User";
        
        // Notify the requesting user
        await query(
            "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
            [
                request.user_id, 
                status === 'accepted' 
                    ? `Your request to join ${request.home_name} has been accepted.` 
                    : `Your request to join ${request.home_name} has been declined.`
            ]
        );
        
        res.json({ 
            message: `Request from ${userName} ${status === 'accepted' ? 'accepted' : 'rejected'} successfully.` 
        });
    } catch (error) {
        console.error("Error responding to join request:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;