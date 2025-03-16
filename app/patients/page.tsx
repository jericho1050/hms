'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react';
import { PatientsTable } from '@/components/patients/patients-table';
import {
  NewPatientForm,
  PatientFormValues,
} from '@/components/patients/new-patient-form';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatientData } from '@/hooks/use-patient';

export default function PatientsPage() {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  
  // We're no longer fetching all patients upfront
  const {
    // No need for patients array since we'll fetch paginated data directly in the PatientsTable
    isLoading,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatientData();

  const handleNewPatientSubmit = async (patientData: PatientFormValues) => {
    try {
      const res = await createPatient(patientData);
      if (res.success) {
        toast({
          title: 'Success',
          description: 'New patient has been successfully added',
        });
        setIsNewPatientModalOpen(false);
      } else {
        throw res.error;
      }
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
              <SelectTrigger className='w-[150px]'>
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
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='Admitted'>Admitted</SelectItem>
                <SelectItem value='Discharged'>Discharged</SelectItem>
                <SelectItem value='Outpatient'>Outpatient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <PatientsTable
        searchQuery={searchQuery}
        genderFilter={genderFilter}
        statusFilter={statusFilter}
        patients={[]} // Pass empty array as server-side pagination handles fetching
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
