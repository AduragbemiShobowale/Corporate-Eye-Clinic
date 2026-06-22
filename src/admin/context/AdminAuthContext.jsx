import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession]   = useState(undefined); // undefined = loading
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, branch")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // User exists in Auth but has no profiles row — treat as unauthorised.
      await supabase.auth.signOut();
      setProfile(null);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    // Get the current session on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for sign-in / sign-out events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // Convenience role checks used throughout the admin panel.
  const isSuperAdmin = profile?.role === "super_admin";
  const isStaff      = profile?.role === "staff";
  const isDoctor     = profile?.role === "doctor";
  const isAdmin      = isSuperAdmin || isStaff; // shorthand: can access operations pages

  return (
    <AdminAuthContext.Provider
      value={{ session, profile, loading, signIn, signOut,
               isSuperAdmin, isStaff, isDoctor, isAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
