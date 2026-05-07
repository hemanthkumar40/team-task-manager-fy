// Authentication Routes
// Handles signup, login, logout

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Validate input
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role
            }
        });

        if (authError) {
            console.error('Signup error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        // Create profile in profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                email: email,
                role: role
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
        }

        res.json({ message: 'Account created successfully!', user: authData.user });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }

        res.json({
            message: 'Login successful!',
            user: data.user,
            profile: profile,
            session: data.session
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Get profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        res.json({ user, profile });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Seed demo users
router.post('/seed-demo', async (req, res) => {
    try {
        const demoUsers = [
            { email: 'teamlead1@test.com', password: 'admin123', fullName: 'Alex Thompson', role: 'team_lead' },
            { email: 'teamlead2@test.com', password: 'admin123', fullName: 'Sarah Chen', role: 'team_lead' },
            { email: 'member1@test.com', password: 'member123', fullName: 'Mike Johnson', role: 'team_member' },
            { email: 'member2@test.com', password: 'member123', fullName: 'Emily Davis', role: 'team_member' }
        ];

        const results = [];

        for (const user of demoUsers) {
            // Check if user exists
            const { data: existingUsers } = await supabase
                .from('profiles')
                .select('email')
                .eq('email', user.email);

            if (existingUsers && existingUsers.length > 0) {
                results.push({ email: user.email, status: 'already exists' });
                continue;
            }

            // Create user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    full_name: user.fullName,
                    role: user.role
                }
            });

            if (authError) {
                results.push({ email: user.email, status: 'error', message: authError.message });
                continue;
            }

            // Create profile
            await supabase.from('profiles').insert({
                id: authData.user.id,
                full_name: user.fullName,
                email: user.email,
                role: user.role
            });

            results.push({ email: user.email, status: 'created' });
        }

        res.json({ message: 'Demo users seeded', results });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: 'Failed to seed demo users' });
    }
});

module.exports = router;
