import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  profile: any;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<boolean>;
  savePaper: (paperData: any) => Promise<boolean>;
  savedPaperIds: Set<string>;
  updatePaperTags: (paperId: string, tags: string[]) => Promise<boolean>;
  getUserTags: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savedPaperIds, setSavedPaperIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeSavedPapers = async () => {
      if (user) {
        await fetchSavedPapers();
      }
    };
    
    initializeSavedPapers();
  }, [user]); 

  const fetchSavedPapers = async () => {
    if (!user) return;
    
    try {
      const { data: savedData } = await supabase
        .from('saved_papers')
        .select('paper_id')
        .eq('user_id', user.id);
      
      const savedIds = new Set(savedData?.map(item => item.paper_id) || []);
      setSavedPaperIds(savedIds);
    } catch (error) {
      console.error('Error fetching saved papers:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else {
          console.error('Profile fetch error:', error);
          toast.error('Failed to load profile');
        }
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Unexpected profile fetch error:', error);
      toast.error('Unexpected error loading profile');
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile();
          await fetchSavedPapers();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          await fetchProfile();
          await fetchSavedPapers();
        } else if (event === 'SIGNED_OUT') {
          setProfileLoaded(false);
          setSavedPaperIds(new Set());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !profileLoaded) {
      fetchProfile();
    }
  }, [user, profileLoaded]);

  const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
          data: { full_name: fullName }
        }
      });

      if (error) throw error;
      if (data.user && !data.session) {
        toast.success('Check your email for verification!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully!');
      setUser(null);
      setSession(null);
      setProfileLoaded(false);
      setSavedPaperIds(new Set());
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProfile();
      toast.success('Profile updated!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
      return false;
    }
  };

  const savePaper = async (paperData: any): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to save papers');
      return false;
    }
    
    try {
      if (savedPaperIds.has(paperData.paper_id)) {
        const { error } = await supabase
          .from('saved_papers')
          .delete()
          .match({ user_id: user.id, paper_id: paperData.paper_id });
        
        if (error) throw error;
        
        setSavedPaperIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(paperData.paper_id);
          return newSet;
        });
        
        toast.success('Paper removed from your collection!');
      } else {
        const { error } = await supabase
          .from('saved_papers')
          .upsert({
            user_id: user.id,
            paper_id: paperData.paper_id,
            title: paperData.title,
            abstract: paperData.abstract || '',
            authors: paperData.authors || [],
            published: paperData.published || null,
            url: paperData.url,
            source: paperData.source,
            external_ids: paperData.externalIds || null,
            tags: [],
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        setSavedPaperIds(prev => new Set(prev).add(paperData.paper_id));
        toast.success('Paper saved to your collection!');
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to save paper');
      return false;
    }
  };

  const updatePaperTags = async (paperId: string, tags: string[]): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('saved_papers')
        .update({ tags })
        .match({ user_id: user.id, paper_id: paperId });

      if (error) throw error;
      toast.success('Tags updated!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tags');
      return false;
    }
  };

  const getUserTags = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('saved_papers')
        .select('tags')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const allTags = new Set<string>();
      data.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags);
    } catch (error) {
      console.error('Error fetching user tags:', error);
      return [];
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    profile,
    fetchProfile,
    updateProfile,
    savePaper,
    savedPaperIds,
    updatePaperTags,
    getUserTags,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}