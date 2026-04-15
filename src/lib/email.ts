import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

export async function sendBookingRequestNotification(hostEmail: string, guestName: string, homeTitle: string, bookingId: string) {
  const subject = `New booking request for ${homeTitle}`;
  const html = `
    <h2>New Booking Request</h2>
    <p>Hello,</p>
    <p>${guestName} has requested to book your home "${homeTitle}".</p>
    <p>Please review the request and respond within 24 hours.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}">View Booking Request</a></p>
    <p>Best regards,<br>Musa Residency Team</p>
  `;
  
  await sendEmail(hostEmail, subject, html);
}

export async function sendBookingStatusUpdate(guestEmail: string, status: string, homeTitle: string) {
  const subject = `Booking ${status}: ${homeTitle}`;
  const html = `
    <h2>Booking Update</h2>
    <p>Hello,</p>
    <p>Your booking request for "${homeTitle}" has been ${status}.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings">View Your Bookings</a></p>
    <p>Best regards,<br>Musa Residency Team</p>
  `;
  
  await sendEmail(guestEmail, subject, html);
}