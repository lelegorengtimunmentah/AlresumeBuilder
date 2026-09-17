import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string for display.
 * Defaults to "Jan 2024" style (month + year).
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", options);
}

/**
 * Format an ISO date string for display in Bahasa Indonesia.
 * e.g. "2025-07-01T00:00:00.000000Z" → "Jul 2025"
 * Returns the original string unchanged when it cannot be parsed.
 */
export function formatDateId(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }
): string {
  if (!dateString) return "—";
  // Parse as UTC then display — avoids off-by-one from local timezone offset
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", { ...options, timeZone: "UTC" });
}

/**
 * Truncate a string to maxLength characters, appending "..." if it was cut.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Read a cookie value by name from document.cookie.
 * Returns undefined when running on the server (SSR) or when the cookie is not found.
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : undefined;
}

/**
 * Copy text to the clipboard, returning whether it succeeded.
 *
 * Uses the async Clipboard API when available (secure contexts only — HTTPS or
 * localhost). Falls back to a hidden textarea + document.execCommand("copy")
 * so it also works on plain HTTP (e.g. LAN IP testing), where navigator.clipboard
 * is undefined.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (
    typeof navigator !== "undefined" &&
    typeof window !== "undefined" &&
    window.isSecureContext &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy fallback below
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}
