// Activity Routes
// Handles activity log operations

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all activities
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                *,
                user:profiles(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get activities error:', err);
        res.status(500).json({ error: 'Failed to get activities' });
    }
});

// Get activities for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get user activities error:', err);
        res.status(500).json({ error: 'Failed to get activities' });
    }
});

// Log activity
router.post('/', async (req, res) => {
    try {
        const { userId, action, entityType, entityId, details } = req.body;

        const { data, error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: userId,
                action: action,
                entity_type: entityType || null,
                entity_id: entityId || null,
                details: details || null
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Activity logged', activity: data });
    } catch (err) {
        console.error('Log activity error:', err);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
    try {
        // Get project count
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        // Get task counts by status
        const { data: tasks } = await supabase
            .from('tasks')
            .select('status');

        const taskStats = {
            total: tasks ? tasks.length : 0,
            not_started: tasks ? tasks.filter(t => t.status === 'not_started').length : 0,
            in_progress: tasks ? tasks.filter(t => t.status === 'in_progress').length : 0,
            pending_review: tasks ? tasks.filter(t => t.status === 'pending_review').length : 0,
            verified_completed: tasks ? tasks.filter(t => t.status === 'verified_completed').length : 0,
            needs_rework: tasks ? tasks.filter(t => t.status === 'needs_rework').length : 0,
            overdue: tasks ? tasks.filter(t => t.status === 'overdue').length : 0
        };

        // Get member count
        const { count: memberCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'team_member');

        res.json({
            projects: projectCount || 0,
            tasks: taskStats,
            members: memberCount || 0
        });
    } catch (err) {
        console.error('Get dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
