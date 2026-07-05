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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      claims: {
        Row: {
          help_wanted: string[]
          id: string
          maintainer_user_id: string
          pitch: string | null
          repo_id: string
          verified_at: string
        }
        Insert: {
          help_wanted?: string[]
          id?: string
          maintainer_user_id: string
          pitch?: string | null
          repo_id: string
          verified_at?: string
        }
        Update: {
          help_wanted?: string[]
          id?: string
          maintainer_user_id?: string
          pitch?: string | null
          repo_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_maintainer_user_id_fkey"
            columns: ["maintainer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: true
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          id: string
          repo_id: string
          signal: Database["public"]["Enums"]["feedback_signal"]
          ts: string
          user_id: string
        }
        Insert: {
          id?: string
          repo_id: string
          signal: Database["public"]["Enums"]["feedback_signal"]
          ts?: string
          user_id: string
        }
        Update: {
          id?: string
          repo_id?: string
          signal?: Database["public"]["Enums"]["feedback_signal"]
          ts?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          cycle_ts: string
          id: string
          rank: number
          reason: string
          repo_id: string
          score: number
          user_id: string
        }
        Insert: {
          cycle_ts?: string
          id?: string
          rank: number
          reason: string
          repo_id: string
          score: number
          user_id: string
        }
        Update: {
          cycle_ts?: string
          id?: string
          rank?: number
          reason?: string
          repo_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      repos: {
        Row: {
          deleted_at: string | null
          description: string | null
          embedding: string | null
          forks: number
          full_name: string
          gfi_count: number
          github_id: number
          has_contributing: boolean
          health_score: number
          id: string
          indexed_at: string
          languages: string[]
          last_commit_at: string | null
          open_issues: number
          stars: number
          summary_en: string | null
          summary_ur: string | null
          topics: string[]
        }
        Insert: {
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          forks?: number
          full_name: string
          gfi_count?: number
          github_id: number
          has_contributing?: boolean
          health_score?: number
          id?: string
          indexed_at?: string
          languages?: string[]
          last_commit_at?: string | null
          open_issues?: number
          stars?: number
          summary_en?: string | null
          summary_ur?: string | null
          topics?: string[]
        }
        Update: {
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          forks?: number
          full_name?: string
          gfi_count?: number
          github_id?: number
          has_contributing?: boolean
          health_score?: number
          id?: string
          indexed_at?: string
          languages?: string[]
          last_commit_at?: string | null
          open_issues?: number
          stars?: number
          summary_en?: string | null
          summary_ur?: string | null
          topics?: string[]
        }
        Relationships: []
      }
      users: {
        Row: {
          contribution_streak: number
          created_at: string
          github_id: number
          id: string
          languages: string[]
          last_active_at: string | null
          locale: string
          owned_stars: number
          skill_level: Database["public"]["Enums"]["skill_level"]
          topics: string[]
          total_contributions: number
          username: string
        }
        Insert: {
          contribution_streak?: number
          created_at?: string
          github_id: number
          id: string
          languages?: string[]
          last_active_at?: string | null
          locale?: string
          owned_stars?: number
          skill_level?: Database["public"]["Enums"]["skill_level"]
          topics?: string[]
          total_contributions?: number
          username: string
        }
        Update: {
          contribution_streak?: number
          created_at?: string
          github_id?: number
          id?: string
          languages?: string[]
          last_active_at?: string | null
          locale?: string
          owned_stars?: number
          skill_level?: Database["public"]["Enums"]["skill_level"]
          topics?: string[]
          total_contributions?: number
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      feedback_signal: "up" | "down" | "known" | "hide" | "swipe_r" | "swipe_l"
      skill_level: "beginner" | "intermediate" | "advanced"
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
    Enums: {
      feedback_signal: ["up", "down", "known", "hide", "swipe_r", "swipe_l"],
      skill_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
