export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      applicant_profiles: {
        Row: {
          user_id: string;
          destination_country_code: string;
          study_category: string;
          degree_level: string;
          intake: string;
          citizenship_country_code: string;
          education_country_code: string;
          current_residence_status: string;
          education_status: string;
          grade_scale: string;
          penultimate_year_average: number | null;
          languages: Json;
          waiver_evidence: Json;
          profile_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          destination_country_code: string;
          study_category: string;
          degree_level?: string;
          intake?: string;
          citizenship_country_code: string;
          education_country_code: string;
          current_residence_status: string;
          education_status: string;
          grade_scale: string;
          penultimate_year_average?: number | null;
          languages: Json;
          waiver_evidence: Json;
          profile_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          destination_country_code?: string;
          study_category?: string;
          degree_level?: string;
          intake?: string;
          citizenship_country_code?: string;
          education_country_code?: string;
          current_residence_status?: string;
          education_status?: string;
          grade_scale?: string;
          penultimate_year_average?: number | null;
          languages?: Json;
          waiver_evidence?: Json;
          profile_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_universities: {
        Row: {
          user_id: string;
          university_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          university_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          university_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      account_plans: {
        Row: {
          user_id: string;
          plan: "free" | "plus";
          plus_until: string | null;
          source: "manual" | "beta" | "payment";
          note: string | null;
          whop_membership_id: string | null;
          whop_status: string | null;
          whop_manage_url: string | null;
          whop_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        // Written only by the owner (SQL editor); users have no insert/update grant.
        Insert: { user_id: string; plan?: "free" | "plus"; plus_until?: string | null; source?: "manual" | "beta" | "payment"; note?: string | null };
        Update: { plan?: "free" | "plus"; plus_until?: string | null; source?: "manual" | "beta" | "payment"; note?: string | null };
        Relationships: [];
      };
      confirmed_routes: {
        Row: {
          user_id: string;
          route_path: string;
          route_key: string | null;
          title: string;
          purpose: "study" | "work" | "family" | "business";
          country_code: string;
          step_ids: string[];
          confirmed_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          route_path: string;
          route_key?: string | null;
          title: string;
          purpose: "study" | "work" | "family" | "business";
          country_code: string;
          step_ids?: string[];
        };
        Update: {
          user_id?: string;
          route_path?: string;
          route_key?: string | null;
          title?: string;
          purpose?: "study" | "work" | "family" | "business";
          country_code?: string;
          step_ids?: string[];
        };
        Relationships: [];
      };
      route_task_progress: {
        Row: {
          user_id: string;
          route_key: string;
          task_id: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          route_key: string;
          task_id: string;
          completed_at?: string;
        };
        Update: {
          user_id?: string;
          route_key?: string;
          task_id?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          page: string;
          route: string | null;
          rating: number | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          page: string;
          route?: string | null;
          rating?: number | null;
          message?: string | null;
        };
        Update: {
          page?: string;
          route?: string | null;
          rating?: number | null;
          message?: string | null;
        };
        Relationships: [];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          route: string;
          consent_version: string;
          consented_at: string;
        };
        Insert: {
          email: string;
          route: string;
          consent_version: string;
        };
        Update: {
          email?: string;
          route?: string;
          consent_version?: string;
        };
        Relationships: [];
      };
      public_profiles: {
        Row: {
          user_id: string;
          display_name: string;
          bio: string | null;
          avatar_path: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          bio?: string | null;
          avatar_path?: string | null;
        };
        Update: {
          display_name?: string;
          bio?: string | null;
          avatar_path?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      success_stories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          purpose: "study" | "work" | "family" | "business";
          from_country_code: string;
          to_country_code: string;
          moved_year: number;
          university: string | null;
          status: "pending" | "published" | "hidden";
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          user_id: string;
          title: string;
          body: string;
          purpose: "study" | "work" | "family" | "business";
          from_country_code: string;
          to_country_code: string;
          moved_year: number;
          university?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          purpose?: "study" | "work" | "family" | "business";
          from_country_code?: string;
          to_country_code?: string;
          moved_year?: number;
          university?: string | null;
        };
        Relationships: [];
      };
      story_photos: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          path: string;
          created_at: string;
        };
        Insert: {
          story_id: string;
          user_id: string;
          path: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      story_comments: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          body: string;
          status: "pending" | "published" | "hidden";
          created_at: string;
          published_at: string | null;
        };
        Insert: {
          story_id: string;
          user_id: string;
          body: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      story_likes: {
        Row: {
          story_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          story_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_plus: {
        Args: never;
        Returns: boolean;
      };
      // Only the server's secret key may call it (Whop webhook).
      apply_whop_membership: {
        Args: {
          p_user_id: string;
          p_membership_id: string;
          p_status: string;
          p_active: boolean;
          p_plus_until: string | null;
          p_manage_url: string | null;
        };
        Returns: string;
      };
      delete_my_account: {
        Args: never;
        Returns: undefined;
      };
      leave_waitlist: {
        Args: { p_email: string };
        Returns: undefined;
      };
      is_story_moderator: {
        Args: never;
        Returns: boolean;
      };
      moderate_story: {
        Args: {
          p_story_id: string;
          p_status: "pending" | "published" | "hidden";
          p_reviewed_at: string;
        };
        Returns: undefined;
      };
      moderate_comment: {
        Args: {
          p_comment_id: string;
          p_status: "pending" | "published" | "hidden";
        };
        Returns: undefined;
      };
      story_engagement: {
        Args: { p_story_ids: string[] };
        Returns: { story_id: string; likes: number; comments: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
