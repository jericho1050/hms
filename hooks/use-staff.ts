import { useState, useEffect, useCallback } from 'react';
import type { Staff, StaffSchedule, Schedule } from '@/types/staff';
import { mockStaffData } from '@/lib/mock-staff';
import { supabase } from '@/utils/supabase/client';
import { StaffFilters, PaginationState, StaffStats } from '@/types/form-staff';
import { StaffFormValues } from '@/components/staff/new-staff-form';
import { nanoid } from 'nanoid';
// Import server actions
import {
  addStaffMember,
  updateStaffMember,
  updateStaffAvailability,
} from '@/app/actions/staff';

// Define a type for database staff item
interface DbStaffItem {
  id: string;
  first_name: string;
  last_name: string;
  role?: string | null;
  department?: string | null;
  email?: string | null;
  contact_number?: string | null;
  address?: string | null;
  joining_date?: string | null;
  status?: string | null;
  license_number?: string | null;
  specialty?: string | null;
  qualification?: string | null;
  availability?: any;
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

  // Helper function to convert availability from database to StaffSchedule structure
  const mapAvailabilityToStaffSchedule = (
    availabilityData: any
  ): StaffSchedule => {
    // Handle database format which might be an object with day keys
    // or previous Availability format
    const defaultSchedule: Schedule = 'off';

    if (!availabilityData || typeof availabilityData !== 'object') {
      // Return default StaffSchedule if no data
      return {
        recurring: {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: defaultSchedule,
          sunday: defaultSchedule,
        },
        overrides: {},
      };
    }

    // If data already has the new structure, use it
    if (availabilityData.recurring && availabilityData.overrides) {
      return availabilityData as StaffSchedule;
    }

    // Otherwise, treat it as old format and convert
    return {
      recurring: {
        monday: (availabilityData.monday as Schedule) || defaultSchedule,
        tuesday: (availabilityData.tuesday as Schedule) || defaultSchedule,
        wednesday: (availabilityData.wednesday as Schedule) || defaultSchedule,
        thursday: (availabilityData.thursday as Schedule) || defaultSchedule,
        friday: (availabilityData.friday as Schedule) || defaultSchedule,
        saturday: (availabilityData.saturday as Schedule) || defaultSchedule,
        sunday: (availabilityData.sunday as Schedule) || defaultSchedule,
      },
      overrides: {},
    };
  };

  // Map DB staff item to Staff interface with default values for optional fields
  const mapDbStaffToStaff = (item: DbStaffItem): Staff => ({
    id: item.id,
    firstName: item.first_name,
    lastName: item.last_name,
    role: item.role || '',
    department: item.department || '', // Default empty string for undefined values
    email: item.email || '',
    phone: item.contact_number || '',
    address: item.address || '',
    joiningDate: item.joining_date || new Date().toISOString().split('T')[0],
    status: item.status || 'active',
    licenseNumber: item.license_number || '',
    specialty: item.specialty || '',
    qualification: item.qualification || '',
    availability: mapAvailabilityToStaffSchedule(item.availability),
  });
  async function fetchStaffData(
    page: number,
    pageSize: number,
    all: boolean = false
  ) {
    // Initialize query
    let query = supabase.from('staff').select('*', { count: 'exact' });

    // Apply pagination only if 'all' is false
    if (!all) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }

    // Execute the query
    const { data: staff, error, count } = await query;

    if (error) {
      throw error;
    }

    return { staff, count };
  }

  async function filterStaffData(
    searchQuery: string,
    departmentFilter: string,
    roleFilter: string,
    statusFilter: string,
    page: number,
    pageSize: number
  ) {
    // Initialize query with filters
    let query = supabase.from('staff').select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
      const searchLower = `%${searchQuery.toLowerCase()}%`;
      query = query.or(
        `first_name.ilike.${searchLower},last_name.ilike.${searchLower},email.ilike.${searchLower}`
      );
    }

    if (departmentFilter && departmentFilter !== 'all') {
      query = query.eq('department', departmentFilter);
    }

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Get count first
    const countQuery = await query;
    const count = countQuery.count;

    // Then apply pagination
    const start = page * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    // Execute the query
    const { data: staff, error } = await query;

    if (error) {
      throw error;
    }

    return { staff, count };
  }

  async function getStaffStats() {
    try {
      // Get counts of active staff directly from database
      const {
        data: activeStaffData,
        error: activeError,
        count: activeCount,
      } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get counts of inactive staff directly from database
      const {
        data: inactiveStaffData,
        error: inactiveError,
        count: inactiveCount,
      } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'inactive');

      if (inactiveError) throw inactiveError;

      // Get department breakdown
      const { data: deptData, error: deptError } = await supabase
        .from('staff')
        .select('department');

      if (deptError) throw deptError;

      const departmentBreakdown: Record<string, number> = {};
      deptData?.forEach((item: { department: string }) => {
        if (item.department) {
          departmentBreakdown[item.department] =
            (departmentBreakdown[item.department] || 0) + 1;
        }
      });

      // Get role breakdown
      const { data: roleData, error: roleError } = await supabase
        .from('staff')
        .select('role');

      if (roleError) throw roleError;

      const roleBreakdown: Record<string, number> = {};
      roleData?.forEach((item: { role: string }) => {
        if (item.role) {
          roleBreakdown[item.role] = (roleBreakdown[item.role] || 0) + 1;
        }
      });

      return {
        totalStaff: (activeCount || 0) + (inactiveCount || 0),
        activeStaff: activeCount || 0,
        inactiveStaff: inactiveCount || 0,
        departmentBreakdown,
        roleBreakdown,
      };
    } catch (error) {
      console.error('Error calculating staff stats:', error);
      throw error;
    }
  }

  // Fetch staff data with/without pagination using server action
  const fetchStaffDataHandler = useCallback(
    async (page = 0, pageSize = 10, all = initialFilters?.fetchAllStaff) => {
      try {
        setIsLoading(true);

        // Use the server action instead of direct Supabase call
        const { staff, count } = await fetchStaffData(page, pageSize, all);

        // Map the database fields to the Staff interface format with default values
        const mappedStaff: Staff[] = (staff || []).map(mapDbStaffToStaff);

        // Update pagination state
        setPagination({
          currentPage: all ? 0 : page,
          pageSize: all ? count || 0 : pageSize,
          totalCount: count || 0,
          totalPages: all ? 1 : Math.ceil((count || 0) / pageSize),
        });

        // Set the mapped data to state
        setStaffData(mappedStaff);
      } catch (error) {
        console.error('Error fetching staff data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [initialFilters?.fetchAllStaff]
  );

  // Function to change page
  const changePage = useCallback(
    (page: number) => {
      // Use filterStaff with current filters instead
      filterStaff(
        initialFilters?.searchQuery || '',
        initialFilters?.departmentFilter || 'all',
        initialFilters?.roleFilter || 'all',
        initialFilters?.statusFilter || 'all',
        page,
        pagination.pageSize
      );
    },
    [initialFilters, pagination.pageSize]
  );

  // Function to change page size
  const changePageSize = useCallback(
    (newPageSize: number) => {
      filterStaff(
        initialFilters?.searchQuery || '',
        initialFilters?.departmentFilter || 'all',
        initialFilters?.roleFilter || 'all',
        initialFilters?.statusFilter || 'all',
        0, // Reset to first page
        newPageSize
      );
    },
    [initialFilters]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await fetchStaffDataHandler(pagination.currentPage, pagination.pageSize);
  }, [fetchStaffDataHandler, pagination.currentPage, pagination.pageSize]);

  // Filter staff based on search query and filters - now using server action
  const filterStaff = useCallback(
    async (
      searchQuery: string,
      departmentFilter: string,
      roleFilter: string,
      statusFilter: string,
      page = pagination.currentPage,
      pageSize = pagination.pageSize
    ) => {
      try {
        setIsLoading(true);

        // Use server action instead of direct Supabase call
        const { staff, count } = await filterStaffData(
          searchQuery,
          departmentFilter,
          roleFilter,
          statusFilter,
          page,
          pageSize
        );

        // Map the database results to Staff interface format with default values
        const mappedStaff: Staff[] = (staff || []).map(mapDbStaffToStaff);

        // Update filtered staff state
        setFilteredStaff(mappedStaff);

        // Update pagination state
        setPagination({
          currentPage: page,
          pageSize: pageSize,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        });
      } catch (error) {
        console.error('Error filtering staff:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.currentPage, pagination.pageSize]
  );

  // Handle new staff submission using server action
  const handleNewStaffSubmit = useCallback(
    async (newStaffData: StaffFormValues) => {
      try {
        // Call server action
        const data = await addStaffMember(newStaffData);

        if (data && data.length > 0) {
          // Map the returned data to match Staff interface
          const mappedNewStaff: Staff = mapDbStaffToStaff(data[0]);

          // Optimistic update of local state
          setStaffData((prev) => [...prev, mappedNewStaff]);
        }
      } catch (error) {
        console.error('Error adding new staff:', error);
      }
    },
    []
  );

  // Handle staff update using server action
  const handleStaffUpdate = useCallback(
    async (
      updatedStaff: Staff,
      staffId: string,
      availability?: StaffSchedule
    ) => {
      try {
        if (availability) {
          // Update just availability
          await updateStaffAvailability(staffId, availability);
        } else {
          // Update entire staff record
          await updateStaffMember(updatedStaff, staffId);
        }

        // Optimistic update of local state
        const updatedStaffData = staffData.map((staff) =>
          staff.id === updatedStaff.id ? updatedStaff : staff
        );

        setStaffData(updatedStaffData);
        setFilteredStaff((prev) =>
          prev.map((staff) =>
            staff.id === updatedStaff.id ? updatedStaff : staff
          )
        );
      } catch (error) {
        console.error('Error updating staff data:', error);
      }
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
    fetchStaffDataHandler();
  }, [fetchStaffDataHandler]);

  // useEffect(() => {
  //   calculateStats();
  // }, []);



  useEffect(() => {
    // This will run only once on component mount
    if (initialFilters) {
      filterStaff(
        initialFilters.searchQuery || '',
        initialFilters.departmentFilter || 'all',
        initialFilters.roleFilter || 'all',
        initialFilters.statusFilter || 'all',
        0, // Start at first page
        pagination.pageSize
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps array means it only runs once

  return {
    staffData,
    filteredStaff,
    stats,
    setStats,
    getStaffStats,
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
