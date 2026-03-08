import { supabase } from "@/integrations/supabase/client";

export function isGmailEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@gmail.com");
}

export async function signUp(email: string, password: string) {
  if (!isGmailEmail(email)) {
    return { error: { message: "Hanya email @gmail.com yang diizinkan untuk mendaftar." } };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function hasActiveSubscription(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase.rpc("has_active_subscription", { _user_id: user.id });
  return !!data;
}

export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return !!data;
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
  return data;
}
