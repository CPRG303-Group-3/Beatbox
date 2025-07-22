import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://ckhxpakwwpmdnhjatxui.supabase.co";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraHhwYWt3d3BtZG5oamF0eHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDA0ODQsImV4cCI6MjA2ODcxNjQ4NH0.mE0_uONMlPFkAGKpJSWWWP_ii9rxLZxlxi_yMHcb2Ys";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
