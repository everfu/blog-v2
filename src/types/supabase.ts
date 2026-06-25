export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostStatus = 'draft' | 'published' | 'archived'
export type CommentStatus = 'pending' | 'approved' | 'spam' | 'deleted'
export type ProfileRole = 'admin' | 'user'
export type CommentAuthMode = 'email' | 'authenticated'
export type CommentAttachmentStatus = 'pending' | 'approved' | 'hidden'
export type CommentModerationAction =
  | 'approved'
  | 'pending'
  | 'spam'
  | 'deleted'
  | 'reply'
  | 'bulk_moderate'
  | 'feature'
  | 'unfeature'
  | 'pin'
  | 'unpin'
  | 'handled'
  | 'unhandled'
  | 'note'
  | 'bulk_feature'
  | 'bulk_unfeature'
  | 'bulk_pin'
  | 'bulk_unpin'
  | 'bulk_handled'
  | 'bulk_unhandled'
export type CommentModerationRuleType = 'keyword' | 'email_hash' | 'ip_hash' | 'page_path' | 'ua'
export type CommentModerationRuleAction = 'pending' | 'spam'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type StackKind = 'hardware' | 'software'
export type FriendApplicationStatus = 'pending' | 'handled' | 'rejected'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          github_username: string | null
          display_name: string | null
          avatar_url: string | null
          role: ProfileRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          github_username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: ProfileRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          github_username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: ProfileRole
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          slug: string
          year: number
          title: string
          excerpt: string
          content: string
          tags: string[]
          cover: string | null
          category: string
          status: PostStatus
          recent: boolean
          view_count: number
          like_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          year: number
          title: string
          excerpt?: string
          content: string
          tags?: string[]
          cover?: string | null
          category?: string
          status?: PostStatus
          recent?: boolean
          view_count?: number
          like_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          year?: number
          title?: string
          excerpt?: string
          content?: string
          tags?: string[]
          cover?: string | null
          category?: string
          status?: PostStatus
          recent?: boolean
          view_count?: number
          like_count?: number
          published_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          emoji: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          emoji: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      post_revisions: {
        Row: {
          id: string
          post_id: string
          snapshot: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          snapshot: Json
          created_by?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          page_path: string
          post_id: string | null
          parent_id: string | null
          user_id: string | null
          author_name: string
          author_email: string | null
          email_hash: string | null
          website: string | null
          body: string
          status: CommentStatus
          ip_hash: string | null
          user_agent: string | null
          auth_mode: CommentAuthMode
          location_label: string | null
          country: string | null
          region: string | null
          city: string | null
          ua_browser: string | null
          ua_browser_version: string | null
          ua_os: string | null
          ua_device: string | null
          ua_request_id: string | null
          metadata: Json
          like_count: number
          is_featured: boolean
          is_pinned: boolean
          viewer_token_hash: string | null
          handled_at: string | null
          handled_by: string | null
          operator_note: string | null
          notified_owner_at: string | null
          notified_reply_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_path: string
          post_id?: string | null
          parent_id?: string | null
          user_id?: string | null
          author_name: string
          author_email?: string | null
          email_hash?: string | null
          website?: string | null
          body: string
          status?: CommentStatus
          ip_hash?: string | null
          user_agent?: string | null
          auth_mode?: CommentAuthMode
          location_label?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          ua_browser?: string | null
          ua_browser_version?: string | null
          ua_os?: string | null
          ua_device?: string | null
          ua_request_id?: string | null
          metadata?: Json
          like_count?: number
          is_featured?: boolean
          is_pinned?: boolean
          viewer_token_hash?: string | null
          handled_at?: string | null
          handled_by?: string | null
          operator_note?: string | null
          notified_owner_at?: string | null
          notified_reply_at?: string | null
          created_at?: string
        }
        Update: {
          status?: CommentStatus
          body?: string
          author_email?: string | null
          auth_mode?: CommentAuthMode
          location_label?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          ua_browser?: string | null
          ua_browser_version?: string | null
          ua_os?: string | null
          ua_device?: string | null
          ua_request_id?: string | null
          metadata?: Json
          like_count?: number
          is_featured?: boolean
          is_pinned?: boolean
          viewer_token_hash?: string | null
          handled_at?: string | null
          handled_by?: string | null
          operator_note?: string | null
          notified_owner_at?: string | null
          notified_reply_at?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          visitor_hash: string
          ip_hash: string
          user_agent_hash: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      comment_attachments: {
        Row: {
          id: string
          comment_id: string | null
          user_id: string
          storage_path: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          status: CommentAttachmentStatus
          created_at: string
        }
        Insert: {
          id?: string
          comment_id?: string | null
          user_id: string
          storage_path: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          status?: CommentAttachmentStatus
          created_at?: string
        }
        Update: {
          comment_id?: string | null
          status?: CommentAttachmentStatus
          width?: number | null
          height?: number | null
        }
        Relationships: []
      }
      comment_settings: {
        Row: {
          key: string
          value: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comment_moderation_events: {
        Row: {
          id: string
          comment_id: string
          actor_id: string | null
          action: CommentModerationAction
          previous_status: CommentStatus | null
          next_status: CommentStatus | null
          note: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          actor_id?: string | null
          action: CommentModerationAction
          previous_status?: CommentStatus | null
          next_status?: CommentStatus | null
          note?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      comment_moderation_rules: {
        Row: {
          id: string
          rule_type: CommentModerationRuleType
          match_value: string
          action: CommentModerationRuleAction
          enabled: boolean
          hit_count: number
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rule_type: CommentModerationRuleType
          match_value: string
          action?: CommentModerationRuleAction
          enabled?: boolean
          hit_count?: number
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          rule_type?: CommentModerationRuleType
          match_value?: string
          action?: CommentModerationRuleAction
          enabled?: boolean
          hit_count?: number
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      watched_items: {
        Row: {
          id: string
          title: string
          rating: number
          year: string
          country: string
          genre: string
          director: string
          watched_at: string
          image_url: string | null
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          rating: number
          year: string
          country?: string
          genre?: string
          director?: string
          watched_at: string
          image_url?: string | null
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          rating?: number
          year?: string
          country?: string
          genre?: string
          director?: string
          watched_at?: string
          image_url?: string | null
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      album_categories: {
        Row: {
          id: string
          slug: string
          label: string
          description: string
          cover_image_url: string | null
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          description?: string
          cover_image_url?: string | null
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          label?: string
          description?: string
          cover_image_url?: string | null
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      album_photos: {
        Row: {
          id: string
          category_id: string
          label: string | null
          image_url: string
          display_image_url: string | null
          thumbnail_image_url: string | null
          taken_at: string | null
          description: string | null
          details: Json
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          label?: string | null
          image_url: string
          display_image_url?: string | null
          thumbnail_image_url?: string | null
          taken_at?: string | null
          description?: string | null
          details?: Json
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          label?: string | null
          image_url?: string
          display_image_url?: string | null
          thumbnail_image_url?: string | null
          taken_at?: string | null
          description?: string | null
          details?: Json
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stack_categories: {
        Row: {
          id: string
          slug: string
          name: string
          kind: StackKind
          description: string
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          kind: StackKind
          description?: string
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          kind?: StackKind
          description?: string
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stack_items: {
        Row: {
          id: string
          category_id: string | null
          kind: StackKind
          name: string
          description: string
          item_category: string
          icon: string | null
          image_url: string | null
          url: string | null
          recommended: boolean
          wishlist: boolean
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          kind: StackKind
          name: string
          description?: string
          item_category?: string
          icon?: string | null
          image_url?: string | null
          url?: string | null
          recommended?: boolean
          wishlist?: boolean
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          kind?: StackKind
          name?: string
          description?: string
          item_category?: string
          icon?: string | null
          image_url?: string | null
          url?: string | null
          recommended?: boolean
          wishlist?: boolean
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      friend_groups: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          description?: string
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      friend_links: {
        Row: {
          id: string
          group_id: string | null
          author: string
          sitenick: string | null
          description: string
          link_url: string
          feed_url: string | null
          feed_muted: boolean
          icon_url: string | null
          avatar_url: string | null
          archs: string[]
          joined_at: string
          status: ContentStatus
          sort_order: number
          last_checked_at: string | null
          last_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id?: string | null
          author: string
          sitenick?: string | null
          description?: string
          link_url: string
          feed_url?: string | null
          feed_muted?: boolean
          icon_url?: string | null
          avatar_url?: string | null
          archs?: string[]
          joined_at?: string
          status?: ContentStatus
          sort_order?: number
          last_checked_at?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          group_id?: string | null
          author?: string
          sitenick?: string | null
          description?: string
          link_url?: string
          feed_url?: string | null
          feed_muted?: boolean
          icon_url?: string | null
          avatar_url?: string | null
          archs?: string[]
          joined_at?: string
          status?: ContentStatus
          sort_order?: number
          last_checked_at?: string | null
          last_error?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      friend_feed_snapshots: {
        Row: {
          id: string
          friend_link_id: string | null
          author: string
          sitenick: string | null
          avatar_url: string | null
          site_link: string
          archs: string[]
          title: string
          link_url: string
          summary: string
          cover_url: string | null
          pub_date: string
          source_status: Json
          created_at: string
        }
        Insert: {
          id?: string
          friend_link_id?: string | null
          author: string
          sitenick?: string | null
          avatar_url?: string | null
          site_link: string
          archs?: string[]
          title: string
          link_url: string
          summary?: string
          cover_url?: string | null
          pub_date: string
          source_status?: Json
          created_at?: string
        }
        Update: {
          friend_link_id?: string | null
          author?: string
          sitenick?: string | null
          avatar_url?: string | null
          site_link?: string
          archs?: string[]
          title?: string
          link_url?: string
          summary?: string
          cover_url?: string | null
          pub_date?: string
          source_status?: Json
        }
        Relationships: []
      }
      friend_application_settings: {
        Row: {
          key: string
          value: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      friend_link_applications: {
        Row: {
          id: string
          author_name: string
          site_name: string
          description: string
          site_url: string
          avatar_url: string | null
          feed_url: string | null
          contact: string
          note: string
          status: FriendApplicationStatus
          ip_hash: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_name: string
          site_name: string
          description: string
          site_url: string
          avatar_url?: string | null
          feed_url?: string | null
          contact: string
          note?: string
          status?: FriendApplicationStatus
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          site_name?: string
          description?: string
          site_url?: string
          avatar_url?: string | null
          feed_url?: string | null
          contact?: string
          note?: string
          status?: FriendApplicationStatus
          ip_hash?: string | null
          user_agent?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          id: string
          key: string
          title: string
          subtitle: string
          enabled: boolean
          sort_order: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          title: string
          subtitle?: string
          enabled?: boolean
          sort_order?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          title?: string
          subtitle?: string
          enabled?: boolean
          sort_order?: number
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_passkey_state: {
        Args: {
          p_email: string
        }
        Returns: Array<{
          user_id: string
          passkey_count: number
        }>
      }
      increment_post_view: {
        Args: {
          p_post_id: string
        }
        Returns: Array<{
          view_count: number
          like_count: number
        }>
      }
      record_post_like: {
        Args: {
          p_post_id: string
          p_visitor_hash: string
          p_ip_hash: string
          p_user_agent_hash: string
        }
        Returns: Array<{
          liked: boolean
          view_count: number
          like_count: number
        }>
      }
      record_post_reaction: {
        Args: {
          p_post_id: string
          p_emoji: string
          p_visitor_hash: string
          p_ip_hash: string
          p_user_agent_hash: string
        }
        Returns: Array<{
          reacted: boolean
          reactions: Json
        }>
      }
      record_comment_like: {
        Args: {
          p_comment_id: string
          p_visitor_hash: string
          p_ip_hash: string
          p_user_agent_hash: string
        }
        Returns: Array<{
          liked: boolean
          like_count: number
        }>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
