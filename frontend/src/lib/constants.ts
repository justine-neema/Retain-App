// frontend/src/lib/constants.ts

/**
 * Payment methods users can pick from.
 * Stored/sent as plain strings, but the UI restricts to these options.
 * Keep lowercase to match what the form sends.
 */
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Transfer" },
  { value: "mobile", label: "Mobile money" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethodValue =
  (typeof PAYMENT_METHODS)[number]["value"];

/**
 * Map a payment method value to its label for display.
 */
export function paymentMethodLabel(value: string): string {
  const found = PAYMENT_METHODS.find((m) => m.value === value);
  return found ? found.label : value;
}

/**
 * Budget status thresholds (percent of budget used).
 * Used to color the budget bar and to label "within / approaching / over".
 */
export const BUDGET_THRESHOLDS = {
  approaching: 0.8, // >= 80% → "approaching"
  over: 1.0,        // > 100% → "over"
} as const;

/**
 * Default pagination size for expense lists.
 */
export const DEFAULT_PAGE_SIZE = 20;