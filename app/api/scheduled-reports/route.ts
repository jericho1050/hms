import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface ScheduledReportPayload {
  reportName: string;
  reportType: string;
  frequency: string;
  recipients: string; // Comes from emailRecipients in the form
  dateRange: { 
    from: string | null; 
    to: string | null;
  };
  departmentFilter: string;
  reportTypeFilter: string;
  fileFormat?: string; // pdf, excel, csv, html
  includeCharts?: boolean;
  includeTables?: boolean;
  includeSummary?: boolean;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json() as ScheduledReportPayload;
    const {
      reportName,
      reportType,
      frequency,
      recipients,
      dateRange,
      departmentFilter,
      reportTypeFilter,
      fileFormat = 'pdf',
      includeCharts = true,
      includeTables = true,
      includeSummary = true
    } = body;
    
    // Validate required fields
    if (!reportName || !reportType || !frequency || !recipients) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Calculate next run date based on frequency
    const nextRun = calculateNextRunDate(frequency);
    
    // Store scheduled report in database
    const { data, error } = await supabase
      .from('report_schedules')
      .insert({
        user_id: user.id,
        report_name: reportName,
        report_type: reportType,
        frequency,
        recipients,
        filters: JSON.stringify({
          dateRange,
          departmentFilter,
          reportTypeFilter,
          includeCharts,
          includeTables,
          includeSummary
        }),
        next_run: nextRun.toISOString(),
        created_at: new Date().toISOString(),
        file_format: fileFormat
      })
      .select();
      
    if (error) {
      console.error('Error saving scheduled report:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in scheduled reports API:', error);
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