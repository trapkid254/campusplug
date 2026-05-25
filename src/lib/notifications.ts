import {
  sendWelcomeEmail,
  sendInquiryNotification,
  sendApplicationNotification,
  sendOrderNotificationAdmin,
  sendListingApprovedEmail,
  sendApplicationStatusEmail,
} from "./email";
import { sendSMS, isSmsConfigured } from "./sms";
import { prisma } from "./prisma";

/** Send SMS to user if they have a phone number on file */
async function smsToUser(userId: string, message: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (user?.phone) await sendSMS(user.phone, message);
}

export async function notifyWelcome(email: string, name: string, phone?: string) {
  await sendWelcomeEmail(email, name);
  if (phone && isSmsConfigured()) {
    await sendSMS(phone, `Welcome to CampusPlug, ${name}! Find housing, internships & academic help at campusplug.co.ke`);
  }
}

export async function notifyInquiry(
  landlordId: string,
  landlordEmail: string,
  propertyTitle: string,
  inquiry: { name: string; email: string; phone: string; message: string }
) {
  await sendInquiryNotification(landlordEmail, propertyTitle, inquiry);
  await smsToUser(
    landlordId,
    `CampusPlug: New inquiry for "${propertyTitle}" from ${inquiry.name}. Phone: ${inquiry.phone}. Check your dashboard.`
  );
}

export async function notifyApplication(
  providerId: string,
  providerEmail: string,
  internshipTitle: string,
  studentName: string
) {
  await sendApplicationNotification(providerEmail, internshipTitle, studentName);
  await smsToUser(
    providerId,
    `CampusPlug: ${studentName} applied for "${internshipTitle}". Review applications in your dashboard.`
  );
}

export async function notifyApplicationStatus(
  studentId: string,
  studentEmail: string,
  internshipTitle: string,
  status: string
) {
  await sendApplicationStatusEmail(studentEmail, internshipTitle, status);
  await smsToUser(
    studentId,
    `CampusPlug: Your application for "${internshipTitle}" is now ${status}.`
  );
}

export async function notifyOrderAdmin(order: {
  title: string;
  studentName: string;
  serviceName: string;
}) {
  await sendOrderNotificationAdmin(order);
}

export async function notifyListingApproved(
  landlordId: string,
  email: string,
  title: string,
  slug: string,
  phone?: string | null
) {
  await sendListingApprovedEmail(email, title, slug);
  const target = phone || (await prisma.user.findUnique({ where: { id: landlordId }, select: { phone: true } }))?.phone;
  if (target) {
    await sendSMS(target, `CampusPlug: Your listing "${title}" is now live! View: ${process.env.NEXTAUTH_URL}/properties/${slug}`);
  }
}

export async function notifyPaymentSuccess(userId: string, amount: number, receipt: string) {
  await smsToUser(
    userId,
    `CampusPlug: Payment of KES ${amount} received. M-Pesa receipt: ${receipt}. Thank you!`
  );
}
