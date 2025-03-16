export interface StaffStats {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    departmentBreakdown: Record<string, number>;
    roleBreakdown: Record<string, number>;
  }
  
  export interface StaffFilters {
    searchQuery?: string;
    departmentFilter?: string;
    roleFilter?: string;
    statusFilter?: string;
    fetchAllStaff?: boolean

  }
  
  // Add pagination interface
  export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }