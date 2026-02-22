import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type MembershipInquiryEmailProps = {
  name: string;
  email: string;
  phone: string;
  preferredPlan?: string;
  message?: string;
};

export function MembershipInquiryEmail({
  name,
  email,
  phone,
  preferredPlan = "",
  message = "",
}: MembershipInquiryEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>New membership inquiry</Text>
            <Text style={paragraph}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={paragraph}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={paragraph}>
              <strong>Phone:</strong> {phone}
            </Text>
            {preferredPlan ? (
              <Text style={paragraph}>
                <strong>Preferred plan:</strong> {preferredPlan}
              </Text>
            ) : null}
            {message ? (
              <Text style={paragraph}>
                <strong>Message:</strong>
              </Text>
            ) : null}
            {message ? <Text style={messageBlock}>{message}</Text> : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#484848",
  padding: "17px 24px 0",
};

const paragraph = {
  margin: "0 0 12px",
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  padding: "0 24px",
};

const messageBlock = {
  margin: "0 0 12px",
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  padding: "0 24px",
  whiteSpace: "pre-wrap" as const,
};
