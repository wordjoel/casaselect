/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || "";

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== "YOUR_SUPABASE_URL") 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.info("Supabase credentials not fully configured. Running database layer in local Express fallback mode.");
}
