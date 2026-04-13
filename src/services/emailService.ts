import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter() {
  if (!transporter) {
    const service = process.env.EMAIL_SERVICE || 'gmail';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('Email credentials not provided. Email notifications will be skipped.');
      return null;
    }

    transporter = nodemailer.createTransport({
      service,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailTransporter = getEmailTransporter();
  if (!mailTransporter) return;

  const from = process.env.FROM_EMAIL || process.env.EMAIL_USER;

  try {
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendEnrollmentEmail(userEmail: string, userName: string, courseTitle: string) {
  const subject = `Welcome to ${courseTitle}!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Enrollment Confirmed!</h1>
      <p>Hi ${userName},</p>
      <p>Congratulations! You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
      <p>You can now access all the course materials from your dashboard.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; rounded: 8px;">
        <p style="margin: 0;">Happy Learning!</p>
        <p style="margin: 0; font-weight: bold;">AI CoursePro Team</p>
      </div>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
}

export async function sendCompletionEmail(userEmail: string, userName: string, courseTitle: string) {
  const subject = `Congratulations on completing ${courseTitle}!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Course Completed! 🎓</h1>
      <p>Hi ${userName},</p>
      <p>Amazing job! You have successfully completed <strong>${courseTitle}</strong>.</p>
      <p>This is a great milestone in your AI learning journey. Keep up the great work!</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; rounded: 8px;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold;">AI CoursePro Team</p>
      </div>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
}
