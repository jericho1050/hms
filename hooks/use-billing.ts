import { useState } from 'react';
import { useToast } from './use-toast';
import { 
  createBillingRecord, 
  updateBillingRecord, 
  deleteBillingRecord, 
} from '@/app/actions/billing';
import { BillingFormData, BillingFilter, BillingRecord, BillingWithPatient } from '@/types/billing';
import { supabase } from '@/utils/supabase/client';

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<BillingWithPatient[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BillingWithPatient | null>(null);
  const [filters, setFilters] = useState<BillingFilter>({});
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const fetchBillingRecords = async (newFilters?: BillingFilter) => {
    setIsLoading(true);
    try {
      const currentFilters = newFilters || filters;
      if (newFilters) {
        setFilters(newFilters);
      }
      const data = await getBillingRecords(currentFilters);
      setRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch billing records',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // async function getPatientBillingRecords(patientId: string): Promise<BillingRecord[]> {
  
  //   const { data, error } = await supabase
  //     .from('billing')
  //     .select('*')
  //     .eq('patient_id', patientId)
  //     .order('invoice_date', { ascending: false });
  
  //   if (error) {
  //     console.error('Error fetching patient billing records:', error);
  //     throw new Error('Failed to fetch patient billing records');
  //   }
  
  //   // Parse the services JSON field into proper BillingService array
  //   const parsedRecords = data.map(record => ({
  //     ...record,
  //     services: Array.isArray(record.services) 
  //       ? record.services.map((service: any) => ({
  //           name: service.name,
  //           quantity: service.quantity,
  //           price: service.price
  //         }))
  //       : []
  //   }));
  
  //   return parsedRecords as BillingRecord[];
  // }
  
  async function getBillingStats() {
  
    // Get current month's revenue
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    const { data: monthlyRevenue, error: revenueError } = await supabase
      .from('billing')
      .select('total_amount')
      .gte('invoice_date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('invoice_date', lastDayOfMonth.toISOString().split('T')[0]);
  
    // Get outstanding payments
    const { data: outstandingPayments, error: outstandingError } = await supabase
      .from('billing')
      .select('total_amount')
      .in('payment_status', ['pending', 'overdue']);
  
    // Get recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('billing')
      .select(`
        *,
        patient:patients(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
  
    if (revenueError || outstandingError || transactionsError) {
      console.error('Error fetching billing stats');
      throw new Error('Failed to fetch billing statistics');
    }
  
    const totalMonthlyRevenue = monthlyRevenue?.reduce((sum: number, item: any) => sum + Number(item.total_amount), 0) || 0;
    const totalOutstanding = outstandingPayments?.reduce((sum: number, item: any) => sum + Number(item.total_amount), 0) || 0;
  
    return {
      totalMonthlyRevenue,
      totalOutstanding,
      recentTransactions
    };
  }



async function getBillingRecords(filters?: BillingFilter): Promise<BillingWithPatient[]> {

  let query = supabase
    .from('billing')
    .select(`
      *,
      patient:patients(id, first_name, last_name)
    `)
    .order('invoice_date', { ascending: false });

  // Apply filters if provided
  if (filters) {
    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters.paymentStatus && filters.paymentStatus !== '') {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters.startDate) {
      query = query.gte('invoice_date', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      query = query.lte('invoice_date', filters.endDate.toISOString().split('T')[0]);
    }
    if (filters.minAmount) {
      query = query.gte('total_amount', filters.minAmount);
    }
    if (filters.maxAmount) {
      query = query.lte('total_amount', filters.maxAmount);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching billing records:', error);
    throw new Error('Failed to fetch billing records');
  }

  let filteredData = data as unknown as BillingWithPatient[];
  
  // Filter by patient name if searchTerm is provided
  if (filters?.searchTerm) {
    const searchTermLower = filters.searchTerm.toLowerCase();
    filteredData = filteredData.filter(record => {
      const patientFirstName = record.patient?.first_name?.toLowerCase() || '';
      const patientLastName = record.patient?.last_name?.toLowerCase() || '';
      const fullName = `${patientFirstName} ${patientLastName}`;
      
      return fullName.includes(searchTermLower) || 
             patientFirstName.includes(searchTermLower) || 
             patientLastName.includes(searchTermLower);
    });
  }

  return filteredData;
}

async function getBillingRecord(id: string): Promise<BillingWithPatient | null> {

  const { data, error } = await supabase
    .from('billing')
    .select(`
      *,
      patient:patients(id, first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching billing record:', error);
    throw new Error('Failed to fetch billing record');
  }

  return data as unknown as BillingWithPatient;
}

  const fetchBillingRecord = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getBillingRecord(id);
      setSelectedRecord(data);
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch billing record',
        variant: 'destructive',
      });
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createBilling = async (formData: BillingFormData) => {
    setIsLoading(true);
    try {
      // Format dates as ISO strings for the database
      const billingData = {
        ...formData,
        invoice_date: formData.invoice_date?.toISOString().split('T')[0],
        due_date: formData.due_date?.toISOString().split('T')[0],
        payment_date: formData.payment_date?.toISOString().split('T')[0],
      };
      const id = await createBillingRecord(billingData as any);
      toast({
        title: 'Success',
        description: 'Billing record created successfully',
      });
      fetchBillingRecords();
      return id;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create billing record',
        variant: 'destructive',
      });
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBilling = async (id: string, formData: BillingFormData) => {
    setIsLoading(true);
    try {
      // Format dates as ISO strings for the database
      const billingData = {
        ...formData,
        invoice_date: formData.invoice_date?.toISOString().split('T')[0],
        due_date: formData.due_date?.toISOString().split('T')[0],
        payment_date: formData.payment_date?.toISOString().split('T')[0],
      };
      await updateBillingRecord(id, billingData as any);
      toast({
        title: 'Success',
        description: 'Billing record updated successfully',
      });
      fetchBillingRecords();
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update billing record',
        variant: 'destructive',
      });
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBilling = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteBillingRecord(id);
      toast({
        title: 'Success',
        description: 'Billing record deleted successfully',
      });
      fetchBillingRecords();
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete billing record',
        variant: 'destructive',
      });
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBillingStats = async () => {
    setIsLoading(true);
    try {
      const data = await getBillingStats();
      setStats(data);
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch billing statistics',
        variant: 'destructive',
      });
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalAmount = (services: any[]) => {
    return services.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  };

  return {
    isLoading,
    records,
    selectedRecord,
    filters,
    stats,
    fetchBillingRecords,
    fetchBillingRecord,
    createBilling,
    updateBilling,
    deleteBilling,
    fetchBillingStats,
    setFilters,
    calculateTotalAmount
  };
}