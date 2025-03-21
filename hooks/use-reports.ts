import { ClinicalMetrics, DemographicData, AgeData, AppointmentStats, BedOccupancy, DeptCounts, FinancialGrowth, FinancialSummary, InsuranceClaim, PatientDemographics, PaymentDistribution, RevenueDept, RevenueTrend, StaffDeptMap, RoomOccupancyHistory, OperationalMetrics } from './../types/reports';
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, formatDate, subMonths, subYears, eachMonthOfInterval, addDays, subDays } from "date-fns";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeptOccupancy } from "@/types/reports";
import { useRooms } from './use-rooms';



export function useReports() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");

  // Data states
  const [revenueByDept, setRevenueByDept] = useState<RevenueDept[]>([]);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);

  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    noShowAppointments: 0,
    pendingAppointments: 0,
    completionRate: 0,
    noShowRate: 0
  });
  const [bedOccupancy, setBedOccupancy] = useState<BedOccupancy[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    outstandingBills: 0,
    insuranceClaimsCount: 0,
    collectionRate: 0
  });
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [paymentDistribution, setPaymentDistribution] = useState<PaymentDistribution[]>([]);
  const [financialGrowth, setFinancialGrowth] = useState<FinancialGrowth>({
    revenueGrowth: 0,
    outstandingBillsGrowth: 0,
    insuranceClaimsGrowth: 0,
    collectionRateGrowth: 0
  });

  // Add clinical metrics state
  const [clinicalMetrics, setClinicalMetrics] = useState<ClinicalMetrics>({});
  
  // Add operational metrics state
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({});
  
  // Add room occupancy history state
  const [roomOccupancyHistory, setRoomOccupancyHistory] = useState<RoomOccupancyHistory[]>([]);

  const { getRoomOccupancyHistory } = useRooms();

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [dateRange, departmentFilter, reportTypeFilter]);

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load departments for filtering
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .order('name')

      if (deptError) throw deptError
      setDepartments(deptData?.map(d => d.name) || [])

      // Format dates for querying
      const fromDate = dateRange.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : formatDate(startOfMonth(new Date()), 'yyyy-MM-dd')
      const toDate = dateRange.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : formatDate(endOfMonth(new Date()), 'yyyy-MM-dd')

      // Load financial data
      await loadFinancialData(fromDate, toDate)

      // Load patient demographics
      const patientDemographics = await loadPatientDemographics()

      // Load appointment statistics
      await loadAppointmentStats(fromDate, toDate)

      // Load bed occupancy
      await loadBedOccupancy()

      // Load clinical metrics from medical records
      await loadClinicalMetrics(fromDate, toDate, patientDemographics);
      
      // Load operational metrics including room occupancy history
      await loadOperationalMetrics(fromDate, toDate);

    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFinancialData = async (fromDate: string, toDate: string) => {
    try {
      // Get total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('billing')
        .select('total_amount, payment_status, payment_date, invoice_date, insurance_claim_id')
        .gte('invoice_date', fromDate)
        .lte('invoice_date', toDate)

      if (revenueError) throw revenueError

      // Get previous period data for growth calculations
      const prevFromDate = formatDate(subMonths(new Date(fromDate), 12), 'yyyy-MM-dd')
      const prevToDate = formatDate(subMonths(new Date(toDate), 12), 'yyyy-MM-dd')
      
      const { data: prevRevenueData, error: prevRevenueError } = await supabase
        .from('billing')
        .select('total_amount, payment_status, payment_date, invoice_date, insurance_claim_id')
        .gte('invoice_date', prevFromDate)
        .lte('invoice_date', prevToDate)
      
      if (prevRevenueError) throw prevRevenueError

      // Calculate financial metrics
      const totalRevenue = revenueData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const prevTotalRevenue = prevRevenueData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 1 // Avoid division by zero
      
      const outstandingBills = revenueData?.filter(bill => bill.payment_status === 'pending')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const prevOutstandingBills = prevRevenueData?.filter(bill => bill.payment_status === 'pending')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 1
      
      const insuranceClaimsCount = revenueData?.filter(bill => bill.insurance_claim_id !== null).length || 0
      const prevInsuranceClaimsCount = prevRevenueData?.filter(bill => bill.insurance_claim_id !== null).length || 1
      
      const paidAmount = revenueData?.filter(bill => bill.payment_status === 'paid')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0
      
      const prevPaidAmount = prevRevenueData?.filter(bill => bill.payment_status === 'paid')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const prevCollectionRate = prevTotalRevenue > 0 ? (prevPaidAmount / prevTotalRevenue) * 100 : 1

      // Calculate growth rates with reasonable fallbacks
      let revenueGrowth = prevTotalRevenue > 100 
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
        : (totalRevenue > prevTotalRevenue ? 100 : 0);
      
      let outstandingBillsGrowth = prevOutstandingBills > 100 
        ? ((outstandingBills - prevOutstandingBills) / prevOutstandingBills) * 100 
        : (outstandingBills > prevOutstandingBills ? 100 : -100);
      
      let insuranceClaimsGrowth = prevInsuranceClaimsCount > 5 
        ? ((insuranceClaimsCount - prevInsuranceClaimsCount) / prevInsuranceClaimsCount) * 100 
        : (insuranceClaimsCount > prevInsuranceClaimsCount ? 100 : 0);
      
      // For collection rate, use percentage point difference rather than percentage growth
      let collectionRateGrowth = collectionRate - prevCollectionRate;

      // NOTE: Historical metrics functionality commented out until database types are updated
      /* 
      // Try to get historical data for more accurate comparisons
      try {
        const previousMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
        const { data: historicalData } = await supabase
          .from('financial_historical_metrics')
          .select('metric_name, metric_value')
          .eq('period', previousMonth)
          .in('metric_name', ['revenue', 'outstanding_bills', 'insurance_claims', 'collection_rate']);
        
        // Use historical data if available
        if (historicalData && historicalData.length > 0) {
          console.log('Using historical metrics data for growth calculation');
          
          const prevHistoricalRevenue = historicalData.find(d => d.metric_name === 'revenue')?.metric_value;
          const prevHistoricalOutstanding = historicalData.find(d => d.metric_name === 'outstanding_bills')?.metric_value;
          const prevHistoricalClaims = historicalData.find(d => d.metric_name === 'insurance_claims')?.metric_value;
          const prevHistoricalCollection = historicalData.find(d => d.metric_name === 'collection_rate')?.metric_value;
          
          // Recalculate with historical data if available
          if (prevHistoricalRevenue && prevHistoricalRevenue > 100) {
            revenueGrowth = ((totalRevenue - prevHistoricalRevenue) / prevHistoricalRevenue) * 100;
          }
          
          if (prevHistoricalOutstanding && prevHistoricalOutstanding > 100) {
            outstandingBillsGrowth = ((outstandingBills - prevHistoricalOutstanding) / prevHistoricalOutstanding) * 100;
          }
          
          if (prevHistoricalClaims && prevHistoricalClaims > 5) {
            insuranceClaimsGrowth = ((insuranceClaimsCount - prevHistoricalClaims) / prevHistoricalClaims) * 100;
          }
          
          if (prevHistoricalCollection) {
            collectionRateGrowth = collectionRate - prevHistoricalCollection;
          }
        }
      } catch (error) {
        console.error("Error fetching historical metrics:", error);
        // Continue with previously calculated values
      }
      */

      // Cap extreme values for better display
      revenueGrowth = Math.max(-999, Math.min(999, revenueGrowth));
      outstandingBillsGrowth = Math.max(-999, Math.min(999, outstandingBillsGrowth));
      insuranceClaimsGrowth = Math.max(-999, Math.min(999, insuranceClaimsGrowth));
      collectionRateGrowth = Math.max(-100, Math.min(100, collectionRateGrowth));

      // Store current metrics in historical table for future comparison
      // await storeCurrentMetrics(totalRevenue, outstandingBills, insuranceClaimsCount, collectionRate);

      setFinancialSummary({
        totalRevenue,
        outstandingBills,
        insuranceClaimsCount,
        collectionRate
      })

      setFinancialGrowth({
        revenueGrowth,
        outstandingBillsGrowth,
        insuranceClaimsGrowth,
        collectionRateGrowth
      })

      // Get revenue by department (simplified approach)
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, department')

      if (staffData) {
        // Create a map of staff IDs to departments
        const staffDeptMap: StaffDeptMap = {}
        if (staffData) {
          staffData.forEach(staff => {
            staffDeptMap[staff.id] = staff.department
          })
        }

        // Get appointments with billing
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('staff_id')
          .gte('appointment_date', fromDate)
          .lte('appointment_date', toDate)

        if (appointmentData) {
          // Count appointments by department
          const deptCounts: DeptCounts = {}
          appointmentData.forEach(appt => {
            const dept = staffDeptMap[appt.staff_id]
            if (dept) {
              deptCounts[dept] = (deptCounts[dept] || 0) + 1
            }
          })

          // Convert to revenue by department (approximation)
          const avgRevenue = totalRevenue / (appointmentData.length || 1)
          const deptRevenue = Object.entries(deptCounts).map(([name, count]) => ({
            name,
            revenue: avgRevenue * count,
            target: avgRevenue * count * 1.1 // 10% higher target
          }))

          setRevenueByDept(deptRevenue)
        }
      }

      // Calculate revenue trends
      await loadRevenueTrends()

      // Calculate payment distribution
      await loadPaymentDistribution()

      // Get insurance claims with patient info
      if (revenueData) {
        const claimsData = revenueData.filter(bill => bill.insurance_claim_id !== null).slice(0, 10)
        
        // Get patient data for claims
        const claimPatients = []
        for (const claim of claimsData) {
          try {
            if (claim.insurance_claim_id) {
              // Since we don't have insurance_claims table in the schema,
              // we'll use the billing data and some simulated patient info
              const patientId = `P${Math.floor(Math.random() * 1000)}`
              const firstName = ["John", "Jane", "Michael", "Sarah", "David"][Math.floor(Math.random() * 5)]
              const lastName = ["Smith", "Johnson", "Williams", "Brown", "Jones"][Math.floor(Math.random() * 5)]
              const provider = ["Blue Cross", "Aetna", "United Healthcare", "Cigna", "Medicare"][Math.floor(Math.random() * 5)]
              
              claimPatients.push({
                id: claim.insurance_claim_id,
                patient: `${firstName} ${lastName}`,
                amount: claim.total_amount,
                status: claim.payment_status,
                provider: provider,
                submittedDate: claim.invoice_date,
                paidDate: claim.payment_date
              })
            }
          } catch (error) {
            console.error("Error getting patient data for claim:", error)
          }
        }
        
        // If we couldn't find patient data, use the basic claim data
        const claims = claimPatients.length > 0 ? claimPatients : claimsData.map(claim => ({
          id: claim.insurance_claim_id || `CL-${Math.floor(Math.random() * 10000)}`,
          patient: "Patient Name", // Placeholder
          amount: claim.total_amount,
          status: claim.payment_status,
          provider: "Insurance Provider", // Placeholder
          submittedDate: claim.invoice_date,
          paidDate: claim.payment_date
        }))

        setInsuranceClaims(claims)
      }
    } catch (error) {
      console.error("Error loading financial data:", error)
    }
  }

  const loadRevenueTrends = async () => {
    try {
      // Get revenue trends for the last 12 months
      const now = new Date()
      const startDate = subYears(now, 1)
      const monthRange = eachMonthOfInterval({ start: startDate, end: now })
      
      const trends: RevenueTrend[] = []
      
      for (let i = 0; i < monthRange.length; i++) {
        const month = monthRange[i]
        const monthStart = formatDate(startOfMonth(month), 'yyyy-MM-dd')
        const monthEnd = formatDate(endOfMonth(month), 'yyyy-MM-dd')
        
        // Get revenue for the month
        const { data: revenueData } = await supabase
          .from('billing')
          .select('total_amount')
          .gte('invoice_date', monthStart)
          .lte('invoice_date', monthEnd)
        
        // Get expenses for the month (simplified - using 70-85% of revenue as expenses)
        const monthRevenue = revenueData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
        const expenseRatio = 0.7 + (Math.random() * 0.15) // Between 70-85% of revenue
        const monthExpenses = monthRevenue * expenseRatio
        
        trends.push({
          month: format(month, 'MMM'),
          revenue: monthRevenue,
          expenses: Math.round(monthExpenses)
        })
      }
      
      setRevenueTrends(trends)
    } catch (error) {
      console.error("Error loading revenue trends:", error)
    }
  }

  const loadPaymentDistribution = async () => {
    try {
      // Get payment methods distribution
      const { data: paymentData } = await supabase
        .from('billing')
        .select('payment_method, total_amount')
        .not('payment_method', 'is', null)

      if (paymentData && paymentData.length > 0) {
        // Group payments by method
        const methodTotals: { [key: string]: number } = {}
        let totalPayments = 0
        
        paymentData.forEach(payment => {
          const method = mapPaymentMethodToCategory(payment.payment_method || 'Other')
          methodTotals[method] = (methodTotals[method] || 0) + (payment.total_amount || 0)
          totalPayments += (payment.total_amount || 0)
        })
        
        // Convert to percentage distribution
        const distribution = Object.entries(methodTotals).map(([name, amount]) => ({
          name,
          value: Math.round((amount / totalPayments) * 100)
        }))
        
        setPaymentDistribution(distribution)
      } else {
        // Fallback if no data
        setPaymentDistribution([
          { name: "Insurance", value: 68 },
          { name: "Out-of-pocket", value: 22 },
          { name: "Government", value: 8 },
          { name: "Other", value: 2 },
        ])
      }
    } catch (error) {
      console.error("Error loading payment distribution:", error)
    }
  }

  // Helper function to map payment methods to categories
  const mapPaymentMethodToCategory = (method: string): string => {
    method = method.toLowerCase()
    if (method.includes('insurance') || method.includes('aetna') || method.includes('blue cross') || 
        method.includes('cigna') || method.includes('united')) {
      return 'Insurance'
    } else if (method.includes('medicare') || method.includes('medicaid')) {
      return 'Government'
    } else if (method.includes('cash') || method.includes('credit') || method.includes('debit') || 
               method.includes('check') || method.includes('self')) {
      return 'Out-of-pocket'
    } else {
      return 'Other'
    }
  }

  const loadPatientDemographics = async () => {
    try {
      // Get patient data for demographics
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('gender, date_of_birth')

      if (patientError) throw patientError

      // Process gender distribution
      const genderCounts = { Male: 0, Female: 0, Other: 0 }
      
      // Process age distribution
      const ageCounts = { 
        '0-18': 0, 
        '19-35': 0, 
        '36-50': 0, 
        '51-65': 0, 
        '66+': 0 
      }

      if (patientData) {
        patientData.forEach(patient => {
          // Gender counts
          if (patient.gender === 'male') genderCounts.Male++
          else if (patient.gender === 'female') genderCounts.Female++
          else genderCounts.Other++

          // Age counts
          if (patient.date_of_birth) {
            const birthDate = new Date(patient.date_of_birth)
            const age = new Date().getFullYear() - birthDate.getFullYear()
            
            if (age <= 18) ageCounts['0-18']++
            else if (age <= 35) ageCounts['19-35']++
            else if (age <= 50) ageCounts['36-50']++
            else if (age <= 65) ageCounts['51-65']++
            else ageCounts['66+']++
          }
        })
      }

      // Format for charts
      const genderData = Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }))
      const ageData = Object.entries(ageCounts).map(([age, count]) => ({ age, count }))
      
      return {
        genderDistribution: genderData,
        ageDistribution: ageData
      }
   } catch (error) {
      console.error("Error loading patient demographics:", error)
      // Return empty arrays if there's an error
      return {
        genderDistribution: [],
        ageDistribution: []
      }
    }
  }

  const loadAppointmentStats = async (fromDate: string, toDate: string) => {
    try {
      // Get appointment data
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate)

      if (appointmentError) throw appointmentError

      if (appointmentData) {
        const totalAppointments = appointmentData.length
        const completedAppointments = appointmentData.filter(appt => appt.status === 'completed').length
        const noShowAppointments = appointmentData.filter(appt => appt.status === 'no-show').length
        const pendingAppointments = appointmentData.filter(appt => appt.status === 'scheduled').length
        
        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
        const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0

        setAppointmentStats({
          totalAppointments,
          completedAppointments,
          noShowAppointments,
          pendingAppointments,
          completionRate,
          noShowRate
        })
      }
    } catch (error) {
      console.error("Error loading appointment stats:", error)
    }
  }
  const loadBedOccupancy = async () => {
    try {
      // Get room and occupancy data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('room_number, capacity, current_occupancy, department_id, room_type')

      if (roomError) throw roomError

      if (roomData) {
        // Get department info
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name')

        // Create department ID to name mapping
        const deptMap: StaffDeptMap = {}
        if (deptData) {
          deptData.forEach(dept => {
            deptMap[dept.id] = dept.name
          })
        }

        // Format for bed occupancy chart
        const bedOccupancyData = roomData.map(room => ({
          room: room.room_number,
          department: room.department_id ? (deptMap[room.department_id] ?? 'Unknown') : 'Unknown',
          type: room.room_type,
          capacity: room.capacity,
          occupied: room.current_occupancy,
          available: room.capacity - room.current_occupancy,
          occupancyRate: room.capacity > 0 ? (room.current_occupancy / room.capacity) * 100 : 0
        }))

        // Group by department
        const deptOccupancy: DeptOccupancy = {}
        bedOccupancyData.forEach(room => {
          if (!deptOccupancy[room.department]) {
            deptOccupancy[room.department] = {
              department: room.department,
              total: 0,
              occupied: 0,
              available: 0
            }
          }
          deptOccupancy[room.department].total += room.capacity
          deptOccupancy[room.department].occupied += room.occupied
          deptOccupancy[room.department].available += room.available
        })

        setBedOccupancy(Object.values(deptOccupancy))
      }
    } catch (error) {
      console.error("Error loading bed occupancy:", error)
    }
  }

  // Load clinical metrics from medical records
  const loadClinicalMetrics = async (fromDate: string, toDate: string, patientDemographics: PatientDemographics) => {
    try {
      // Get medical records
      let recordsQuery = supabase
        .from('medical_records')
        .select(`
          id, 
          patient_id,
          staff_id, 
          record_date, 
          diagnosis, 
          treatment, 
          prescription, 
          follow_up_date, 
          notes, 
          attachments,
          vital_signs,
          patients(id, first_name, last_name, gender, date_of_birth)
        `)
        .gte('record_date', fromDate)
        .lte('record_date', toDate)
      
      if (departmentFilter !== 'all') {
        // Join through staff to filter by department
        recordsQuery = recordsQuery
          .eq('staff.department', departmentFilter)
      }

      const { data: records, error: recordsError } = await recordsQuery;
      
      if (recordsError) throw recordsError;

      // Get patient data for demographics 
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, gender, date_of_birth');
      
      if (patientError) throw patientError;

      // Process diagnosis frequency
      const diagnosisCounts: {[key: string]: number} = {};
      records?.forEach(record => {
        const diagnosis = record.diagnosis;
        // Group similar diagnoses into categories
        let category = 'Other';
        
        if (diagnosis.toLowerCase().includes('heart') || diagnosis.toLowerCase().includes('cardio')) {
          category = 'Cardiovascular';
        } else if (diagnosis.toLowerCase().includes('lung') || diagnosis.toLowerCase().includes('respiratory')) {
          category = 'Respiratory';
        } else if (diagnosis.toLowerCase().includes('diabetes') || diagnosis.toLowerCase().includes('thyroid')) {
          category = 'Endocrine';
        } else if (diagnosis.toLowerCase().includes('cancer') || diagnosis.toLowerCase().includes('tumor')) {
          category = 'Cancer';
        } else if (diagnosis.toLowerCase().includes('fracture') || diagnosis.toLowerCase().includes('bone')) {
          category = 'Musculoskeletal';
        } else if (diagnosis.toLowerCase().includes('brain') || diagnosis.toLowerCase().includes('neuro')) {
          category = 'Neurological';
        } else if (diagnosis.toLowerCase().includes('child') || diagnosis.toLowerCase().includes('pediatric')) {
          category = 'Pediatric';
        }
        
        diagnosisCounts[category] = (diagnosisCounts[category] || 0) + 1;
      });

      const diagnosisFrequency = Object.entries(diagnosisCounts).map(([name, count]) => ({
        name,
        count
      }));

      // Process treatment outcomes
      const treatmentResults: {[key: string]: {success: number, failure: number}} = {};
      records?.forEach(record => {
        const treatment = record.treatment;
        // Simplify treatment categories
        let category = 'Other Treatment';
        if (treatment?.toLowerCase().includes('surgery')) {
          category = 'Surgery';
        } else if (treatment?.toLowerCase().includes('medication') || treatment?.toLowerCase().includes('drug')) {
          category = 'Medication';
        } else if (treatment?.toLowerCase().includes('therapy') || treatment?.toLowerCase().includes('rehabilitation')) {
          category = 'Therapy';
        } else if (treatment?.toLowerCase().includes('diet') || treatment?.toLowerCase().includes('exercise')) {
          category = 'Lifestyle Changes';
        }

        // Check if there are notes about outcome
        let isSuccess = true;
        if (record.notes) {
          const notesLower = record.notes.toLowerCase();
          if (notesLower.includes('failed') || notesLower.includes('unsuccessful') || 
              notesLower.includes('not improved') || notesLower.includes('deteriorated')) {
            isSuccess = false;
          }
        }

        if (!treatmentResults[category]) {
          treatmentResults[category] = { success: 0, failure: 0 };
        }
        
        if (isSuccess) {
          treatmentResults[category].success += 1;
        } else {
          treatmentResults[category].failure += 1;
        }
      });

      const treatmentOutcomes = Object.entries(treatmentResults).map(([treatment, results]) => ({
        treatment,
        success: results.success,
        failure: results.failure
      }));

      // Generate patient outcomes over time (using months)
      const monthsData: {[key: string]: {improved: number, stable: number, deteriorated: number}} = {};
      
      // Create entries for last 6 months
      const sixMonthsAgo = subMonths(new Date(), 6);
      const months = eachMonthOfInterval({
        start: sixMonthsAgo,
        end: new Date()
      });

      months.forEach(month => {
        const monthStr = format(month, 'MMM yyyy');
        monthsData[monthStr] = { improved: 0, stable: 0, deteriorated: 0 };
      });

      // Fill with actual data
      records?.forEach(record => {
        const recordMonth = format(new Date(record.record_date), 'MMM yyyy');
        if (monthsData[recordMonth]) {
          let outcome = 'stable';
          if (record.notes) {
            const notesLower = record.notes.toLowerCase();
            if (notesLower.includes('improved') || notesLower.includes('better')) {
              outcome = 'improved';
            } else if (notesLower.includes('worse') || notesLower.includes('deteriorated')) {
              outcome = 'deteriorated';
            }
          }
          
          monthsData[recordMonth][outcome as keyof typeof monthsData[typeof recordMonth]] += 1;
        }
      });

      const patientOutcomes = Object.entries(monthsData).map(([month, outcomes]) => ({
        month,
        improved: outcomes.improved,
        stable: outcomes.stable,
        deteriorated: outcomes.deteriorated
      }));

      // Calculate readmission rates
      const readmissionMonths: {[key: string]: {total: number, readmissions: number}} = {};
      
      // Initialize months
      months.forEach(month => {
        const monthStr = format(month, 'MMM yyyy');
        readmissionMonths[monthStr] = { total: 0, readmissions: 0 };
      });

      // Get unique patients in each month and look for readmissions
      const patientVisits: {[key: string]: {[key: string]: number}} = {};
      
      records?.forEach(record => {
        const recordMonth = format(new Date(record.record_date), 'MMM yyyy');
        const patientId = record.patient_id;
        
        if (!patientVisits[patientId]) {
          patientVisits[patientId] = {};
        }
        
        patientVisits[patientId][recordMonth] = (patientVisits[patientId][recordMonth] || 0) + 1;
        
        if (readmissionMonths[recordMonth]) {
          readmissionMonths[recordMonth].total += 1;
          
          // If this patient has more than one visit in this month, count as readmission
          if (patientVisits[patientId][recordMonth] > 1) {
            readmissionMonths[recordMonth].readmissions += 1;
          }
        }
      });

      const readmissionRates = Object.entries(readmissionMonths).map(([month, data]) => ({
        month,
        rate: data.total > 0 ? (data.readmissions / data.total) * 100 : 0
      }));

      // Calculate overall readmission rate
      const totalPatients = Object.keys(patientVisits).length;
      const patientsWithMultipleVisits = Object.values(patientVisits).filter(visits => 
        Object.values(visits).reduce((sum, count) => sum + count, 0) > 1
      ).length;
      
      const overallReadmissionRate = totalPatients > 0 ? (patientsWithMultipleVisits / totalPatients) * 100 : 0;
      
      // Calculate length of stay (if we have discharge data)
      const stayLengths: number[] = [];
      records?.forEach(record => {
        if (record.follow_up_date && record.record_date) {
          const admissionDate = new Date(record.record_date);
          const dischargeDate = new Date(record.follow_up_date);
          const stayDays = Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 3600 * 24));
          if (stayDays > 0 && stayDays < 100) { // Validate reasonable stay lengths
            stayLengths.push(stayDays);
          }
        }
      });
      
      const averageStayLength = stayLengths.length > 0 
        ? stayLengths.reduce((sum, days) => sum + days, 0) / stayLengths.length 
        : 0;
      
      // Get previous period for comparison
      const prevFromDate = formatDate(subMonths(new Date(fromDate), 12), 'yyyy-MM-dd');
      const prevToDate = formatDate(subMonths(new Date(toDate), 12), 'yyyy-MM-dd');
      
      const { data: prevRecords } = await supabase
        .from('medical_records')
        .select('id, patient_id, record_date, follow_up_date, notes')
        .gte('record_date', prevFromDate)
        .lte('record_date', prevToDate);
      
      // Calculate previous length of stay
      const prevStayLengths: number[] = [];
      prevRecords?.forEach(record => {
        if (record.follow_up_date && record.record_date) {
          const admissionDate = new Date(record.record_date);
          const dischargeDate = new Date(record.follow_up_date);
          const stayDays = Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 3600 * 24));
          if (stayDays > 0 && stayDays < 100) {
            prevStayLengths.push(stayDays);
          }
        }
      });
      
      const prevAverageStayLength = prevStayLengths.length > 0 
        ? prevStayLengths.reduce((sum, days) => sum + days, 0) / prevStayLengths.length 
        : 1; // Avoid division by zero
      
      const lengthOfStayChange = ((averageStayLength - prevAverageStayLength) / prevAverageStayLength) * 100;

      // Compile the clinical metrics
      setClinicalMetrics({
        diagnosisFrequency,
        treatmentOutcomes,
        patientOutcomes,
        readmissionRates,
        patientsByAge: patientDemographics?.ageDistribution || [],// Preserve existing data
        patientsByGender: patientDemographics?.genderDistribution || [], // Preserve existing data
        patientSatisfaction: {
          rate: 0, // Zero instead of hardcoded placeholder
          change: 0  // Zero instead of hardcoded placeholder
        },
        lengthOfStay: {
          days: averageStayLength,
          change: lengthOfStayChange
        },
        readmissionRate: {
          rate: overallReadmissionRate,
          change: 0  // Zero instead of hardcoded placeholder
        },
        mortalityRate: {
          rate: 0,  // Zero instead of hardcoded placeholder
          change: 0  // Zero instead of hardcoded placeholder
        }
      });

    } catch (error) {
      console.error("Error loading clinical metrics:", error);
      // Don't fail the whole loading process if clinical metrics fail
    }
  };

  // Function to store current metrics in historical table
  /* 
  const storeCurrentMetrics = async (revenue: number, outstandingBills: number, 
                                    insuranceClaims: number, collectionRate: number) => {
    try {
      const currentPeriod = format(new Date(), 'yyyy-MM');
      
      // Store each metric as a separate record
      const metrics = [
        { period: currentPeriod, metric_name: 'revenue', metric_value: revenue },
        { period: currentPeriod, metric_name: 'outstanding_bills', metric_value: outstandingBills },
        { period: currentPeriod, metric_name: 'insurance_claims', metric_value: insuranceClaims },
        { period: currentPeriod, metric_name: 'collection_rate', metric_value: collectionRate }
      ];
      
      // Check if metrics already exist for this period
      const { data: existingMetrics } = await supabase
        .from('financial_historical_metrics')
        .select('id, metric_name')
        .eq('period', currentPeriod);
      
      if (existingMetrics && existingMetrics.length > 0) {
        // Update existing metrics
        for (const metric of metrics) {
          const existingMetric = existingMetrics.find(m => m.metric_name === metric.metric_name);
          if (existingMetric) {
            await supabase
              .from('financial_historical_metrics')
              .update({ metric_value: metric.metric_value })
              .eq('id', existingMetric.id);
          } else {
            await supabase
              .from('financial_historical_metrics')
              .insert(metric);
          }
        }
      } else {
        // Insert new metrics
        await supabase
          .from('financial_historical_metrics')
          .insert(metrics);
      }
    } catch (error) {
      console.error("Error storing historical metrics:", error);
      // Don't stop execution if history storage fails
    }
  };
  */

  // Refresh all data
  const refreshData = async () => {
    toast({
      title: "Refreshing",
      description: "Updating report data...",
    })
    await loadData()
    toast({
      title: "Refreshed",
      description: "Report data has been updated.",
    })
  }

  // // Export functionality
  // const exportReport = async (format: string) => {
  //   // This is left to be implemented in the page component as it requires UI libraries like jsPDF
  //   return { format, success: true };
  // };

  // Function to calculate average wait time from appointments if possible
const calculateAverageWaitTime = () => {
  // If you don't have appointment duration or wait time data in your schema
  // Return null to indicate it's not available
  return null;
};

// Function to check if staff utilization can be calculated
const isStaffUtilizationAvailable = false; // Set to true if you add this data to your schema

// Function to fetch staff utilization from Supabase
const fetchStaffUtilization = async () => {
  try {
    // This would be implemented if you had the appropriate table
    return null;
  } catch (error) {
    console.error("Error fetching staff utilization:", error);
    return null;
  }
};

// Function to load operational metrics including room occupancy history
const loadOperationalMetrics = async (fromDate: string, toDate: string) => {
  try {
    // Load room occupancy history
    await loadRoomOccupancyHistory(fromDate, toDate);
    
    // Calculate operational metrics
    const appointmentCompletionRate = appointmentStats.completionRate;
    const noShowRate = appointmentStats.noShowRate;
    
    // Calculate bed occupancy rate (average across departments)
    const bedOccupancyRate = bedOccupancy.length > 0 
      ? bedOccupancy.reduce((sum, dept) => sum + (dept.occupied / dept.total) * 100, 0) / bedOccupancy.length
      : 0;
    
    // Convert room occupancy history to operational metrics format
    const roomUtilization = roomOccupancyHistory.map(room => ({
      room: `${room.room_number || 'Unknown'} (${room.department_name || 'Unassigned'})`,
      utilizationRate: room.occupancy_rate ?? 0,
    }));
    
    // Fetch real inventory data for inventory status
    let inventoryStatus: Array<{
      category: string;
      inStock: number;
      onOrder: number;
      critical: boolean;
    }> = [];
    try {
      // Get inventory data grouped by category
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('category, quantity, reorder_level, status');
        
      if (inventoryError) throw inventoryError;
      
      if (inventoryData && inventoryData.length > 0) {
        // Group by category
        const categoryGroups: {[key: string]: {total: number, inStock: number, critical: number}} = {};
        
        inventoryData.forEach(item => {
          if (!categoryGroups[item.category]) {
            categoryGroups[item.category] = { total: 0, inStock: 0, critical: 0 };
          }
          
          categoryGroups[item.category].total++;
          
          // If quantity is greater than reorder level, count as in stock
          if (item.quantity > (item.reorder_level || 0)) {
            categoryGroups[item.category].inStock++;
          } else {
            categoryGroups[item.category].critical++;
          }
        });
        
        // Convert to array format for chart
        inventoryStatus = Object.entries(categoryGroups).map(([category, data]) => ({
          category,
          inStock: Math.round((data.inStock / data.total) * 100),
          onOrder: 0, // We don't have this data in the schema yet
          critical: data.critical > 0
        }));
      }
    } catch (error) {
      console.error("Error fetching inventory status:", error);
    }
    
    // Fetch real staff performance data if possible
    let staffPerformance: Array<{
      category: string;
      nursing: number;
      physicians: number;
      support: number;
    }> = [];
    try {
      // Get staff data grouped by department and role
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('department, role')
        .in('role', ['nurse', 'doctor', 'support staff', 'physician', 'assistant']);
      
      if (staffError) throw staffError;
      
      if (staffData && staffData.length > 0) {
        // Get unique categories for staff performance
        const categories = ['Patient Care', 'Documentation', 'Team Collaboration', 'Response Time', 'Protocol Adherence'];
        
        // Calculate staff counts by role for performance calculation
        const nursesCount = staffData.filter(s => s.role.toLowerCase().includes('nurse')).length;
        const physiciansCount = staffData.filter(s => s.role.toLowerCase().includes('doctor') || s.role.toLowerCase().includes('physician')).length;
        const supportCount = staffData.filter(s => s.role.toLowerCase().includes('support') || s.role.toLowerCase().includes('assistant')).length;
        
        // For now, we don't have actual performance metrics, so we're using a weighted random approach
        // that considers actual staff distribution but is still placeholder data
        staffPerformance = categories.map(category => {
          // We assign slightly better metrics for categories with more staff
          // This is still placeholder data, but it reflects the actual staff distribution
          const nursingWeight = nursesCount > 0 ? 70 + (nursesCount % 30) : 75;
          const physiciansWeight = physiciansCount > 0 ? 70 + (physiciansCount % 30) : 75;  
          const supportWeight = supportCount > 0 ? 60 + (supportCount % 25) : 65;
          
          return {
            category,
            nursing: nursingWeight,
            physicians: physiciansWeight,
            support: supportWeight
          };
        });
      }
    } catch (error) {
      console.error("Error fetching staff performance data:", error);
    }
    
    // Set operational metrics
    setOperationalMetrics({
      appointmentCompletionRate,
      noShowRate,
      averageWaitTime: 0, // Zero until we have real data
      bedOccupancyRate,
      roomUtilization: roomUtilization.map(item => ({
        room: item.room,
        utilizationRate: Number(item.utilizationRate)
      })),
      staffUtilization: departments.map(dept => ({
        department: dept,
        utilizationRate: 0 // Zero until we have real data
      })),
      bedOccupancy,
      staffPerformance,
      inventoryStatus,
      staffUtilizationRate: 0, // Zero until we have real data
      staffUtilizationChange: 0, // Zero until we have real data
      dailyAdmissions: await generateDailyAdmissionsData(fromDate, toDate),
      roomOccupancyHistory, // Add the room occupancy history data
    });
    
  } catch (error) {
    console.error("Error loading operational metrics:", error);
  }
};

// Function to load room occupancy history
const loadRoomOccupancyHistory = async (fromDate: string, toDate: string) => {
  try {
    console.log("Loading room occupancy history with date range:", fromDate, "to", toDate);
    
    // Use the getRoomOccupancyHistory function from useRooms instead of directly querying Supabase
    const { roomOccupancyHistory: historyData, error } = await getRoomOccupancyHistory({
      from: new Date(fromDate),
      to: new Date(toDate)
    });
    
    console.log("Room occupancy history fetched:", historyData?.length || 0, "records");
    
    if (error) {
      throw new Error(error);
    }
    
    // Apply department filter if needed
    let filteredData = historyData;
    if (departmentFilter !== 'all') {
      filteredData = historyData.filter(room => 
        room.department_name?.toLowerCase() === departmentFilter.toLowerCase()
      );
      console.log("Filtered room occupancy history by department:", departmentFilter, 
                 "resulting in", filteredData?.length || 0, "records");
    }
    
    setRoomOccupancyHistory(filteredData || []);
    console.log("Room occupancy history set in state:", filteredData?.length || 0, "records");
    
  } catch (error) {
    console.error("Error loading room occupancy history:", error);
    setRoomOccupancyHistory([]);
  }
};

// Helper function to generate daily admissions data from real appointment data
const generateDailyAdmissionsData = async (fromDate: string, toDate: string) => {
  try {
    // Initialize daily data structure
    const admissionsByDay: {[key: string]: {emergency: number, scheduled: number}} = {};
    
    // Initialize days in range
    let currentDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    while (currentDate <= endDate) {
      const dayKey = format(currentDate, 'yyyy-MM-dd');
      admissionsByDay[dayKey] = { emergency: 0, scheduled: 0 };
      currentDate = addDays(currentDate, 1);
    }
    
    // Get real appointment data
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_type')
      .gte('appointment_date', fromDate)
      .lte('appointment_date', toDate);
    
    if (appointmentsError) {
      throw appointmentsError;
    }
    
    if (appointmentsData && appointmentsData.length > 0) {
      // Process actual appointments by day and type
      appointmentsData.forEach(appointment => {
        const appointmentDay = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');
        
        if (admissionsByDay[appointmentDay]) {
          // Check appointment type to determine if emergency or scheduled
          if (appointment.appointment_type.toLowerCase().includes('emergency')) {
            admissionsByDay[appointmentDay].emergency += 1;
          } else {
            admissionsByDay[appointmentDay].scheduled += 1;
          }
        }
      });
      
      // Convert to array format for charts
      return Object.entries(admissionsByDay).map(([day, counts]) => ({
        day: format(new Date(day), 'MMM dd'),
        emergency: counts.emergency,
        scheduled: counts.scheduled
      }));
    }
    
    // If no appointment data is found, check for patient room assignments
    const { data: admissionsData } = await supabase
      .from('patient_room_assignments')
      .select('admission_date')
      .gte('admission_date', fromDate)
      .lte('admission_date', toDate);
      
    if (admissionsData && admissionsData.length > 0) {
      // Process room assignments as admissions
      // But we need to join with other tables to determine if emergency/scheduled
      // For now, we'll use a reasonable estimate based on time of day
      admissionsData.forEach(admission => {
        const admissionDay = format(new Date(admission.admission_date), 'yyyy-MM-dd');
        if (admissionsByDay[admissionDay]) {
          const admissionTime = new Date(admission.admission_date).getHours();
          
          // Assign emergency/scheduled based on admission time as a heuristic
          // Emergencies are more common outside business hours
          if (admissionTime < 8 || admissionTime > 17) {
            admissionsByDay[admissionDay].emergency += 1;
          } else {
            admissionsByDay[admissionDay].scheduled += 1;
          }
        }
      });
      
      // Convert to array format for charts
      return Object.entries(admissionsByDay).map(([day, counts]) => ({
        day: format(new Date(day), 'MMM dd'),
        emergency: counts.emergency,
        scheduled: counts.scheduled
      }));
    }
    
    // If no data found at all, return mock data for demonstration
    return [
      { day: "Mon", emergency: 12, scheduled: 28 },
      { day: "Tue", emergency: 8, scheduled: 30 },
      { day: "Wed", emergency: 10, scheduled: 25 },
      { day: "Thu", emergency: 15, scheduled: 22 },
      { day: "Fri", emergency: 7, scheduled: 32 },
      { day: "Sat", emergency: 18, scheduled: 15 },
      { day: "Sun", emergency: 20, scheduled: 10 }
    ];
    
  } catch (error) {
    console.error("Error generating daily admissions data:", error);
    // Return mock data even on error
    return [
      { day: "Mon", emergency: 12, scheduled: 28 },
      { day: "Tue", emergency: 8, scheduled: 30 },
      { day: "Wed", emergency: 10, scheduled: 25 },
      { day: "Thu", emergency: 15, scheduled: 22 },
      { day: "Fri", emergency: 7, scheduled: 32 },
      { day: "Sat", emergency: 18, scheduled: 15 },
      { day: "Sun", emergency: 20, scheduled: 10 }
    ];
  }
};

  return {
    // State
    isLoading,
    departments,
    dateRange,
    departmentFilter,
    reportTypeFilter,
    
    // Data
    revenueByDept,
    insuranceClaims,
    appointmentStats,
    bedOccupancy,
    financialSummary,
    revenueTrends,
    paymentDistribution,
    financialGrowth,
    clinicalMetrics,
    operationalMetrics,
    roomOccupancyHistory,
    
    // Actions
    setDateRange,
    setDepartmentFilter,
    setReportTypeFilter,
    refreshData,
    calculateAverageWaitTime,
    fetchStaffUtilization,
    loadData
  };
}