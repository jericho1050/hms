export interface StaffSchedule {
  recurring: {
    monday: Schedule;
    tuesday: Schedule;
    wednesday: Schedule;
    thursday: Schedule;
    friday: Schedule;
    saturday: Schedule;
    sunday: Schedule;
  };
  overrides: {
    [dateString: string]: Schedule; // Format: "YYYY-MM-DD"
  };
}

export type Schedule = 'morning' | 'afternoon' | 'night' | 'on-call' | 'off';

// This interface is no longer used, but keeping it temporarily for reference
// if there are other components using it that need to be updated
export interface Availability {
  monday?: Schedule;
  tuesday?: Schedule;
  wednesday?: Schedule;
  thursday?: Schedule;
  friday?: Schedule;
  saturday?: Schedule;
  sunday?: Schedule;
  [key: string]: Schedule | string | undefined; // For dynamic day access

}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  status: string;
  licenseNumber?: string;
  specialty?: string;
  qualification?: string;
  availability: StaffSchedule; // Now required and using StaffSchedule interface
}

export interface Doctor extends Staff {}
