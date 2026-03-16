import express from 'express';
import bcrypt  from 'bcryptjs';
import User    from '../models/User.js';

const router = express.Router();

// ─── Helper: safe public user object (never expose hashed password) ───────────
function safeUser(u) {
    return {
        id:           u._id,
        username:     u.username,
        email:        u.email,
        profilePhoto: u.profilePhoto || '',
        avatarColor:  u.avatarColor  || '#7c6eff',
        bio:          u.bio          || '',
        provider:     u.provider     || 'local',
        createdAt:    u.createdAt,
    };
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Validate email format
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must include both letters and numbers.' });
        }

        // Check for duplicate email
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Hash password and create user
        const hashed = await bcrypt.hash(password, 12);
        const user   = await User.create({
            username: username.trim(),
            email:    email.toLowerCase().trim(),
            password: hashed,
            provider: 'local',
        });

        console.log(`[signup] New user created: ${user.email}`);
        return res.status(201).json({ success: true, user: safeUser(user) });

    } catch (error) {
        console.error('[signup error]', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Sign up failed.' });
    }
});

// ─── POST /api/auth/signin ────────────────────────────────────────────────────
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Verify hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        console.log(`[signin] User logged in: ${user.email}`);
        return res.status(200).json({ success: true, user: safeUser(user) });

    } catch (error) {
        console.error('[signin error]', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Sign in failed.' });
    }
});

export default router;
