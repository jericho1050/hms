"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PatientDetailsDialog } from "./patient-details-dialog"
import { EditPatientForm } from "./edit-patient-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Patient } from "@/types/patients"
import { supabase } from "@/utils/supabase/client"
import { mapDbPatientToPatient } from "@/hooks/use-patient"

interface PatientsTableProps {
  searchQuery: string
  genderFilter: string
  statusFilter: string
  patients: Patient[] // This will now be only the current page's patients
  isLoading: boolean
  updatePatient: (updatedPatient: Patient) => Promise<any>
  deletePatient: (patientId: string) => Promise<any>
}

export function PatientsTable({ 
  searchQuery, 
  genderFilter,
  statusFilter,
  patients,
  isLoading,
  updatePatient,
  deletePatient
}: PatientsTableProps) {
  
  const [currentPage, setCurrentPage] = useState(0) // Change to 0-indexed to match Supabase
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedPatients, setPaginatedPatients] = useState<Patient[]>([])
  const [isRefetching, setIsRefetching] = useState(false)
  const { toast } = useToast()

  const patientsPerPage = 10
  const totalPages = Math.ceil(totalCount / patientsPerPage)

  // Function to fetch patients with server-side pagination and filtering
  const fetchPaginatedPatients = async () => {
    try {
      setIsRefetching(true)
      
      // Start building the query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
      
      // Apply filters
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase()
        query = query
          .or(`first_name.ilike.%${searchTerms}%,last_name.ilike.%${searchTerms}%,email.ilike.%${searchTerms}%,id.ilike.%${searchTerms}%`)
      }
      
      if (genderFilter !== "all") {
        query = query.eq('gender', genderFilter)
      }
      
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter)
      }
      
      // Calculate range
      const start = currentPage * patientsPerPage
      const end = start + patientsPerPage - 1
      
      // Apply pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)
      
      if (error) {
        throw error
      }
      
      // Map database records to our Patient type using the existing mapper
      const mappedPatients = data ? data.map(dbRecord => mapDbPatientToPatient(dbRecord)) : []
      
      setPaginatedPatients(mappedPatients)
      
      // Update total count for pagination
      if (count !== null) {
        setTotalCount(count)
      }
    } catch (error) {
      console.error('Error fetching paginated patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    } finally {
      setIsRefetching(false)
    }
  }
  
  // Fetch paginated patients when page, filters change
  useEffect(() => {
    fetchPaginatedPatients()
  }, [currentPage, searchQuery, genderFilter, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsEditModalOpen(true)
  }

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePatient = async () => {
    if (!selectedPatient) return

    try {
      const result = await deletePatient(selectedPatient.id)
      
      if (result.error) {
        throw result.error
      }

      toast({
        title: "Patient deleted",
        description: `${selectedPatient.firstName} ${selectedPatient.lastName} has been removed`,
      })
      
      // Refetch current page (or go to previous page if this was the only item)
      if (paginatedPatients.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchPaginatedPatients()
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      const result = await updatePatient(updatedPatient)
      
      if (result.error) {
        throw result.error
      }

      toast({
        title: "Patient updated",
        description: "Patient information has been updated successfully",
      })
      
      // Refresh the current page data
      fetchPaginatedPatients()
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      })
    } finally {
      setIsEditModalOpen(false)
    }
  }
  
  // Get the patients to display - either from our server-paginated data or original prop
  const displayPatients = paginatedPatients.length > 0 ? paginatedPatients : patients

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="w-[100px]">ID</TableHead> */}
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isRefetching ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>Loading patients...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayPatients.length > 0 ? (
              displayPatients.map((patient) => (
                <TableRow key={patient.id}>
                  {/* <TableCell className="font-medium">{patient.id}</TableCell> */}
                  <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{patient.phone}</span>
                      <span className="text-xs text-muted-foreground">{patient.email}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={patient.status === "Admitted" ? "admitted" : patient.status === "Discharged" ? "discharged" : "outpatient"} className="capitalize">
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.insuranceProvider ? (
                      <div className="flex flex-col">
                        <span className="text-sm">{patient.insuranceProvider}</span>
                        <span className="text-xs text-muted-foreground">ID: {patient.insuranceId}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit patient
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePatient(patient)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>No patients found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * patientsPerPage + 1} to{" "}
            {Math.min((currentPage + 1) * patientsPerPage, totalCount)} of {totalCount} patients
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(0)} disabled={currentPage === 0}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Patient Details Dialog */}
      {selectedPatient && (
        <PatientDetailsDialog
          patient={selectedPatient}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {/* Edit Patient Form */}
      {selectedPatient && (
        <EditPatientForm
          patient={selectedPatient}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdatePatient}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedPatient?.firstName} {selectedPatient?.lastName}'s record and cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePatient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

