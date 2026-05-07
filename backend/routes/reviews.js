// Review Routes
// Handles task review operations (approve/reject)

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Approve task
router.post('/approve/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { reviewerId, feedback } = req.body;

        // Update task status
        const { error: taskError } = await supabase
            .from('tasks')
            .update({
                status: 'verified_completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (taskError) {
            return res.status(400).json({ error: taskError.message });
        }

        // Create review record
        const { data: review, error: reviewError } = await supabase
            .from('task_reviews')
            .insert({
                task_id: taskId,
                reviewer_id: reviewerId,
                action: 'approved',
                feedback: feedback || 'Task approved. Good work!'
            })
            .select()
            .single();

        if (reviewError) {
            console.error('Review record error:', reviewError);
        }

        // Get task details for notification
        const { data: task } = await supabase
            .from('tasks')
            .select('title, assigned_to')
            .eq('id', taskId)
            .single();

        // Create notification for member
        if (task && task.assigned_to) {
            await supabase.from('notifications').insert({
                user_id: task.assigned_to,
                title: 'Task Approved',
                message: `Your task "${task.title}" has been approved!`
            });
        }

        res.json({ message: 'Task approved!', review });
    } catch (err) {
        console.error('Approve task error:', err);
        res.status(500).json({ error: 'Failed to approve task' });
    }
});

// Request rework
router.post('/rework/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { reviewerId, feedback } = req.body;

        if (!feedback) {
            return res.status(400).json({ error: 'Feedback is required for rework request' });
        }

        // Update task status
        const { error: taskError } = await supabase
            .from('tasks')
            .update({
                status: 'needs_rework',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (taskError) {
            return res.status(400).json({ error: taskError.message });
        }

        // Create review record
        const { data: review, error: reviewError } = await supabase
            .from('task_reviews')
            .insert({
                task_id: taskId,
                reviewer_id: reviewerId,
                action: 'rework_requested',
                feedback: feedback
            })
            .select()
            .single();

        if (reviewError) {
            console.error('Review record error:', reviewError);
        }

        // Get task details for notification
        const { data: task } = await supabase
            .from('tasks')
            .select('title, assigned_to')
            .eq('id', taskId)
            .single();

        // Create notification for member
        if (task && task.assigned_to) {
            await supabase.from('notifications').insert({
                user_id: task.assigned_to,
                title: 'Rework Requested',
                message: `Your task "${task.title}" needs rework: ${feedback}`
            });
        }

        res.json({ message: 'Rework requested!', review });
    } catch (err) {
        console.error('Request rework error:', err);
        res.status(500).json({ error: 'Failed to request rework' });
    }
});

// Get all reviews for a task
router.get('/task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const { data, error } = await supabase
            .from('task_reviews')
            .select(`
                *,
                reviewer:profiles(full_name)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

module.exports = router;
