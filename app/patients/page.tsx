'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react';
import { PatientsTable } from '@/components/patients/patients-table';
import { NewPatientForm, PatientFormValues } from '@/components/patients/new-patient-form';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/utils/supabase/client';
import { usePatientData } from '@/hooks/use-patient';

export default function PatientsPage() {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const { toast } = useToast();
  const { patients, fetchPatients, isLoading, updatePatient, deletePatient } = usePatientData();

  const handleRefresh = async () => {
    try {
      // Call fetchPatients to get the latest data from the database
      const result = await fetchPatients();
      
      // Check if there was an error during fetching
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: 'Refreshed',
        description: 'Patient data has been refreshed',
      });
    } catch (error) {
      console.error('Error refreshing patient data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh patient data',
        variant: 'destructive',
      });
    }
  };

  const handleNewPatientSubmit = async (patientData: PatientFormValues) => {
    try {
      // Map form fields to database fields, ensuring required fields are present
      const dbPatient = {
        // Required fields
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address,
        phone: patientData.phone,
        email: patientData.email,

        // Optional fields
        marital_status: patientData.maritalStatus || null,
        city: patientData.city || null,
        state: patientData.state || null,
        zip_code: patientData.zipCode || null,
        blood_type: patientData.bloodType === 'unknown' ? null : patientData.bloodType,
        allergies: patientData.hasAllergies ? patientData.allergies : null,
        current_medications: patientData.currentMedications || null,
        past_surgeries: patientData.pastSurgeries || null,
        chronic_conditions: patientData.chronicConditions || null,
        
        // Emergency contact fields
        emergency_contact_name: patientData.contactName || null,
        emergency_contact_relationship: patientData.relationship || null,
        emergency_contact_phone: patientData.contactPhone || null,
        emergency_contact_address: patientData.contactAddress || null,

        // Insurance fields (only if hasInsurance is true)
        insurance_provider: patientData.hasInsurance ? patientData.insuranceProvider : null,
        insurance_id: patientData.hasInsurance ? patientData.insuranceId : null,
        insurance_group_number: patientData.hasInsurance ? patientData.groupNumber : null,
        policy_holder_name: patientData.hasInsurance ? patientData.policyHolderName : null,
        relationship_to_patient: patientData.hasInsurance ? patientData.relationshipToPatient : null,
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(dbPatient)
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'New patient has been successfully added',
      });
      setIsNewPatientModalOpen(false);
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to add new patient. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Patient Management
          </h1>
          <p className='text-muted-foreground'>
            Manage patient records and information
          </p>
        </div>
        <Button
          onClick={() => setIsNewPatientModalOpen(true)}
          className='gap-2'
        >
          <PlusCircle className='h-4 w-4' />
          New Patient
        </Button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
        <div className='relative w-full md:w-96'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search patients...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='flex gap-2 w-full md:w-auto'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by gender' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Genders</SelectItem>
                <SelectItem value='male'>Male</SelectItem>
                <SelectItem value='female'>Female</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <PatientsTable 
        searchQuery={searchQuery} 
        genderFilter={genderFilter} 
        patients={patients}
        isLoading={isLoading}
        updatePatient={updatePatient}
        deletePatient={deletePatient}
      />

      <NewPatientForm
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSubmit={handleNewPatientSubmit}
      />
    </div>
  );
}
