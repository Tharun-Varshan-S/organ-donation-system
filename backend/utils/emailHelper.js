import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configure Nodemailer Transporter
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
    }
});

/**
 * Base Email Layout (Professional Styling)
 */
const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: #d9534f; padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
    .button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .highlight { color: #d9534f; font-weight: bold; }
    .card { border: 1px solid #eee; padding: 15px; border-radius: 5px; background-color: #fafafa; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LifeBridge</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} LifeBridge Organ Donation System. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Common mail sender function
 */
const sendMail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"LifeBridge – Organ Donation System" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log("Email sent: " + info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // In production, we might want to log this to a service or ignore if non-critical
        return null;
    }
};

/* ===============================
   EMAIL TEMPLATES
================================ */

/**
 * 🩸 Welcome Email (Donor / User)
 */
export const sendWelcomeMail = async (toEmail, name) => {
    const html = baseLayout(`
    <h2>Welcome to LifeBridge, ${name}!</h2>
    <p>Thank you for registering with <b>LifeBridge</b>, a secure and transparent organ donation platform dedicated to saving lives.</p>
    <p>Your account has been successfully created. You can now:</p>
    <ul>
      <li>Track organ donation requests</li>
      <li>Update your donor preferences</li>
      <li>Manage your medical profile securely</li>
    </ul>
    <p>Together, we can make a difference.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="button">Log in to your Dashboard</a>
    <br/><br/>
    <p>Warm regards,<br/>The LifeBridge Team</p>
  `);

    await sendMail({ to: toEmail, subject: "Welcome to LifeBridge", html });
};

/**
 * 🏥 Hospital Registration Welcome (Pending Approval)
 */
export const sendHospitalWelcomeMail = async (toEmail, hospitalName) => {
    const html = baseLayout(`
    <h2>Welcome to LifeBridge, ${hospitalName}!</h2>
    <p>Thank you for registering your facility with <b>LifeBridge</b>.</p>
    <div class="card">
      <p><b>Status: Pending Verification</b></p>
      <p>Your registration is currently being reviewed by our Admin Team. We verify all healthcare facilities to ensure the highest standards of safety and legitimacy.</p>
    </div>
    <p>You will receive another email once your account has been approved and activated. Thank you for your patience.</p>
    <br/>
    <p>Best regards,<br/>LifeBridge Admin Team</p>
  `);

    await sendMail({ to: toEmail, subject: "Registration Received – LifeBridge", html });
};

/**
 * 🏥 Hospital Approval
 */

export const sendHospitalApprovalMail = async (toEmail, hospitalName) => {
    const html = baseLayout(`
    <h2>Hospital Verification Approved</h2>
    <p>Dear Administrator at ${hospitalName},</p>
    <p>We are pleased to inform you that your hospital has been successfully <b>verified and approved</b> by the LifeBridge Admin Team.</p>
    <div class="card">
      <p><b>Access Granted:</b> You can now manage patients, donors, organ requests, and transplant operations through your dedicated hospital dashboard.</p>
    </div>
    <p>Please ensure all data provided is accurate and all operations comply with medical ethics and guidelines.</p>
    <a href="${process.env.FRONTEND_URL}/hospital/login" class="button">Access Hospital Portal</a>
    <br/><br/>
    <p>Best regards,<br/>LifeBridge Admin Team</p>
  `);

    await sendMail({ to: toEmail, subject: "Hospital Approved – LifeBridge Portal Access", html });
};

/**
 * 🩸 Donor Applied to Organ Request
 */
export const sendDonorApplicationMail = async (toEmail, donorName, organ) => {
    const html = baseLayout(`
    <h2>Application Received</h2>
    <p>Hello ${donorName},</p>
    <p>We have received your application to donate <b>${organ}</b>. Thank you for your selfless contribution to saving a life.</p>
    <div class="card">
      <p><b>Next Steps:</b> The hospital medical board will review your application and medical details. You will be notified once a decision is made or if further information is required.</p>
    </div>
    <p>You can monitor the status of your application in your dashboard.</p>
    <br/>
    <p>Thank you for your humanity,<br/>LifeBridge Team</p>
  `);

    await sendMail({ to: toEmail, subject: "Donor Application Received - LifeBridge", html });
};

/**
 * 🔔 Donor Selected for Transplant
 */
export const sendDonorSelectionMail = async (toEmail, donorName, organ, hospitalName) => {
    const html = baseLayout(`
    <h2 style="color: #d9534f;">Important: You Have Been Selected</h2>
    <p>Hello ${donorName},</p>
    <p>We are pleased to inform you that you have been <b>selected</b> as a match for a <span class="highlight">${organ}</span> transplant surgery at <b>${hospitalName}</b>.</p>
    <div class="card">
      <p><b>Action Required:</b> A representative from ${hospitalName} will contact you shortly to discuss the next steps, medical preparations, and scheduling.</p>
    </div>
    <p>Please ensure your contact information is up to date and stay reachable.</p>
    <br/>
    <p>With gratitude,<br/>LifeBridge Medical Team</p>
  `);

    await sendMail({ to: toEmail, subject: "Critical Update: Selected for Organ Transplant", html });
};

/**
 * 🗓 Operation Scheduled
 */
export const sendOperationScheduledMail = async (toEmail, name, organ, date, hospitalName, location) => {
    const formattedDate = new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = baseLayout(`
    <h2>Transplant Operation Scheduled</h2>
    <p>Hello ${name},</p>
    <p>An operation for a <b>${organ}</b> transplant has been scheduled at your facility.</p>
    <div class="card">
      <p><b>Scheduled Date:</b> <span class="highlight">${formattedDate}</span></p>
      <p><b>Hospital:</b> ${hospitalName}</p>
      ${location ? `<p><b>Location:</b> ${location}</p>` : ''}
    </div>
    <p>Please ensure all medical preparations are completed according to protocol. Report to the designated department at least 2 hours before the scheduled time.</p>
    <br/>
    <p>Professional regards,<br/>LifeBridge Hospital Team</p>
  `);

    await sendMail({ to: toEmail, subject: `Operation Scheduled: ${organ} Transplant`, html });
};

export default sendMail;
