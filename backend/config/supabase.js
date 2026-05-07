// Supabase Configuration
// This file sets up the connection to our Supabase database

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role for backend operations
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
