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
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          room_number: string | null
          staff_id: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_type: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          room_number?: string | null
          staff_id: string
          start_time: string
          status: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          room_number?: string | null
          staff_id?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          created_at: string
          discount: number | null
          due_date: string | null
          id: string
          insurance_claim_id: string | null
          insurance_coverage: number | null
          invoice_date: string
          notes: string | null
          patient_id: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          services: Json
          tax: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          insurance_claim_id?: string | null
          insurance_coverage?: number | null
          invoice_date: string
          notes?: string | null
          patient_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status: string
          services: Json
          tax?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          insurance_claim_id?: string | null
          insurance_coverage?: number | null
          invoice_date?: string
          notes?: string | null
          patient_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          services?: Json
          tax?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          current_utilization: number | null
          description: string | null
          head_staff_id: string | null
          id: string
          location: string | null
          name: string
          total_capacity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_utilization?: number | null
          description?: string | null
          head_staff_id?: string | null
          id?: string
          location?: string | null
          name: string
          total_capacity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_utilization?: number | null
          description?: string | null
          head_staff_id?: string | null
          id?: string
          location?: string | null
          name?: string
          total_capacity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_staff_id_fkey"
            columns: ["head_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number | null
          created_at: string
          expiry_date: string | null
          id: string
          item_name: string
          location: string | null
          quantity: number
          reorder_level: number | null
          status: string
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name: string
          location?: string | null
          quantity: number
          reorder_level?: number | null
          status: string
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name?: string
          location?: string | null
          quantity?: number
          reorder_level?: number | null
          status?: string
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          attachments: string[] | null
          created_at: string
          diagnosis: string
          follow_up_date: string | null
          id: string
          notes: string | null
          patient_id: string
          prescription: Json | null
          record_date: string
          staff_id: string
          treatment: string | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          diagnosis: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription?: Json | null
          record_date: string
          staff_id: string
          treatment?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          diagnosis?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription?: Json | null
          record_date?: string
          staff_id?: string
          treatment?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string | null
          city: string | null
          created_at: string
          current_medications: string | null
          date_of_birth: string
          email: string
          emergency_contact_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          gender: string
          id: string
          insurance_group_number: string | null
          insurance_id: string | null
          insurance_provider: string | null
          last_name: string
          marital_status: string | null
          medical_history: Json | null
          past_surgeries: string | null
          phone: string
          policy_holder_name: string | null
          relationship_to_patient: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string | null
          city?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth: string
          email: string
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_group_number?: string | null
          insurance_id?: string | null
          insurance_provider?: string | null
          last_name: string
          marital_status?: string | null
          medical_history?: Json | null
          past_surgeries?: string | null
          phone: string
          policy_holder_name?: string | null
          relationship_to_patient?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string | null
          city?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string
          email?: string
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_group_number?: string | null
          insurance_id?: string | null
          insurance_provider?: string | null
          last_name?: string
          marital_status?: string | null
          medical_history?: Json | null
          past_surgeries?: string | null
          phone?: string
          policy_holder_name?: string | null
          relationship_to_patient?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          current_occupancy: number
          department_id: string | null
          id: string
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          current_occupancy?: number
          department_id?: string | null
          id?: string
          room_number: string
          room_type: string
          status: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          department_id?: string | null
          id?: string
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          contact_number: string
          created_at: string
          department: string
          email: string
          first_name: string
          id: string
          joining_date: string
          last_name: string
          license_number: string | null
          qualification: string | null
          role: string
          specialty: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_number: string
          created_at?: string
          department: string
          email: string
          first_name: string
          id?: string
          joining_date: string
          last_name: string
          license_number?: string | null
          qualification?: string | null
          role: string
          specialty?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_number?: string
          created_at?: string
          department?: string
          email?: string
          first_name?: string
          id?: string
          joining_date?: string
          last_name?: string
          license_number?: string | null
          qualification?: string | null
          role?: string
          specialty?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      appointment_dashboard_view: {
        Row: {
          created_at: string | null
          date: string | null
          dayofweek: number | null
          department: string | null
          doctorid: string | null
          doctorname: string | null
          endtime: string | null
          id: string | null
          iscompleted: boolean | null
          isnoshow: boolean | null
          ispending: boolean | null
          istoday: boolean | null
          month: number | null
          notes: string | null
          patientid: string | null
          patientname: string | null
          room_number: string | null
          starttime: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          weeknumber: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patientid"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_stats: {
        Row: {
          completed: number | null
          noshows: number | null
          pending: number | null
          totaltoday: number | null
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          bed_occupancy_rate: number | null
          monthly_revenue: number | null
          today_appointments: number | null
          total_inventory_items: number | null
          total_patients: number | null
          total_staff: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_appointment_availability: {
        Args: {
          p_staff_id: string
          p_date: string
          p_start_time: string
          p_end_time: string
        }
        Returns: boolean
      }
      check_user_in_staff: {
        Args: {
          user_id_param: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_in_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
