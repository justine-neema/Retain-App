// frontend/src/lib/format.ts

/**
 * Format a number as Rwandan Francs.
 * RWF has no subunit in practice — we show whole numbers.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string as "MMM D, YYYY" (e.g., "Oct 15, 2026").
 * Accepts "YYYY-MM-DD" or full ISO timestamps.
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Convert a Date (or "now") to "YYYY-MM" — the format budgets use.
 */
export function toMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Convert a Date (or "now") to "YYYY-MM-DD" — the format expense dates use.
 */
export function toDateInputValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Human-friendly month label from a "YYYY-MM" string.
 * Example: "2026-10" → "October 2026".
 */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}