const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { query } = require('../config/db');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || "fallback_default_secret";

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // Validate minimum password length only (simplified requirement)
    if (password.length < 6) {
        return res.status(400).json({ 
            error: "Password must be at least 6 characters long." 
        });
    }

    try {
        // Check if user already exists
        const existingUsers = await query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already registered. Try logging in!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const result = await query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
            [name, email, hashedPassword]
        );

        // Generate token for immediate login
        const token = jwt.sign(
            { user_id: result.insertId, email: email }, 
            jwtSecret, 
            { expiresIn: "7d" }
        );

        res.status(201).json({ 
            message: "🙌 User registered successfully!", 
            user_id: result.insertId,
            token 
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal Server Error." });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Get user by email
        const users = await query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = users[0];
        
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email }, 
            jwtSecret, 
            { expiresIn: "7d" }
        );

        res.json({ 
            message: "✅ Login successful!", 
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            avatar_id: user.avatar_id,
            token 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Database error." });
    }
});

// Helper function to generate random token
const generateResetToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

// Password reset request
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }
    
    try {
        // Check if user exists
        const users = await query("SELECT user_id FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            // For security reasons, still return success even if email not found
            return res.json({ message: "If your email is registered, you will receive password reset instructions." });
        }
        
        const user = users[0];
        
        // Generate reset token
        const resetToken = generateResetToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        
        // Store the token in the database
        // First, check if there's an existing token for this user and delete it
        await query("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.user_id]);
        
        // Insert new token
        await query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
            [user.user_id, resetToken, tokenExpiry]
        );
        
        // In a production app, we would send an email with a link to reset the password
        // For now, we'll just return the token in the response for testing
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        
        console.log(`Password reset link: ${resetLink}`);
        
        res.json({ 
            message: "If your email is registered, you will receive password reset instructions.",
            // Only in development, expose the token and link
            ...(process.env.NODE_ENV === 'development' && { 
                token: resetToken, 
                resetLink: resetLink 
            })
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ error: "Token and new password are required." });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    
    try {
        // Find the token in the database
        const tokens = await query(
            "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()",
            [token]
        );
        
        if (tokens.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }
        
        const tokenRecord = tokens[0];
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update the user's password
        await query(
            "UPDATE users SET password_hash = ? WHERE user_id = ?",
            [hashedPassword, tokenRecord.user_id]
        );
        
        // Delete the token so it can't be used again
        await query("DELETE FROM password_reset_tokens WHERE token = ?", [token]);
        
        res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;