// lib/mailgun.ts
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

export type EmailAttachment = {
  data: Buffer;
  filename: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
}) {
  try {
    const result = await client.messages.create(process.env.MAILGUN_DOMAIN || '', {
      from: `CareSanar HMS <reports@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
      html,
      attachment: attachments,
    });
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}


export async function sendInvoice(invoice: any) {
    // Calculate service amounts and subtotal
    const services = Array.isArray(invoice.services) 
    ? invoice.services 
    : typeof invoice.services === 'string' 
      ? JSON.parse(invoice.services || '[]') 
      : [];
      
  const servicesWithAmount = services.map((service: any) => ({
    name: service.name,
    quantity: service.quantity,
    price: service.price?.toFixed(2) || '0.00',
    amount: (service.quantity * service.price)?.toFixed(2) || '0.00'
  }));
  
  const subtotal = services.reduce((total: number, service: any) => 
    total + (service.quantity * service.price), 0);
  
  const taxAmount = subtotal * (invoice.tax || 0) / 100;
  
  // Format dates for display
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString();
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A';

  // Prepare email data with Handlebars template variables
  const emailData = {
    from: `CareSanar HMS <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: invoice.patient.email,
    subject: `Invoice #${invoice.id.substring(0, 8)}`,
    template: 'invoice_template', // Template name in Mailgun
    'h:X-Mailgun-Variables': JSON.stringify({
      patient_name: `${invoice.patient.first_name} ${invoice.patient.last_name}`,
      invoice_id: invoice.id.substring(0, 8),
      invoice_date: invoiceDate,
      due_date: dueDate,
      payment_status: invoice.payment_status.replace('_', ' '),
      total_amount: invoice.total_amount?.toFixed(2) || '0.00',
      subtotal: subtotal.toFixed(2),
      tax: invoice.tax || null,
      tax_amount: taxAmount.toFixed(2),
      discount: invoice.discount?.toFixed(2) || null,
      insurance_coverage: invoice.insurance_coverage?.toFixed(2) || null,
      services: servicesWithAmount,
      is_paid: invoice.payment_status === 'paid',
      company_name: 'Healthcare Management System',
      company_address: '123 Medical Plaza, Suite 100, Health City, HC 12345',
      contact_email: 'billing@healthcarems.com',
      current_year: new Date().getFullYear(),
      privacy_policy_url: 'https://healthcarems.com/privacy',
      portal_link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing?invoiceId=${invoice.id}`
    }),
  };

  // For hackathon purposes, log the email data instead of actually sending
  console.log('Email data prepared:', emailData);
  
  // To actually send when ready, uncomment this:
  const response = await client.messages.create(process.env.MAILGUN_DOMAIN || 'your-domain.com', emailData);
  return response
}