
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://muvysxyjdpzdufmkyza.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dnlzeHlqZHB6ZHVmcW1reXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjMyMjEsImV4cCI6MjA4ODAzOTIyMX0.c2sL00EuCT_RiYLXgAPlo6_a_xSlun0lqIa06DjbCJw'

export const supabase = createClient(supabaseUrl, supabaseKey)
