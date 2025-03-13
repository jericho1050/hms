'use client';

import { useState } from 'react';
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
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Phone,
  FileText,
  Users,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Form schemas for each step
const personalDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
});

const contactInfoSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(4, 'Zip code must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
});

const medicalHistorySchema = z.object({
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
});

const emergencyContactSchema = z.object({
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
  contactPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters'),
  contactAddress: z.string().min(5, 'Address must be at least 5 characters'),
});

const insuranceInfoSchema = z.object({
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  groupNumber: z.string().optional(),
  policyHolderName: z.string().optional(),
  relationshipToPatient: z
    .enum(['self', 'spouse', 'parent', 'other'])
    .optional(),
});

// Combined schema for the entire form
const patientFormSchema = z.object({
  ...personalDetailsSchema.shape,
  ...contactInfoSchema.shape,
  ...medicalHistorySchema.shape,
  ...emergencyContactSchema.shape,
  ...insuranceInfoSchema.shape,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

interface NewPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormValues) => void;
}

export function NewPatientForm({
  isOpen,
  onClose,
  onSubmit,
}: NewPatientFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    values: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      bloodType: 'unknown',
      allergies: [],
      currentMedications: '',
      pastSurgeries: '',
      chronicConditions: '',
      hasAllergies: false,
      contactName: '',
      relationship: '',
      contactPhone: '',
      contactAddress: '',
      hasInsurance: false,
      insuranceProvider: '',
      insuranceId: '',
      groupNumber: '',
      policyHolderName: '',
      relationshipToPatient: 'self',
    },
  });

  const totalSteps = 6;

  // Handle form submission
  const handleFormSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(data);
      form.reset();
      setStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step navigation
  const nextStep = async () => {
    let isValid = false;

    // Validate the current step before proceeding
    switch (step) {
      case 1:
        isValid = await form.trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'maritalStatus',
        ]);
        break;
      case 2:
        isValid = await form.trigger([
          'address',
          'city',
          'state',
          'zipCode',
          'phone',
          'email',
        ]);
        break;
      case 3:
        isValid = await form.trigger([
          'bloodType',
          'hasAllergies',
          'currentMedications',
          'pastSurgeries',
          'chronicConditions',
        ]);
        break;
      case 4:
        isValid = await form.trigger([
          'contactName',
          'relationship',
          'contactPhone',
          'contactAddress',
        ]);
        break;
      case 5:
        isValid = await form.trigger([
          'hasInsurance',
          'insuranceProvider',
          'insuranceId',
          'groupNumber',
          'policyHolderName',
          'relationshipToPatient',
        ]);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    form.reset();
    setStep(1);
    onClose();
  };

  // Render the appropriate form step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='step1-firstName'
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                key='step1-lastName'
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              key='step1-dateOfBirth'
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

            <FormField
              key='step1-gender'
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              key='step1-maritalStatus'
              control={form.control}
              name='maritalStatus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
        );

      case 2:
        return (
          <div className='space-y-4'>
            <FormField
              key='step2-address'
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='123 Main St' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                key='step2-city'
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='New York' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                key='step2-state'
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder='NY' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              key='step2-zipCode'
              control={form.control}
              name='zipCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder='10001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step2-phone'
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder='(555) 123-4567' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step2-email'
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='john.doe@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            <FormField
              key='step3-bloodType'
              control={form.control}
              name='bloodType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              key='step3-hasAllergies'
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
                    <FormLabel>Does the patient have any allergies?</FormLabel>
                    <FormDescription>
                      Check this box if the patient has any known allergies
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('hasAllergies') && (
              <FormField
                key='step3-allergies'
                control={form.control}
                name='allergies'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='List all allergies (e.g., penicillin, peanuts, latex)'
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
              key='step3-currentMedications'
              control={form.control}
              name='currentMedications'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='List all current medications and dosages'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step3-pastSurgeries'
              control={form.control}
              name='pastSurgeries'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Surgeries</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='List any past surgeries and dates'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step3-chronicConditions'
              control={form.control}
              name='chronicConditions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chronic Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='List any chronic conditions (e.g., diabetes, hypertension)'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className='space-y-4'>
            <FormField
              key='step4-contactName'
              control={form.control}
              name='contactName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Jane Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step4-relationship'
              control={form.control}
              name='relationship'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to Patient</FormLabel>
                  <FormControl>
                    <Input placeholder='Spouse, Parent, etc.' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step4-contactPhone'
              control={form.control}
              name='contactPhone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder='(555) 123-4567' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              key='step4-contactAddress'
              control={form.control}
              name='contactAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Full address'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className='space-y-4'>
            <FormField
              key='step5-hasInsurance'
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
                    <FormLabel>
                      Does the patient have health insurance?
                    </FormLabel>
                    <FormDescription>
                      Check this box if the patient has health insurance
                      coverage
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('hasInsurance') && (
              <>
                <FormField
                  key='step5-insuranceProvider'
                  control={form.control}
                  name='insuranceProvider'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Blue Cross, Aetna, etc.'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    key='step5-insuranceId'
                    control={form.control}
                    name='insuranceId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance ID</FormLabel>
                        <FormControl>
                          <Input placeholder='XYZ123456789' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    key='step5-groupNumber'
                    control={form.control}
                    name='groupNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Number</FormLabel>
                        <FormControl>
                          <Input placeholder='G12345' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  key='step5-policyHolderName'
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
                  key='step5-relationshipToPatient'
                  control={form.control}
                  name='relationshipToPatient'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Patient</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
              </>
            )}
          </div>
        );

      case 6:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-4'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4'>
                <Check className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-lg font-medium'>Review Information</h3>
              <p className='text-sm text-muted-foreground'>
                Please review all information before submitting
              </p>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2 border rounded-md p-3'>
                  <h4 className='font-medium flex items-center'>
                    <User className='h-4 w-4 mr-2' />
                    Personal Details
                  </h4>
                  <div className='text-sm'>
                    <p>
                      <span className='font-medium'>Name:</span>{' '}
                      {form.getValues('firstName')} {form.getValues('lastName')}
                    </p>
                    <p>
                      <span className='font-medium'>Date of Birth:</span>{' '}
                      {new Date(
                        form.getValues('dateOfBirth')
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className='font-medium'>Gender:</span>{' '}
                      {form.getValues('gender')}
                    </p>
                    <p>
                      <span className='font-medium'>Marital Status:</span>{' '}
                      {form.getValues('maritalStatus')}
                    </p>
                  </div>
                </div>

                <div className='space-y-2 border rounded-md p-3'>
                  <h4 className='font-medium flex items-center'>
                    <Phone className='h-4 w-4 mr-2' />
                    Contact Information
                  </h4>
                  <div className='text-sm'>
                    <p>
                      <span className='font-medium'>Address:</span>{' '}
                      {form.getValues('address')}
                    </p>
                    <p>
                      <span className='font-medium'>City/State/Zip:</span>{' '}
                      {form.getValues('city')}, {form.getValues('state')}{' '}
                      {form.getValues('zipCode')}
                    </p>
                    <p>
                      <span className='font-medium'>Phone:</span>{' '}
                      {form.getValues('phone')}
                    </p>
                    <p>
                      <span className='font-medium'>Email:</span>{' '}
                      {form.getValues('email')}
                    </p>
                  </div>
                </div>

                <div className='space-y-2 border rounded-md p-3'>
                  <h4 className='font-medium flex items-center'>
                    <FileText className='h-4 w-4 mr-2' />
                    Medical History
                  </h4>
                  <div className='text-sm'>
                    <p>
                      <span className='font-medium'>Blood Type:</span>{' '}
                      {form.getValues('bloodType')}
                    </p>
                    <p>
                      <span className='font-medium'>Allergies:</span>{' '}
                      {form.getValues('hasAllergies')
                        ? form.getValues('allergies')?.join(', ') ||
                          'None specified'
                        : 'None'}
                    </p>
                    <p>
                      <span className='font-medium'>Current Medications:</span>{' '}
                      {form.getValues('currentMedications') || 'None'}
                    </p>
                    <p>
                      <span className='font-medium'>Chronic Conditions:</span>{' '}
                      {form.getValues('chronicConditions') || 'None'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2 border rounded-md p-3'>
                  <h4 className='font-medium flex items-center'>
                    <Users className='h-4 w-4 mr-2' />
                    Emergency Contact
                  </h4>
                  <div className='text-sm'>
                    <p>
                      <span className='font-medium'>Name:</span>{' '}
                      {form.getValues('contactName') || 'None provided'}
                    </p>
                    <p>
                      <span className='font-medium'>Relationship:</span>{' '}
                      {form.getValues('relationship') || 'None provided'}
                    </p>
                    <p>
                      <span className='font-medium'>Phone:</span>{' '}
                      {form.getValues('contactPhone') || 'None provided'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2 border rounded-md p-3 md:col-span-2'>
                  <h4 className='font-medium flex items-center'>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Insurance Information
                  </h4>
                  <div className='text-sm'>
                    {form.getValues('hasInsurance') ? (
                      <>
                        <p>
                          <span className='font-medium'>Provider:</span>{' '}
                          {form.getValues('insuranceProvider')}
                        </p>
                        <p>
                          <span className='font-medium'>ID:</span>{' '}
                          {form.getValues('insuranceId')}
                        </p>
                        <p>
                          <span className='font-medium'>Group Number:</span>{' '}
                          {form.getValues('groupNumber')}
                        </p>
                        <p>
                          <span className='font-medium'>Policy Holder:</span>{' '}
                          {form.getValues('policyHolderName')}
                        </p>
                        <p>
                          <span className='font-medium'>
                            Relationship to Patient:
                          </span>{' '}
                          {form.getValues('relationshipToPatient')}
                        </p>
                      </>
                    ) : (
                      <p>No insurance information provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Please fill out the patient information. All fields marked with an
            asterisk (*) are required.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className='flex justify-between mb-6'>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center',
                { 'text-primary': step === index + 1 },
                { 'text-muted-foreground': step !== index + 1 }
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  { 'bg-primary text-primary-foreground': step === index + 1 },
                  { 'bg-primary/20': step > index + 1 },
                  { 'border border-muted-foreground': step < index + 1 }
                )}
              >
                {step > index + 1 ? <Check className='h-4 w-4' /> : index + 1}
              </div>
              <span className='text-xs mt-1 hidden md:block'>
                {index === 0 && 'Personal'}
                {index === 1 && 'Contact'}
                {index === 2 && 'Medical'}
                {index === 3 && 'Emergency'}
                {index === 4 && 'Insurance'}
                {index === 5 && 'Review'}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className='space-y-6'
          >
            {renderStepContent()}

            <DialogFooter className='flex justify-between'>
              {step > 1 && (
                <Button type='button' variant='outline' onClick={prevStep}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back
                </Button>
              )}

              {step < totalSteps ? (
                <Button type='button' onClick={nextStep}>
                  Next
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              ) : (
                <Button
                  type='button'
                  disabled={isSubmitting}
                  onClick={() => {
                    // Add confirmation before submitting
                    if (
                      confirm(
                        'Are you sure you want to submit this patient information?'
                      )
                    ) {
                      form.handleSubmit(handleFormSubmit)();
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
