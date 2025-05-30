
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://inbkdayhwatpnfciqfvd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluYmtkYXlod2F0cG5mY2lxZnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjc5MTgsImV4cCI6MjA2NDEwMzkxOH0.0M2Sx4L44RfOVVhUG2VQlT4rT0cMZw23HS9UKW_twu0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
