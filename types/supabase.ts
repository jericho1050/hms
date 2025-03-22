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
      ai_diagnosis_logs: {
        Row: {
          ai_response: string
          created_at: string
          feedback: string | null
          id: string
          is_helpful: boolean | null
          medical_history: string | null
          patient_id: string
          symptoms: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          medical_history?: string | null
          patient_id: string
          symptoms: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          feedback?: string | null
          id?: string
          is_helpful?: boolean | null
          medical_history?: string | null
          patient_id?: string
          symptoms?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_diagnosis_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
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
          total_paid: number | null
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
          total_paid?: number | null
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
          total_paid?: number | null
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
          color: string | null
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
          color?: string | null
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
          color?: string | null
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
      financial_historical_metrics: {
        Row: {
          id: number
          metric_name: string
          metric_value: number
          period: string
          recorded_at: string | null
        }
        Insert: {
          id?: number
          metric_name: string
          metric_value: number
          period: string
          recorded_at?: string | null
        }
        Update: {
          id?: number
          metric_name?: string
          metric_value?: number
          period?: string
          recorded_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number | null
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          item_name: string
          last_restocked: string | null
          location: string | null
          quantity: number
          reorder_level: number | null
          sku: string | null
          status: string
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          item_name: string
          last_restocked?: string | null
          location?: string | null
          quantity: number
          reorder_level?: number | null
          sku?: string | null
          status: string
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          item_name?: string
          last_restocked?: string | null
          location?: string | null
          quantity?: number
          reorder_level?: number | null
          sku?: string | null
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
          outcome: string | null
          patient_id: string
          prescription: Json | null
          readmission: boolean | null
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
          outcome?: string | null
          patient_id: string
          prescription?: Json | null
          readmission?: boolean | null
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
          outcome?: string | null
          patient_id?: string
          prescription?: Json | null
          readmission?: boolean | null
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
      patient_room_assignments: {
        Row: {
          admission_date: string
          assigned_by: string
          bed_number: number
          created_at: string
          discharge_date: string | null
          id: string
          notes: string | null
          patient_id: string
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admission_date?: string
          assigned_by: string
          bed_number: number
          created_at?: string
          discharge_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admission_date?: string
          assigned_by?: string
          bed_number?: number
          created_at?: string
          discharge_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_room_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_room_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_occupancy_history"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "patient_room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
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
          past_surgeries: string | null
          phone: string
          policy_holder_name: string | null
          relationship_to_patient: string | null
          state: string | null
          status: string
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
          past_surgeries?: string | null
          phone: string
          policy_holder_name?: string | null
          relationship_to_patient?: string | null
          state?: string | null
          status?: string
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
          past_surgeries?: string | null
          phone?: string
          policy_holder_name?: string | null
          relationship_to_patient?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      report_schedules: {
        Row: {
          created_at: string
          file_format: string | null
          filters: Json
          frequency: string
          id: string
          last_run: string | null
          next_run: string
          recipients: string
          report_name: string
          report_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at: string
          file_format?: string | null
          filters: Json
          frequency: string
          id?: string
          last_run?: string | null
          next_run: string
          recipients: string
          report_name: string
          report_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_format?: string | null
          filters?: Json
          frequency?: string
          id?: string
          last_run?: string | null
          next_run?: string
          recipients?: string
          report_name?: string
          report_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          cleaning_status: string | null
          created_at: string
          current_occupancy: number
          department_id: string | null
          features: Json | null
          floor: string | null
          id: string
          is_isolation: boolean | null
          last_cleaned: string | null
          room_number: string
          room_type: string
          status: string
          updated_at: string
          wing: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          cleaning_status?: string | null
          created_at?: string
          current_occupancy?: number
          department_id?: string | null
          features?: Json | null
          floor?: string | null
          id?: string
          is_isolation?: boolean | null
          last_cleaned?: string | null
          room_number: string
          room_type: string
          status: string
          updated_at?: string
          wing?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          cleaning_status?: string | null
          created_at?: string
          current_occupancy?: number
          department_id?: string | null
          features?: Json | null
          floor?: string | null
          id?: string
          is_isolation?: boolean | null
          last_cleaned?: string | null
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
          wing?: string | null
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
          availability: Json | null
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
          user_id: string | null
        }
        Insert: {
          address?: string | null
          availability?: Json | null
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
          user_id?: string | null
        }
        Update: {
          address?: string | null
          availability?: Json | null
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
          user_id?: string | null
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
      room_occupancy_history: {
        Row: {
          capacity: number | null
          current_patients: number | null
          date: string | null
          department_id: string | null
          department_name: string | null
          occupancy_rate: number | null
          patients_admitted: number | null
          room_id: string | null
          room_number: string | null
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
    }
    Functions: {
      assign_patient_to_room: {
        Args: {
          p_patient_id: string
          p_room_id: string
          p_bed_number: number
          p_staff_id: string
        }
        Returns: string
      }
      check_appointment_availability: {
        Args: {
          p_staff_id: string
          p_date: string
          p_start_time: string
          p_end_time: string
        }
        Returns: boolean
      }
      check_room_availability: {
        Args: {
          p_room_id: string
        }
        Returns: boolean
      }
      check_user_in_staff: {
        Args: {
          user_id_param: string
        }
        Returns: boolean
      }
      discharge_patient_from_room: {
        Args: {
          p_assignment_id: string
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
      recalculate_room_occupancy: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      staff_status: "active" | "inactive" | "on-leave"
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
