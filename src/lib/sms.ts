/**
 * SMS Service for sending notifications
 *
 * Configure with environment variables:
 * - SMS_API_TOKEN: API token from SMSAPI.pl or similar provider
 * - SMS_SENDER_NAME: Sender name (max 11 characters)
 * - SMS_ENABLED: Set to "true" to enable SMS sending
 */

export interface SendSMSOptions {
  to: string;
  message: string;
}

export interface SMSResult {
  success: boolean;
  error?: string;
}

/**
 * Normalize Polish phone number to international format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove spaces and other formatting
  let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");

  // If starts with 0, replace with +48
  if (cleaned.startsWith("0")) {
    cleaned = "+48" + cleaned.substring(1);
  }

  // If doesn't start with +, assume Polish number
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 9) {
      cleaned = "+48" + cleaned;
    }
  }

  return cleaned;
}

/**
 * Send SMS notification
 * Uses SMSAPI.pl by default, can be configured for other providers
 */
export async function sendSMS({ to, message }: SendSMSOptions): Promise<SMSResult> {
  const apiToken = process.env.SMS_API_TOKEN;
  const senderName = process.env.SMS_SENDER_NAME || "LiveAIPhoto";
  const isEnabled = process.env.SMS_ENABLED === "true";

  // If SMS is disabled, just log and return success
  if (!isEnabled) {
    console.log(`[SMS DISABLED] Would send to ${to}: ${message}`);
    return { success: true };
  }

  if (!apiToken) {
    console.error("[SMS] API token not configured");
    return { success: false, error: "SMS API token not configured" };
  }

  const normalizedPhone = normalizePhoneNumber(to);

  try {
    // Using SMSAPI.pl REST API
    const response = await fetch("https://api.smsapi.pl/sms.do", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        to: normalizedPhone,
        message: message,
        from: senderName,
        format: "json",
        encoding: "utf-8",
      }),
    });

    const result = await response.json();

    if (response.ok && !result.error) {
      console.log(`[SMS] Sent successfully to ${normalizedPhone}`);
      return { success: true };
    } else {
      console.error(`[SMS] Failed to send: ${JSON.stringify(result)}`);
      return { success: false, error: result.message || "Failed to send SMS" };
    }
  } catch (error) {
    console.error("[SMS] Error sending:", error);
    return { success: false, error: "Network error sending SMS" };
  }
}

/**
 * Send order completed notification
 */
export async function sendOrderCompletedSMS(
  phone: string,
  orderId: string
): Promise<SMSResult> {
  const shortOrderId = orderId.slice(-6).toUpperCase();
  const message = `Twoje zamówienie #${shortOrderId} zostało ukończone! Gotowe grafiki czekają na Ciebie w panelu. - Live AI Photo`;

  return sendSMS({ to: phone, message });
}

/**
 * Get the phone number to notify for an order
 * Priority: order override > user profile
 */
export async function getNotificationPhone(
  orderPhone: string | null,
  userPhone: string | null
): Promise<string | null> {
  // Use order-specific phone if provided, otherwise fall back to user profile
  return orderPhone || userPhone || null;
}
