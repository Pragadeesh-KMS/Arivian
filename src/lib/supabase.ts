import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          email: string;
          contact_no: string | null;
          profession: string | null;
          university: string | null;
          cv_url: string | null;
          portfolio_link: string | null;
          research_papers: any[] | null;
          created_at: string;
          updated_at: string;
          topic1: string | null;
          topic2: string | null;
          topic3: string | null;
          topic4: string | null;
          topic5: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          email: string;
          contact_no?: string | null;
          profession?: string | null;
          university?: string | null;
          cv_url?: string | null;
          portfolio_link?: string | null;
          research_papers?: any[] | null;
          created_at?: string;
          updated_at?: string;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
          topic4?: string | null;
          topic5?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          email?: string;
          contact_no?: string | null;
          profession?: string | null;
          university?: string | null;
          cv_url?: string | null;
          portfolio_link?: string | null;
          research_papers?: any[] | null;
          created_at?: string;
          updated_at?: string;
          topic1?: string | null;
          topic2?: string | null;
          topic3?: string | null;
          topic4?: string | null;
          topic5?: string | null;
        };
      };
      papers: {
        Row: {
          id: string;
          urn: string;
          title: string;
          topic_tags: string[] | null;
          abstract: string | null;
          motive: string | null;
          completion_percentage: number;
          template: string | null;
          collaborators_needed: number;
          author_id: string;
          collaborators: string[] | null;
          content: any | null;
          created_at: string;
          updated_at: string; 
          is_public: boolean;
        };
        Insert: {
          id?: string;
          urn: string;
          title: string;
          topic_tags?: string[] | null;
          abstract?: string | null;
          motive?: string | null;
          completion_percentage?: number;
          template?: string | null;
          collaborators_needed: number;
          author_id: string;
          collaborators?: string[] | null;
          content?: any | null;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;

        };
        urn: {
          type: 'text',
          unique: true
        }
        Update: {
          id?: string;
          urn?: string;
          title?: string;
          topic_tags?: string[] | null;
          abstract?: string | null;
          motive?: string | null;
          completion_percentage?: number;
          template?: string | null;
          collaborators_needed?: number;
          author_id?: string;
          collaborators?: string[] | null;
          content?: any | null;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
      };

      saved_papers: {
        Row: {
          id: string;
          user_id: string;
          paper_id: string;
          title: string;
          abstract: string | null;
          authors: string[];
          published: string | null;
          url: string;
          source: string;
          external_ids: Record<string, string> | null; // JSON object for external IDs
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          paper_id: string;
          title: string;
          abstract?: string | null;
          authors: string[];
          published?: string | null;
          url: string;
          source: string;
          external_ids?: Record<string, string> | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          paper_id?: string;
          title?: string;
          abstract?: string | null;
          authors?: string[];
          published?: string | null;
          url?: string;
          source?: string;
          external_ids?: Record<string, string> | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};