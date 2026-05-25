import nodemailer from "nodemailer";
import { siteConfig } from "./config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const from = process.env.EMAIL_FROM || `CampusPlug <${siteConfig.contact.email}>`;
const adminEmail = process.env.ADMIN_EMAIL || siteConfig.contact.email;

function baseTemplate(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#059669;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">Campus<span style="opacity:.9">Plug</span></h1>
    </div>
    <div style="padding:32px 24px">
      <h2 style="color:#0f172a;margin:0 0 16px;font-size:20px">${title}</h2>
      ${body}
    </div>
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;font-size:12px;color:#64748b">
      © ${new Date().getFullYear()} CampusPlug Kenya · <a href="${siteConfig.url}" style="color:#059669">campusplug.co.ke</a>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER && process.env.NODE_ENV === "production") {
    console.warn("[email] SMTP not configured, skipping:", subject);
    return;
  }

  if (!process.env.SMTP_USER) {
    console.log(`[email dev] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send:", subject, err);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    "Welcome to CampusPlug!",
    baseTemplate(
      `Welcome, ${name}!`,
      `<p style="color:#475569;line-height:1.6">Your account is ready. Start exploring student housing, internships, and academic services across Kenyan universities.</p>
       <p style="margin-top:24px"><a href="${siteConfig.url}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Explore CampusPlug</a></p>`
    )
  );
}

export async function sendInquiryNotification(
  landlordEmail: string,
  propertyTitle: string,
  inquiry: { name: string; email: string; phone: string; message: string }
) {
  await sendEmail(
    landlordEmail,
    `New inquiry: ${propertyTitle}`,
    baseTemplate(
      "New Property Inquiry",
      `<p style="color:#475569">Someone is interested in <strong>${propertyTitle}</strong>:</p>
       <table style="width:100%;margin-top:16px;font-size:14px;color:#334155">
         <tr><td style="padding:4px 0;color:#64748b">Name</td><td><strong>${inquiry.name}</strong></td></tr>
         <tr><td style="padding:4px 0;color:#64748b">Email</td><td>${inquiry.email}</td></tr>
         <tr><td style="padding:4px 0;color:#64748b">Phone</td><td>${inquiry.phone}</td></tr>
       </table>
       <blockquote style="margin:16px 0;padding:12px 16px;background:#f8fafc;border-left:4px solid #059669;color:#475569">${inquiry.message}</blockquote>
       <p><a href="${siteConfig.url}/dashboard/landlord/inquiries" style="color:#059669">View in dashboard →</a></p>`
    )
  );
}

export async function sendApplicationNotification(
  providerEmail: string,
  internshipTitle: string,
  studentName: string
) {
  await sendEmail(
    providerEmail,
    `New application: ${internshipTitle}`,
    baseTemplate(
      "New Internship Application",
      `<p style="color:#475569"><strong>${studentName}</strong> applied for <strong>${internshipTitle}</strong>.</p>
       <p style="margin-top:24px"><a href="${siteConfig.url}/dashboard/provider/applications" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Review Application</a></p>`
    )
  );
}

export async function sendOrderNotificationAdmin(
  order: { title: string; studentName: string; serviceName: string }
) {
  await sendEmail(
    adminEmail,
    `New service order: ${order.title}`,
    baseTemplate(
      "New Academic Service Order",
      `<p style="color:#475569"><strong>${order.studentName}</strong> requested <strong>${order.serviceName}</strong>:</p>
       <p style="color:#334155;font-weight:600">${order.title}</p>
       <p><a href="${siteConfig.url}/dashboard/admin/orders" style="color:#059669">Manage order →</a></p>`
    )
  );
}

export async function sendListingApprovedEmail(to: string, title: string, slug: string) {
  await sendEmail(
    to,
    `Your listing is live: ${title}`,
    baseTemplate(
      "Listing Approved!",
      `<p style="color:#475569">Great news! Your listing <strong>${title}</strong> has been approved and is now visible on CampusPlug.</p>
       <p style="margin-top:24px"><a href="${siteConfig.url}/properties/${slug}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Listing</a></p>`
    )
  );
}

export async function sendApplicationStatusEmail(
  to: string,
  internshipTitle: string,
  status: string
) {
  await sendEmail(
    to,
    `Application update: ${internshipTitle}`,
    baseTemplate(
      "Application Status Updated",
      `<p style="color:#475569">Your application for <strong>${internshipTitle}</strong> has been updated to: <strong>${status}</strong>.</p>
       <p style="margin-top:16px"><a href="${siteConfig.url}/dashboard/student/applications" style="color:#059669">View your applications →</a></p>`
    )
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your CampusPlug password",
    baseTemplate(
      "Password Reset",
      `<p style="color:#475569">Click the button below to reset your password. This link expires in 1 hour.</p>
       <p style="margin-top:24px"><a href="${resetUrl}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a></p>
       <p style="margin-top:16px;font-size:12px;color:#94a3b8">If you didn't request this, ignore this email.</p>`
    )
  );
}
