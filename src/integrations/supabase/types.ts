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
      ad_campaigns: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          display_order: number
          end_date: string
          headline: string
          id: string
          image_url: string | null
          is_active: boolean
          placement_slug: string
          sponsor_logo_url: string | null
          sponsor_name: string
          start_date: string
          subtext: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          display_order?: number
          end_date?: string
          headline?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          placement_slug: string
          sponsor_logo_url?: string | null
          sponsor_name: string
          start_date?: string
          subtext?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          display_order?: number
          end_date?: string
          headline?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          placement_slug?: string
          sponsor_logo_url?: string | null
          sponsor_name?: string
          start_date?: string
          subtext?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ad_enquiries: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          company: string
          company_age: string | null
          company_url: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          placement_slug: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          company: string
          company_age?: string | null
          company_url?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          placement_slug?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          company?: string
          company_age?: string | null
          company_url?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          placement_slug?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_placements: {
        Row: {
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          internal_price_note: string | null
          is_active: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          internal_price_note?: string | null
          is_active?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          internal_price_note?: string | null
          is_active?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          escalated_at: string | null
          escalated_by: string | null
          id: string
          priority: number | null
          rejection_reason: string | null
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
          escalated_at?: string | null
          escalated_by?: string | null
          id?: string
          priority?: number | null
          rejection_reason?: string | null
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
          escalated_at?: string | null
          escalated_by?: string | null
          id?: string
          priority?: number | null
          rejection_reason?: string | null
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
      award_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          nominations_open: boolean
          slug: string
          title: string
          voting_ends_at: string | null
          voting_starts_at: string | null
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          nominations_open?: boolean
          slug: string
          title: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          year?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          nominations_open?: boolean
          slug?: string
          title?: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          year?: number
        }
        Relationships: []
      }
      award_nominations: {
        Row: {
          broker_id: string | null
          category_id: string
          created_at: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subtitle: string | null
          title: string
          user_id: string
        }
        Insert: {
          broker_id?: string | null
          category_id: string
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subtitle?: string | null
          title: string
          user_id: string
        }
        Update: {
          broker_id?: string | null
          category_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      award_nominees: {
        Row: {
          broker_id: string | null
          category_id: string
          created_at: string
          display_order: number
          id: string
          logo_url: string | null
          subtitle: string | null
          title: string
          vote_count: number
        }
        Insert: {
          broker_id?: string | null
          category_id: string
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          subtitle?: string | null
          title: string
          vote_count?: number
        }
        Update: {
          broker_id?: string | null
          category_id?: string
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          subtitle?: string | null
          title?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "award_nominees_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      award_votes: {
        Row: {
          category_id: string
          created_at: string
          id: string
          nominee_id: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          nominee_id: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          nominee_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_votes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "award_nominees"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_profiles: {
        Row: {
          account_manager_contact: string | null
          account_manager_name: string | null
          affiliate_url: string | null
          claim_status: string
          claimed_by: string | null
          created_at: string | null
          featured_position: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          site_name: string
          slug: string
          supported_sports: string[] | null
          tier: string
          updated_at: string | null
          verification_docs_url: string | null
        }
        Insert: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          affiliate_url?: string | null
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          site_name: string
          slug: string
          supported_sports?: string[] | null
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Update: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          affiliate_url?: string | null
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          site_name?: string
          slug?: string
          supported_sports?: string[] | null
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Relationships: []
      }
      betting_sites: {
        Row: {
          bonus: string | null
          created_at: string
          display_order: number | null
          features: string[] | null
          id: string
          license: string | null
          logo: string | null
          min_deposit: string | null
          name: string
          rating: number | null
          slug: string
          sports: string[] | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          url: string | null
          warning: string | null
          withdrawal_speed: string | null
        }
        Insert: {
          bonus?: string | null
          created_at?: string
          display_order?: number | null
          features?: string[] | null
          id?: string
          license?: string | null
          logo?: string | null
          min_deposit?: string | null
          name: string
          rating?: number | null
          slug: string
          sports?: string[] | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url?: string | null
          warning?: string | null
          withdrawal_speed?: string | null
        }
        Update: {
          bonus?: string | null
          created_at?: string
          display_order?: number | null
          features?: string[] | null
          id?: string
          license?: string | null
          logo?: string | null
          min_deposit?: string | null
          name?: string
          rating?: number | null
          slug?: string
          sports?: string[] | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url?: string | null
          warning?: string | null
          withdrawal_speed?: string | null
        }
        Relationships: []
      }
      broker_profiles: {
        Row: {
          account_manager_contact: string | null
          account_manager_name: string | null
          broker_id: string
          claim_status: string
          claimed_by: string | null
          created_at: string | null
          featured_position: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          tier: string
          updated_at: string | null
          verification_docs_url: string | null
        }
        Insert: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          broker_id: string
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Update: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          broker_id?: string
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_profiles_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: true
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          account_types: Json | null
          avg_spread: string | null
          badge: string | null
          complaints: number | null
          cons: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          founded_year: number | null
          headquarters: string | null
          homepage_position: number | null
          id: string
          last_verified_at: string | null
          leverage: string | null
          license_number: string | null
          logo_url: string | null
          min_deposit: string | null
          name: string
          payment_method_details: Json
          payment_methods: string[] | null
          platforms: string[] | null
          pros: string[] | null
          regulation: string[] | null
          review_count: number | null
          score: number | null
          show_on_homepage: boolean
          slug: string
          stars: number | null
          status: Database["public"]["Enums"]["content_status"]
          support_email: string | null
          support_phone: string | null
          tags: string[] | null
          type: string
          updated_at: string
          warning_note: string | null
          website_url: string | null
          withdrawal_fee: string | null
          withdrawal_time: string | null
        }
        Insert: {
          account_types?: Json | null
          avg_spread?: string | null
          badge?: string | null
          complaints?: number | null
          cons?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          homepage_position?: number | null
          id?: string
          last_verified_at?: string | null
          leverage?: string | null
          license_number?: string | null
          logo_url?: string | null
          min_deposit?: string | null
          name: string
          payment_method_details?: Json
          payment_methods?: string[] | null
          platforms?: string[] | null
          pros?: string[] | null
          regulation?: string[] | null
          review_count?: number | null
          score?: number | null
          show_on_homepage?: boolean
          slug: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          support_email?: string | null
          support_phone?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          warning_note?: string | null
          website_url?: string | null
          withdrawal_fee?: string | null
          withdrawal_time?: string | null
        }
        Update: {
          account_types?: Json | null
          avg_spread?: string | null
          badge?: string | null
          complaints?: number | null
          cons?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          homepage_position?: number | null
          id?: string
          last_verified_at?: string | null
          leverage?: string | null
          license_number?: string | null
          logo_url?: string | null
          min_deposit?: string | null
          name?: string
          payment_method_details?: Json
          payment_methods?: string[] | null
          platforms?: string[] | null
          pros?: string[] | null
          regulation?: string[] | null
          review_count?: number | null
          score?: number | null
          show_on_homepage?: boolean
          slug?: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          support_email?: string | null
          support_phone?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
          warning_note?: string | null
          website_url?: string | null
          withdrawal_fee?: string | null
          withdrawal_time?: string | null
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
          specs: Json
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
          specs?: Json
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
          specs?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_error_log: {
        Row: {
          app_version: string | null
          created_at: string
          id: string
          message: string
          route: string | null
          severity: string
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          id?: string
          message: string
          route?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string
          id?: string
          message?: string
          route?: string | null
          severity?: string
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      courses: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          note: string | null
          original_price: number | null
          price: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          note?: string | null
          original_price?: number | null
          price?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          note?: string | null
          original_price?: number | null
          price?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_articles: {
        Row: {
          course_id: string | null
          created_at: string
          display_order: number | null
          hero_image_url: string | null
          id: string
          is_locked: boolean | null
          key_takeaway: string | null
          read_time: number | null
          sections: Json
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          track: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          display_order?: number | null
          hero_image_url?: string | null
          id?: string
          is_locked?: boolean | null
          key_takeaway?: string | null
          read_time?: number | null
          sections?: Json
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          track?: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          display_order?: number | null
          hero_image_url?: string | null
          id?: string
          is_locked?: boolean | null
          key_takeaway?: string | null
          read_time?: number | null
          sections?: Json
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          track?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_articles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      forum_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      forum_threads: {
        Row: {
          best_reply_id: string | null
          body: string
          category: string
          created_at: string
          id: string
          last_reply_at: string
          locked: boolean
          pinned: boolean
          reply_count: number
          slug: string
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          best_reply_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          last_reply_at?: string
          locked?: boolean
          pinned?: boolean
          reply_count?: number
          slug: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          best_reply_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          last_reply_at?: string
          locked?: boolean
          pinned?: boolean
          reply_count?: number
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_best_reply_id_fkey"
            columns: ["best_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
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
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          forum_replies: boolean
          id: string
          inapp_enabled: boolean
          last_digest_sent_at: string | null
          new_match_alerts: boolean
          scam_alerts: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          forum_replies?: boolean
          id?: string
          inapp_enabled?: boolean
          last_digest_sent_at?: string | null
          new_match_alerts?: boolean
          scam_alerts?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          forum_replies?: boolean
          id?: string
          inapp_enabled?: boolean
          last_digest_sent_at?: string | null
          new_match_alerts?: boolean
          scam_alerts?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_claims: {
        Row: {
          admin_note: string | null
          claimed_by: string
          contact_info: Json | null
          created_at: string | null
          documents_url: string | null
          id: string
          profile_id: string
          profile_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          claimed_by: string
          contact_info?: Json | null
          created_at?: string | null
          documents_url?: string | null
          id?: string
          profile_id: string
          profile_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          claimed_by?: string
          contact_info?: Json | null
          created_at?: string | null
          documents_url?: string | null
          id?: string
          profile_id?: string
          profile_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      profile_follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          country_code: string | null
          created_at: string
          experience_level: string | null
          full_name: string | null
          id: string
          is_public: boolean | null
          phone: string | null
          reputation_score: number | null
          reputation_tier: string | null
          show_complaints: boolean | null
          show_country: boolean | null
          show_journal_stats: boolean
          show_real_name: boolean | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_telegram: string | null
          social_tiktok: string | null
          social_twitter: string | null
          social_youtube: string | null
          trading_style: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean | null
          phone?: string | null
          reputation_score?: number | null
          reputation_tier?: string | null
          show_complaints?: boolean | null
          show_country?: boolean | null
          show_journal_stats?: boolean
          show_real_name?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_telegram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          trading_style?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean | null
          phone?: string | null
          reputation_score?: number | null
          reputation_tier?: string | null
          show_complaints?: boolean | null
          show_country?: boolean | null
          show_journal_stats?: boolean
          show_real_name?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_telegram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          trading_style?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          bonus_amount: string | null
          broker_id: string | null
          broker_name: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expiry_date: string | null
          full_description: string | null
          how_to_claim: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          link_url: string | null
          promo_type: string
          referral_url: string | null
          slug: string | null
          status: Database["public"]["Enums"]["content_status"]
          terms: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: string | null
          broker_id?: string | null
          broker_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          full_description?: string | null
          how_to_claim?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          link_url?: string | null
          promo_type?: string
          referral_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          terms?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: string | null
          broker_id?: string | null
          broker_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string | null
          full_description?: string | null
          how_to_claim?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          link_url?: string | null
          promo_type?: string
          referral_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          terms?: string[] | null
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
      referral_clicks: {
        Row: {
          converted: boolean
          created_at: string
          id: string
          ip_hash: string | null
          referral_code_id: string
          referrer_url: string | null
          user_agent: string | null
        }
        Insert: {
          converted?: boolean
          created_at?: string
          id?: string
          ip_hash?: string | null
          referral_code_id: string
          referrer_url?: string | null
          user_agent?: string | null
        }
        Update: {
          converted?: boolean
          created_at?: string
          id?: string
          ip_hash?: string | null
          referral_code_id?: string
          referrer_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          broker_id: string | null
          clicks: number
          code: string
          conversions: number
          created_at: string
          earnings: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_id?: string | null
          clicks?: number
          code: string
          conversions?: number
          created_at?: string
          earnings?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_id?: string | null
          clicks?: number
          code?: string
          conversions?: number
          created_at?: string
          earnings?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          points_delta: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          points_delta: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          points_delta?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reads: {
        Row: {
          broker_id: string
          id: string
          read_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          broker_id: string
          id?: string
          read_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          broker_id?: string
          id?: string
          read_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: []
      }
      review_replies: {
        Row: {
          broker_id: string
          content: string
          created_at: string
          id: string
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_id: string
          content: string
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_id?: string
          content?: string
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          account_id_masked: string | null
          account_proof_url: string | null
          author: string | null
          avatar: string | null
          broker_id: string | null
          content: string | null
          created_at: string
          id: string
          photo_urls: string[]
          rating: number | null
          role: string | null
          status: Database["public"]["Enums"]["content_status"]
          user_id: string | null
          verified_account: boolean
        }
        Insert: {
          account_id_masked?: string | null
          account_proof_url?: string | null
          author?: string | null
          avatar?: string | null
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[]
          rating?: number | null
          role?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
          verified_account?: boolean
        }
        Update: {
          account_id_masked?: string | null
          account_proof_url?: string | null
          author?: string | null
          avatar?: string | null
          broker_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          photo_urls?: string[]
          rating?: number | null
          role?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          user_id?: string | null
          verified_account?: boolean
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
      saved_matches: {
        Row: {
          answers: Json
          created_at: string
          id: string
          name: string
          notify_on_new: boolean
          result: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          name?: string
          notify_on_new?: boolean
          result?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          name?: string
          notify_on_new?: boolean
          result?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          notify_on_new: boolean
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          notify_on_new?: boolean
          scope?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          notify_on_new?: boolean
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scam_alerts: {
        Row: {
          broker_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          full_report: string | null
          id: string
          is_repeat_offender: boolean
          severity: string
          show_full_report: boolean
          status: Database["public"]["Enums"]["content_status"]
          story: string | null
          title: string
        }
        Insert: {
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          full_report?: string | null
          id?: string
          is_repeat_offender?: boolean
          severity?: string
          show_full_report?: boolean
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
          title?: string
        }
        Update: {
          broker_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          full_report?: string | null
          id?: string
          is_repeat_offender?: boolean
          severity?: string
          show_full_report?: boolean
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
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
          categories: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          discord_url: string | null
          id: string
          logo_url: string | null
          members: string | null
          monthly_signals: string | null
          name: string
          pricing_tiers: Json | null
          sample_signals: Json | null
          status: Database["public"]["Enums"]["content_status"]
          telegram_url: string | null
          track_record: string | null
          updated_at: string
          verified: boolean | null
          win_rate: number | null
        }
        Insert: {
          avg_rr?: string | null
          categories?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discord_url?: string | null
          id?: string
          logo_url?: string | null
          members?: string | null
          monthly_signals?: string | null
          name: string
          pricing_tiers?: Json | null
          sample_signals?: Json | null
          status?: Database["public"]["Enums"]["content_status"]
          telegram_url?: string | null
          track_record?: string | null
          updated_at?: string
          verified?: boolean | null
          win_rate?: number | null
        }
        Update: {
          avg_rr?: string | null
          categories?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discord_url?: string | null
          id?: string
          logo_url?: string | null
          members?: string | null
          monthly_signals?: string | null
          name?: string
          pricing_tiers?: Json | null
          sample_signals?: Json | null
          status?: Database["public"]["Enums"]["content_status"]
          telegram_url?: string | null
          track_record?: string | null
          updated_at?: string
          verified?: boolean | null
          win_rate?: number | null
        }
        Relationships: []
      }
      signal_profiles: {
        Row: {
          account_manager_contact: string | null
          account_manager_name: string | null
          claim_status: string
          claimed_by: string | null
          created_at: string | null
          featured_position: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          signal_group_id: string
          tier: string
          updated_at: string | null
          verification_docs_url: string | null
        }
        Insert: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          signal_group_id: string
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Update: {
          account_manager_contact?: string | null
          account_manager_name?: string | null
          claim_status?: string
          claimed_by?: string | null
          created_at?: string | null
          featured_position?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          signal_group_id?: string
          tier?: string
          updated_at?: string | null
          verification_docs_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_profiles_signal_group_id_fkey"
            columns: ["signal_group_id"]
            isOneToOne: true
            referencedRelation: "signal_groups"
            referencedColumns: ["id"]
          },
        ]
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
      support_messages: {
        Row: {
          admin_response: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          context_name: string | null
          created_at: string
          id: string
          message: string
          responded_at: string | null
          responded_by: string | null
          sender_role: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          context_name?: string | null
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          responded_by?: string | null
          sender_role: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          context_name?: string | null
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          responded_by?: string | null
          sender_role?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tier_upgrades: {
        Row: {
          admin_note: string | null
          contact_info: Json | null
          created_at: string | null
          current_tier: string
          id: string
          profile_id: string
          profile_type: string
          requested_by: string
          requested_tier: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_note?: string | null
          contact_info?: Json | null
          created_at?: string | null
          current_tier: string
          id?: string
          profile_id: string
          profile_type: string
          requested_by: string
          requested_tier: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_note?: string | null
          contact_info?: Json | null
          created_at?: string | null
          current_tier?: string
          id?: string
          profile_id?: string
          profile_type?: string
          requested_by?: string
          requested_tier?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trade_journal: {
        Row: {
          broker_id: string | null
          closed_at: string | null
          created_at: string
          entry_price: number | null
          exit_price: number | null
          id: string
          notes: string | null
          opened_at: string
          outcome: string | null
          pnl: number | null
          rr: number | null
          side: string
          size: number | null
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_id?: string | null
          closed_at?: string | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          outcome?: string | null
          pnl?: number | null
          rr?: number | null
          side: string
          size?: number | null
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_id?: string | null
          closed_at?: string | null
          created_at?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          outcome?: string | null
          pnl?: number | null
          rr?: number | null
          side?: string
          size?: number | null
          symbol?: string
          updated_at?: string
          user_id?: string
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
      convert_referral: { Args: { code_text: string }; Returns: string }
      detect_potential_scam: {
        Args: { _broker_id: string }
        Returns: undefined
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment_referral_clicks: {
        Args: { code_id: string }
        Returns: undefined
      }
      is_verified_trader: { Args: { _user_id: string }; Returns: boolean }
      submit_application: {
        Args: {
          _application_data: Json
          _contact_email: string
          _contact_phone: string
          _contact_telegram: string
          _role: string
          _user_id: string
        }
        Returns: string
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
        | "betting_site"
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
        "betting_site",
      ],
      content_status: ["draft", "pending", "published", "rejected"],
    },
  },
} as const
