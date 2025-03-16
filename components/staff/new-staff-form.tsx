"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react"
import type { Staff } from "@/types/staff"
import { useToast } from "@/hooks/use-toast"

// Step validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const employmentDetailsSchema = z.object({
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  status: z.string().min(1, "Status is required"),
});

const professionalQualificationsSchema = z.object({
  qualification: z.string().optional(),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
});

// Complete form schema
const staffFormSchema = personalInfoSchema.merge(employmentDetailsSchema).merge(professionalQualificationsSchema);

export type StaffFormValues = z.infer<typeof staffFormSchema>

interface NewStaffFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Staff>) => void
  departments: string[]
  roles: string[]
}

export function NewStaffForm({ isOpen, onClose, onSubmit, departments, roles }: NewStaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const steps = ["Personal Information", "Employment Details", "Professional Qualifications"]
  const { toast } = useToast()

  // Initialize the form
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      department: "",
      email: "",
      phone: "",
      address: "",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "active",
      licenseNumber: "",
      specialty: "",
      qualification: "",
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Handle form submission
  const handleFormSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const staffData = {
        ...data,
        availability: {
          monday: "morning",
          tuesday: "morning",
          wednesday: "morning",
          thursday: "morning",
          friday: "morning",
          saturday: "off",
          sunday: "off",
        },
      }

      onSubmit(staffData)
      
      // Show success toast
      toast({
        title: "Staff Added",
        description: `${data.firstName} ${data.lastName} has been successfully added to the staff.`,
        variant: "default",
      })
      
      form.reset()
      setCurrentStep(0)
      onClose() // Close the dialog after successful submission
    } catch (error) {
      console.error("Error creating staff:", error)
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation schemas for each step
  const stepSchemas = [
    personalInfoSchema,
    employmentDetailsSchema,
    professionalQualificationsSchema
  ];

  // Get field names for each step
  const stepFields = [
    ["firstName", "lastName", "email", "phone", "address"],
    ["role", "department", "joiningDate", "status"],
    ["qualification", "licenseNumber", "specialty"]
  ];

  const validateCurrentStep = async () => {
    const currentSchema = stepSchemas[currentStep];
    const currentFields = stepFields[currentStep];
    
    // Extract current step values
    const currentValues = {} as any;
    currentFields.forEach(field => {
      currentValues[field] = form.getValues(field as any);
    });
    
    try {
      // Validate current step's fields
      await currentSchema.parseAsync(currentValues);
      return true;
    } catch (error) {
      // Trigger validation for all fields in current step
      currentFields.forEach(field => {
        form.trigger(field as any);
      });
      
      // Show error toast
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
      
      return false;
    }
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogDescription>Fill out the form below to add a new staff member.</DialogDescription>
        </DialogHeader>

        {/* Stepper Header */}
        <div className="mb-6">
          <div className="flex justify-between relative mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center z-10">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep ? "bg-green-500 border-green-500 text-white" :
                    index === currentStep ? "bg-primary border border-muted-foreground text-white" :
                    "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`text-xs mt-1 ${index === currentStep ? "font-semibold" : "text-gray-500"}`}>
                  {step}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary/10 transition-all duration-300" 
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, City, State, Zip" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Employment Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.length > 0 ? (
                              roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="Doctor">Doctor</SelectItem>
                                <SelectItem value="Nurse">Nurse</SelectItem>
                                <SelectItem value="Receptionist">Receptionist</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                                <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                                <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.length > 0 ? (
                              departments.map((department) => (
                                <SelectItem key={department} value={department}>
                                  {department}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="Cardiology">Cardiology</SelectItem>
                                <SelectItem value="Neurology">Neurology</SelectItem>
                                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="Oncology">Oncology</SelectItem>
                                <SelectItem value="Radiology">Radiology</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                                <SelectItem value="Surgery">Surgery</SelectItem>
                                <SelectItem value="Administration">Administration</SelectItem>
                                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                <SelectItem value="Laboratory">Laboratory</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="on-leave">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Professional Qualifications */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="MD, PhD, BSN, etc." {...field} />
                      </FormControl>
                      <FormDescription>Highest degree or qualification obtained</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("role") === "Doctor" && (
                  <>
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialty</FormLabel>
                          <FormControl>
                            <Input placeholder="Cardiology, Neurology, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="MD12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" disabled={isSubmitting} onClick={()=> {

                    if (
                      confirm(
                        'Are you sure you want to submit this staff information?'
                      )
                    ) {
                      form.handleSubmit(handleFormSubmit)();
                    }
                }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Staff...
                    </>
                  ) : (
                    "Add Staff"
                  )}
                </Button>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

