'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPatients } from '@/lib/mock-appointments';
import { usePatientData } from '@/hooks/use-patient';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';

// Form schema
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  department: z.string().min(1, 'Department is required'),
  date: z.date({
    required_error: 'Appointment date is required',
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  type: z.string().min(1, 'Appointment type is required'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface Doctor {
  id: string;
  name: string;
}

interface NewAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  departments: string[];
  doctors: Doctor[];
}

export function NewAppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  departments,
  doctors,
}: NewAppointmentFormProps) {
  const { patients, fetchPatients } = usePatientData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize the form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      department: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      type: '',
      notes: '',
    },
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);

    try {
      // Find patient name from ID
      const patient = patients.find((p) => p.id === data.patientId);
      const doctor = doctors.find((d) => d.id === data.doctorId);

      // Prepare data for submission
      const appointmentData = {
        ...data,
        patientName: patient
          ? `${patient.firstName} ${patient.lastName}`
          : 'Unknown Patient',
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        date: data.date.toISOString(),
      };

      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(appointmentData);
      form.reset();
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Appointment types
  const appointmentTypes = [
    'Regular Checkup',
    'Follow-up',
    'Consultation',
    'Procedure',
    'Surgery',
    'Emergency',
    'Vaccination',
    'Lab Work',
    'Imaging',
    'Physical Therapy',
  ];

  // Time slots
  const timeSlots: string[] = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Fill out the form below to schedule a new appointment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='patientId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Patient</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? patients.find(
                                  (patient) => patient.id === field.value
                                )
                                ? `${
                                    patients.find(
                                      (patient) => patient.id === field.value
                                    )?.firstName
                                  } ${
                                    patients.find(
                                      (patient) => patient.id === field.value
                                    )?.lastName
                                  }`
                                : 'Select patient'
                              : 'Select patient'}
                            <CalendarIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[300px] p-0'>
                        <Command>
                          <CommandInput placeholder='Search patient...' />
                          <CommandEmpty>No patient found.</CommandEmpty>
                          <CommandGroup className='max-h-[200px] overflow-y-auto'>
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.firstName} ${patient.lastName}`}
                                onSelect={() => {
                                  form.setValue('patientId', patient.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === patient.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {patient.firstName} {patient.lastName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='department'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select department' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='doctorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select doctor' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Appointment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Prevent selecting dates in the past
                            const isPastDate = date < new Date();

                            // Prevent selecting weekends (Saturday is 6, Sunday is 0)
                            const isWeekend =
                              date.getDay() === 0 || date.getDay() === 6;

                            return isPastDate || isWeekend;
                          }}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='startTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select start time' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select end time' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots
                            .filter(
                              (time) => time > form.getValues('startTime')
                            )
                            .map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select appointment type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any additional notes or instructions'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any special instructions or information for this
                      appointment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Appointment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
