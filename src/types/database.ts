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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};