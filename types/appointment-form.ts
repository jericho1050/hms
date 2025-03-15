import { appointmentFormSchema } from "@/components/appointments/new-appointment-form";
import { z } from "zod";
import { Staff } from "./staff";


export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export interface Doctor extends Staff {
  id: string;
  name: string;
}

export interface NewAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  departments: string[];
  doctors: Doctor[];
}