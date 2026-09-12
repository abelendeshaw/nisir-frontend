/**
 * Money is integer cents everywhere in the shop. It becomes a string exactly
 * once, here, so the cart, the card and the receipt can never disagree.
 */

/** `$185` when it lands on the dollar, `$185.40` when it does not. */
export function money(cents: number) {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100);
  const rest = abs % 100;
  const body =
    rest === 0
      ? whole.toLocaleString("en-US")
      : `${whole.toLocaleString("en-US")}.${String(rest).padStart(2, "0")}`;
  return `${negative ? "−" : ""}$${body}`;
}

/** Always two decimals — for the checkout summary and the receipt. */
export function moneyExact(cents: number) {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  return `${negative ? "−" : ""}$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(
    abs % 100,
  ).padStart(2, "0")}`;
}

export function grams(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}kg` : `${Math.round(value)}g`;
}

export function millimetres([w, h, d]: [number, number, number], scale = 1) {
  return [w, h, d].map((n) => Math.round(n * scale)).join(" × ") + "mm";
}

/**
 * Volume as measured off the print model.
 *
 * One decimal below 100cm³ and none above it, because the figure is precise
 * to a tenth on a medallion and spuriously so on a board game — `577.6cm³`
 * reads as a measurement, `826.4cm³` as false confidence once the number is
 * that large and the geometry that approximate.
 */
export function cubicCentimetres(value: number) {
  return value >= 100 ? `${Math.round(value)}cm³` : `${value.toFixed(1)}cm³`;
}

/** `5–9 days`, or `Instant` for anything that downloads. */
export function leadTime([min, max]: [number, number]) {
  if (max === 0) return "Instant download";
  return min === max ? `${max} days` : `${min}–${max} days`;
}

export function pluralise(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
