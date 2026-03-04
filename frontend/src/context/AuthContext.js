/**
 * Authentication Context for Kazilink
 * Manages Supabase authentication state and provides auth methods
 * Handles user session management and auth state changes
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Create authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // User state and loading state
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Initialize authentication state on app load
     * Retrieves current session from Supabase
     */
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session retrieval error:', error);
      }
      // Set user from session or null if no session
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Get initial session
    getSession();

    /**
     * Listen for authentication state changes
     * Updates user state when user signs in/out
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        if (!session) setBackendUser(null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Verify session with backend and cache the profile
   */
  const verifySession = async (axiosInstance) => {
    if (backendUser) return backendUser;

    try {
      const { data } = await axiosInstance.get('/auth/me');
      setBackendUser(data);
      return data;
    } catch (err) {
      setBackendUser(null);
      return null;
    }
  };

  /**
   * Sign up new user with Supabase
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user metadata
   * @param {object} opts - Additional options
   * @returns {Promise<{data, error}>} Supabase response
   */
  const signUp = async (email, password, userData = {}, opts = {}) => {
    // Extract email redirect URL from options
    const emailRedirectTo = userData.emailRedirectTo || opts.emailRedirectTo;

    // Prepare metadata
    const metadata = { ...userData };
    if (metadata.emailRedirectTo) delete metadata.emailRedirectTo;

    const options = { data: metadata };
    if (emailRedirectTo) options.emailRedirectTo = emailRedirectTo;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    return { data, error };
  };

  /**
   * Sign in existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{data, error}>} Supabase response
   */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  /**
   * Sign out current user
   * @returns {Promise<{error}>} Supabase response
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setBackendUser(null);
    return { error };
  };

  // Context value object
  const value = {
    user,
    backendUser,
    loading,
    signUp,
    signIn,
    signOut,
    verifySession,
    setBackendUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * @returns {object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
