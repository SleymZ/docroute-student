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
    };
    Views: Record<string, never>;
    Functions: {
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
