import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://pfjvveisbzcfwdepekvh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmanZ2ZWlzYnpjZndkZXBla3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MDcwNTMsImV4cCI6MjAyMjM4MzA1M30.60MTpY891S65dsiSJUjGz-fgt4EYrITAwuJjbskp9Vc";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
