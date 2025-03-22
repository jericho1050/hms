import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';
import { Buffer } from 'buffer';
import { createClient } from '@/utils/supabase/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawBarChart, drawPieChart, extractChartData } from '@/utils/chart-helpers';

interface ScheduledReport {
  id: string;
  user_id: string;
  report_name: string;
  report_type: string;
  frequency: string;
  recipients: string;
  filters: string; // JSON string
  next_run: string;
  last_run?: string;
  created_at: string;
  file_format?: string; // pdf, excel, csv, html
}

interface ReportFilters {
  dateRange: {
    from: string | null;
    to: string | null;
  };
  departmentFilter: string;
  reportTypeFilter: string;
  includeCharts?: boolean;
  includeTables?: boolean;
  includeSummary?: boolean;
}

// Generate report based on requested format
async function generateReport(
  reportType: string, 
  filters: ReportFilters, 
  format: string = 'pdf'
): Promise<{ data: Buffer; extension: string }> {
  console.log(`Generating ${reportType} report in ${format} format with filters:`, filters);
  
  // Default to PDF if format is not specified or invalid
  if (!['pdf', 'excel', 'csv', 'html'].includes(format.toLowerCase())) {
    format = 'pdf';
  }

  // Get report data based on report type
  const reportData = await getReportData(reportType, filters);
  
  // Generate report in the requested format
  switch (format.toLowerCase()) {
    case 'pdf':
      return { 
        data: await generatePdfReport(reportType, reportData, filters),
        extension: 'pdf'
      };
    case 'excel':
      return { 
        data: await generateExcelReport(reportType, reportData, filters),
        extension: 'xlsx'
      };
    case 'csv':
      return { 
        data: await generateCsvReport(reportType, reportData, filters),
        extension: 'csv'
      };
    case 'html':
      return { 
        data: await generateHtmlReport(reportType, reportData, filters),
        extension: 'html'
      };
    default:
      return { 
        data: await generatePdfReport(reportType, reportData, filters),
        extension: 'pdf'
      };
  }
}

// Get report data based on report type
async function getReportData(reportType: string, filters: ReportFilters): Promise<any> {
  const supabase = await createClient();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  // Parse date range filters for database queries
  const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : undefined;
  const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : undefined;
  
  // Apply department filter if not "all"
  const departmentFilter = filters.departmentFilter !== 'all' ? filters.departmentFilter : undefined;
  
  switch (reportType.toLowerCase()) {
    case 'financial': {
      // Get billing data for financial report
      let billingQuery = supabase
        .from('billing')
        .select('id, total_amount, payment_status, payment_date, invoice_date, payment_method');
      
      // Apply date filter if available
      if (fromDate) {
        billingQuery = billingQuery.gte('invoice_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        billingQuery = billingQuery.lte('invoice_date', toDate.toISOString().split('T')[0]);
      }
      
      const { data: billingData, error: billingError } = await billingQuery;
      
      if (billingError) {
        console.error('Error fetching billing data:', billingError);
        throw new Error('Failed to fetch financial data');
      }
      
      // Get revenue by department
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, department');
      
      let appointmentsQuery = supabase
        .from('appointments')
        .select('staff_id');
      
      // Apply date filter if available
      if (fromDate) {
        appointmentsQuery = appointmentsQuery.gte('appointment_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        appointmentsQuery = appointmentsQuery.lte('appointment_date', toDate.toISOString().split('T')[0]);
      }
      
      const { data: appointmentData } = await appointmentsQuery;
      
      // Create a map of staff IDs to departments
      const staffDeptMap: {[key: string]: string} = {};
      if (staffData) {
        staffData.forEach((staff: any) => {
          staffDeptMap[staff.id] = staff.department;
        });
      }
      
      // Count appointments by department
      const deptCounts: {[key: string]: number} = {};
      if (appointmentData) {
        appointmentData.forEach((appt: any) => {
          const dept = staffDeptMap[appt.staff_id];
          if (dept) {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
          }
        });
      }
      
      // Calculate financial metrics
      const totalRevenue = billingData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0;
      const outstandingBills = billingData?.filter(bill => bill.payment_status === 'pending')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0;
      const paidAmount = billingData?.filter(bill => bill.payment_status === 'paid')
        .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0;
      const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;
      
      // Group payments by method
      const methodTotals: {[key: string]: number} = {};
      let totalPayments = 0;
      
      billingData?.forEach(payment => {
        const method = mapPaymentMethodToCategory(payment.payment_method || 'Other');
        methodTotals[method] = (methodTotals[method] || 0) + (payment.total_amount || 0);
        totalPayments += (payment.total_amount || 0);
      });
      
      // Convert to percentage distribution
      const paymentDistribution = Object.entries(methodTotals).map(([name, amount]) => ({
        name,
        value: Math.round((amount / (totalPayments || 1)) * 100)
      }));
      
      // Calculate department revenue
      const avgRevenue = totalRevenue / (appointmentData?.length || 1);
      const revenueByDepartment = Object.entries(deptCounts).map(([name, count]) => ({
        department: name,
        revenue: Math.round(avgRevenue * count),
        expenses: Math.round(avgRevenue * count * 0.75), // Estimate expenses at 75% of revenue
        profit: Math.round(avgRevenue * count * 0.25)  // Estimate profit at 25% of revenue
      }));
      
      // Filter by department if specified
      const filteredRevenueByDept = departmentFilter
        ? revenueByDepartment.filter(dept => dept.department.toLowerCase() === departmentFilter.toLowerCase())
        : revenueByDepartment;
      
      const totals = {
        revenue: filteredRevenueByDept.reduce((sum, dept) => sum + dept.revenue, 0),
        expenses: filteredRevenueByDept.reduce((sum, dept) => sum + dept.expenses, 0),
        profit: filteredRevenueByDept.reduce((sum, dept) => sum + dept.profit, 0)
      };
      
      return {
        title: 'Financial Performance Report',
        date: dateStr,
        summary: `This report provides a summary of financial performance with a total revenue of ${formatCurrency(totalRevenue)}, outstanding bills of ${formatCurrency(outstandingBills)}, and a collection rate of ${collectionRate.toFixed(1)}%.`,
        data: filteredRevenueByDept,
        totals,
        paymentDistribution,
        charts: [
          { type: 'bar', title: 'Department Revenue Comparison' },
          { type: 'pie', title: 'Payment Method Distribution' }
        ]
      };
    }
    
    case 'clinical': {
      // Get patient data for clinical report
      let patientsQuery = supabase
        .from('patients')
        .select('id, gender, date_of_birth');
      
      const { data: patientData, error: patientError } = await patientsQuery;
      
      if (patientError) {
        console.error('Error fetching patient data:', patientError);
        throw new Error('Failed to fetch clinical data');
      }
      
      // Get medical records data
      let recordsQuery = supabase
        .from('medical_records')
        .select('id, patient_id, diagnosis, treatment, outcome, readmission, admission_date, discharge_date');
      
      // Apply date filter if available
      if (fromDate) {
        recordsQuery = recordsQuery.gte('admission_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        recordsQuery = recordsQuery.lte('discharge_date', toDate.toISOString().split('T')[0]);
      }
      
      const { data: medicalRecords, error: recordsError } = await recordsQuery;
      
      // if (recordsError) {
      //   console.error('Error fetching medical records:', recordsError);
      //   throw new Error('Failed to fetch clinical data');
      // }
      
      // Process patient demographics
      const genderCounts = { Male: 0, Female: 0, Other: 0 };
      const ageCounts = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '66+': 0 };
      
      patientData?.forEach(patient => {
        // Gender counts
        if (patient.gender === 'male') genderCounts.Male++;
        else if (patient.gender === 'female') genderCounts.Female++;
        else genderCounts.Other++;
        
        // Age counts
        if (patient.date_of_birth) {
          const birthDate = new Date(patient.date_of_birth);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          
          if (age <= 18) ageCounts['0-18']++;
          else if (age <= 35) ageCounts['19-35']++;
          else if (age <= 50) ageCounts['36-50']++;
          else if (age <= 65) ageCounts['51-65']++;
          else ageCounts['66+']++;
        }
      });
      
      // Process department data
      const departmentData: {[key: string]: {patients: number, successful: number, readmission: number}} = {};
      
      // Get departments from staff
      const { data: staffDepts } = await supabase
        .from('staff')
        .select('id, department');
      
      const staffDeptMap: {[key: string]: string} = {};
      if (staffDepts) {
        staffDepts.forEach((staff: any) => {
          staffDeptMap[staff.id] = staff.department;
        });
      }
      
      // Get appointments with staff info
      const { data: apptData } = await supabase
        .from('appointments')
        .select('id, staff_id, patient_id');
      
      // Map patients to departments through appointments
      const patientDeptMap: {[key: string]: string} = {};
      if (apptData) {
        apptData.forEach((appt: any) => {
          const dept = staffDeptMap[appt.staff_id];
          if (dept && appt.patient_id) {
            patientDeptMap[appt.patient_id] = dept;
          }
        });
      }
      
      // Process medical records by department
      medicalRecords?.forEach(record => {
        const dept = patientDeptMap[record.patient_id] || 'Unknown';
        
        if (!departmentData[dept]) {
          departmentData[dept] = { patients: 0, successful: 0, readmission: 0 };
        }
        
        departmentData[dept].patients++;
        
        if (record.outcome === 'improved' || record.outcome === 'cured') {
          departmentData[dept].successful++;
        }
        
        if (record.readmission) {
          departmentData[dept].readmission++;
        }
      });
      
      // Convert to array for report
      const clinicalByDept = Object.entries(departmentData).map(([department, data]) => ({
        department,
        patients: data.patients,
        successful: data.successful,
        readmission: data.readmission,
        successRate: data.patients > 0 ? Math.round((data.successful / data.patients) * 100) : 0,
        readmissionRate: data.patients > 0 ? Math.round((data.readmission / data.patients) * 100) : 0
      }));
      
      // Filter by department if specified
      const filteredClinicalData = departmentFilter
        ? clinicalByDept.filter(dept => dept.department.toLowerCase() === departmentFilter.toLowerCase())
        : clinicalByDept;
      
      const totals = {
        patients: filteredClinicalData.reduce((sum, dept) => sum + dept.patients, 0),
        successful: filteredClinicalData.reduce((sum, dept) => sum + dept.successful, 0),
        readmission: filteredClinicalData.reduce((sum, dept) => sum + dept.readmission, 0)
      };
      
      return {
        title: 'Clinical Outcomes Report',
        date: dateStr,
        summary: `This report provides a summary of clinical outcomes across ${filteredClinicalData.length} departments with a total of ${totals.patients} patients.`,
        data: filteredClinicalData,
        totals,
        demographics: {
          gender: Object.entries(genderCounts).map(([gender, count]) => ({ gender, count })),
          age: Object.entries(ageCounts).map(([age, count]) => ({ age, count }))
        },
        charts: [
          { type: 'bar', title: 'Treatment Success Rates by Department' },
          { type: 'pie', title: 'Patient Demographics' }
        ]
      };
    }
    
    case 'operational': {
      // Get operational metrics from database
      
      // Get appointment stats
      let appointmentsQuery = supabase
        .from('appointments')
        .select('id, status, appointment_date');
      
      // Apply date filter if available
      if (fromDate) {
        appointmentsQuery = appointmentsQuery.gte('appointment_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        appointmentsQuery = appointmentsQuery.lte('appointment_date', toDate.toISOString().split('T')[0]);
      }
      
      const { data: appointmentData, error: appointmentError } = await appointmentsQuery;
      
      if (appointmentError) {
        console.error('Error fetching appointment data:', appointmentError);
        throw new Error('Failed to fetch operational data');
      }
      
      // Get room data for bed occupancy
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('room_number, capacity, current_occupancy, department_id, room_type');
      
      if (roomError) {
        console.error('Error fetching room data:', roomError);
        throw new Error('Failed to fetch operational data');
      }
      
      // Get department info
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name');
      
      // Create department ID to name mapping
      const deptMap: {[key: string]: string} = {};
      if (deptData) {
        deptData.forEach((dept: any) => {
          deptMap[dept.id] = dept.name;
        });
      }
      
      // Calculate appointment metrics
      const totalAppointments = appointmentData?.length || 0;
      const completedAppointments = appointmentData?.filter(appt => appt.status === 'completed').length || 0;
      const noShowAppointments = appointmentData?.filter(appt => appt.status === 'no-show').length || 0;
      const pendingAppointments = appointmentData?.filter(appt => appt.status === 'scheduled').length || 0;
      
      const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
      const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;
      
      // Calculate bed occupancy metrics by department
      const bedOccupancyByDept: {[key: string]: {total: number, occupied: number, available: number}} = {};
      
      roomData?.forEach(room => {
        const deptName = room.department_id ? (deptMap[room.department_id] || 'Unknown') : 'Unknown';
        
        if (!bedOccupancyByDept[deptName]) {
          bedOccupancyByDept[deptName] = { total: 0, occupied: 0, available: 0 };
        }
        
        bedOccupancyByDept[deptName].total += room.capacity;
        bedOccupancyByDept[deptName].occupied += room.current_occupancy;
        bedOccupancyByDept[deptName].available += (room.capacity - room.current_occupancy);
      });
      
      // Convert to array for report
      const bedOccupancyData = Object.entries(bedOccupancyByDept).map(([department, data]) => ({
        department,
        bedUtilization: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
        total: data.total,
        occupied: data.occupied,
        available: data.available
      }));
      
      // Filter by department if specified
      const filteredBedOccupancy = departmentFilter
        ? bedOccupancyData.filter(dept => dept.department.toLowerCase() === departmentFilter.toLowerCase())
        : bedOccupancyData;
      
      // Calculate overall metrics
      const totalBeds = filteredBedOccupancy.reduce((sum, dept) => sum + dept.total, 0);
      const occupiedBeds = filteredBedOccupancy.reduce((sum, dept) => sum + dept.occupied, 0);
      const overallOccupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
      
      return {
        title: 'Operational Efficiency Report',
        date: dateStr,
        summary: `This report provides operational metrics with an appointment completion rate of ${completionRate.toFixed(1)}% and overall bed occupancy of ${overallOccupancyRate.toFixed(1)}%.`,
        data: filteredBedOccupancy,
        metrics: {
          appointmentCompletionRate: completionRate,
          noShowRate: noShowRate,
          bedOccupancyRate: overallOccupancyRate
        },
        averages: {
          bedUtilization: overallOccupancyRate,
          completionRate: completionRate,
          noShowRate: noShowRate
        },
        charts: [
          { type: 'bar', title: 'Bed Utilization by Department' },
          { type: 'bar', title: 'Appointment Status Distribution' }
        ]
      };
    }
    
    case 'compliance': {
      // Without actual compliance data in database, we'll create a simulated report
      // This would be replaced with real data in a production system
      
      // Get departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name');
      
      const departments = deptData?.map((dept: any) => dept.name) || [];
      
      // Generate compliance data based on real departments
      const complianceData = departments.map(department => {
        // Deterministic "random" values based on department name length
        const nameLength = department.length;
        const compliantRate = 85 + (nameLength % 15); // 85-99% compliance
        const incidents = Math.max(1, 10 - (nameLength % 10)); // 1-10 incidents
        
        // Risk level based on compliance rate and incidents
        let riskLevel = 'Low';
        if (compliantRate < 90 || incidents > 5) {
          riskLevel = 'Medium';
        }
        if (compliantRate < 85 || incidents > 8) {
          riskLevel = 'High';
        }
        
        return {
          department,
          compliant: compliantRate,
          incidents,
          riskLevel
        };
      });
      
      // Filter by department if specified
      const filteredComplianceData = departmentFilter
        ? complianceData.filter(dept => dept.department.toLowerCase() === departmentFilter.toLowerCase())
        : complianceData;
      
      const averages = {
        compliant: filteredComplianceData.reduce((sum, dept) => sum + dept.compliant, 0) / filteredComplianceData.length,
        incidents: filteredComplianceData.reduce((sum, dept) => sum + dept.incidents, 0)
      };
      
      return {
        title: 'Compliance and Risk Report',
        date: dateStr,
        summary: `This report provides a summary of compliance metrics with an average compliance rate of ${averages.compliant.toFixed(1)}% across ${filteredComplianceData.length} departments.`,
        data: filteredComplianceData,
        averages,
        charts: [
          { type: 'bar', title: 'Compliance Rates by Department' },
          { type: 'pie', title: 'Incident Distribution' }
        ]
      };
    }
    
    default:
      // For unknown report types, return a general report with available data
      const { data: deptData } = await supabase
        .from('departments')
        .select('name');
      
      const departments = deptData?.map((dept: any) => dept.name) || [];
      
      return {
        title: 'General Hospital Report',
        date: dateStr,
        summary: 'This is a general report about hospital operations.',
        data: departments.map(department => ({
          department,
          metric1: 75 + Math.floor(Math.random() * 20),
          metric2: 80 + Math.floor(Math.random() * 15),
          metric3: 70 + Math.floor(Math.random() * 25)
        })),
        averages: { metric1: 84, metric2: 89.6, metric3: 82.8 },
        charts: [
          { type: 'bar', title: 'Department Comparison' },
          { type: 'line', title: 'Trend Analysis' }
        ]
      };
  }
}

// Helper function to categorize payment methods
function mapPaymentMethodToCategory(method: string): string {
  method = method.toLowerCase();
  if (method.includes('insurance') || method.includes('aetna') || method.includes('blue cross') || 
      method.includes('cigna') || method.includes('united')) {
    return 'Insurance';
  } else if (method.includes('medicare') || method.includes('medicaid')) {
    return 'Government';
  } else if (method.includes('cash') || method.includes('credit') || method.includes('debit') || 
             method.includes('check') || method.includes('self')) {
    return 'Out-of-pocket';
  } else {
    return 'Other';
  }
}

// Format currency for reports
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// PDF Report Generation
async function generatePdfReport(reportType: string, data: any, filters: ReportFilters): Promise<Buffer> {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(data.title, 14, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Report Date: ${data.date}`, 14, 30);
  
  // Add department filter if not "all"
  if (filters.departmentFilter && filters.departmentFilter !== 'all') {
    doc.text(`Department: ${filters.departmentFilter}`, 14, 38);
  }
  
  // Add date range if available
  if (filters.dateRange.from || filters.dateRange.to) {
    const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from).toLocaleDateString() : 'earliest';
    const toDate = filters.dateRange.to ? new Date(filters.dateRange.to).toLocaleDateString() : 'latest';
    doc.text(`Date Range: ${fromDate} to ${toDate}`, 14, 46);
  }
  
  let yPosition = 46;
  
  // Add summary if requested
  if (filters.includeSummary !== false) {
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Executive Summary', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    
    // Split summary into multiple lines if it's too long
    const splitSummary = doc.splitTextToSize(data.summary, 180);
    doc.text(splitSummary, 14, yPosition);
    yPosition += (splitSummary.length * 6) + 10;
  }
  
  // Add table if requested - use autoTable for better formatting
  if (filters.includeTables !== false && data.data && data.data.length > 0) {
    try {
      // Extract headers and prepare data for autoTable
      const headers = Object.keys(data.data[0]);
      const rows = data.data.map((row: any) => Object.values(row));
      
      // Calculate starting position based on current content
      const tableStartY = yPosition + 10;
      
      // Create table using autoTable plugin
      autoTable(doc,{
        startY: tableStartY,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data: any) => {
          // Update yPosition after drawing table
          yPosition = data.cursor.y + 10;
        }
      });
      
      // Add totals or averages if available
      if (data.totals || data.averages) {
        const summary = data.totals || data.averages;
        const summaryRows = Object.entries(summary).map(([key, value]) => [
          key.toString(), 
          value !== null && value !== undefined ? value.toString() : ''
        ]);
        
        // Get position after previous table
        const summaryStartY = (doc as any).lastAutoTable.finalY + 10;
        
        autoTable(doc,{
          startY: summaryStartY,
          head: [[data.totals ? 'Total' : 'Average', 'Value']],
          body: summaryRows,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255]
          },
          bodyStyles: { 
            fontStyle: 'bold'
          },
          margin: { left: 14, right: 14 },
          didDrawPage: (data: any) => {
            // Update yPosition after drawing table
            yPosition = data.cursor.y + 15;
          }
        });
      }
    } catch (error) {
      console.error("Error creating table in PDF:", error);
      // Fallback to simple text if table fails
      doc.text("Error generating table data", 14, yPosition + 10);
      yPosition += 20;
    }
  }
  
  // Add charts if requested
  if (filters.includeCharts !== false && data.charts && data.charts.length > 0) {
    try {
      for (let i = 0; i < data.charts.length; i++) {
        // Add a new page for each chart
        doc.addPage();
        
        const chart = data.charts[i];
        doc.setFontSize(16);
        doc.text(chart.title, 14, 20);
        
        // Extract data for chart
        const chartData = extractChartData(data, chart);
        
        // Draw chart based on type
        if (chart.type === 'bar') {
          drawBarChart(doc, chartData, 14, 30, 180, 120);
        } else if (chart.type === 'pie') {
          drawPieChart(doc, chartData, 14, 30, 180, 120);
        } else if (chart.type === 'line') {
          // For line charts, use bar charts as fallback
          drawBarChart(doc, chartData, 14, 30, 180, 120);
          doc.setFontSize(10);
          doc.text('(Line chart shown as bar chart)', 14, 160);
        }
        
        // Add chart description
        doc.setFontSize(10);
        doc.text(`Chart Type: ${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}`, 14, 170);
      }
    } catch (error) {
      console.error("Error adding charts to PDF:", error);
      // Add an error page if charts fail
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Error generating charts", 14, 20);
      doc.setFontSize(11);
      doc.text("The requested charts could not be generated.", 14, 30);
    }
  }
  
  // Convert the PDF to a Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

// Excel Report Generation (simplified as CSV for demo)
async function generateExcelReport(reportType: string, data: any, filters: ReportFilters): Promise<Buffer> {
  // For simplicity, we're generating a CSV and calling it Excel
  return generateCsvReport(reportType, data, filters);
}

// CSV Report Generation
async function generateCsvReport(reportType: string, data: any, filters: ReportFilters): Promise<Buffer> {
  if (!data.data || data.data.length === 0) {
    return Buffer.from('No data available');
  }

  // Extract headers
  const headers = Object.keys(data.data[0]);
  
  // Create CSV content
  let csvContent = `"${data.title}"\n`;
  csvContent += `"Report Date","${data.date}"\n\n`;
  
  // Add summary if requested
  if (filters.includeSummary !== false) {
    csvContent += `"Executive Summary"\n"${data.summary}"\n\n`;
  }
  
  // Add headers and data
  csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
  
  // Add data rows
  csvContent += data.data.map((row: any) => {
    return Object.values(row).map((value: any) => `"${value}"`).join(',');
  }).join('\n');
  
  // Add totals or averages if available
  if (data.totals) {
    csvContent += '\n\n"Totals"';
    Object.entries(data.totals).forEach(([key, value]) => {
      csvContent += `\n"${key}","${value}"`;
    });
  } else if (data.averages) {
    csvContent += '\n\n"Averages"';
    Object.entries(data.averages).forEach(([key, value]) => {
      csvContent += `\n"${key}","${value}"`;
    });
  }
  
  return Buffer.from(csvContent);
}

// HTML Report Generation
async function generateHtmlReport(reportType: string, data: any, filters: ReportFilters): Promise<Buffer> {
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    h1 { color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background-color: #3498db; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    tr:hover { background-color: #f5f5f5; }
    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .footer { margin-top: 40px; font-size: 12px; color: #7f8c8d; text-align: center; }
    .chart-placeholder { background-color: #f0f0f0; padding: 30px; text-align: center; margin: 20px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <p>Report Date: ${data.date}</p>
    ${filters.departmentFilter && filters.departmentFilter !== 'all' ? `<p>Department: ${filters.departmentFilter}</p>` : ''}
    ${filters.dateRange.from || filters.dateRange.to ? 
      `<p>Date Range: ${filters.dateRange.from ? new Date(filters.dateRange.from).toLocaleDateString() : 'earliest'} to 
      ${filters.dateRange.to ? new Date(filters.dateRange.to).toLocaleDateString() : 'latest'}</p>` : ''}
  </div>
  `;

  // Add summary if requested
  if (filters.includeSummary !== false) {
    htmlContent += `
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>${data.summary}</p>
  </div>
    `;
  }

  // Add data table if requested and available
  if (filters.includeTables !== false && data.data && data.data.length > 0) {
    const headers = Object.keys(data.data[0]);
    
    htmlContent += `
  <h2>Data Table</h2>
  <table>
    <thead>
      <tr>
        ${headers.map(header => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.data.map((row: any) => `
      <tr>
        ${Object.values(row).map((value: any) => `<td>${value}</td>`).join('')}
      </tr>
      `).join('')}
    </tbody>
  </table>
    `;
    
    // Add totals or averages if available
    if (data.totals) {
      htmlContent += `
  <h3>Totals</h3>
  <table>
    <tbody>
      ${Object.entries(data.totals).map(([key, value]) => `
      <tr>
        <td><strong>${key}</strong></td>
        <td>${value}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
      `;
    } else if (data.averages) {
      htmlContent += `
  <h3>Averages</h3>
  <table>
    <tbody>
      ${Object.entries(data.averages).map(([key, value]) => `
      <tr>
        <td><strong>${key}</strong></td>
        <td>${value}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
      `;
    }
  }

  // Add chart placeholders if requested
  if (filters.includeCharts !== false && data.charts && data.charts.length > 0) {
    htmlContent += `
  <h2>Charts and Visualizations</h2>
    `;
    
    data.charts.forEach((chart: any) => {
      htmlContent += `
  <div class="chart-placeholder">
    <h3>${chart.title}</h3>
    <p>[${chart.type.toUpperCase()} CHART VISUALIZATION WOULD APPEAR HERE]</p>
  </div>
      `;
    });
  }

  // Close the HTML document
  htmlContent += `
  <div class="footer">
    <p>This is an automatically generated report from the Hospital Management System.</p>
  </div>
</body>
</html>
  `;

  return Buffer.from(htmlContent);
}

export async function POST(request: Request) {
  try {
    // Verify this is an authorized call
    const requestHeaders = new Headers(request.headers);
    const authToken = requestHeaders.get('x-api-key');
    
    // Check for API key with fallback for testing
    const expectedToken = process.env.REPORT_SCHEDULER_SECRET || 'TheQuickDoggyJumpOverTheLazyCatsLOLO@3zxcvzasdf';
    if (authToken !== expectedToken) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        provided: authToken 
      }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    // Get all reports scheduled to run now
    const now = new Date();
    console.log(`Fetching reports scheduled to run before: ${now.toISOString()}`);

    const { data: scheduledReports, error } = await supabase
      .from('report_schedules')
      .select('*')
      // Use this line when actually deploying to production
      .lte('next_run', now.toISOString());
      
    if (error) {
      console.error('Error fetching scheduled reports:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!scheduledReports || scheduledReports.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No reports scheduled for now',
        processed: 0,
      });
    }
    
    console.log(`Found ${scheduledReports.length} reports to process`);
    
    // Process each scheduled report
    const results = [];
    
    for (const report of scheduledReports) {
      try {
        // Parse the filters from string to object
        let filters: ReportFilters;
        try {
          if (typeof report.filters === 'string') {
            filters = JSON.parse(report.filters) as ReportFilters;
          } else {
            // If it's already an object (happens in some environments)
            filters = report.filters as unknown as ReportFilters;
          }
          
          // Handle legacy filter format - the old format doesn't have dateRange property
          if (!filters.dateRange) {
            // Create a default dateRange if it doesn't exist
            filters = {
              ...filters,
              dateRange: { 
                from: null, 
                to: null 
              },
              departmentFilter: filters.departmentFilter || 'all',
              reportTypeFilter: 'all'
            };
            
            console.log('Converted legacy filter format:', filters);
          }
        } catch (parseError) {
          console.error(`Error parsing filters for report ${report.id}:`, parseError);
          console.log('Raw filters value:', report.filters);
          
          // Provide a default filter if parsing fails
          filters = {
            dateRange: { from: null, to: null },
            departmentFilter: 'all',
            reportTypeFilter: 'all',
            includeCharts: true,
            includeTables: true,
            includeSummary: true
          };
        }
        
        // Respect the user's file format selection, defaulting to PDF if not specified
        const fileFormat = report.file_format?.toLowerCase() || 'pdf';
        
        console.log(`Processing report: ${report.report_name}`, {
          id: report.id,
          type: report.report_type,
          format: fileFormat,
          filters
        });

        // Generate report in the appropriate format
        const { data: reportData, extension } = await generateReport(
          report.report_type, 
          filters, 
          fileFormat
        );
        
        console.log(`Generated ${extension.toUpperCase()} report for ${report.report_name}, size: ${reportData.length} bytes`);
        
        // Send email with the report
        const emailResult = await sendEmail({
          to: report.recipients,
          subject: `${report.report_name} - Scheduled Report`,
          text: `Your scheduled ${report.report_type} report is attached.`,
          html: `
            <h2>Hospital Management System - Scheduled Report</h2>
            <p>Your scheduled report "${report.report_name}" is attached.</p>
            <p>Report type: ${report.report_type}</p>
            <p>This is an automated email. Please do not reply.</p>
          `,
          attachments: [
            {
              data: reportData,
              filename: `${report.report_name.replace(/\s+/g, '_')}.${extension}`,
            },
          ],
        });
        
        console.log('Email send result:', emailResult);
        
        // Update next run date
        const nextRun = calculateNextRunDate(report.frequency);
        await supabase
          .from('report_schedules')
          .update({ 
            last_run: now.toISOString(),
            next_run: nextRun.toISOString()
          })
          .eq('id', report.id);
          
        results.push({
          id: report.id,
          name: report.report_name,
          format: fileFormat,
          success: emailResult.success,
          error: emailResult.error,
        });
      } catch (reportError) {
        console.error(`Error processing report ${report.id}:`, reportError);
        results.push({
          id: report.id,
          name: report.report_name,
          success: false,
          error: reportError instanceof Error ? reportError.message : String(reportError),
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error processing scheduled reports:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to calculate next run date
function calculateNextRunDate(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      now.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'biweekly':
      now.setDate(now.getDate() + 14);
      now.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      now.setDate(1); // First day of next month
      now.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      now.setDate(1); // First day of the quarter
      now.setHours(8, 0, 0, 0); // 8 AM
      break;
    default:
      // Default to daily
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0); // 8 AM
  }
  
  return now;
}

// Helper function to generate chart configuration (unused now, but keep for reference)
function getChartConfig(chart: any, data: any) {
  switch (chart.type) {
    case 'bar':
      return {
        type: 'bar',
        data: {
          labels: data.data.map((item: any) => item.department || item.name),
          datasets: [
            {
              label: chart.title,
              data: data.data.map((item: any) => item.revenue || item.value),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      };
    case 'pie':
      return {
        type: 'pie',
        data: {
          labels: data.paymentDistribution ? 
            data.paymentDistribution.map((item: any) => item.name) : 
            data.data.map((item: any) => item.department || item.name),
          datasets: [
            {
              data: data.paymentDistribution ? 
                data.paymentDistribution.map((item: any) => item.value) : 
                data.data.map((item: any) => item.revenue || item.value || 0),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      };
    default:
      throw new Error(`Unsupported chart type: ${chart.type}`);
  }
}
