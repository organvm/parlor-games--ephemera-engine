// Placeholder for Supabase generated types
// Generate using: npx supabase gen types typescript --local > app/src/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          display_name: string
          email: string
          auth_provider: string
          avatar_url: string | null
          is_host: boolean
          notification_preferences: Json
          accessibility_preferences: Json
          created_at: string
          last_active_at: string
        }
        Insert: {
          id: string
          display_name: string
          email: string
          auth_provider?: string
          avatar_url?: string | null
          is_host?: boolean
          notification_preferences?: Json
          accessibility_preferences?: Json
          created_at?: string
          last_active_at?: string
        }
        Update: {
          display_name?: string
          email?: string
          auth_provider?: string
          avatar_url?: string | null
          is_host?: boolean
          notification_preferences?: Json
          accessibility_preferences?: Json
          last_active_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          game_type: string
          name: string
          date_time: string
          state: string
          host_id: string
          config: Json
          invite_code: string | null
          created_at: string
          updated_at: string
        }
      }
      // Add other tables as needed
    }
  }
}
