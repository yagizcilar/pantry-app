import { createClient } from '@supabase/supabase-js'

// --- PASTE YOUR KEYS INSIDE THE QUOTES BELOW ---

// 1. Go to Supabase -> Settings (Gear Icon) -> API
// 2. Copy "Project URL" and paste it here:
const supabaseUrl = "https://vcxswacmsxpcbyhnkznm.supabase.co" 

// 3. Copy "Project API Key (anon/public)" and paste it here:
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeHN3YWNtc3hwY2J5aG5rem5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTU4MjAsImV4cCI6MjA4MTI5MTgyMH0.Y8MQLh1z-OonG5HaYKxqUtR7-0bj8O8HWoQ_jUsE0oc"

// ------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey)