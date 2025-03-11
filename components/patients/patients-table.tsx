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
import { mockPatients } from "@/lib/mock-patients"
import type { Patient } from "@/types/patients"

interface PatientsTableProps {
  searchQuery: string
  genderFilter: string
}

export function PatientsTable({ searchQuery, genderFilter }: PatientsTableProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const patientsPerPage = 10
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)

  // Fetch patients data (mock data for now)
  useEffect(() => {
    setPatients(mockPatients)
  }, [])

  // Filter patients based on search query and gender filter
  useEffect(() => {
    let filtered = [...patients]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(query) ||
          patient.lastName.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query),
      )
    }

    if (genderFilter !== "all") {
      filtered = filtered.filter((patient) => patient.gender.toLowerCase() === genderFilter)
    }

    setFilteredPatients(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [patients, searchQuery, genderFilter])

  // Get current page patients
  const currentPatients = filteredPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage)

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

  const confirmDeletePatient = () => {
    if (!selectedPatient) return

    // In a real app, this would call an API to delete the patient
    setPatients(patients.filter((p) => p.id !== selectedPatient.id))

    toast({
      title: "Patient deleted",
      description: `${selectedPatient.firstName} ${selectedPatient.lastName} has been removed`,
      variant: "destructive",
    })

    setIsDeleteDialogOpen(false)
  }

  const handleUpdatePatient = (updatedPatient: Patient) => {
    // In a real app, this would call an API to update the patient
    setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))

    toast({
      title: "Patient updated",
      description: "Patient information has been updated successfully",
    })

    setIsEditModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPatients.length > 0 ? (
              currentPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
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
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * patientsPerPage + 1} to{" "}
            {Math.min(currentPage * patientsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
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

