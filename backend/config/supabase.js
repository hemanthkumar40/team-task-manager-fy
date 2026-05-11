// Supabase Configuration
// This file sets up the connection to our Supabase database

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URLhttps://tbgrvjcggbxcbxqxxgeq.supabase.co;
const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZ3J2amNnZ2J4Y2J4cXh4Z2VxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NTk5NywiZXhwIjoyMDkzNzQxOTk3fQ.1knVZa315tunsKrsOyaetPSua91QCVKsAQ45PVAJWpQ;

// Create Supabase client with service role for backend operations
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
