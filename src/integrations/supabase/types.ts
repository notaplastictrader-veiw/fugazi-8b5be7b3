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
      applications: {
        Row: {
          application_data: Json
          contact_email: string | null
          contact_phone: string | null
          contact_telegram: string | null
          created_at: string
          id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          application_data?: Json
          contact_email?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          created_at?: string
          id?: string
          role: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_data?: Json
          contact_email?: string | null
          contact_phone?: string | null
          contact_telegram?: string | null
          created_at?: string
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      approval_queue: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submitted_by: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_by?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_by?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      brokers: {
        Row: {
          avg_spread: string | null
          badge: string | null
          complaints: number | null
          created_at: string
          created_by: string | null
          id: string
          leverage: string | null
          logo_url: string | null
          min_deposit: string | null
          name: string
          regulation: string[] | null
          review_count: number | null
          score: number | null
          slug: string
          stars: number | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          avg_spread?: string | null
          badge?: string | null
          complaints?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          leverage?: string | null
          logo_url?: string | null
          min_deposit?: string | null
          name: string
          regulation?: string[] | null
          review_count?: number | null
          score?: number | null
          slug: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Update: {
          avg_spread?: string | null
          badge?: string | null
          complaints?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          leverage?: string | null
          logo_url?: string | null
          min_deposit?: string | null
          name?: string
          regulation?: string[] | null
          review_count?: number | null
          score?: number | null
          slug?: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          actual_value: string | null
          category: string
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          event_date: string
          event_time: string | null
          forecast_value: string | null
          id: string
          impact: string
          previous_value: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_value?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          forecast_value?: string | null
          id?: string
          impact?: string
          previous_value?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_value?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          forecast_value?: string | null
          id?: string
          impact?: string
          previous_value?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          broker_id: string | null
          content: string | null
          created_at: string
          id: string
          proof_urls: string[] | null
          status: Database["public"]["Enums"]["content_status"]
          user_id: string | null
        }
        Insert: {
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          proof_urls?: string[] | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
        }
        Update: {
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          proof_urls?: string[] | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          direction: string
          id: string
          pair: string
          potential: string
          reasoning: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_label: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          pair: string
          potential?: string
          reasoning?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_label?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          pair?: string
          potential?: string
          reasoning?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_label?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          category: string
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          slug: string
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          slug: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          country_code: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          bonus_amount: string | null
          broker_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          link_url: string | null
          promo_type: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: string | null
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          link_url?: string | null
          promo_type?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: string | null
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          link_url?: string | null
          promo_type?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author: string | null
          avatar: string | null
          broker_id: string | null
          content: string | null
          created_at: string
          id: string
          rating: number | null
          role: string | null
          status: Database["public"]["Enums"]["content_status"]
          user_id: string | null
        }
        Insert: {
          author?: string | null
          avatar?: string | null
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          role?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
        }
        Update: {
          author?: string | null
          avatar?: string | null
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          role?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      scam_alerts: {
        Row: {
          broker_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          severity: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Update: {
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scam_alerts_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_groups: {
        Row: {
          avg_rr: string | null
          created_at: string
          created_by: string | null
          id: string
          members: string | null
          monthly_signals: string | null
          name: string
          status: Database["public"]["Enums"]["content_status"]
          track_record: string | null
          updated_at: string
          verified: boolean | null
          win_rate: number | null
        }
        Insert: {
          avg_rr?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          members?: string | null
          monthly_signals?: string | null
          name: string
          status?: Database["public"]["Enums"]["content_status"]
          track_record?: string | null
          updated_at?: string
          verified?: boolean | null
          win_rate?: number | null
        }
        Update: {
          avg_rr?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          members?: string | null
          monthly_signals?: string | null
          name?: string
          status?: Database["public"]["Enums"]["content_status"]
          track_record?: string | null
          updated_at?: string
          verified?: boolean | null
          win_rate?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      sports_predictions: {
        Row: {
          analyst_note: string | null
          confidence: number | null
          created_at: string
          created_by: string | null
          id: string
          is_correct: boolean | null
          match_date: string
          prediction: string
          result: string | null
          sport: string
          status: Database["public"]["Enums"]["content_status"]
          team_a: string
          team_b: string
          title: string
          updated_at: string
        }
        Insert: {
          analyst_note?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_correct?: boolean | null
          match_date?: string
          prediction?: string
          result?: string | null
          sport?: string
          status?: Database["public"]["Enums"]["content_status"]
          team_a?: string
          team_b?: string
          title: string
          updated_at?: string
        }
        Update: {
          analyst_note?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_correct?: boolean | null
          match_date?: string
          prediction?: string
          result?: string | null
          sport?: string
          status?: Database["public"]["Enums"]["content_status"]
          team_a?: string
          team_b?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action_type: string
          content_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          content_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          broker_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "content_ops"
        | "moderator"
        | "user"
        | "broker"
        | "signal_provider"
      content_status: "draft" | "pending" | "published" | "rejected"
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
      app_role: [
        "super_admin",
        "content_ops",
        "moderator",
        "user",
        "broker",
        "signal_provider",
      ],
      content_status: ["draft", "pending", "published", "rejected"],
    },
  },
} as const
