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
      attendance: {
        Row: {
          accuracy: number | null
          created_at: string
          distance_m: number
          id: string
          latitude: number
          longitude: number
          status: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          distance_m: number
          id?: string
          latitude: number
          longitude: number
          status?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          distance_m?: number
          id?: string
          latitude?: number
          longitude?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_reviews: {
        Row: {
          attendance_id: string
          decision: string
          note: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          attendance_id: string
          decision: string
          note?: string
          reviewer_id?: string
          updated_at?: string
        }
        Update: {
          attendance_id?: string
          decision?: string
          note?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_reviews_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: true
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_access: {
        Row: {
          created_at: string
          direction: string
          id: string
          id_id: string
          user_id: string
          verified_by: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          id_id: string
          user_id: string
          verified_by?: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          id_id?: string
          user_id?: string
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_access_id_id_fkey"
            columns: ["id_id"]
            isOneToOne: false
            referencedRelation: "digital_ids"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_ai_blocks: {
        Row: {
          created_at: string
          message: string
          status: number
          user_id: string
        }
        Insert: {
          created_at?: string
          message: string
          status: number
          user_id: string
        }
        Update: {
          created_at?: string
          message?: string
          status?: number
          user_id?: string
        }
        Relationships: []
      }
      campus_chat: {
        Row: {
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campus_events: {
        Row: {
          created_at: string
          created_by: string
          date: string
          description: string
          id: string
          tag: string
          time: string
          title: string
          venue: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          date: string
          description: string
          id?: string
          tag: string
          time: string
          title: string
          venue: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          tag?: string
          time?: string
          title?: string
          venue?: string
        }
        Relationships: []
      }
      campus_locations: {
        Row: {
          accessibility_note: string
          accessible: boolean
          category: string
          id: string
          latitude: number
          longitude: number
          name: string
          verified_by: string
        }
        Insert: {
          accessibility_note?: string
          accessible?: boolean
          category?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          verified_by?: string
        }
        Update: {
          accessibility_note?: string
          accessible?: boolean
          category?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          verified_by?: string
        }
        Relationships: []
      }
      campus_notices: {
        Row: {
          body: string
          category: string
          created_at: string
          created_by: string
          department: string
          id: string
          title: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          created_by?: string
          department?: string
          id?: string
          title: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string
          department?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      campus_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      campus_parking_slots: {
        Row: {
          area: string
          id: string
          number: number
          occupied: boolean
          updated_at: string
        }
        Insert: {
          area: string
          id?: string
          number: number
          occupied?: boolean
          updated_at?: string
        }
        Update: {
          area?: string
          id?: string
          number?: number
          occupied?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      campus_permissions: {
        Row: {
          capability: string
          user_id: string
        }
        Insert: {
          capability: string
          user_id: string
        }
        Update: {
          capability?: string
          user_id?: string
        }
        Relationships: []
      }
      campus_reports: {
        Row: {
          category: string
          created_at: string
          department: string
          description: string
          id: string
          kind: string
          photo_path: string | null
          rating: number | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          department?: string
          description: string
          id?: string
          kind: string
          photo_path?: string | null
          rating?: number | null
          status?: string
          title: string
          user_id?: string
        }
        Update: {
          category?: string
          created_at?: string
          department?: string
          description?: string
          id?: string
          kind?: string
          photo_path?: string | null
          rating?: number | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      campus_resources: {
        Row: {
          available: boolean
          capacity: number
          category: string
          id: string
          location: string
          name: string
        }
        Insert: {
          available?: boolean
          capacity?: number
          category: string
          id?: string
          location?: string
          name: string
        }
        Update: {
          available?: boolean
          capacity?: number
          category?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      campus_schedule: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          kind: string
          location: string
          reminder_at: string | null
          starts_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          kind: string
          location?: string
          reminder_at?: string | null
          starts_at: string
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          kind?: string
          location?: string
          reminder_at?: string | null
          starts_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_ids: {
        Row: {
          active: boolean
          approved_by: string | null
          created_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          active?: boolean
          approved_by?: string | null
          created_at?: string
          id?: string
          token?: string
          user_id: string
        }
        Update: {
          active?: boolean
          approved_by?: string | null
          created_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "campus_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string
        }
        Relationships: []
      }
      incident_responses: {
        Row: {
          department: string
          incident_id: string
          note: string
          status: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          department?: string
          incident_id: string
          note?: string
          status: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          department?: string
          incident_id?: string
          note?: string
          status?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incident_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      item_claims: {
        Row: {
          created_at: string
          evidence: string
          id: string
          report_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence: string
          id?: string
          report_id: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          evidence?: string
          id?: string
          report_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_claims_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "campus_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_reads: {
        Row: {
          notice_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notice_id: string
          read_at?: string
          user_id?: string
        }
        Update: {
          notice_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "campus_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          created_at: string
          full_name: string | null
          id: string
          registration_number: string | null
        }
        Insert: {
          account_type?: string
          created_at?: string
          full_name?: string | null
          id: string
          registration_number?: string | null
        }
        Update: {
          account_type?: string
          created_at?: string
          full_name?: string | null
          id?: string
          registration_number?: string | null
        }
        Relationships: []
      }
      resource_bookings: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          purpose: string
          resource_id: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          purpose: string
          resource_id: string
          starts_at: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          purpose?: string
          resource_id?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "campus_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      campus_capability: { Args: { cap: string }; Returns: boolean }
      claimable_item: { Args: { item: string }; Returns: boolean }
      deliver_personal_reminders: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lost_found_feed: {
        Args: never
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          kind: string
          photo_path: string
          status: string
          title: string
        }[]
      }
      public_item_photo: { Args: { path: string }; Returns: boolean }
      resource_availability: {
        Args: { from_time: string; resource: string; to_time: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "campus_manager"
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
      app_role: ["campus_manager"],
    },
  },
} as const
