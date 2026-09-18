// Manual payment details shown on the /dashboard/upgrade page — no payment
// gateway yet (see the multi-tenant plan), so this is what a free-plan org
// sees when they want to upgrade.
//
// qrisImageUrl: put your real static QRIS image at client/public/qris.png
// (or similar) and point this at it, e.g. "/qris.png" — leave null to hide
// the QRIS section instead of showing a fake/broken image.
//
// banks / eWallets: each entry's `logo` is a short brand tag rendered as a
// colored chip (see Upgrade.jsx's PaymentLogo) since no licensed logo
// artwork is bundled with the app — swap in a real image asset per entry
// (`logoImage: "/assets/bca.png"`) if/when one is available.
//
// whatsappNumber: international format, digits only, no "+" or leading 0.
export const paymentConfig = {
  priceYearly: "Rp 110.000",
  priceDaily: "Rp 300",
  qrisImageUrl: null,
  banks: [
    { name: "BCA", accountNumber: "6975262107", color: "#0068C9" },
    { name: "BRI", accountNumber: "818001003748538", color: "#00529C" },
  ],
  eWallets: [
    { provider: "OVO", number: "085643323957", color: "#4C3494" },
    { provider: "GoPay", number: "085643323957", color: "#00AED6" },
    { provider: "ShopeePay", number: "085643323957", color: "#EE4D2D" },
  ],
  whatsappNumber: "6285702056901",
};
