// Manual payment details shown on the /dashboard/upgrade page — no payment
// gateway yet (see the multi-tenant plan), so this is what a free-plan org
// sees when they want to upgrade. EDIT THESE VALUES to your real details
// before going live; everything below is a placeholder.
//
// qrisImageUrl: put your real static QRIS image at client/public/qris.png
// (or similar) and point this at it, e.g. "/qris.png" — leave null to hide
// the QRIS section instead of showing a fake/broken image.
//
// whatsappNumber: international format, digits only, no "+" or leading 0
// (e.g. a number like 0812-3456-7890 becomes "62812345678900"). Leave null
// to hide the WhatsApp confirmation button — the in-app "Saya Sudah Bayar"
// request still works without it.
export const paymentConfig = {
  priceLabel: "Hubungi kami untuk info harga",
  qrisImageUrl: null,
  bankTransfer: {
    bankName: "Nama Bank Anda",
    accountNumber: "0000000000",
    accountHolder: "Nama Pemilik Rekening",
  },
  eWallet: {
    provider: "OVO / GoPay / DANA",
    number: "0800-0000-0000",
    accountHolder: "Nama Pemilik Akun",
  },
  whatsappNumber: null,
};
