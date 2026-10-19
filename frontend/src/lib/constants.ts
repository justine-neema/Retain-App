// list of payment methods users can pick
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Transfer" },
  { value: "card", label: "Card" },
  { value: "mobile", label: "Mobile money" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethodValue =
  (typeof PAYMENT_METHODS)[number]["value"];

// map payment methods value to label for display
export function paymentMethodLabel(value: string): string {
  const found = PAYMENT_METHODS.find((m) => m.value === value);
  return found ? found.label : value;
}

// budget status thresholds
export const BUDGET_THRESHOLDS = {
  approaching: 0.8, // >= 80% → "approaching"
  over: 1.0,        // > 100% → "over"
} as const;

// default pagination size for expense lists
export const DEFAULT_PAGE_SIZE = 20;