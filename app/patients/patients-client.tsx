'use client';

import { useState, useEffect } from 'react';
import { usePatientData } from '@/hooks/use-patient';
import { PatientsTable } from '@/components/patients/patients-table';
import { NewPatientForm } from '@/components/patients/new-patient-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import type { Patient } from '@/types/patients';
import { useToast } from '@/hooks/use-toast';
import { PatientFormValues } from '@/components/patients/new-patient-form';

interface PatientsClientProps {
  initialPatients: Patient[];
  initialCount: number;
}

export default function PatientsClient({
  initialPatients,
  initialCount,
}: PatientsClientProps) {
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [patientsPerPage] = useState(10);
  const [displayPatients, setDisplayPatients] =
    useState<Patient[]>(initialPatients);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [isRefetching, setIsRefetching] = useState(false);
  const { toast } = useToast();

  // Use our refactored hook that now uses server actions for mutations
  const { patients, isLoading, createPatient, updatePatient, deletePatient, getPaginatedPatients} =
    usePatientData();

  // Fetch paginated patients with server action
  const fetchPaginatedPatients = async () => {
    setIsRefetching(true);

    try {
      const result = await getPaginatedPatients(
        currentPage,
        patientsPerPage,
        searchQuery,
        genderFilter,
        statusFilter
      );

      if (result.error) {
        console.error('Error fetching paginated patients:', result.error);
        return;
      }

      setDisplayPatients(result.patients);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching paginated patients:', error);
    } finally {
      setIsRefetching(false);
    }
  };

  // Update data when filters or pagination change
  useEffect(() => {
    fetchPaginatedPatients();
  }, [currentPage, searchQuery, genderFilter, statusFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, genderFilter, statusFilter]);

  // Update local state when real-time changes occur
  useEffect(() => {
    if (patients.length > 0) {
      fetchPaginatedPatients(); // Refresh when we get real-time updates
    }
  }, [patients.length]);

  // Handle new patient form submission
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


  // Handle patient deletion
  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);

      // Refresh current page (or go to previous page if this was the only item)
      if (displayPatients.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchPaginatedPatients();
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  // Handle patient update
  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      await updatePatient(updatedPatient);
      // Refresh to show updated patient data
      fetchPaginatedPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold'>Patients</h1>
            <p className='text-muted-foreground'>
              Manage patient records and information
            </p>
          </div>
          <Button
            className='w-full md:w-auto'
            onClick={() => setIsNewPatientModalOpen(true)}
          >
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Patient
          </Button>
        </div>

        {/* Filters */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search patients...'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='Admitted'>Admitted</SelectItem>
                <SelectItem value='Discharged'>Discharged</SelectItem>
                <SelectItem value='Outpatient'>Outpatient</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger>
              <SelectValue placeholder='Filter by gender' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='all'>All Genders</SelectItem>
                <SelectItem value='Male'>Male</SelectItem>
                <SelectItem value='Female'>Female</SelectItem>
                <SelectItem value='Other'>Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Patients table */}
        <PatientsTable
          searchQuery={searchQuery}
          genderFilter={genderFilter}
          statusFilter={statusFilter}
          patients={displayPatients}
          totalCount={totalCount}
          currentPage={currentPage}
          patientsPerPage={patientsPerPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading || isRefetching}
          updatePatient={handleUpdatePatient}
          deletePatient={handleDeletePatient}
        />
      </div>

      {/* New Patient Form */}
      <NewPatientForm
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSubmit={handleNewPatientSubmit}
      />
    </div>
  );
}
