import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendEmailVerification(email: string, name: string, userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store token in database
  await db.update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: expiresAt,
    })
    .where(eq(users.id, userId));

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  
  const subject = 'Verify your Musa Residency account';
  const html = `
    <h2>Welcome to Musa Residency!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining our community of artists and creatives. Please verify your email address to complete your registration.</p>
    <p><a href="${verificationUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>Musa Residency Team</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject,
    html,
  });
}

export async function sendBookingNotificationEmail(
  hostEmail: string,
  hostName: string,
  guestName: string,
  homeTitle: string,
  bookingId: string
) {
  const subject = `New Booking Request for ${homeTitle}`;
  const html = `
    <h2>New Booking Request</h2>
    <p>Hi ${hostName},</p>
    <p>You have received a new booking request from ${guestName} for your property "${homeTitle}".</p>
    <p>Please review the request and respond within 24 hours to avoid auto-decline.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}">View Booking Request</a></p>
    <p>Best regards,<br>Musa Residency Team</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to: hostEmail,
    subject,
    html,
  });
}

export async function sendBookingStatusEmail(
  guestEmail: string,
  guestName: string,
  homeTitle: string,
  status: string,
  bookingId: string
) {
  const subject = `Booking ${status === 'approved' ? 'Approved' : 'Update'} - ${homeTitle}`;
  const html = `
    <h2>Booking ${status === 'approved' ? 'Approved' : 'Update'}</h2>
    <p>Hi ${guestName},</p>
    <p>Your booking request for "${homeTitle}" has been ${status}.</p>
    ${status === 'approved' ? 
      `<p>Payment has been processed successfully. You will receive further details from the host soon.</p>` :
      status === 'declined' ? 
      `<p>Unfortunately, your booking request was not approved. You can search for other available properties.</p>` :
      `<p>Your booking status has been updated.</p>`
    }
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}">View Booking Details</a></p>
    <p>Best regards,<br>Musa Residency Team</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to: guestEmail,
    subject,
    html,
  });
}