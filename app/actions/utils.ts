import type { Patient } from "@/types/patients";

// Define the shape of database patient records for mapping
export interface DbPatient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string;
  email: string;
  blood_type: string | null;
  allergies: string[] | null;
  current_medications: string | null;
  past_surgeries: string | null;
  chronic_conditions: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  insurance_provider: string | null;
  insurance_id: string | null;
  insurance_group_number: string | null;
  policy_holder_name: string | null;
  relationship_to_patient: string | null;
  status: string;
  created_at?: string;
}

export const mapDbPatientToPatient = (dbRecord: any): Patient => {
  return {
    id: dbRecord.id,
    firstName: dbRecord.first_name,
    lastName: dbRecord.last_name,
    dateOfBirth: dbRecord.date_of_birth,
    gender: dbRecord.gender,
    maritalStatus: dbRecord.marital_status || "",
    address: dbRecord.address || "",
    city: dbRecord.city || "",
    state: dbRecord.state || "",
    zipCode: dbRecord.zip_code || "",
    phone: dbRecord.phone || "",
    email: dbRecord.email || "",
    bloodType: dbRecord.blood_type,
    allergies: dbRecord.allergies,
    currentMedications: dbRecord.current_medications,
    pastSurgeries: dbRecord.past_surgeries,
    chronicConditions: dbRecord.chronic_conditions,
    emergencyContactName: dbRecord.emergency_contact_name,
    emergencyContactRelationship: dbRecord.emergency_contact_relationship,
    emergencyContactPhone: dbRecord.emergency_contact_phone,
    insuranceProvider: dbRecord.insurance_provider,
    insuranceId: dbRecord.insurance_id,
    insuranceGroupNumber: dbRecord.insurance_group_number,
    groupNumber: dbRecord.insurance_group_number,
    policyHolderName: dbRecord.policy_holder_name,
    relationshipToPatient: dbRecord.relationship_to_patient,
    status: dbRecord.status || "Admitted"
  };
}

// Reverse mapping for sending data to Supabase
export const mapPatientToDbPatient = (patient: Patient): Omit<DbPatient, 'created_at'> => {
  return {
    id: patient.id,
    first_name: patient.firstName,
    last_name: patient.lastName,
    date_of_birth: patient.dateOfBirth,
    gender: patient.gender,
    marital_status: patient.maritalStatus,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    zip_code: patient.zipCode,
    phone: patient.phone,
    email: patient.email,
    blood_type: patient.bloodType,
    allergies: patient.allergies,
    current_medications: patient.currentMedications,
    past_surgeries: patient.pastSurgeries,
    chronic_conditions: patient.chronicConditions,
    emergency_contact_name: patient.emergencyContactName,
    emergency_contact_relationship: patient.emergencyContactRelationship,
    emergency_contact_phone: patient.emergencyContactPhone,
    insurance_provider: patient.insuranceProvider,
    insurance_id: patient.insuranceId,
    insurance_group_number: patient.insuranceGroupNumber,
    policy_holder_name: patient.policyHolderName,
    relationship_to_patient: patient.relationshipToPatient,
    status: patient.status
  };
}