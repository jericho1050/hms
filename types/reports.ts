export type RevenueDept = {
  name: string;
  revenue: number;
  target: number;
}

export type InsuranceClaim = {
  id: string;
  patient: string;
  amount: number;
  status: string;
  provider: string;
  submittedDate: string;
  paidDate: string | null;
}

export type DemographicData = {
  gender: string;
  count: number;
}

export type AgeData = {
  age: string;
  count: number;
}

export type PatientDemographics = {
  genderDistribution: DemographicData[];
  ageDistribution: AgeData[];
}

export type AppointmentStats = {
  totalAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  noShowRate: number;
}

export type BedOccupancy = {
  department: string;
  total: number;
  occupied: number;
  available: number;
}

export type FinancialSummary = {
  totalRevenue: number;
  outstandingBills: number;
  insuranceClaimsCount: number;
  collectionRate: number;
}

export type StaffDeptMap = {
  [key: string]: string;
}

export type DeptCounts = {
  [key: string]: number;
}

export type DeptOccupancy = {
  [key: string]: BedOccupancy;
}


export type FilterState = {
  dateRange: { from: Date | undefined; to: Date | undefined };
  departmentFilter: string;
  reportTypeFilter: string;
}

// Add interfaces for clinical metrics and medical records
export type MedicalRecord = {
  id: string;
  patient_id: string;
  staff_id: string;
  record_date: string;
  diagnosis: string;
  treatment: string;
  prescription: any;
  follow_up_date: string | null;
  notes: string | null;
  attachments: string[] | null;
  vital_signs: any;
}

export type FinancialGrowth = {
  revenueGrowth: number;
  outstandingBillsGrowth: number;
  insuranceClaimsGrowth: number;
  collectionRateGrowth: number;
}

export type RevenueTrend = {
  month: string;
  revenue: number;
  expenses: number;
}

export type PaymentDistribution = {
  name: string;
  value: number;
}



type DiagnosisCount = {
  name: string;
  count: number;
}

type TreatmentOutcome = {
  treatment: string;
  success: number;
  failure: number;
}

type PatientOutcome = {
  month: string;
  improved: number;
  stable: number;
  deteriorated: number;
}

type ReadmissionRate = {
  month: string;
  rate: number;
}

type CommonProcedure = {
  procedure: string;
  count: number;
  avgTime: number;
  complicationRate: number;
}

export type ClinicalMetrics = {
  patientsByAge?: Array<{
    age: string;
    count: number;
  }>;
  patientsByGender?: Array<{
    gender: string;
    count: number;
  }>;
  diagnosisFrequency?: DiagnosisCount[];
  treatmentOutcomes?: TreatmentOutcome[];
  patientOutcomes?: PatientOutcome[];
  readmissionRates?: ReadmissionRate[];
  commonProcedures?: CommonProcedure[];
  patientSatisfaction?: {
    rate: number;
    change: number;
  };
  lengthOfStay?: {
    days: number;
    change: number;
  };
  readmissionRate?: {
    rate: number;
    change: number;
  };
  mortalityRate?: {
    rate: number;
    change: number;
  };
}