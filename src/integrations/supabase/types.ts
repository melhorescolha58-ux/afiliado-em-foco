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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_links: {
        Row: {
          affiliate_tag: string | null
          affiliate_url: string
          created_at: string
          id: string
          method: string
          original_url: string
          product_id: string | null
          store: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_tag?: string | null
          affiliate_url: string
          created_at?: string
          id?: string
          method?: string
          original_url: string
          product_id?: string | null
          store: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_tag?: string | null
          affiliate_url?: string
          created_at?: string
          id?: string
          method?: string
          original_url?: string
          product_id?: string | null
          store?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          created_at: string
          details: Json
          id: string
          rule_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          rule_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          rule_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          condition_type: string
          condition_value: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          condition_type?: string
          condition_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          condition_type?: string
          condition_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          last_checked_at: string | null
          last_error: string | null
          metadata: Json
          name: string
          phone_number: string | null
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          metadata?: Json
          name: string
          phone_number?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          metadata?: Json
          name?: string
          phone_number?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          category_id: string | null
          connection_id: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          is_active: boolean
          name: string
          send_available: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          send_available?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          send_available?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "group_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          campaign_id: string | null
          created_at: string
          id: string
          product_id: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_automations: number
          max_connections: number
          max_groups: number
          max_schedules: number
          name: string
          price_monthly: number | null
          price_yearly: number | null
          requires_validation: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_automations?: number
          max_connections?: number
          max_groups?: number
          max_schedules?: number
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          requires_validation?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_automations?: number
          max_connections?: number
          max_groups?: number
          max_schedules?: number
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          requires_validation?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_url: string | null
          category: string | null
          coupon: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          original_price: number | null
          original_url: string | null
          promo_code: string | null
          promo_price: number | null
          status: string
          store: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_url?: string | null
          category?: string | null
          coupon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          original_price?: number | null
          original_url?: string | null
          promo_code?: string | null
          promo_price?: number | null
          status?: string
          store?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_url?: string | null
          category?: string | null
          coupon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          original_price?: number | null
          original_url?: string | null
          promo_code?: string | null
          promo_price?: number | null
          status?: string
          store?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          automation_settings: Json
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notify_email: boolean
          notify_failures: boolean
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          automation_settings?: Json
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notify_email?: boolean
          notify_failures?: boolean
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          automation_settings?: Json
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notify_email?: boolean
          notify_failures?: boolean
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      queue_groups: {
        Row: {
          created_at: string
          group_id: string
          id: string
          queue_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          queue_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          queue_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_groups_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_items: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          message_body: string
          position: number
          product_id: string | null
          queue_id: string
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          message_body: string
          position?: number
          product_id?: string | null
          queue_id: string
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          message_body?: string
          position?: number
          product_id?: string | null
          queue_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_items_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      queues: {
        Row: {
          campaign_id: string | null
          created_at: string
          days_of_week: number[]
          id: string
          interval_minutes: number
          is_demo: boolean
          name: string
          start_at: string
          status: string
          updated_at: string
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          days_of_week?: number[]
          id?: string
          interval_minutes?: number
          is_demo?: boolean
          name: string
          start_at?: string
          status?: string
          updated_at?: string
          user_id: string
          window_end?: string
          window_start?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          days_of_week?: number[]
          id?: string
          interval_minutes?: number
          is_demo?: boolean
          name?: string
          start_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "queues_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          days_of_week: number[]
          end_time: string
          group_ids: string[]
          id: string
          interval_minutes: number
          is_active: boolean
          kind: string
          max_per_period: number
          name: string
          product_ids: string[]
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          end_time?: string
          group_ids?: string[]
          id?: string
          interval_minutes?: number
          is_active?: boolean
          kind?: string
          max_per_period?: number
          name: string
          product_ids?: string[]
          start_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          end_time?: string
          group_ids?: string[]
          id?: string
          interval_minutes?: number
          is_active?: boolean
          kind?: string
          max_per_period?: number
          name?: string
          product_ids?: string[]
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      send_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          error_detail: string | null
          external_id: string | null
          group_id: string | null
          group_name: string | null
          id: string
          is_demo: boolean
          message_body: string
          origin: string
          product_id: string | null
          product_name: string | null
          queue_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          error_detail?: string | null
          external_id?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          is_demo?: boolean
          message_body: string
          origin?: string
          product_id?: string | null
          product_name?: string | null
          queue_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          error_detail?: string | null
          external_id?: string | null
          group_id?: string | null
          group_name?: string | null
          id?: string
          is_demo?: boolean
          message_body?: string
          origin?: string
          product_id?: string | null
          product_name?: string | null
          queue_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "send_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "send_logs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "send_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "send_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          custom_max_groups: number | null
          id: string
          payment_provider: string | null
          payment_reference: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          custom_max_groups?: number | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          custom_max_groups?: number | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          created_at: string
          id: string
          metric: string
          period_start: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          period_start?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          period_start?: string
          quantity?: number
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_active: { Args: { _user_id: string }; Returns: boolean }
      user_group_limit: { Args: { _user_id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
