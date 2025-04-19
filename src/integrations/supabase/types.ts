export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          client_name: string
          contact_email: string
          contact_person: string
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string
          created_at: string | null
          id: string
          payment_terms: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          client_name: string
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date: string
          created_at?: string | null
          id?: string
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          client_name?: string
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string
          created_at?: string | null
          id?: string
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          cost_rate: number
          created_at: string | null
          department: string
          designation: string
          email: string
          employee_id: string
          first_name: string
          hire_date: string
          last_name: string
          phone: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          cost_rate?: number
          created_at?: string | null
          department: string
          designation: string
          email: string
          employee_id?: string
          first_name: string
          hire_date: string
          last_name: string
          phone?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          cost_rate?: number
          created_at?: string | null
          department?: string
          designation?: string
          email?: string
          employee_id?: string
          first_name?: string
          hire_date?: string
          last_name?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          description: string
          invoice_id: string
          line_item_id: string
          quantity: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          amount: number
          description: string
          invoice_id: string
          line_item_id?: string
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
          unit_price: number
        }
        Update: {
          amount?: number
          description?: string
          invoice_id?: string
          line_item_id?: string
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["invoice_id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at: string | null
          currency: string
          due_date: string
          invoice_date: string
          invoice_id: string
          invoice_number: string
          payment_date: string | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          client_id: string
          created_at?: string | null
          currency?: string
          due_date: string
          invoice_date: string
          invoice_id?: string
          invoice_number: string
          payment_date?: string | null
          status: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          client_id?: string
          created_at?: string | null
          currency?: string
          due_date?: string
          invoice_date?: string
          invoice_id?: string
          invoice_number?: string
          payment_date?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignments: {
        Row: {
          assignment_id: string
          created_at: string | null
          employee_id: string | null
          end_date: string | null
          project_id: string | null
          role: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          project_id?: string | null
          role: string
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          project_id?: string | null
          role?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_statistics"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          client_id: string
          created_at: string | null
          description: string | null
          end_date: string
          project_id: string
          project_name: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string | null
        }
        Insert: {
          budget?: number
          client_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          project_id?: string
          project_name: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
        }
        Update: {
          budget?: number
          client_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          project_id?: string
          project_name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          date: string
          description: string | null
          employee_id: string | null
          hours: number
          project_id: string | null
          time_entry_id: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          date: string
          description?: string | null
          employee_id?: string | null
          hours: number
          project_id?: string | null
          time_entry_id?: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          date?: string
          description?: string | null
          employee_id?: string | null
          hours?: number
          project_id?: string | null
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_statistics"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      project_statistics: {
        Row: {
          budget: number | null
          progress_percentage: number | null
          project_id: string | null
          project_name: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          team_size: number | null
          total_hours: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assignment_status: "ACTIVE" | "COMPLETED"
      project_status: "ACTIVE" | "COMPLETED" | "ON_HOLD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assignment_status: ["ACTIVE", "COMPLETED"],
      project_status: ["ACTIVE", "COMPLETED", "ON_HOLD"],
    },
  },
} as const
