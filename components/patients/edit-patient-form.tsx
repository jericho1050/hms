'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import type { Patient } from '@/types/patients';

// Form schema
const patientFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  bloodType: z.enum([
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    'unknown',
  ]),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.string().optional(),
  pastSurgeries: z.string().optional(),
  chronicConditions: z.string().optional(),
  hasAllergies: z.boolean().default(false),
  emergencyContactName: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .optional(),
  emergencyContactRelationship: z
    .string()
    .min(2, 'Relationship must be at least 2 characters')
    .optional(),
  emergencyContactPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .optional(),
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  groupNumber: z.string().optional(),
  policyHolderName: z.string().optional(),
  relationshipToPatient: z
    .enum(['self', 'spouse', 'parent', 'other'])
    .optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface EditPatientFormProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Patient) => void;
}

export function EditPatientForm({
  patient,
  isOpen,
  onClose,
  onSubmit,
}: EditPatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Initialize the form with patient data
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender as 'male' | 'female' | 'other',
      maritalStatus: patient.maritalStatus as
        | 'single'
        | 'married'
        | 'divorced'
        | 'widowed',
      address: patient.address,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      phone: patient.phone,
      email: patient.email,
      bloodType:
        (patient.bloodType as
          | 'A+'
          | 'A-'
          | 'B+'
          | 'B-'
          | 'AB+'
          | 'AB-'
          | 'O+'
          | 'O-'
          | 'unknown') || 'unknown',
      allergies: patient.allergies || [],
      currentMedications: patient.currentMedications || '',
      pastSurgeries: patient.pastSurgeries || '',
      chronicConditions: patient.chronicConditions || '',
      hasAllergies: patient.allergies ? patient.allergies.length > 0 : false,
      emergencyContactName: patient.emergencyContactName || '',
      emergencyContactRelationship: patient.emergencyContactRelationship || '',
      emergencyContactPhone: patient.emergencyContactPhone || '',
      hasInsurance: !!patient.insuranceProvider,
      insuranceProvider: patient.insuranceProvider || '',
      insuranceId: patient.insuranceId || '',
      groupNumber: patient.groupNumber || '',
      policyHolderName: patient.policyHolderName || '',
      relationshipToPatient:
        (patient.relationshipToPatient as
          | 'self'
          | 'spouse'
          | 'parent'
          | 'other') || 'self',
    },
  });

  // Add this useEffect to reset form values when patient changes
  useEffect(() => {
    if (patient && form) {
      form.reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender as 'male' | 'female' | 'other',
        maritalStatus: patient.maritalStatus as
          | 'single'
          | 'married'
          | 'divorced'
          | 'widowed',
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipCode: patient.zipCode,
        phone: patient.phone,
        email: patient.email,
        bloodType:
          (patient.bloodType as
            | 'A+'
            | 'A-'
            | 'B+'
            | 'B-'
            | 'AB+'
            | 'AB-'
            | 'O+'
            | 'O-'
            | 'unknown') || 'unknown',
        allergies: patient.allergies || [],
        currentMedications: patient.currentMedications || '',
        pastSurgeries: patient.pastSurgeries || '',
        chronicConditions: patient.chronicConditions || '',
        hasAllergies: patient.allergies ? patient.allergies.length > 0 : false,
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactRelationship:
          patient.emergencyContactRelationship || '',
        emergencyContactPhone: patient.emergencyContactPhone || '',
        hasInsurance: !!patient.insuranceProvider,
        insuranceProvider: patient.insuranceProvider || '',
        insuranceId: patient.insuranceId || '',
        groupNumber: patient.groupNumber || '',
        policyHolderName: patient.policyHolderName || '',
        relationshipToPatient:
          (patient.relationshipToPatient as
            | 'self'
            | 'spouse'
            | 'parent'
            | 'other') || 'self',
      });
    }
  }, [patient, form]);


  // Function to validate individual tabs
  const validateTabFields = async (tab: string): Promise<boolean> => {
    switch (tab) {
      case 'personal':
        return await form.trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'maritalStatus',
        ]);
      case 'contact':
        return await form.trigger([
          'address',
          'city',
          'state',
          'zipCode',
          'phone',
          'email',
        ]);
      case 'medical':
        return await form.trigger([
          'bloodType',
          'hasAllergies',
          'currentMedications',
          'pastSurgeries',
          'chronicConditions',
        ]);
      case 'emergency':
        return await form.trigger([
          'emergencyContactName',
          'emergencyContactRelationship',
          'emergencyContactPhone',
          'hasInsurance',
        ]);
      case 'insurance':
        return await form.trigger([
          'hasInsurance',
          'insuranceProvider',
          'insuranceId',
          'groupNumber',
          'policyHolderName',
          'relationshipToPatient',
        ]);
      default:
        return true;
    }
  };

  // Handle tab change with validation
  const handleTabChange = async (tab: string) => {
    const isValid = await validateTabFields(activeTab);
    if (isValid) {
      setActiveTab(tab);
    }
  };

  // Reset form and close dialog
  const handleClose = () => {
    form.reset();
    setActiveTab('personal');
    onClose();
  };

  // Handle form submission
  const handleFormSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);

    try {
      // Validate all fields before submission
      const isValid = await form.trigger();
      if (!isValid) {
        // Find the first tab with errors and switch to it
        const personalValid = await form.trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'maritalStatus',
        ]);
        if (!personalValid) {
          setActiveTab('personal');
          setIsSubmitting(false);
          return;
        }

        const contactValid = await form.trigger([
          'address',
          'city',
          'state',
          'zipCode',
          'phone',
          'email',
        ]);
        if (!contactValid) {
          setActiveTab('contact');
          setIsSubmitting(false);
          return;
        }

        const medicalValid = await form.trigger([
          'bloodType',
          'hasAllergies',
          'currentMedications',
          'pastSurgeries',
          'chronicConditions',
        ]);
        if (!medicalValid) {
          setActiveTab('medical');
          setIsSubmitting(false);
          return;
        }

        const emergencyValid = await form.trigger([
          'emergencyContactName',
          'emergencyContactRelationship',
          'emergencyContactPhone',
          'hasInsurance',
        ]);
        if (!emergencyValid) {
          setActiveTab('emergency');
          setIsSubmitting(false);
          return;
        }

        return;
      }

      // Combine form data with existing patient data
      const updatedPatient: Patient = {
        ...patient,
        ...data,
      };

      onSubmit(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update patient information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className='space-y-6'
          >
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='personal'>Personal</TabsTrigger>
                <TabsTrigger value='contact'>Contact</TabsTrigger>
                <TabsTrigger value='medical'>Medical</TabsTrigger>
                <TabsTrigger value='emergency'>Emergency</TabsTrigger>
                <TabsTrigger value='insurance'>Insurance</TabsTrigger>
              </TabsList>

              <TabsContent value='personal' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='dateOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select gender' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='male'>Male</SelectItem>
                            <SelectItem value='female'>Female</SelectItem>
                            <SelectItem value='other'>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maritalStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select marital status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='single'>Single</SelectItem>
                            <SelectItem value='married'>Married</SelectItem>
                            <SelectItem value='divorced'>Divorced</SelectItem>
                            <SelectItem value='widowed'>Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value='contact' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='zipCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type='email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value='medical' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='bloodType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select blood type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='A+'>A+</SelectItem>
                          <SelectItem value='A-'>A-</SelectItem>
                          <SelectItem value='B+'>B+</SelectItem>
                          <SelectItem value='B-'>B-</SelectItem>
                          <SelectItem value='AB+'>AB+</SelectItem>
                          <SelectItem value='AB-'>AB-</SelectItem>
                          <SelectItem value='O+'>O+</SelectItem>
                          <SelectItem value='O-'>O-</SelectItem>
                          <SelectItem value='unknown'>Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='hasAllergies'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Has Allergies</FormLabel>
                        <FormDescription>
                          Check if the patient has any allergies
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('hasAllergies') && (
                  <FormField
                    control={form.control}
                    name='allergies'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='List all allergies'
                            className='min-h-[80px]'
                            onChange={(e) => field.onChange([e.target.value])}
                            value={field.value?.join('\n') || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name='currentMedications'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='List all current medications'
                          className='min-h-[80px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='pastSurgeries'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Surgeries</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='List past surgeries'
                            className='min-h-[80px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='chronicConditions'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chronic Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='List chronic conditions'
                            className='min-h-[80px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value='emergency' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='emergencyContactName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='emergencyContactRelationship'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='emergencyContactPhone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </TabsContent>
              <TabsContent value='insurance' className='space-y-4'>
              <FormField
                  control={form.control}
                  name='hasInsurance'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Has Insurance</FormLabel>
                        <FormDescription>
                          Check if the patient has health insurance
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('hasInsurance') && (
                  <div className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='insuranceProvider'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Provider</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='insuranceId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='groupNumber'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='policyHolderName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder='John Doe' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='relationshipToPatient'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship to Patient</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || 'self'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select relationship' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='self'>Self</SelectItem>
                              <SelectItem value='spouse'>Spouse</SelectItem>
                              <SelectItem value='parent'>Parent</SelectItem>
                              <SelectItem value='other'>Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type='button'
                disabled={isSubmitting}
                onClick={() => {
                  // Add confirmation before submitting
                  if (confirm('Are you sure you want to save these changes?')) {
                    form.handleSubmit(handleFormSubmit)();
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
