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
          published_at?: string | null
          updated_at?: string
        }
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
          email_hash: string | null
          website: string | null
          body: string
          status: CommentStatus
          ip_hash: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_path: string
          post_id?: string | null
          parent_id?: string | null
          user_id?: string | null
          author_name: string
          email_hash?: string | null
          website?: string | null
          body: string
          status?: CommentStatus
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          status?: CommentStatus
          body?: string
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
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
