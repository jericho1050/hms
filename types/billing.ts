import { Database } from '@/types/supabase';

export interface BillingRecord {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  invoice_date: string;
  due_date: string | null;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'partially_paid';
  payment_method: string | null;
  payment_date: string | null;
  services: BillingService[];
  insurance_claim_id: string | null;
  insurance_coverage: number | null;
  discount: number | null;
  tax: number | null;
  notes: string | null;
}

export interface BillingService {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: string;
}

export interface BillingWithPatient extends BillingRecord {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export type BillingFilter = {
  startDate?: Date;
  endDate?: Date;
  patientId?: string;
  paymentStatus?: string;
  minAmount?: number;
  maxAmount?: number;
};

export type BillingInsert = Omit<
  Database['public']['Tables']['billing']['Insert'],
  'id' | 'created_at' | 'updated_at'
>;

export type BillingUpdate = Omit<
  Database['public']['Tables']['billing']['Update'],
  'created_at' | 'updated_at'
>;

export interface BillingFormData {
  patient_id: string;
  invoice_date: Date;
  due_date?: Date;
  total_amount?: number;
  payment_status: string;
  payment_method?: string;
  payment_date?: Date;
  services: BillingService[];
  insurance_claim_id?: string;
  insurance_coverage?: number;
  discount?: number;
  tax?: number;
  notes?: string;
}