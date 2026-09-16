export const fmtNumber = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));

// Like fmtNumber but keeps up to 2 decimal places instead of rounding to a
// whole number — for quantities that are legitimately fractional (e.g. a
// maggot harvest weighed at 2.5kg), where fmtNumber's rounding would silently
// drop the fraction the user actually entered.
export const fmtQty = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

export const fmtCurrency = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// Plain "YYYY-MM-DD" strings are ISO-8601 date-only, which Date parses as UTC midnight —
// formatting that in a positive-UTC-offset timezone can roll the displayed day backward.
// Parse those components as local instead; anything else (datetimes) parses as-is.
const toLocalDate = (iso) => {
  if (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
};

export const fmtDate = (iso, opts = { day: "2-digit", month: "short", year: "numeric" }) =>
  toLocalDate(iso).toLocaleDateString("en-US", opts);

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
