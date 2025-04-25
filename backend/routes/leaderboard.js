const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard for a home (current month)
router.get('/homes/:home_id', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { month, year } = req.query;
    
    // Default to current month/year if not specified
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1; // JS months are 0-indexed
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get leaderboard data
        const leaderboard = await query(
            `SELECT l.user_id, u.name, u.avatar_id, l.total_points, l.month, l.year
             FROM leaderboard l
             JOIN users u ON l.user_id = u.user_id
             WHERE l.home_id = ? AND l.month = ? AND l.year = ?
             ORDER BY l.total_points DESC`,
            [home_id, currentMonth, currentYear]
        );
        
        // Get home name
        const homes = await query("SELECT home_name FROM homes WHERE home_id = ?", [home_id]);
        const homeName = homes.length > 0 ? homes[0].home_name : "Unknown";
        
        res.json({
            home_id,
            home_name: homeName,
            month: currentMonth,
            year: currentYear,
            leaderboard
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get user stats across all homes
router.get('/user/stats', authenticateToken, async (req, res) => {
    try {
        // Get total points by home
        const pointsByHome = await query(
            `SELECT h.home_id, h.home_name, SUM(l.total_points) as total_points
             FROM leaderboard l
             JOIN homes h ON l.home_id = h.home_id
             WHERE l.user_id = ?
             GROUP BY l.home_id
             ORDER BY total_points DESC`,
            [req.user.user_id]
        );
        
        // Get total tasks completed
        const tasksCompleted = await query(
            `SELECT COUNT(*) as total_completed
             FROM task_completion tc
             JOIN task_assignments ta ON tc.assignment_id = ta.assignment_id
             WHERE tc.completed_by = ?`,
            [req.user.user_id]
        );
        
        // Get monthly completion trends
        const monthlyTrends = await query(
            `SELECT l.month, l.year, SUM(l.total_points) as monthly_points
             FROM leaderboard l
             WHERE l.user_id = ?
             GROUP BY l.year, l.month
             ORDER BY l.year DESC, l.month DESC
             LIMIT 6`,
            [req.user.user_id]
        );
        
        // Combine stats
        const stats = {
            total_points: pointsByHome.reduce((sum, item) => sum + item.total_points, 0),
            total_tasks_completed: tasksCompleted[0].total_completed,
            points_by_home: pointsByHome,
            monthly_trends: monthlyTrends
        };
        
        res.json(stats);
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get lowest scorers for a home (for task redistribution)
router.get('/homes/:home_id/lowest-scorers', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { limit = 5 } = req.query;
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get active users with lowest points
        const lowestScorers = await query(
            `SELECT u.user_id, u.name, u.avatar_id, COALESCE(l.total_points, 0) as total_points
             FROM home_users hu
             JOIN users u ON hu.user_id = u.user_id
             LEFT JOIN leaderboard l ON hu.user_id = l.user_id AND l.home_id = ? 
                AND l.month = MONTH(CURDATE()) AND l.year = YEAR(CURDATE())
             WHERE hu.home_id = ? AND hu.status = 'active'
             ORDER BY total_points ASC, u.name
             LIMIT ?`,
            [home_id, home_id, parseInt(limit)]
        );
        
        res.json(lowestScorers);
    } catch (error) {
        console.error("Error fetching lowest scorers:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Get yearly leaderboard summary (monthly winners)
router.get('/homes/:home_id/yearly-summary', authenticateToken, async (req, res) => {
    const home_id = req.params.home_id;
    const { year } = req.query;
    
    // Default to current year if not specified
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    try {
        // Check if user has access to this home
        const homeAccess = await query(
            "SELECT * FROM home_users WHERE home_id = ? AND user_id = ?",
            [home_id, req.user.user_id]
        );
        
        if (homeAccess.length === 0) {
            return res.status(403).json({ error: "Access denied to this home." });
        }
        
        // Get monthly winners for the year
        const monthlyWinners = await query(
            `SELECT 
                l.month,
                l.year,
                l.user_id,
                u.name,
                u.avatar_id,
                l.total_points
             FROM 
                (SELECT 
                    home_id, month, year, MAX(total_points) as max_points
                 FROM 
                    leaderboard
                 WHERE 
                    home_id = ? AND year = ?
                 GROUP BY 
                    month, year) as winners
             JOIN 
                leaderboard l ON winners.home_id = l.home_id AND winners.month = l.month 
                AND winners.year = l.year AND winners.max_points = l.total_points
             JOIN 
                users u ON l.user_id = u.user_id
             ORDER BY 
                l.year, l.month`,
            [home_id, currentYear]
        );
        
        // Get home name
        const homes = await query("SELECT home_name FROM homes WHERE home_id = ?", [home_id]);
        const homeName = homes.length > 0 ? homes[0].home_name : "Unknown";
        
        res.json({
            home_id,
            home_name: homeName,
            year: currentYear,
            monthly_winners: monthlyWinners
        });
    } catch (error) {
        console.error("Error fetching yearly summary:", error);
        res.status(500).json({ error: "Database error." });
    }
});

module.exports = router;