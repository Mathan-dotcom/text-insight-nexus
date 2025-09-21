export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_results: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string | null
          document_id: number | null
          id: string
          result_data: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: number | null
          id?: string
          result_data?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: number | null
          id?: string
          result_data?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          document_id: number | null
          id: string
          personality_mode: string | null
          session_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: number | null
          id?: string
          personality_mode?: string | null
          session_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: number | null
          id?: string
          personality_mode?: string | null
          session_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      clause_explanations: {
        Row: {
          clause_pattern: string
          clause_type: string
          created_at: string | null
          explanation: string
          id: string
          risk_level: string | null
          scenario_example: string | null
        }
        Insert: {
          clause_pattern: string
          clause_type: string
          created_at?: string | null
          explanation: string
          id?: string
          risk_level?: string | null
          scenario_example?: string | null
        }
        Update: {
          clause_pattern?: string
          clause_type?: string
          created_at?: string | null
          explanation?: string
          id?: string
          risk_level?: string | null
          scenario_example?: string | null
        }
        Relationships: []
      }
      community_benchmarks: {
        Row: {
          category: string
          geography: string | null
          id: string
          last_updated: string | null
          metric_name: string
          metric_value: number | null
          percentile_25: number | null
          percentile_50: number | null
          percentile_75: number | null
          percentile_90: number | null
          sample_size: number | null
        }
        Insert: {
          category: string
          geography?: string | null
          id?: string
          last_updated?: string | null
          metric_name: string
          metric_value?: number | null
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_size?: number | null
        }
        Update: {
          category?: string
          geography?: string | null
          id?: string
          last_updated?: string | null
          metric_name?: string
          metric_value?: number | null
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_size?: number | null
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          fairness_score: number | null
          id: string
          is_verified: boolean | null
          name: string
          tags: string[] | null
          template_content: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fairness_score?: number | null
          id?: string
          is_verified?: boolean | null
          name: string
          tags?: string[] | null
          template_content: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fairness_score?: number | null
          id?: string
          is_verified?: boolean | null
          name?: string
          tags?: string[] | null
          template_content?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          bucket: string
          created_at: string | null
          document_type: string | null
          ethics_fairness_score: number | null
          external_id: string
          file_name: string | null
          financial_fairness_score: number | null
          id: number
          important_dates: Json | null
          key_clauses: Json | null
          legal_liability_score: number | null
          metadata: Json | null
          obligations: Json | null
          page_count: number | null
          parsed_content: string | null
          path: string
          privacy_data_score: number | null
          processing_status: string | null
          rights_shield_score: number | null
          risk_factors: Json | null
          size: number | null
          termination_flexibility_score: number | null
          user_id: string | null
          word_count: number | null
        }
        Insert: {
          bucket?: string
          created_at?: string | null
          document_type?: string | null
          ethics_fairness_score?: number | null
          external_id?: string
          file_name?: string | null
          financial_fairness_score?: number | null
          id?: never
          important_dates?: Json | null
          key_clauses?: Json | null
          legal_liability_score?: number | null
          metadata?: Json | null
          obligations?: Json | null
          page_count?: number | null
          parsed_content?: string | null
          path: string
          privacy_data_score?: number | null
          processing_status?: string | null
          rights_shield_score?: number | null
          risk_factors?: Json | null
          size?: number | null
          termination_flexibility_score?: number | null
          user_id?: string | null
          word_count?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string | null
          document_type?: string | null
          ethics_fairness_score?: number | null
          external_id?: string
          file_name?: string | null
          financial_fairness_score?: number | null
          id?: never
          important_dates?: Json | null
          key_clauses?: Json | null
          legal_liability_score?: number | null
          metadata?: Json | null
          obligations?: Json | null
          page_count?: number | null
          parsed_content?: string | null
          path?: string
          privacy_data_score?: number | null
          processing_status?: string | null
          rights_shield_score?: number | null
          risk_factors?: Json | null
          size?: number | null
          termination_flexibility_score?: number | null
          user_id?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      summaries: {
        Row: {
          content: string | null
          created_at: string | null
          document_id: number | null
          id: number
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_id?: number | null
          id?: never
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_id?: number | null
          id?: never
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
