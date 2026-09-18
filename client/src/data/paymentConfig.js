// Manual payment details shown on the /dashboard/upgrade page — no payment
// gateway yet (see the multi-tenant plan), so this is what a free-plan org
// sees when they want to upgrade.
//
// qrisImageUrl: put your real static QRIS image at client/public/qris.png
// (or similar) and point this at it, e.g. "/qris.png" — leave null to hide
// the QRIS section instead of showing a fake/broken image.
//
// banks / eWallets: `logoImage` is the real brand logo (rendered at a fixed
// height, natural aspect ratio — see Upgrade.jsx's PaymentLogo); `color` is
// only a fallback background used if `logoImage` is ever removed.
//
// whatsappNumber: international format, digits only, no "+" or leading 0.
import bcaLogo from "../assets/BANK_BCA.webp";
import briLogo from "../assets/BANK_BRI.webp";
import ovoLogo from "../assets/OVO_LOGO.svg";
import gopayLogo from "../assets/GOPAY_LOGO.webp";
import shopeepayLogo from "../assets/SPAY_LOGO.png";

export const paymentConfig = {
  priceYearly: "Rp 110.000",
  priceDaily: "Rp 300",
  qrisImageUrl: null,
  banks: [
    { name: "BCA", accountNumber: "6975262107", logoImage: bcaLogo, color: "#0068C9" },
    { name: "BRI", accountNumber: "818001003748538", logoImage: briLogo, color: "#00529C" },
  ],
  eWallets: [
    { provider: "OVO", number: "085643323957", logoImage: ovoLogo, color: "#4C3494" },
    { provider: "GoPay", number: "085643323957", logoImage: gopayLogo, color: "#00AED6" },
    { provider: "ShopeePay", number: "085643323957", logoImage: shopeepayLogo, color: "#EE4D2D" },
  ],
  whatsappNumber: "6285702056901",
};
