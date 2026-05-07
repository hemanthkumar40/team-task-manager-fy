// Task Routes
// Handles CRUD operations for tasks

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(name),
                assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, email),
                created_by_profile:profiles!tasks_created_by_fkey(full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// Get tasks by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;

        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(name),
                assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, email)
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get tasks by status error:', err);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// Get tasks for a member
router.get('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;

        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(name),
                created_by_profile:profiles!tasks_created_by_fkey(full_name)
            `)
            .eq('assigned_to', memberId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get member tasks error:', err);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// Get single task
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(name),
                assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, email),
                created_by_profile:profiles!tasks_created_by_fkey(full_name),
                progress_notes(
                    *,
                    user:profiles(full_name)
                ),
                task_reviews(
                    *,
                    reviewer:profiles(full_name)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Get task error:', err);
        res.status(500).json({ error: 'Failed to get task' });
    }
});

// Create task
router.post('/', async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, dueDate, priority, createdBy } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ error: 'Title and project are required' });
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: title,
                description: description || '',
                project_id: projectId,
                assigned_to: assignedTo || null,
                due_date: dueDate || null,
                priority: priority || 'medium',
                status: 'not_started',
                created_by: createdBy
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Task created!', task: data });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, assignedTo, dueDate, priority, status } = req.body;

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
        if (dueDate !== undefined) updateData.due_date = dueDate;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Task updated!', task: data });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Submit task for review (member action)
router.put('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: 'pending_review',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Task submitted for review!', task: data });
    } catch (err) {
        console.error('Submit task error:', err);
        res.status(500).json({ error: 'Failed to submit task' });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Task deleted!' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Add progress note to task
router.post('/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { note, userId } = req.body;

        if (!note) {
            return res.status(400).json({ error: 'Note is required' });
        }

        const { data, error } = await supabase
            .from('progress_notes')
            .insert({
                task_id: id,
                user_id: userId,
                note: note
            })
            .select(`
                *,
                user:profiles(full_name)
            `)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Note added!', note: data });
    } catch (err) {
        console.error('Add note error:', err);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Get tasks pending review
router.get('/review/pending', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(name),
                assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, email),
                progress_notes(
                    *,
                    user:profiles(full_name)
                )
            `)
            .eq('status', 'pending_review')
            .order('updated_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get pending review tasks error:', err);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

module.exports = router;
