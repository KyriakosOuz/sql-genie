
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// These should be set in the Lovable project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uugdlxzevfyodglfrxdb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Z2RseHpldmZ5b2RnbGZyeGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTgxMTEsImV4cCI6MjA1Njc5NDExMX0.MRuNyTt64GX_O4i0pKeCvsQ186hDVnFLnFnR99YsNbc';

// Check if valid Supabase credentials are provided
const hasValidCredentials = 
  supabaseUrl !== 'https://placeholder-url.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key';

// Display warning if environment variables are missing
if (!hasValidCredentials) {
  console.warn('Missing or invalid Supabase environment variables. Some features will be disabled. Please connect your Supabase project in the Lovable project settings.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials;

// Types for our database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Query = {
  id: number;
  user_id: string;
  prompt: string;
  sql_result: string;
  schema: string;
  created_at: string;
};

export type UploadedSchema = {
  id: number;
  user_id: string;
  name: string;
  schema_sql: string;
  created_at: string;
};
