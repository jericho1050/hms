"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Filter, RefreshCw, Users, UserCheck, UserX, Briefcase, Loader2 } from "lucide-react"
import { StaffDirectory } from "@/components/staff/staff-directory"
import { StaffAvailability } from "@/components/staff/staff-availability"
import { NewStaffForm } from "@/components/staff/new-staff-form"
import { mockStaffData } from "@/lib/mock-staff"
import type { Staff } from "@/types/staff"

export default function StaffManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [staffData, setStaffData] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false)

  // Stats for staff metrics
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    departmentBreakdown: {} as Record<string, number>,
    roleBreakdown: {} as Record<string, number>,
  })

  // Fetch staff data (mock data for now)
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStaffData(mockStaffData)
      } catch (error) {
        console.error("Error fetching staff data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaffData()
  }, [])

  // Filter staff based on search query and filters
  useEffect(() => {
    let filtered = [...staffData]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (staff) =>
          staff.firstName.toLowerCase().includes(query) ||
          staff.lastName.toLowerCase().includes(query) ||
          staff.email.toLowerCase().includes(query) ||
          staff.id.toLowerCase().includes(query),
      )
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((staff) => staff.department.toLowerCase() === departmentFilter.toLowerCase())
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((staff) => staff.role.toLowerCase() === roleFilter.toLowerCase())
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((staff) => staff.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredStaff(filtered)

    // Calculate stats
    const activeStaff = staffData.filter((staff) => staff.status === "active").length
    const inactiveStaff = staffData.filter((staff) => staff.status === "inactive").length

    // Department breakdown
    const departmentBreakdown: Record<string, number> = {}
    staffData.forEach((staff) => {
      departmentBreakdown[staff.department] = (departmentBreakdown[staff.department] || 0) + 1
    })

    // Role breakdown
    const roleBreakdown: Record<string, number> = {}
    staffData.forEach((staff) => {
      roleBreakdown[staff.role] = (roleBreakdown[staff.role] || 0) + 1
    })

    setStats({
      totalStaff: staffData.length,
      activeStaff,
      inactiveStaff,
      departmentBreakdown,
      roleBreakdown,
    })
  }, [staffData, searchQuery, departmentFilter, roleFilter, statusFilter])

  // Get unique departments and roles for filters
  const departments = Array.from(new Set(staffData.map((staff) => staff.department)))
  const roles = Array.from(new Set(staffData.map((staff) => staff.role)))

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Handle new staff submission
  const handleNewStaffSubmit = (newStaffData: Partial<Staff>) => {
    // In a real app, this would be an API call
    const newStaff: Staff = {
      id: `S-${Math.floor(Math.random() * 10000)}`,
      firstName: newStaffData.firstName || "",
      lastName: newStaffData.lastName || "",
      role: newStaffData.role || "",
      department: newStaffData.department || "",
      email: newStaffData.email || "",
      phone: newStaffData.phone || "",
      address: newStaffData.address || "",
      joiningDate: newStaffData.joiningDate || new Date().toISOString().split("T")[0],
      status: "active",
      licenseNumber: newStaffData.licenseNumber || "",
      specialty: newStaffData.specialty || "",
      qualification: newStaffData.qualification || "",
      availability: newStaffData.availability || {},
    }

    setStaffData([...staffData, newStaff])
    setIsNewStaffModalOpen(false)
  }

  // Handle staff update
  const handleStaffUpdate = (updatedStaff: Staff) => {
    const updatedStaffData = staffData.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff))
    setStaffData(updatedStaffData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage hospital staff, roles, and schedules</p>
        </div>
        <Button onClick={() => setIsNewStaffModalOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Staff
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">Total staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">Currently active staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveStaff}</div>
            <p className="text-xs text-muted-foreground">Currently inactive staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Department and Role Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.departmentBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{department}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(count / stats.totalStaff) * 100}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.roleBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(count / stats.totalStaff) * 100}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department.toLowerCase()}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role.toLowerCase()}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-2">
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Weekly Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <StaffDirectory staff={filteredStaff} onStaffUpdate={handleStaffUpdate} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <StaffAvailability staff={filteredStaff} onStaffUpdate={handleStaffUpdate} />
        </TabsContent>
      </Tabs>

      {/* New Staff Modal */}
      <NewStaffForm
        isOpen={isNewStaffModalOpen}
        onClose={() => setIsNewStaffModalOpen(false)}
        onSubmit={handleNewStaffSubmit}
        departments={departments}
        roles={roles}
      />
    </div>
  )
}

// Calendar icon component
function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

