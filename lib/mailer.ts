"use server";

import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

async function getTransport() {
  // If proper SMTP is configured, use it
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // Fallback: Ethereal (for dev/testing). Do not use in production.
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendOTPEmail(to: string, code: string) {
  const transporter = await getTransport();

  const info = await transporter.sendMail({
    from: smtpFrom || 'Resume Analyzer <no-reply@example.com>',
    to,
    subject: "Your Resume Analyzer OTP Code",
    text: `Your OTP code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your OTP code is <b>${code}</b>.</p><p>It expires in 5 minutes.</p>`,
  });

  // Provide preview URL and code in dev if using fallback/test
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("OTP preview URL:", preview);
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log(`DEV OTP: ${code} (to: ${to})`);
  }

  return info.messageId;
}
