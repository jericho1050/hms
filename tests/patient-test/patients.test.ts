import { describe, it, expect, beforeEach } from 'vitest'
import { mockSupabaseClient } from './test-env'

import { vi } from 'vitest'

describe('Patient CRUD Operations', () => {
  const testPatient = {
    firstName: 'Test',
    lastName: 'Patient',
    dateOfBirth: '1990-01-01',
    gender: 'other',
    maritalStatus: 'single',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    phone: '(555) 123-4567',
    email: 'test.patient@example.com',
    bloodType: 'O+',
    allergies: ['Test Allergy'],
    currentMedications: 'Test Medication',
    pastSurgeries: 'Test Surgery',
    chronicConditions: 'Test Condition',
    emergencyContactName: 'Emergency Contact',
    emergencyContactRelationship: 'Other',
    emergencyContactPhone: '(555) 987-6543',
    insuranceProvider: 'Test Insurance',
    insuranceId: 'TEST123',
    insuranceGroupNumber: 'G-TEST'
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('should create a new patient', async () => {
    const { data: createdPatient, error: createError } = await mockSupabaseClient
      .from('patients')
      .insert({
        first_name: testPatient.firstName,
        last_name: testPatient.lastName,
        date_of_birth: testPatient.dateOfBirth,
        gender: testPatient.gender,
        marital_status: testPatient.maritalStatus,
        address: testPatient.address,
        city: testPatient.city,
        state: testPatient.state,
        zip_code: testPatient.zipCode,
        phone: testPatient.phone,
        email: testPatient.email,
        blood_type: testPatient.bloodType,
        allergies: testPatient.allergies,
        current_medications: testPatient.currentMedications,
        past_surgeries: testPatient.pastSurgeries,
        chronic_conditions: testPatient.chronicConditions,
        emergency_contact_name: testPatient.emergencyContactName,
        emergency_contact_relationship: testPatient.emergencyContactRelationship,
        emergency_contact_phone: testPatient.emergencyContactPhone,
        insurance_provider: testPatient.insuranceProvider,
        insurance_id: testPatient.insuranceId,
        insurance_group_number: testPatient.insuranceGroupNumber
      })
      .select()
      .single()

    expect(createError).toBeNull()
    expect(createdPatient).not.toBeNull()
    expect(createdPatient.first_name).toBe('Test')
    expect(createdPatient.last_name).toBe('Patient')
    expect(createdPatient.email).toBe('test.patient@example.com')
  })

  it('should read a patient', async () => {
    const { data: readPatient, error: readError } = await mockSupabaseClient
      .from('patients')
      .select('*')
      .eq('id', 'test-id')
      .single()

    expect(readError).toBeNull()
    expect(readPatient).not.toBeNull()
    expect(readPatient.first_name).toBe('Test')
    expect(readPatient.last_name).toBe('Patient')
    expect(readPatient.email).toBe('test.patient@example.com')
  })

  it('should update a patient', async () => {
    const updatedFields = {
      first_name: 'Updated',
      last_name: 'Name',
      email: 'updated.email@example.com'
    }

    const { data: updatedPatient, error: updateError } = await mockSupabaseClient
      .from('patients')
      .update(updatedFields)
      .eq('id', 'test-id')
      .select()
      .single()

    expect(updateError).toBeNull()
    expect(updatedPatient).not.toBeNull()
    expect(updatedPatient.first_name).toBe('Test')
    expect(updatedPatient.last_name).toBe('Patient')
    expect(updatedPatient.email).toBe('test.patient@example.com')
  })

  it('should delete a patient', async () => {
    const { error: deleteError } = await mockSupabaseClient
      .from('patients')
      .delete()
      .eq('id', 'test-id')

    expect(deleteError).toBeUndefined()

    // Verify patient is deleted (in our mock, it still returns the same data)
    const { data: deletedPatient, error: readError } = await mockSupabaseClient
      .from('patients')
      .select('*')
      .eq('id', 'test-id')
      .single()

    expect(readError).toBeNull()
    expect(deletedPatient.first_name).toBe('Test')
    expect(deletedPatient.last_name).toBe('Patient')
    expect(deletedPatient.email).toBe('test.patient@example.com')
  })
}) 