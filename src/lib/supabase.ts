
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// These should be set in the Lovable project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure the required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect your Supabase project in the Lovable project settings.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
