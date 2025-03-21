'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  FileText,
  Users,
  CreditCard,
  Calendar,
  Activity,
  Droplets,
  AlertTriangle,
  Pill,
  Scissors,
  HeartPulse,
  Clock,
  Loader2,
  Brain,
} from 'lucide-react';
import type { Patient } from '@/types/patients';
import type { Appointment } from '@/types/appointments';
import { useAppointments } from '@/hooks/use-appointments';
import { usePatientData } from '@/hooks/use-patient';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/utils/supabase/client';
import { FloatingDiagnosisAssistant } from '../ai/floating-diagnosis-assistant';
import { calculateAge } from '@/lib/utils';

// Define service types
interface ServiceItem {
  name: string;
  cost: number;
}

interface PatientDetailsDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailsDialog({
  patient,
  isOpen,
  onClose,
}: PatientDetailsDialogProps) {
  const { appointments, fetchAppointments, isLoading } = useAppointments();
  const {
    fetchPatientBillingHistory,
    billingHistory,
    isBillingLoading,
    billingError,
    handleBillingChange,
  } = usePatientData();
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(
    []
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Fetch appointments when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen, fetchAppointments]);

  // Fetch billing history when tab changes to billing
  useEffect(() => {
    if (isOpen && activeTab === 'billing' && patient.id) {
      // We now do this in the onValueChange handler, but keep this for safety
      // The Promise.resolve ensures it runs in the next tick, which helps with tests
      Promise.resolve().then(() => {
        fetchPatientBillingHistory(patient.id);
      });
    }
  }, [isOpen, activeTab, patient.id, fetchPatientBillingHistory]);

  // Set up real-time subscription for billing updates
  useEffect(() => {
    if (isOpen && patient.id && typeof supabase.channel === 'function') {
      const billingChannel = supabase
        .channel('billing-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'billing' },
          (payload: any) => handleBillingChange(payload, patient.id)
        )
        .subscribe();

      return () => {
        if (typeof supabase.removeChannel === 'function') {
          supabase.removeChannel(billingChannel);
        }
      };
    }
    return undefined;
  }, [isOpen, patient.id, handleBillingChange]);

  // Filter appointments for this patient
  useEffect(() => {
    if (appointments.length > 0 && patient.id) {
      const filteredAppointments = appointments.filter(
        (appointment) => appointment.patientId === patient.id
      );
      // Sort appointments by date (most recent first)
      filteredAppointments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPatientAppointments(filteredAppointments);
    }
  }, [appointments, patient.id]);

  // Format appointment status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-green-800 hover:bg-green-100'
          >
            Completed
          </Badge>
        );
      case 'scheduled':
        return <Badge variant='outline'>Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant='destructive'>Cancelled</Badge>;
      case 'no-show':
        return <Badge variant='secondary'>No Show</Badge>;
      case 'in-progress':
        return <Badge variant='default'>In Progress</Badge>;
      case 'checked-in':
        return (
          <Badge
            variant='outline'
            className='bg-blue-100 text-blue-800 hover:bg-blue-100'
          >
            Checked In
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  // Format payment status for display
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-green-800 hover:bg-green-100'
          >
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          >
            Pending
          </Badge>
        );
      case 'overdue':
        return <Badge variant='destructive'>Overdue</Badge>;
      case 'cancelled':
        return <Badge variant='secondary'>Cancelled</Badge>;
      case 'refunded':
        return (
          <Badge
            variant='outline'
            className='bg-blue-100 text-blue-800 hover:bg-blue-100'
          >
            Refunded
          </Badge>
        );
      case 'partial':
        return (
          <Badge
            variant='outline'
            className='bg-purple-100 text-purple-800 hover:bg-purple-100'
          >
            Partial
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle AI diagnosis request
  const handleAiDiagnosis = async () => {
    if (!symptoms.trim()) {
      // Show error or toast notification
      return;
    }

    setIsLoadingAi(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          symptoms,
          medicalHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI diagnosis');
      }

      const data = await response.json();
      setAiResponse(data.suggestions);
    } catch (error: any) {
      console.error('AI diagnosis error:', error);
      // Show error toast
    } finally {
      setIsLoadingAi(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto overflow-x-visible'
        onInteractOutside={(e) => e.preventDefault()}
      >
          {isOpen && activeTab !== 'billing' && activeTab !== 'appointments' && (
            <FloatingDiagnosisAssistant
              patientId={patient.id}
              patientName={`${patient.firstName} ${patient.lastName}`}
            />
          )}

        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            <span data-testid='patient-full-name'>
              {patient.firstName} {patient.lastName}
            </span>
            <Badge variant='outline' className='ml-2 capitalize'>
              {patient.gender}
            </Badge>
            <Badge
              variant={
                patient.status === 'Admitted'
                  ? 'default'
                  : patient.status === 'Discharged'
                  ? 'secondary'
                  : 'outline'
              }
              className='ml-auto'
            >
              {patient.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Patient ID: {patient.id} • Date of Birth:{' '}
            {new Date(patient.dateOfBirth).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue='overview'
          className='w-full'
          onValueChange={(value) => {
            setActiveTab(value);
            // Directly fetch billing history when the billing tab is selected
            if (value === 'billing' && patient.id) {
              fetchPatientBillingHistory(patient.id);
            }
          }}
          value={activeTab}
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='medical'>Medical</TabsTrigger>
            <TabsTrigger value='appointments'>Appointments</TabsTrigger>
            <TabsTrigger value='billing'>Billing</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='space-y-4'>
                <div className='border rounded-md p-4'>
                  <h3 className='font-medium flex items-center mb-2'>
                    <User className='h-4 w-4 mr-2' />
                    Personal Information
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex'>
                      <span className='font-medium w-32'>Full Name:</span>
                      <span>
                        {patient.firstName} {patient.lastName}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Date of Birth:</span>
                      <span>
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Age:</span>
                      <span>
                        {calculateAge(patient.dateOfBirth)}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Gender:</span>
                      <span className='capitalize'>{patient.gender}</span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Marital Status:</span>
                      <span className='capitalize'>
                        {patient.maritalStatus}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Patient Status:</span>
                      <span>
                        <Badge
                          variant={
                            patient.status === 'Admitted'
                              ? 'default'
                              : patient.status === 'Discharged'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {patient.status}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                <div className='border rounded-md p-4'>
                  <h3 className='font-medium flex items-center mb-2'>
                    <Phone className='h-4 w-4 mr-2' />
                    Contact Information
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center'>
                      <span className='font-medium w-32'>Phone:</span>
                      <span data-testid='patient-phone'>{patient.phone}</span>
                    </div>
                    <div className='flex items-center'>
                      <span className='font-medium w-32'>Email:</span>
                      <span data-testid='patient-email'>{patient.email}</span>
                    </div>
                    <div className='flex items-start'>
                      <span className='font-medium w-32'>Address:</span>
                      <span>
                        {patient.address}, {patient.city}, {patient.state}{' '}
                        {patient.zipCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='border rounded-md p-4'>
                  <h3 className='font-medium flex items-center mb-2'>
                    <Users className='h-4 w-4 mr-2' />
                    Emergency Contact
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex'>
                      <span className='font-medium w-32'>Name:</span>
                      <span>
                        {patient.emergencyContactName || 'Not provided'}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Relationship:</span>
                      <span>
                        {patient.emergencyContactRelationship || 'Not provided'}
                      </span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium w-32'>Phone:</span>
                      <span>
                        {patient.emergencyContactPhone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='border rounded-md p-4'>
                  <h3 className='font-medium flex items-center mb-2'>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Insurance Information
                  </h3>
                  {patient.insuranceProvider ? (
                    <div className='space-y-2 text-sm'>
                      <div className='flex'>
                        <span className='font-medium w-32'>Provider:</span>
                        <span>{patient.insuranceProvider}</span>
                      </div>
                      <div className='flex'>
                        <span className='font-medium w-32'>Policy Number:</span>
                        <span>{patient.insuranceId}</span>
                      </div>
                      <div className='flex'>
                        <span className='font-medium w-32'>Group Number:</span>
                        <span>
                          {patient.insuranceGroupNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No insurance information provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='medical' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className='border rounded-md p-4'>
                <h3
                  className='font-medium flex items-center mb-3'
                  data-testid='blood-information'
                >
                  <Droplets className='h-4 w-4 mr-2' />
                  Blood Information
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex'>
                    <span className='font-medium w-32'>Blood Type:</span>
                    <span>
                      {patient.bloodType ? (
                        <Badge variant='outline'>{patient.bloodType}</Badge>
                      ) : (
                        'Unknown'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className='border rounded-md p-4'>
                <h3 className='font-medium flex items-center mb-3'>
                  <AlertTriangle className='h-4 w-4 mr-2' />
                  Allergies
                </h3>
                <div className='space-y-2 text-sm'>
                  {patient.allergies?.length ? (
                    <div className='flex flex-col gap-1'>
                      {patient.allergies.map((allergy, index) => (
                        <div key={index} className='flex items-center'>
                          <Badge variant='destructive' className='mr-2'>
                            !
                          </Badge>
                          <span>{allergy}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No known allergies
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='border rounded-md p-4'>
              <h3 className='font-medium flex items-center mb-3'>
                <HeartPulse className='h-4 w-4 mr-2' />
                Chronic Conditions
              </h3>
              <div className='space-y-2 text-sm'>
                {patient.chronicConditions ? (
                  <div className='whitespace-pre-line'>
                    {patient.chronicConditions}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No chronic conditions reported
                  </p>
                )}
              </div>
            </div>

            <div className='border rounded-md p-4'>
              <h3 className='font-medium flex items-center mb-3'>
                <Pill className='h-4 w-4 mr-2' />
                Current Medications
              </h3>
              <div className='space-y-2 text-sm'>
                {patient.currentMedications ? (
                  <div className='whitespace-pre-line'>
                    {patient.currentMedications}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No current medications
                  </p>
                )}
              </div>
            </div>

            <div className='border rounded-md p-4'>
              <h3 className='font-medium flex items-center mb-3'>
                <Scissors className='h-4 w-4 mr-2' />
                Surgical History
              </h3>
              <div className='space-y-2 text-sm'>
                {patient.pastSurgeries ? (
                  <div className='whitespace-pre-line'>
                    {patient.pastSurgeries}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No past surgeries reported
                  </p>
                )}
              </div>
            </div>

            <div className='border rounded-md p-4'>
              <h3 className='font-medium mb-2'>Recent Medical Records</h3>
              <p className='text-sm text-muted-foreground'>
                No recent medical records found
              </p>
            </div>
          </TabsContent>

          <TabsContent value='appointments'>
            <div className='border rounded-md p-4 mt-4'>
              <h3
                className='font-medium flex items-center mb-3'
                data-testid='appointment-history-title'
              >
                <Calendar className='h-4 w-4 mr-2' />
                Appointment History
              </h3>

              {isLoading ? (
                <div className='flex justify-center py-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                </div>
              ) : patientAppointments.length > 0 ? (
                <div className='space-y-3'>
                  {patientAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className='border rounded-md p-3 hover:bg-muted/50 transition'
                      data-testid='appointment-card'
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <div className='font-medium flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {format(
                                parseISO(appointment.date),
                                'MMMM d, yyyy'
                              )}
                            </span>
                          </div>
                          <div className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
                            <Clock className='h-3 w-3' />
                            <span>
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </div>
                        </div>
                        <div data-testid='appointment-status'>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm'>
                        <div>
                          <span className='font-medium'>Department:</span>{' '}
                          {appointment.department || 'Not specified'}
                        </div>
                        <div data-testid='appointment-doctor'>
                          <span className='font-medium'>Doctor:</span>{' '}
                          {appointment.doctorName || 'Not assigned'}
                        </div>
                        {appointment.type && (
                          <div>
                            <span className='font-medium'>Type:</span>{' '}
                            {appointment.type}
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className='mt-2 text-sm'>
                          <span className='font-medium'>Notes:</span>
                          <p className='mt-1 text-muted-foreground whitespace-pre-line'>
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No appointment history found
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='billing'>
            <div className='border rounded-md p-4 mt-4'>
              <h3 className='font-medium flex items-center mb-4'>
                <CreditCard className='h-4 w-4 mr-2' />
                Billing History
              </h3>

              {isBillingLoading ? (
                <div className='flex justify-center py-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                </div>
              ) : billingHistory.length > 0 ? (
                <div className='space-y-3'>
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className='border rounded-md p-3 hover:bg-muted/50 transition'
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <div className='font-medium flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              Invoice Date:{' '}
                              {new Date(bill.invoice_date).toLocaleDateString()}
                            </span>
                          </div>
                          {bill.due_date && (
                            <div className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
                              <Clock className='h-3 w-3' />
                              <span>
                                Due Date:{' '}
                                {new Date(bill.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>{getPaymentStatusBadge(bill.payment_status)}</div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm'>
                        <div className='font-semibold text-base'>
                          Total: {formatCurrency(bill.total_amount)}
                        </div>
                        {bill.payment_method && (
                          <div>
                            <span className='font-medium'>Payment Method:</span>{' '}
                            {bill.payment_method}
                          </div>
                        )}
                        {bill.payment_date && (
                          <div>
                            <span className='font-medium'>Payment Date:</span>{' '}
                            {new Date(bill.payment_date).toLocaleDateString()}
                          </div>
                        )}
                        {bill.insurance_claim_id && (
                          <div>
                            <span className='font-medium'>
                              Insurance Claim ID:
                            </span>{' '}
                            {bill.insurance_claim_id}
                          </div>
                        )}
                        {bill.insurance_coverage && (
                          <div>
                            <span className='font-medium'>
                              Insurance Coverage:
                            </span>{' '}
                            {formatCurrency(bill.insurance_coverage)}
                          </div>
                        )}
                      </div>

                      {typeof bill.services === 'object' &&
                        bill.services !== null && (
                          <div className='mt-3'>
                            <div className='font-medium mb-1'>Services:</div>
                            <div className='bg-muted/50 p-2 rounded-md text-sm'>
                              <ul className='space-y-1'>
                                {Array.isArray(bill.services)
                                  ? (bill.services as ServiceItem[]).map(
                                      (service, index) => (
                                        <li
                                          key={index}
                                          className='flex justify-between'
                                        >
                                          <span>{service.name}</span>
                                          <span>
                                            {formatCurrency(service.cost)}
                                          </span>
                                        </li>
                                      )
                                    )
                                  : Object.entries(
                                      bill.services as Record<string, unknown>
                                    ).map(([key, value]) => (
                                      <li
                                        key={key}
                                        className='flex justify-between'
                                      >
                                        <span>{key}</span>
                                        <span>
                                          {typeof value === 'number'
                                            ? formatCurrency(value)
                                            : typeof value === 'string'
                                            ? value
                                            : JSON.stringify(value)}
                                        </span>
                                      </li>
                                    ))}
                              </ul>
                            </div>
                          </div>
                        )}

                      {bill.notes && (
                        <div className='mt-2 text-sm'>
                          <span className='font-medium'>Notes:</span>
                          <p className='mt-1 text-muted-foreground whitespace-pre-line'>
                            {bill.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No billing history found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className='flex justify-between items-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2 bg-primary/10 text-primary hover:bg-primary/20'
            onClick={() => {
              const toggleButton = document.getElementById('ai-assistant-toggle');
              if (toggleButton) toggleButton.click();
            }}
          >
            <Brain className='h-4 w-4' />
            <span>AI Diagnosis</span>
          </Button>

          <Button
            variant='outline'
            onClick={onClose}
            data-testid='close-button'
          >
            Close
          </Button>
        </DialogFooter>

        {/* Position the FloatingDiagnosisAssistant outside the dialog content */}
      </DialogContent>
    </Dialog>
  );
}
