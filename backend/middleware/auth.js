// Authentication Middleware
// Checks if user is logged in and has correct role

const supabase = require('../config/supabase');

// Verify user token
async function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// Check if user is admin/team lead
async function isAdmin(req, res, next) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({ error: 'Profile not found' });
        }

        if (profile.role !== 'team_lead') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (err) {
        console.error('Admin check error:', err);
        res.status(500).json({ error: 'Authorization failed' });
    }
}

module.exports = { verifyToken, isAdmin };
