export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'autistic_adult' | 'caregiver' | 'professional' | 'educator' | 'employer'
export type SubscriptionPlan = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type VideoCategory = 'Housing' | 'Employment' | 'Mental Health' | 'Relationships' | 'Identity'
export type FontSize = 'small' | 'normal' | 'large'
export type RecordType = 'video' | 'playlist' | 'collection'
export type PostStatus = 'visible' | 'hidden' | 'removed'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_id: string | null
          role: UserRole
          font_size: FontSize
          bio: string | null
          is_employee: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_id?: string | null
          role?: UserRole
          font_size?: FontSize
          bio?: string | null
          is_employee?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_id?: string | null
          role?: UserRole
          font_size?: FontSize
          bio?: string | null
          is_employee?: boolean
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          price_cents: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          price_cents?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          price_cents?: number
          currency?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          youtube_id: string
          title: string
          description: string | null
          category: VideoCategory
          topic_id: string | null
          speaker: string | null
          thumbnail_url: string | null
          duration_seconds: number | null
          tags: string[]
          is_premium: boolean
          is_featured: boolean
          is_autism_edmonton_pick: boolean
          is_new_this_month: boolean
          certificate_eligible: boolean
          estimated_learning_minutes: number
          popularity_score: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          youtube_id: string
          title: string
          description?: string | null
          category: VideoCategory
          topic_id?: string | null
          speaker?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          tags?: string[]
          is_premium?: boolean
          is_featured?: boolean
          is_autism_edmonton_pick?: boolean
          is_new_this_month?: boolean
          certificate_eligible?: boolean
          estimated_learning_minutes?: number
          popularity_score?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          youtube_id?: string
          title?: string
          description?: string | null
          category?: VideoCategory
          topic_id?: string | null
          speaker?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          tags?: string[]
          is_premium?: boolean
          is_featured?: boolean
          is_autism_edmonton_pick?: boolean
          is_new_this_month?: boolean
          certificate_eligible?: boolean
          estimated_learning_minutes?: number
          popularity_score?: number
          updated_at?: string
        }
      }
      video_transcripts: {
        Row: {
          id: string
          video_id: string
          full_text: string
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          full_text: string
          language?: string
          created_at?: string
        }
        Update: {
          full_text?: string
          language?: string
        }
      }
      video_transcript_segments: {
        Row: {
          id: string
          video_id: string
          start_time: number
          end_time: number
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          start_time: number
          end_time: number
          text: string
          created_at?: string
        }
        Update: {
          start_time?: number
          end_time?: number
          text?: string
        }
      }
      video_activities: {
        Row: {
          id: string
          video_id: string
          title: string
          description: string | null
          activity_type: 'quiz' | 'reflection' | 'worksheet'
          content: Json
          is_premium: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          title: string
          description?: string | null
          activity_type: 'quiz' | 'reflection' | 'worksheet'
          content?: Json
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          activity_type?: 'quiz' | 'reflection' | 'worksheet'
          content?: Json
          is_premium?: boolean
        }
      }
      watch_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          progress_seconds: number
          completed: boolean
          last_watched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          progress_seconds?: number
          completed?: boolean
          last_watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          progress_seconds?: number
          completed?: boolean
          last_watched_at?: string
          updated_at?: string
        }
      }
      saved_videos: {
        Row: {
          id: string
          user_id: string
          video_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          saved_at?: string
        }
        Update: Record<string, never>
      }
      games: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          game_type: 'built-in' | 'iframe'
          is_premium: boolean
          difficulty: 'easy' | 'medium' | 'hard'
          thumbnail_url: string | null
          iframe_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          game_type?: 'built-in' | 'iframe'
          is_premium?: boolean
          difficulty?: 'easy' | 'medium' | 'hard'
          thumbnail_url?: string | null
          iframe_url?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string
          game_type?: 'built-in' | 'iframe'
          is_premium?: boolean
          difficulty?: 'easy' | 'medium' | 'hard'
          thumbnail_url?: string | null
          iframe_url?: string | null
        }
      }
      game_progress: {
        Row: {
          id: string
          user_id: string
          game_id: string
          completed: boolean
          score: number | null
          played_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          completed?: boolean
          score?: number | null
          played_at?: string
          created_at?: string
        }
        Update: {
          completed?: boolean
          score?: number | null
          played_at?: string
        }
      }
      contact_cards: {
        Row: {
          id: string
          name: string
          title: string | null
          organization: string | null
          email: string | null
          phone: string | null
          website: string | null
          description: string | null
          category: string
          display_order: number
          is_visible: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          category?: string
          display_order?: number
          is_visible?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          title?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          category?: string
          display_order?: number
          is_visible?: boolean
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
      }
      speakers: {
        Row: {
          id: string
          name: string
          bio: string | null
          credentials: string | null
          organization: string | null
          profile_image_url: string | null
          website_url: string | null
          contact_url: string | null
          topic_specialties: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bio?: string | null
          credentials?: string | null
          organization?: string | null
          profile_image_url?: string | null
          website_url?: string | null
          contact_url?: string | null
          topic_specialties?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          bio?: string | null
          credentials?: string | null
          organization?: string | null
          profile_image_url?: string | null
          website_url?: string | null
          contact_url?: string | null
          topic_specialties?: string[]
          updated_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          topic_id: string | null
          tags: string[]
          is_premium: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          topic_id?: string | null
          tags?: string[]
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          topic_id?: string | null
          tags?: string[]
          is_premium?: boolean
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          topic_id: string | null
          tags: string[]
          is_premium: boolean
          certificate_eligible: boolean
          estimated_hours: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          topic_id?: string | null
          tags?: string[]
          is_premium?: boolean
          certificate_eligible?: boolean
          estimated_hours?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          topic_id?: string | null
          tags?: string[]
          is_premium?: boolean
          certificate_eligible?: boolean
          estimated_hours?: number
          updated_at?: string
        }
      }
      learning_records: {
        Row: {
          id: string
          user_id: string
          video_id: string | null
          playlist_id: string | null
          collection_id: string | null
          watched_seconds: number
          completed: boolean
          completed_at: string | null
          record_type: RecordType
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id?: string | null
          playlist_id?: string | null
          collection_id?: string | null
          watched_seconds?: number
          completed?: boolean
          completed_at?: string | null
          record_type: RecordType
          created_at?: string
          updated_at?: string
        }
        Update: {
          watched_seconds?: number
          completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          video_id: string | null
          playlist_id: string | null
          collection_id: string | null
          title: string
          recipient_name: string
          learning_hours: number
          issued_at: string
          certificate_code: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id?: string | null
          playlist_id?: string | null
          collection_id?: string | null
          title: string
          recipient_name: string
          learning_hours?: number
          issued_at?: string
          certificate_code?: string
          created_at?: string
        }
        Update: {
          title?: string
          recipient_name?: string
          learning_hours?: number
        }
      }
      discussion_posts: {
        Row: {
          id: string
          user_id: string
          video_id: string | null
          title: string | null
          body: string
          tags: string[]
          status: PostStatus
          reported_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id?: string | null
          title?: string | null
          body: string
          tags?: string[]
          status?: PostStatus
          reported_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string | null
          body?: string
          tags?: string[]
          status?: PostStatus
          reported_count?: number
          is_hidden?: boolean
          updated_at?: string
        }
      }
      discussion_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          body: string
          status: PostStatus
          reported_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          body: string
          status?: PostStatus
          reported_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          status?: PostStatus
          reported_count?: number
          is_hidden?: boolean
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          post_id: string | null
          comment_id: string | null
          reason: string | null
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          post_id?: string | null
          comment_id?: string | null
          reason?: string | null
          status?: ReportStatus
          created_at?: string
        }
        Update: {
          status?: ReportStatus
        }
      }
      external_organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          website_url: string | null
          organization_type: string | null
          location: string | null
          topics: string[]
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website_url?: string | null
          organization_type?: string | null
          location?: string | null
          topics?: string[]
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          website_url?: string | null
          organization_type?: string | null
          location?: string | null
          topics?: string[]
          is_visible?: boolean
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Subscription = Tables<'subscriptions'>
export type Video = Tables<'videos'>
export type VideoTranscript = Tables<'video_transcripts'>
export type VideoTranscriptSegment = Tables<'video_transcript_segments'>
export type VideoActivity = Tables<'video_activities'>
export type WatchProgress = Tables<'watch_progress'>
export type SavedVideo = Tables<'saved_videos'>
export type Game = Tables<'games'>
export type GameProgress = Tables<'game_progress'>
export type ContactCard = Tables<'contact_cards'>
export type Topic = Tables<'topics'>
export type Tag = Tables<'tags'>
export type Speaker = Tables<'speakers'>
export type Playlist = Tables<'playlists'>
export type Collection = Tables<'collections'>
export type LearningRecord = Tables<'learning_records'>
export type Certificate = Tables<'certificates'>
export type DiscussionPost = Tables<'discussion_posts'>
export type DiscussionComment = Tables<'discussion_comments'>
export type Report = Tables<'reports'>
export type ExternalOrganization = Tables<'external_organizations'>
