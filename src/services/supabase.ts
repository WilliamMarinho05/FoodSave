import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://localhost:3000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibXBuY2Noa2Z0aWtrcHZhbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzExNDksImV4cCI6MjEwNDY0NzE0OX0.tZQZVcgyeiuXHPEBt_jwqHtjpaduAzfV1j9CLdp94Ik';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});