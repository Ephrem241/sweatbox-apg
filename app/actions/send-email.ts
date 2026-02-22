"use server";

import { Resend } from "resend";
import { ClassBookingEmail } from "@/emails/ClassBookingEmail";
import { MembershipInquiryEmail } from "@/emails/MembershipInquiryEmail";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL;

function isResendConfigured(): boolean {
  return !!(RESEND_API_KEY && RESEND_FROM_EMAIL && RESEND_TO_EMAIL);
}

export type SendClassBookingEmailResult =
  | { success: true }
  | { error: string };

export type SendMembershipInquiryEmailResult =
  | { success: true }
  | { error: string };

export type ClassBookingEmailParams = {
  name: string;
  email: string;
  phone: string;
  className?: string;
  preferredDate?: string;
  message?: string;
};

export type MembershipInquiryEmailParams = {
  name: string;
  email: string;
  phone: string;
  preferredPlan?: string;
  message?: string;
};

export async function sendClassBookingEmail(
  data: ClassBookingEmailParams
): Promise<SendClassBookingEmailResult> {
  if (!isResendConfigured()) {
    return { error: "Email service is not configured." };
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL!,
      to: [RESEND_TO_EMAIL!],
      subject: "New class booking request",
      react: ClassBookingEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        className: data.className,
        preferredDate: data.preferredDate,
        message: data.message,
      }),
    });
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}

export async function sendMembershipInquiryEmail(
  data: MembershipInquiryEmailParams
): Promise<SendMembershipInquiryEmailResult> {
  if (!isResendConfigured()) {
    return { error: "Email service is not configured." };
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL!,
      to: [RESEND_TO_EMAIL!],
      subject: "New membership inquiry",
      react: MembershipInquiryEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredPlan: data.preferredPlan,
        message: data.message,
      }),
    });
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}
