export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          address: string
          phone: string
          email: string
          insurance_provider: string | null
          insurance_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: Json | null
          allergies: string[] | null
          blood_type: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          address: string
          phone: string
          email: string
          insurance_provider?: string | null
          insurance_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Json | null
          allergies?: string[] | null
          blood_type?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          address?: string
          phone?: string
          email?: string
          insurance_provider?: string | null
          insurance_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Json | null
          allergies?: string[] | null
          blood_type?: string | null
        }
      }
      staff: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          first_name: string
          last_name: string
          role: string
          department: string
          specialty: string | null
          qualification: string | null
          joining_date: string
          contact_number: string
          email: string
          address: string | null
          status: string
          license_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          first_name: string
          last_name: string
          role: string
          department: string
          specialty?: string | null
          qualification?: string | null
          joining_date: string
          contact_number: string
          email: string
          address?: string | null
          status: string
          license_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          first_name?: string
          last_name?: string
          role?: string
          department?: string
          specialty?: string | null
          qualification?: string | null
          joining_date?: string
          contact_number?: string
          email?: string
          address?: string | null
          status?: string
          license_number?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          staff_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: string
          appointment_type: string
          reason: string | null
          notes: string | null
          room_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          staff_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: string
          appointment_type: string
          reason?: string | null
          notes?: string | null
          room_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          staff_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: string
          appointment_type?: string
          reason?: string | null
          notes?: string | null
          room_number?: string | null
        }
      }
      medical_records: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          staff_id: string
          record_date: string
          diagnosis: string
          treatment: string | null
          prescription: Json | null
          follow_up_date: string | null
          notes: string | null
          attachments: string[] | null
          vital_signs: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          staff_id: string
          record_date: string
          diagnosis: string
          treatment?: string | null
          prescription?: Json | null
          follow_up_date?: string | null
          notes?: string | null
          attachments?: string[] | null
          vital_signs?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          staff_id?: string
          record_date?: string
          diagnosis?: string
          treatment?: string | null
          prescription?: Json | null
          follow_up_date?: string | null
          notes?: string | null
          attachments?: string[] | null
          vital_signs?: Json | null
        }
      }
      inventory: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          item_name: string
          category: string
          quantity: number
          unit: string | null
          cost_per_unit: number | null
          supplier: string | null
          reorder_level: number | null
          location: string | null
          expiry_date: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          item_name: string
          category: string
          quantity: number
          unit?: string | null
          cost_per_unit?: number | null
          supplier?: string | null
          reorder_level?: number | null
          location?: string | null
          expiry_date?: string | null
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          item_name?: string
          category?: string
          quantity?: number
          unit?: string | null
          cost_per_unit?: number | null
          supplier?: string | null
          reorder_level?: number | null
          location?: string | null
          expiry_date?: string | null
          status?: string
        }
      }
      billing: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          invoice_date: string
          due_date: string | null
          total_amount: number
          payment_status: string
          payment_method: string | null
          payment_date: string | null
          services: Json
          insurance_claim_id: string | null
          insurance_coverage: number | null
          discount: number | null
          tax: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          invoice_date: string
          due_date?: string | null
          total_amount: number
          payment_status: string
          payment_method?: string | null
          payment_date?: string | null
          services: Json
          insurance_claim_id?: string | null
          insurance_coverage?: number | null
          discount?: number | null
          tax?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          invoice_date?: string
          due_date?: string | null
          total_amount?: number
          payment_status?: string
          payment_method?: string | null
          payment_date?: string | null
          services?: Json
          insurance_claim_id?: string | null
          insurance_coverage?: number | null
          discount?: number | null
          tax?: number | null
          notes?: string | null
        }
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

