import { useState, useEffect, useCallback } from 'react';
import type { Staff, StaffSchedule, Schedule } from '@/types/staff';
import { mockStaffData } from '@/lib/mock-staff';
import { supabase } from '@/utils/supabase/client';
import { StaffFilters, PaginationState, StaffStats } from '@/types/form-staff';
import { StaffFormValues } from '@/components/staff/new-staff-form';
import { nanoid } from 'nanoid';

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

  // Fetch staff data with/without pagination
  const fetchStaffData = useCallback(
    async (page = 0, pageSize = 10, all = initialFilters?.fetchAllStaff) => {
      try {
        setIsLoading(true);

        // Initialize query
        let query = supabase.from('staff').select('*', { count: 'exact' });

        // Apply pagination only if 'all' is false
        if (!all) {
          const start = page * pageSize;
          const end = start + pageSize - 1;
          query = query.range(start, end);
        }

        // Execute the query
        let { data: staff, error, count } = await query;

        if (error) {
          throw error;
        }

        // Map the database fields to the Staff interface format
        const mappedStaff = (staff || []).map((item) => ({
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
          availability: mapAvailabilityToStaffSchedule(item.availability),
        }));

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
    []
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
    await fetchStaffData(pagination.currentPage, pagination.pageSize);
  }, [fetchStaffData, pagination.currentPage, pagination.pageSize]);

  // Filter staff based on search query and filters
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

        // Map the database results to Staff interface format
        const mappedStaff = (staff || []).map((item) => ({
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
          availability: mapAvailabilityToStaffSchedule(item.availability),
        }));

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
    [
      pagination.currentPage,
      pagination.pageSize,
      mapAvailabilityToStaffSchedule,
    ]
  );

  // Calculate stats - modify to use total count from pagination
  const calculateStats = async () => {
    try {
      // Get counts of active staff directly from database
      const {
        data: activeStaffData,
        error: activeError,
        count: activeCount,
      } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true }) // head: true returns only count, not data
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
      deptData?.forEach((item) => {
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
      roleData?.forEach((item) => {
        if (item.role) {
          roleBreakdown[item.role] = (roleBreakdown[item.role] || 0) + 1;
        }
      });

      // Update stats state
      setStats({
        totalStaff: (activeCount || 0) + (inactiveCount || 0),
        activeStaff: activeCount || 0,
        inactiveStaff: inactiveCount || 0,
        departmentBreakdown,
        roleBreakdown,
      });
    } catch (error) {
      console.error('Error calculating staff stats:', error);
    }
  }; // No dependencies needed since it doesn't use any state directly

  // Handle new staff submission
  const handleNewStaffSubmit = useCallback(
    async (newStaffData: StaffFormValues) => {
      // In a real app, this would be an API call to Supabase
      const defaultAvailability: StaffSchedule = {
        recurring: {
          monday: 'on-call',
          tuesday: 'on-call',
          wednesday: 'on-call',
          thursday: 'on-call',
          friday: 'on-call',
          saturday: 'off',
          sunday: 'off',
        },
        overrides: {},
      };

      const newStaff = {
        first_name: newStaffData.firstName || '',
        last_name: newStaffData.lastName || '',
        role: newStaffData.role || '',
        department: newStaffData.department || '',
        email: newStaffData.email || '',
        contact_number: newStaffData.phone || '',
        address: newStaffData.address || '',
        joining_date:
          newStaffData.joiningDate || new Date().toISOString().split('T')[0],
        status: 'active',
        license_number: newStaffData.licenseNumber || '',
        specialty: newStaffData.specialty || '',
        qualification: newStaffData.qualification || '',
        // Convert our TypeScript object to a plain JS object for Supabase
        availability: defaultAvailability as any,
      };

      const { data, error } = await supabase
        .from('staff')
        .insert(newStaff)
        .select();

      if (data && data.length > 0) {
        // Map the returned data to match Staff interface
        const mappedNewStaff: Staff = {
          id: data[0].id,
          firstName: data[0].first_name,
          lastName: data[0].last_name,
          role: data[0].role || '',
          department: data[0].department,
          email: data[0].email,
          phone: data[0].contact_number || '',
          address: data[0].address || '',
          joiningDate: data[0].joining_date,
          status: data[0].status || 'active',
          licenseNumber: data[0].license_number || '',
          specialty: data[0].specialty || '',
          qualification: data[0].qualification || '',
          availability: mapAvailabilityToStaffSchedule(data[0].availability),
        };

        setStaffData((prev) => [...prev, mappedNewStaff]);
      }
    },
    []
  );

  // Handle staff update
  const handleStaffUpdate = useCallback(
    async (
      updatedStaff: Staff,
      staffId: string,
      availability?: StaffSchedule
    ) => {
      try {
        // In a real app, we would update the staff data in the database
        if (availability) {
          const { data, error } = await supabase
            .from('staff')
            .update({
              // Convert our TypeScript object to a plain JS object for Supabase
              availability: availability as any,
            })
            .eq('id', staffId)
            .select();
          if (error) {
            throw error;
          }
        } else {
          // Map Staff object to match database schema
          const dbStaff = {
            first_name: updatedStaff.firstName,
            last_name: updatedStaff.lastName,
            role: updatedStaff.role,
            department: updatedStaff.department,
            email: updatedStaff.email,
            contact_number: updatedStaff.phone,
            address: updatedStaff.address,
            joining_date: updatedStaff.joiningDate,
            status: updatedStaff.status,
            license_number: updatedStaff.licenseNumber,
            specialty: updatedStaff.specialty,
            qualification: updatedStaff.qualification,
            availability: updatedStaff.availability as any,
          };

          const { data, error } = await supabase
            .from('staff')
            .update(dbStaff)
            .eq('id', staffId)
            .select();
          if (error) {
            throw error;
          }
        }

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
    fetchStaffData();
  }, [fetchStaffData]);



  useEffect(() => {
    calculateStats();
  }, [staffData, calculateStats]);

  // Set up realtime subscription for staff changes
  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel('staff-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        async (payload) => {
          calculateStats();
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  },[]);


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
