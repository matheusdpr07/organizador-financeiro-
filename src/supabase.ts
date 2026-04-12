import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjfyjucviopwvoywjge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnamZ5anVjdmlvcHd2b3l3amdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjMyMTgsImV4cCI6MjA5MTUzOTIxOH0.4iHhYffzvVLrIwEL2o86jVhuhqvjEFfxQJKOP-tVCqk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
