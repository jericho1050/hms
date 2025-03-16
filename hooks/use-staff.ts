import { useState, useEffect, useCallback } from 'react';
import type { Staff } from '@/types/staff';
import { mockStaffData } from '@/lib/mock-staff';
import { supabase } from '@/utils/supabase/client';

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  departmentBreakdown: Record<string, number>;
  roleBreakdown: Record<string, number>;
}

interface StaffFilters {
  searchQuery: string;
  departmentFilter: string;
  roleFilter: string;
  statusFilter: string;
}

// Add pagination interface
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useStaffData(initialFilters?: Partial<StaffFilters>) {
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);

  // Add pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Stats for staff metrics
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    departmentBreakdown: {},
    roleBreakdown: {},
  });

  // Fetch staff data with pagination
  const fetchStaffData = useCallback(async (page = 0, pageSize = 10) => {
    try {
      setIsLoading(true);
      
      // Calculate range start and end for pagination
      const start = page * pageSize;
      const end = start + pageSize - 1;
      
      // Fetch data with pagination
      let { data: staff, error, count } = await supabase
        .from('staff')
        .select('*', { count: 'exact' })
        .range(start, end);

      if (error) {
        throw error;
      }

      // Map the database fields to the Staff interface format
      const mappedStaff = (staff || []).map(item => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        role: item.role || '',
        department: item.department,
        email: item.email,
        phone: item.contact_number || '',
        address: item.address || '',
        joiningDate: item.joining_date,
        status: item.status || 'active',
        licenseNumber: item.license_number || '',
        specialty: item.specialty || '',
        qualification: item.qualification || '',
        availability: {} // Using empty object as default since availability doesn't exist in database
      }));

      // Update pagination state
      setPagination({
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      });

      // Set the mapped data to state
      setStaffData(mappedStaff);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to change page
  const changePage = useCallback((page: number) => {
    fetchStaffData(page, pagination.pageSize);
  }, [fetchStaffData, pagination.pageSize]);

  // Function to change page size
  const changePageSize = useCallback((newPageSize: number) => {
    fetchStaffData(0, newPageSize);
  }, [fetchStaffData]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await fetchStaffData(pagination.currentPage, pagination.pageSize);
  }, [fetchStaffData, pagination.currentPage, pagination.pageSize]);

  // Filter staff based on search query and filters
  const filterStaff = useCallback(
    (
      searchQuery: string,
      departmentFilter: string,
      roleFilter: string,
      statusFilter: string
    ) => {
      let filtered = [...staffData];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (staff) =>
            staff.firstName.toLowerCase().includes(query) ||
            staff.lastName.toLowerCase().includes(query) ||
            staff.email.toLowerCase().includes(query) ||
            staff.id.toLowerCase().includes(query)
        );
      }

      // Apply department filter
      if (departmentFilter !== 'all') {
        filtered = filtered.filter(
          (staff) =>
            staff.department.toLowerCase() === departmentFilter.toLowerCase()
        );
      }

      // Apply role filter
      if (roleFilter !== 'all') {
        filtered = filtered.filter(
          (staff) => staff.role.toLowerCase() === roleFilter.toLowerCase()
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(
          (staff) => staff.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      setFilteredStaff(filtered);
    },
    [staffData]
  );

  // Calculate stats - modify to use total count from pagination
  const calculateStats = useCallback(() => {
    const activeStaff = staffData.filter(
      (staff) => staff.status === 'active'
    ).length;
    const inactiveStaff = staffData.filter(
      (staff) => staff.status === 'inactive'
    ).length;

    // Department breakdown
    const departmentBreakdown: Record<string, number> = {};
    staffData.forEach((staff) => {
      departmentBreakdown[staff.department] =
        (departmentBreakdown[staff.department] || 0) + 1;
    });

    // Role breakdown
    const roleBreakdown: Record<string, number> = {};
    staffData.forEach((staff) => {
      roleBreakdown[staff.role] = (roleBreakdown[staff.role] || 0) + 1;
    });

    setStats({
      totalStaff: pagination.totalCount,
      activeStaff,
      inactiveStaff,
      departmentBreakdown,
      roleBreakdown,
    });
  }, [staffData, pagination.totalCount]);

  // Handle new staff submission
  const handleNewStaffSubmit = useCallback((newStaffData: Partial<Staff>) => {
    // In a real app, this would be an API call to Supabase
    const newStaff: Staff = {
      id: `S-${Math.floor(Math.random() * 10000)}`,
      firstName: newStaffData.firstName || '',
      lastName: newStaffData.lastName || '',
      role: newStaffData.role || '',
      department: newStaffData.department || '',
      email: newStaffData.email || '',
      phone: newStaffData.phone || '',
      address: newStaffData.address || '',
      joiningDate:
        newStaffData.joiningDate || new Date().toISOString().split('T')[0],
      status: 'active',
      licenseNumber: newStaffData.licenseNumber || '',
      specialty: newStaffData.specialty || '',
      qualification: newStaffData.qualification || '',
      availability: newStaffData.availability || {},
    };

    setStaffData((prev) => [...prev, newStaff]);
  }, []);

  // Handle staff update
  const handleStaffUpdate = useCallback(
    (updatedStaff: Staff) => {
      const updatedStaffData = staffData.map((staff) =>
        staff.id === updatedStaff.id ? updatedStaff : staff
      );
      setStaffData(updatedStaffData);
    },
    [staffData]
  );

  // Get unique departments and roles for filters
  const departments = Array.from(
    new Set(staffData.map((staff) => staff.department))
  );
  const roles = Array.from(new Set(staffData.map((staff) => staff.role)));

  // Initial data load
  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  useEffect(() => {
    calculateStats();
  }, [staffData, calculateStats]);

  useEffect(() => {
    // Only apply filters when staffData or the passed-in filters change
    filterStaff(
      initialFilters?.searchQuery || '',
      initialFilters?.departmentFilter || 'all',
      initialFilters?.roleFilter || 'all',
      initialFilters?.statusFilter || 'all'
    );
  }, [staffData]);

  return {
    staffData,
    filteredStaff,
    stats,
    departments,
    roles,
    isLoading,
    pagination,
    handleRefresh,
    handleNewStaffSubmit,
    handleStaffUpdate,
    filterStaff,
    changePage,
    changePageSize,
  };
}
