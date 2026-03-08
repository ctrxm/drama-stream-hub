import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  profile: { email: string; display_name: string | null; avatar_url: string | null } | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isSubscribed: false,
  isAdmin: false,
  profile: null,
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const fetchUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsSubscribed(false);
      setIsAdmin(false);
      setProfile(null);
      return;
    }

    const [subResult, roleResult, profileResult] = await Promise.all([
      supabase.rpc("has_active_subscription", { _user_id: currentUser.id }),
      supabase.rpc("has_role", { _user_id: currentUser.id, _role: "admin" }),
      supabase.from("profiles").select("email, display_name, avatar_url").eq("user_id", currentUser.id).single(),
    ]);

    setIsSubscribed(!!subResult.data);
    setIsAdmin(!!roleResult.data);
    setProfile(profileResult.data);
  };

  const refetch = async () => {
    await fetchUserData(user);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Use setTimeout to avoid potential deadlock with Supabase client
      setTimeout(() => fetchUserData(session?.user ?? null), 0);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchUserData(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isSubscribed, isAdmin, profile, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
