const BRL_DISPLAY = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const BRL_INPUT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoneyFromCents(cents?: number | null) {
  if (cents === undefined || cents === null) return "—";
  return BRL_DISPLAY.format(cents / 100);
}

export function extractMoneyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatMoneyInputFromDigits(digits: string) {
  if (!digits) return "";
  const cents = Number.parseInt(digits, 10);
  if (!Number.isFinite(cents)) return "";
  return BRL_INPUT.format(cents / 100);
}

export function formatMoneyInputFromCents(cents?: number | null) {
  if (cents === undefined || cents === null) return "";
  return formatMoneyInputFromDigits(String(cents));
}

export function parseMoneyToCents(value: string): number | undefined {
  const digits = extractMoneyDigits(value);
  if (!digits) return undefined;
  const cents = Number.parseInt(digits, 10);
  if (!Number.isFinite(cents)) return undefined;
  return cents;
}
