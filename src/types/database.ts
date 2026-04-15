export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          moniker: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          primary_vehicle_id: string | null
          follower_count: number
          following_count: number
          post_count: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          moniker: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          primary_vehicle_id?: string | null
          follower_count?: number
          following_count?: number
          post_count?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          moniker?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          primary_vehicle_id?: string | null
          follower_count?: number
          following_count?: number
          post_count?: number
          is_verified?: boolean
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          owner_id: string
          registration: string
          make: string | null
          model: string | null
          year: number | null
          colour: string | null
          fuel_type: string | null
          engine_size: string | null
          mot_expiry: string | null
          tax_due: string | null
          dvla_data: Json | null
          nickname: string | null
          description: string | null
          cover_image_url: string | null
          is_primary: boolean
          for_sale: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          registration: string
          make?: string | null
          model?: string | null
          year?: number | null
          colour?: string | null
          fuel_type?: string | null
          engine_size?: string | null
          mot_expiry?: string | null
          tax_due?: string | null
          dvla_data?: Json | null
          nickname?: string | null
          description?: string | null
          cover_image_url?: string | null
          is_primary?: boolean
          for_sale?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          make?: string | null
          model?: string | null
          year?: number | null
          colour?: string | null
          fuel_type?: string | null
          engine_size?: string | null
          mot_expiry?: string | null
          tax_due?: string | null
          dvla_data?: Json | null
          nickname?: string | null
          description?: string | null
          cover_image_url?: string | null
          is_primary?: boolean
          for_sale?: boolean
          updated_at?: string
        }
      }
      plate_locks: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          registration: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          status: 'pending' | 'active' | 'expired' | 'cancelled'
          locked_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          registration: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          status?: 'pending' | 'active' | 'expired' | 'cancelled'
          locked_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'active' | 'expired' | 'cancelled'
          locked_at?: string | null
          expires_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_urls: string[] | null
          vehicle_id: string | null
          reply_to_id: string | null
          repost_of_id: string | null
          like_count: number
          reply_count: number
          repost_count: number
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          image_urls?: string[] | null
          vehicle_id?: string | null
          reply_to_id?: string | null
          repost_of_id?: string | null
          like_count?: number
          reply_count?: number
          repost_count?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          image_urls?: string[] | null
          vehicle_id?: string | null
          like_count?: number
          reply_count?: number
          repost_count?: number
          is_deleted?: boolean
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      reposts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      plate_follows: {
        Row: {
          id: string
          user_id: string
          registration: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          registration: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      conversations: {
        Row: {
          id: string
          participant_ids: string[]
          last_message_at: string | null
          last_message_preview: string | null
          created_at: string
        }
        Insert: {
          id?: string
          participant_ids: string[]
          last_message_at?: string | null
          last_message_preview?: string | null
          created_at?: string
        }
        Update: {
          last_message_at?: string | null
          last_message_preview?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_by: string[]
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read_by?: string[]
          created_at?: string
        }
        Update: {
          read_by?: string[]
        }
      }
      groups: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          cover_image_url: string | null
          member_count: number
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          member_count?: number
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          cover_image_url?: string | null
          member_count?: number
          is_private?: boolean
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'owner' | 'moderator' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'owner' | 'moderator' | 'member'
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'moderator' | 'member'
        }
      }
      group_posts: {
        Row: {
          id: string
          group_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          post_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          vehicle_id: string | null
          title: string
          description: string
          price: number
          currency: string
          category: string
          image_urls: string[] | null
          location: string | null
          postcode: string | null
          status: 'active' | 'sold' | 'withdrawn'
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          vehicle_id?: string | null
          title: string
          description: string
          price: number
          currency?: string
          category: string
          image_urls?: string[] | null
          location?: string | null
          postcode?: string | null
          status?: 'active' | 'sold' | 'withdrawn'
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          price?: number
          category?: string
          image_urls?: string[] | null
          location?: string | null
          postcode?: string | null
          status?: 'active' | 'sold' | 'withdrawn'
          view_count?: number
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type:
            | 'like'
            | 'reply'
            | 'repost'
            | 'follow'
            | 'mention'
            | 'plate_message'
            | 'mot_reminder'
            | 'tax_reminder'
          post_id: string | null
          vehicle_id: string | null
          message: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type:
            | 'like'
            | 'reply'
            | 'repost'
            | 'follow'
            | 'mention'
            | 'plate_message'
            | 'mot_reminder'
            | 'tax_reminder'
          post_id?: string | null
          vehicle_id?: string | null
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: 'post' | 'user' | 'group' | 'listing'
          target_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          target_type: 'post' | 'user' | 'group' | 'listing'
          target_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'dismissed'
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type PlateLock = Database['public']['Tables']['plate_locks']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type Repost = Database['public']['Tables']['reposts']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type PlateFollow = Database['public']['Tables']['plate_follows']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupPost = Database['public']['Tables']['group_posts']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Block = Database['public']['Tables']['blocks']['Row']

// Enriched types used in the UI
export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'id' | 'moniker' | 'display_name' | 'avatar_url' | 'is_verified'>
  vehicles?: Pick<Vehicle, 'id' | 'registration' | 'make' | 'model' | 'year'> | null
  liked_by_user?: boolean
  reposted_by_user?: boolean
}

export type ProfileWithVehicles = Profile & {
  vehicles: Vehicle[]
}
