type WhatsAppOpenOptions = {
  targetWindow?: Window | null;
};

const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

/**
 * Normalize Egyptian numbers to international format.
 * - "01026189334" -> "201026189334"
 * - "201026189334" -> "201026189334"
 * - "+201026189334" -> "201026189334"
 */
export const normalizeWhatsAppPhone = (phone: string) => {
  const cleaned = cleanPhone(phone);
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) return `20${cleaned.slice(1)}`;
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  return cleaned;
};

/**
 * Build a wa.me URL — the standard, universal WhatsApp link that
 * works on mobile (opens app) and desktop (opens WhatsApp Web/Desktop).
 */
export const buildWhatsAppUrl = (phone: string, text = "") => {
  const encodedText = text.trim() ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${normalizeWhatsAppPhone(phone)}${encodedText}`;
};

// Backwards-compatible aliases
export const buildWhatsAppFallbackUrl = buildWhatsAppUrl;
export const buildWhatsAppAppUrl = buildWhatsAppUrl;

/**
 * Open WhatsApp using the universal wa.me link.
 * - On mobile: opens the WhatsApp app directly.
 * - On desktop: opens WhatsApp Web or Desktop app.
 * - If a pre-opened window is provided, navigate it (avoids popup blockers
 *   after async work like uploads/DB inserts).
 */
export const openWhatsAppApp = (phone: string, text = "", options: WhatsAppOpenOptions = {}) => {
  const url = buildWhatsAppUrl(phone, text);
  const target = options.targetWindow;

  if (target && !target.closed) {
    target.location.href = url;
    return url;
  }

  // No pre-opened window: open in a new tab so the current page stays intact.
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    // Popup blocked — fall back to navigating current tab.
    window.location.href = url;
  }
  return url;
};