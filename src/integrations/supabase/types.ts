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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          clicked_at: string | null
          conversion_amount_cents: number | null
          converted: boolean | null
          created_at: string | null
          id: string
          product_id: string | null
          referrer_page: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          conversion_amount_cents?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          referrer_page?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          conversion_amount_cents?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          referrer_page?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "affiliate_products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          additional_images: Json | null
          affiliate_network: string
          affiliate_url: string
          brand: string | null
          category: string
          commission_rate: number | null
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          original_price_cents: number | null
          price_cents: number
          rating: number | null
          review_count: number | null
          short_description: string | null
          specifications: Json | null
          stock_status: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          additional_images?: Json | null
          affiliate_network?: string
          affiliate_url: string
          brand?: string | null
          category: string
          commission_rate?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          original_price_cents?: number | null
          price_cents: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          specifications?: Json | null
          stock_status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          additional_images?: Json | null
          affiliate_network?: string
          affiliate_url?: string
          brand?: string | null
          category?: string
          commission_rate?: number | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          original_price_cents?: number | null
          price_cents?: number
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          specifications?: Json | null
          stock_status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      food_database: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_serving: number | null
          categories: string[] | null
          created_at: string | null
          id: string
          macros: Json | null
          micronutrients: Json | null
          name: string
          serving_size: string | null
          verified: boolean | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_serving?: number | null
          categories?: string[] | null
          created_at?: string | null
          id?: string
          macros?: Json | null
          micronutrients?: Json | null
          name: string
          serving_size?: string | null
          verified?: boolean | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_serving?: number | null
          categories?: string[] | null
          created_at?: string | null
          id?: string
          macros?: Json | null
          micronutrients?: Json | null
          name?: string
          serving_size?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          consumed_at: string
          created_at: string | null
          description: string | null
          food_items: Json
          id: string
          image_url: string | null
          macros: Json | null
          meal_type: string | null
          total_calories: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          consumed_at: string
          created_at?: string | null
          description?: string | null
          food_items: Json
          id?: string
          image_url?: string | null
          macros?: Json | null
          meal_type?: string | null
          total_calories?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          consumed_at?: string
          created_at?: string | null
          description?: string | null
          food_items?: Json
          id?: string
          image_url?: string | null
          macros?: Json | null
          meal_type?: string | null
          total_calories?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          limit_period: string | null
          limit_value: number | null
          plan_type: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          limit_period?: string | null
          limit_value?: number | null
          plan_type: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          limit_period?: string | null
          limit_value?: number | null
          plan_type?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          clicked: boolean | null
          confidence_score: number | null
          created_at: string | null
          dismissed: boolean | null
          display_order: number | null
          displayed_at: string | null
          id: string
          priority: number | null
          product_id: string | null
          purchased: boolean | null
          recommendation_context: string | null
          recommendation_reason: string
          updated_at: string | null
          user_goals_alignment: Json | null
          user_id: string | null
          user_preferences_match: Json | null
          user_workout_patterns: Json | null
        }
        Insert: {
          clicked?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          dismissed?: boolean | null
          display_order?: number | null
          displayed_at?: string | null
          id?: string
          priority?: number | null
          product_id?: string | null
          purchased?: boolean | null
          recommendation_context?: string | null
          recommendation_reason: string
          updated_at?: string | null
          user_goals_alignment?: Json | null
          user_id?: string | null
          user_preferences_match?: Json | null
          user_workout_patterns?: Json | null
        }
        Update: {
          clicked?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          dismissed?: boolean | null
          display_order?: number | null
          displayed_at?: string | null
          id?: string
          priority?: number | null
          product_id?: string | null
          purchased?: boolean | null
          recommendation_context?: string | null
          recommendation_reason?: string
          updated_at?: string | null
          user_goals_alignment?: Json | null
          user_id?: string | null
          user_preferences_match?: Json | null
          user_workout_patterns?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "affiliate_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          activity_level: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          fitness_goals: string[] | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          paused_at: string | null
          subscription_plan: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          account_status?: string
          activity_level?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          fitness_goals?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          paused_at?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          account_status?: string
          activity_level?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          fitness_goals?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          paused_at?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          feedback_type: string
          id: string
          recommendation_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          recommendation_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          recommendation_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "product_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_events: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          platform: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      temporary_access: {
        Row: {
          created_at: string | null
          expires_at: string
          features: Json
          granted_at: string
          granted_via: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          features: Json
          granted_at: string
          granted_via?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          features?: Json
          granted_at?: string
          granted_via?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temporary_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          feature_type: string
          id: string
          last_reset: string | null
          period_start: string | null
          reset_period: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_type: string
          id?: string
          last_reset?: string | null
          period_start?: string | null
          reset_period: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_type?: string
          id?: string
          last_reset?: string | null
          period_start?: string | null
          reset_period?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          status: string | null
          target_date: string | null
          target_value: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_data: Json | null
          action_text: string | null
          action_url: string | null
          body: string
          clicked: boolean | null
          clicked_at: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          notification_type: string
          priority: string | null
          read_at: string | null
          scheduled_for: string
          sent_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_text?: string | null
          action_url?: string | null
          body: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_text?: string | null
          action_url?: string | null
          body?: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          coach_communication_style: string | null
          created_at: string | null
          id: string
          meal_reminders: boolean | null
          metric_units: boolean | null
          notification_preferences: Json | null
          notification_settings: Json | null
          preferred_workout_times: string[] | null
          privacy_settings: Json | null
          updated_at: string | null
          user_id: string | null
          workout_reminders: boolean | null
        }
        Insert: {
          coach_communication_style?: string | null
          created_at?: string | null
          id?: string
          meal_reminders?: boolean | null
          metric_units?: boolean | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          preferred_workout_times?: string[] | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          workout_reminders?: boolean | null
        }
        Update: {
          coach_communication_style?: string | null
          created_at?: string | null
          id?: string
          meal_reminders?: boolean | null
          metric_units?: boolean | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          preferred_workout_times?: string[] | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          workout_reminders?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wellness_checkins: {
        Row: {
          activities: Json | null
          checked_in_at: string
          created_at: string | null
          energy_level: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string | null
        }
        Insert: {
          activities?: Json | null
          checked_in_at: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Update: {
          activities?: Json | null
          checked_in_at?: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          workout_type: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          exercises: Json
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          workout_type?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          workout_type?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          completed: boolean | null
          created_at: string | null
          end_time: string | null
          exercises_completed: Json | null
          heart_rate_data: Json | null
          id: string
          notes: string | null
          perceived_exertion: number | null
          start_time: string
          user_id: string | null
          workout_plan_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          exercises_completed?: Json | null
          heart_rate_data?: Json | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time: string
          user_id?: string | null
          workout_plan_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          exercises_completed?: Json | null
          heart_rate_data?: Json | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          start_time?: string
          user_id?: string | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: { feature: string; period: string; user_uuid: string }
        Returns: boolean
      }
      get_user_plan: { Args: { user_uuid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_usage: {
        Args: { feature: string; period: string; user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
