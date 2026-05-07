// Member Routes
// Handles team member operations

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all members
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get members error:', err);
        res.status(500).json({ error: 'Failed to get members' });
    }
});

// Get team members only (not team leads)
router.get('/team-members', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'team_member')
            .order('full_name');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get team members error:', err);
        res.status(500).json({ error: 'Failed to get team members' });
    }
});

// Get team leads only
router.get('/team-leads', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'team_lead')
            .order('full_name');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get team leads error:', err);
        res.status(500).json({ error: 'Failed to get team leads' });
    }
});

// Get single member
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Get member error:', err);
        res.status(500).json({ error: 'Failed to get member' });
    }
});

// Update member profile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Profile updated!', profile: data });
    } catch (err) {
        console.error('Update member error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get member stats
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;

        // Get task counts by status
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('status')
            .eq('assigned_to', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const stats = {
            total: tasks.length,
            not_started: tasks.filter(t => t.status === 'not_started').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            pending_review: tasks.filter(t => t.status === 'pending_review').length,
            verified_completed: tasks.filter(t => t.status === 'verified_completed').length,
            needs_rework: tasks.filter(t => t.status === 'needs_rework').length,
            overdue: tasks.filter(t => t.status === 'overdue').length
        };

        res.json(stats);
    } catch (err) {
        console.error('Get member stats error:', err);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
