export interface OTPRecord {
  code: string;
  email: string;
  purpose: "login" | "signup";
  expiresAt: number;
}

const otpStore = new Map<string, OTPRecord>();

export function generateOTP(length: number = 6): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function saveOTP(
  email: string,
  purpose: OTPRecord["purpose"],
  ttlMs: number = 5 * 60 * 1000
): string {
  const code = generateOTP(6);
  const record: OTPRecord = {
    code,
    email,
    purpose,
    expiresAt: Date.now() + ttlMs,
  };
  otpStore.set(`${purpose}:${email}`, record);
  return code;
}

export function verifyOTP(
  email: string,
  code: string,
  purpose: OTPRecord["purpose"]
): boolean {
  const key = `${purpose}:${email}`;
  const record = otpStore.get(key);
  if (!record) return false;
  const valid = record.code === code && Date.now() < record.expiresAt;
  if (valid) otpStore.delete(key);
  return valid;
}

// Optional cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt < now) otpStore.delete(key);
  }
}, 60 * 1000);
