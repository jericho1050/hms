'use server'

import { createClient } from '@/utils/supabase/server';
import { BillingInsert, BillingUpdate, BillingRecord } from '@/types/billing';
import { revalidatePath } from 'next/cache';




export async function createBillingRecord(billing: BillingInsert): Promise<string> {
  const supabase = await createClient();

  // If the services field is an array, convert it to a JSONB string
  if (billing.services && Array.isArray(billing.services)) {
    billing.services = billing.services as any;
  }

  const { data, error } = await supabase
    .from('billing')
    .insert(billing)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating billing record:', error);
    throw new Error('Failed to create billing record');
  }

  revalidatePath('/billing');
  return data.id;
}

export async function updateBillingRecord(id: string, billing: BillingUpdate): Promise<void> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    throw new Error('Unauthorized');
  }

  // If the services field is an array, convert it to a JSONB string
  if (billing.services && Array.isArray(billing.services)) {
    billing.services = billing.services as any;
  }

  const { error } = await supabase
    .from('billing')
    .update(billing)
    .eq('id', id);

  if (error) {
    console.error('Error updating billing record:', error);
    throw new Error('Failed to update billing record');
  }

  revalidatePath('/billing');
}

export async function deleteBillingRecord(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('billing')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting billing record:', error);
    throw new Error('Failed to delete billing record');
  }

  revalidatePath('/billing');
}

export async function getPatientBillingRecords(patientId: string): Promise<BillingRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('billing')
    .select('*')
    .eq('patient_id', patientId)
    .order('invoice_date', { ascending: false });

  if (error) {
    console.error('Error fetching patient billing records:', error);
    throw new Error('Failed to fetch patient billing records');
  }

  return data as BillingRecord[];
}

export async function getBillingStats() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    throw new Error('Unauthorized');
  }

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


export async function sendInvoiceEmail(invoiceId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  try {
    // Get the invoice details with patient information
    const { data: invoice, error: invoiceError } = await supabase
      .from('billing')
      .select(`
        *,
        patient:patients(id, first_name, last_name, email)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return { success: false, message: 'Invoice not found' };
    }

    // In a production app, you would connect to a real email service here
    // For demo purposes, we'll simulate successful email sending
    
    console.log(`Email would be sent to: ${invoice.patient.email}`);
    console.log(`Subject: Invoice #${invoice.id.substring(0, 8)}`);
    console.log(`Body: Invoice details for ${invoice.patient.first_name} ${invoice.patient.last_name}`);
    
    // In a real implementation, you would:
    // 1. Generate a PDF of the invoice
    // 2. Use an email service like SendGrid, AWS SES, or Nodemailer
    // 3. Track the email status in a separate table
    
    // Update the invoice to mark that an email was sent
    const { error: updateError } = await supabase
      .from('billing')
      .update({ 
        notes: invoice.notes 
          ? `${invoice.notes}\nInvoice emailed on ${new Date().toISOString()}`
          : `Invoice emailed on ${new Date().toISOString()}`
      })
      .eq('id', invoiceId);
      
    if (updateError) {
      console.error('Error updating invoice with email status:', updateError);
    }

    return { 
      success: true, 
      message: `Invoice email sent to ${invoice.patient.email}` 
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { 
      success: false, 
      message: 'Failed to send invoice email' 
    };
  }
}

export async function processPayment(
  invoiceId: string, 
  paymentAmount: number, 
  paymentMethod: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  try {
    // Get the current invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('billing')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return { success: false, message: 'Invoice not found' };
    }

    // Calculate new status based on payment amount
    let newStatus = invoice.payment_status;
    let newTotalPaid = (invoice.total_paid || 0) + paymentAmount;
    
    if (newTotalPaid >= invoice.total_amount) {
      newStatus = 'paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'partially_paid';
    }

    // Update the invoice with payment information
    const { error: updateError } = await supabase
      .from('billing')
      .update({
        payment_status: newStatus,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        total_paid: newTotalPaid,
        notes: notes ? 
          (invoice.notes ? `${invoice.notes}\n${notes}` : notes) : 
          invoice.notes
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Error updating invoice with payment:', updateError);
      return { success: false, message: 'Failed to process payment' };
    }

    return { 
      success: true, 
      message: `Payment of ${paymentAmount} processed successfully` 
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { 
      success: false, 
      message: 'Failed to process payment' 
    };
  }
}