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
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reported_url: string | null
          reporter_id: string | null
          status: string
          steps: string | null
          title: string
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reported_url?: string | null
          reporter_id?: string | null
          status?: string
          steps?: string | null
          title: string
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reported_url?: string | null
          reporter_id?: string | null
          status?: string
          steps?: string | null
          title?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      build_logs: {
        Row: {
          after_image_urls: string[] | null
          author_id: string
          before_image_urls: string[] | null
          category: string
          created_at: string
          description: string | null
          difficulty: number | null
          hours_spent: number | null
          id: string
          is_deleted: boolean
          labour_cost_pence: number
          mileage: number | null
          parts: Json | null
          parts_cost_pence: number
          post_id: string | null
          title: string
          total_cost_pence: number | null
          updated_at: string
          vehicle_id: string
          would_recommend: boolean | null
        }
        Insert: {
          after_image_urls?: string[] | null
          author_id: string
          before_image_urls?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: number | null
          hours_spent?: number | null
          id?: string
          is_deleted?: boolean
          labour_cost_pence?: number
          mileage?: number | null
          parts?: Json | null
          parts_cost_pence?: number
          post_id?: string | null
          title: string
          total_cost_pence?: number | null
          updated_at?: string
          vehicle_id: string
          would_recommend?: boolean | null
        }
        Update: {
          after_image_urls?: string[] | null
          author_id?: string
          before_image_urls?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: number | null
          hours_spent?: number | null
          id?: string
          is_deleted?: boolean
          labour_cost_pence?: number
          mileage?: number | null
          parts?: Json | null
          parts_cost_pence?: number
          post_id?: string | null
          title?: string
          total_cost_pence?: number | null
          updated_at?: string
          vehicle_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "build_logs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "build_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_ids: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_ids: string[]
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_ids?: string[]
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          member_count: number
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string
          id: string
          image_urls: string[] | null
          location: string | null
          postcode: string | null
          price: number
          seller_id: string
          status: string
          title: string
          updated_at: string
          vehicle_id: string | null
          view_count: number
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          description: string
          id?: string
          image_urls?: string[] | null
          location?: string | null
          postcode?: string | null
          price: number
          seller_id: string
          status?: string
          title: string
          updated_at?: string
          vehicle_id?: string | null
          view_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          image_urls?: string[] | null
          location?: string | null
          postcode?: string | null
          price?: number
          seller_id?: string
          status?: string
          title?: string
          updated_at?: string
          vehicle_id?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_by: string[]
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_by?: string[]
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_by?: string[]
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          post_id: string | null
          type: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          post_id?: string | null
          type: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          post_id?: string | null
          type?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      plate_follows: {
        Row: {
          created_at: string
          id: string
          registration: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          registration: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          registration?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plate_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plate_locks: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          locked_at: string | null
          registration: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          registration: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          registration?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plate_locks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plate_locks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          build_log_data: Json | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          is_deleted: boolean
          like_count: number
          post_type: string
          reply_count: number
          reply_to_id: string | null
          repost_count: number
          repost_of_id: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          author_id: string
          build_log_data?: Json | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_deleted?: boolean
          like_count?: number
          post_type?: string
          reply_count?: number
          reply_to_id?: string | null
          repost_count?: number
          repost_of_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          author_id?: string
          build_log_data?: Json | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          is_deleted?: boolean
          like_count?: number
          post_type?: string
          reply_count?: number
          reply_to_id?: string | null
          repost_count?: number
          repost_of_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_repost_of_id_fkey"
            columns: ["repost_of_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          follower_count: number
          following_count: number
          id: string
          is_verified: boolean
          location: string | null
          moniker: string
          post_count: number
          primary_vehicle_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number
          following_count?: number
          id: string
          is_verified?: boolean
          location?: string | null
          moniker: string
          post_count?: number
          primary_vehicle_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number
          following_count?: number
          id?: string
          is_verified?: boolean
          location?: string | null
          moniker?: string
          post_count?: number
          primary_vehicle_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_vehicle_fk"
            columns: ["primary_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reposts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          co2_emissions: number | null
          colour: string | null
          cover_image_url: string | null
          created_at: string
          date_of_last_v5c_issued: string | null
          description: string | null
          dvla_data: Json | null
          engine_size: string | null
          euro_status: string | null
          for_sale: boolean
          fuel_type: string | null
          id: string
          is_primary: boolean
          make: string | null
          marked_for_export: boolean | null
          model: string | null
          mot_expiry: string | null
          mot_history: Json | null
          mot_history_updated_at: string | null
          nickname: string | null
          owner_id: string
          registration: string
          tax_due: string | null
          updated_at: string
          wheelplan: string | null
          year: number | null
        }
        Insert: {
          co2_emissions?: number | null
          colour?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_last_v5c_issued?: string | null
          description?: string | null
          dvla_data?: Json | null
          engine_size?: string | null
          euro_status?: string | null
          for_sale?: boolean
          fuel_type?: string | null
          id?: string
          is_primary?: boolean
          make?: string | null
          marked_for_export?: boolean | null
          model?: string | null
          mot_expiry?: string | null
          mot_history?: Json | null
          mot_history_updated_at?: string | null
          nickname?: string | null
          owner_id: string
          registration: string
          tax_due?: string | null
          updated_at?: string
          wheelplan?: string | null
          year?: number | null
        }
        Update: {
          co2_emissions?: number | null
          colour?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_last_v5c_issued?: string | null
          description?: string | null
          dvla_data?: Json | null
          engine_size?: string | null
          euro_status?: string | null
          for_sale?: boolean
          fuel_type?: string | null
          id?: string
          is_primary?: boolean
          make?: string | null
          marked_for_export?: boolean | null
          model?: string | null
          mot_expiry?: string | null
          mot_history?: Json | null
          mot_history_updated_at?: string | null
          nickname?: string | null
          owner_id?: string
          registration?: string
          tax_due?: string | null
          updated_at?: string
          wheelplan?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

// ─── Convenience aliases ────────────────────────────────────────────────────
// These row types make imports cleaner throughout the app.

export type Profile       = Database['public']['Tables']['profiles']['Row']
export type Vehicle       = Database['public']['Tables']['vehicles']['Row']
export type PlateLock     = Database['public']['Tables']['plate_locks']['Row']
export type PlateFollow   = Database['public']['Tables']['plate_follows']['Row']
export type Post          = Database['public']['Tables']['posts']['Row']
export type PostLike      = Database['public']['Tables']['post_likes']['Row']
export type Repost        = Database['public']['Tables']['reposts']['Row']
export type Follow        = Database['public']['Tables']['follows']['Row']
export type Conversation  = Database['public']['Tables']['conversations']['Row']
export type Message       = Database['public']['Tables']['messages']['Row']
export type Group         = Database['public']['Tables']['groups']['Row']
export type GroupMember   = Database['public']['Tables']['group_members']['Row']
export type GroupPost     = Database['public']['Tables']['group_posts']['Row']
export type Listing       = Database['public']['Tables']['listings']['Row']
export type Notification  = Database['public']['Tables']['notifications']['Row']
export type Report        = Database['public']['Tables']['reports']['Row']
export type Block         = Database['public']['Tables']['blocks']['Row']
export type BuildLog      = Database['public']['Tables']['build_logs']['Row']
export type BugReport     = Database['public']['Tables']['bug_reports']['Row']

// PostWithAuthor — post joined with author profile and optional vehicle
export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'id' | 'moniker' | 'display_name' | 'avatar_url' | 'is_verified'>
  vehicles: Pick<Vehicle, 'id' | 'registration' | 'make' | 'model' | 'year'> | null
  liked_by_user?: boolean
  reposted_by_user?: boolean
}

export type ProfileWithVehicles = Profile & {
  vehicles: Vehicle[]
}
