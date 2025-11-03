import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './utils/supabaseClient'; // Adjust path if you moved utils
import { Session, User } from '@supabase/supabase-js';

// Define the shape of our authentication context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  // signInWithGoogle: () => Promise<{ error: Error | null }>; // COMMENTED OUT
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup the listener on component unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, session: data.session, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user, session: data.session, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // const signInWithGoogle = async () => { // COMMENTED OUT
  //   const { data, error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       redirectTo: window.location.origin + '/auth/callback',
  //     },
  //   });
  //   return { error };
  // };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    // signInWithGoogle, // COMMENTED OUT
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};