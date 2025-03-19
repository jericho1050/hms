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