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
