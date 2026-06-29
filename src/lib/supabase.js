import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cacniprnjuwuavhhfowu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Session lives only as long as the tab is open.
    // Closing the tab or browser clears the session — staff must log in again.
    // This prevents unauthorised access if someone walks up to an unlocked device.
    persistSession: false,
    autoRefreshToken: true,
  },
});
