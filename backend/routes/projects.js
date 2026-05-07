// Project Routes
// Handles CRUD operations for projects

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                created_by_profile:profiles!projects_created_by_fkey(full_name),
                project_members(
                    member:profiles(id, full_name, email)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(500).json({ error: 'Failed to get projects' });
    }
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                created_by_profile:profiles!projects_created_by_fkey(full_name),
                project_members(
                    member:profiles(id, full_name, email)
                ),
                tasks(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Failed to get project' });
    }
});

// Create project
router.post('/', async (req, res) => {
    try {
        const { name, description, startDate, deadline, createdBy } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const { data, error } = await supabase
            .from('projects')
            .insert({
                name: name,
                description: description || '',
                start_date: startDate || null,
                deadline: deadline || null,
                status: 'not_started',
                created_by: createdBy
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Project created!', project: data });
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, deadline, status } = req.body;

        const { data, error } = await supabase
            .from('projects')
            .update({
                name: name,
                description: description,
                start_date: startDate,
                deadline: deadline,
                status: status
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Project updated!', project: data });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Project deleted!' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Add member to project
router.post('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;

        const { data, error } = await supabase
            .from('project_members')
            .insert({
                project_id: id,
                member_id: memberId
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Member added to project!', data });
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Remove member from project
router.delete('/:id/members/:memberId', async (req, res) => {
    try {
        const { id, memberId } = req.params;

        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', id)
            .eq('member_id', memberId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Member removed from project!' });
    } catch (err) {
        console.error('Remove member error:', err);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// Get projects for a member
router.get('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;

        const { data, error } = await supabase
            .from('project_members')
            .select(`
                project:projects(*)
            `)
            .eq('member_id', memberId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const projects = data.map(item => item.project);
        res.json(projects);
    } catch (err) {
        console.error('Get member projects error:', err);
        res.status(500).json({ error: 'Failed to get projects' });
    }
});

module.exports = router;
