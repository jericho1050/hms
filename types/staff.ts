export interface Staff {
    id: string
    firstName: string
    lastName: string
    role: string
    department: string
    email: string
    phone: string
    address: string
    joiningDate: string
    status: string
    licenseNumber?: string
    specialty?: string
    qualification?: string
    availability?: Record<string, string>
  }
  
  