export interface Patient {
    groupNumber: string
    policyHolderName: string
    relationshipToPatient: "other" | "self" | "spouse" | "parent"
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    maritalStatus: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    bloodType: string | null
    allergies: string[] | null
    currentMedications: string | null
    pastSurgeries: string | null
    chronicConditions: string | null
    emergencyContactName: string | null
    emergencyContactRelationship: string | null
    emergencyContactPhone: string | null
    insuranceProvider: string | null
    insuranceId: string | null
    insuranceGroupNumber: string | null
  }
  
  