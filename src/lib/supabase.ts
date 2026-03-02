import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://chlmgcuiprarqhkanbbb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobG1nY3VpcHJhcnFoa2FuYmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjEwNTMsImV4cCI6MjA4ODAzNzA1M30.Gqk6gjk_dB5r3ALWiQd3Aii9ihvCHn-QuKUxFngwej0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
