// Centralized realistic dummy data for the BSFDM dashboard.
// Structured so every section can later be swapped for a real REST API response
// without changing component code — each export mirrors a plausible API payload shape.

// ---------- Biopond production racks (Maggot Rearing operational board) ----------
// This is the single source of truth for biopond counts across the app (Dashboard's
// Biopond Utilization widget, Production's Maggot Rearing card, the board itself, and
// the Operator module's harvest notifications all read from this via BiopondContext,
// so the numbers never drift apart).
export const HARVEST_CYCLE_DAYS = 8;

// Seed stocking dates are offsets from the *real* current date (not hardcoded
// calendar dates) so the harvest-notification demo (overdue / today / tomorrow /
// upcoming) always looks correct no matter what day this app is actually opened.
const TODAY = new Date();
const offsetISO = (days) => {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};
const addDaysISO = (iso, days) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const RACK_FEED_SOURCES = ["Grand Meruya Hotel", "Aster Bay Resort", "Java Heritage Hotel", "Samudra Grand Hotel", "Kirana Beach Hotel", "Wira Garden Hotel"];

function buildRack(id, name, count, dateInOffsetByNumber) {
  return {
    id,
    name,
    bioponds: Array.from({ length: count }, (_, i) => {
      const number = i + 1;
      const stockingOffset = dateInOffsetByNumber[number];
      if (stockingOffset === undefined) {
        return {
          id: `${id}-${number}`, number, status: "Available",
          babyMaggotQty: null, dateIn: null, feedInKg: null, feedSource: null, harvestDate: null,
          createdBy: null, createdAt: offsetISO(-60), updatedAt: offsetISO(-60),
        };
      }
      const dateIn = offsetISO(stockingOffset);
      return {
        id: `${id}-${number}`,
        number,
        status: "Occupied",
        babyMaggotQty: 15000 + (number % 6) * 1200,
        dateIn,
        feedInKg: 60 + (number % 5) * 15,
        feedSource: RACK_FEED_SOURCES[number % RACK_FEED_SOURCES.length],
        harvestDate: addDaysISO(dateIn, HARVEST_CYCLE_DAYS),
        createdBy: "Andi Setiawan",
        createdAt: dateIn,
        updatedAt: dateIn,
      };
    }),
  };
}

export const biopondRacks = [
  // Stocking offsets (days from today) chosen so harvest dates (+8 days) land on:
  // biopond 3 = overdue 5d, 14 = harvest today, 17 = harvest tomorrow, 22 = upcoming.
  buildRack("RAK-A", "Rak A", 30, { 3: -13, 14: -8, 17: -7, 22: -4 }),
  // A wider spread across Rak B: four more overdue harvests, the rest upcoming.
  buildRack("RAK-B", "Rak B", 30, {
    1: -15, 2: -11, 10: -3, 12: -2, 14: -1, 17: 0, 19: 1, 22: -9, 26: 2, 27: -12,
  }),
];

// ---------- KPI summary (dashboard top cards) ----------
export const kpiSummary = {
  maggotProducedKg: 12450,
  maggotToday: 185,
  maggotTrend: 8.2,
  eggProducedKg: 28.5,
  eggTodayGrams: 420,
  eggTrend: 5.1,
  kasgotProducedKg: 31820,
  kasgotToday: 350,
  kasgotTrend: 3.4,
  wasteProcessedKg: 458420,
  wasteToday: 2850,
  wasteTrend: -1.6,
  lastSync: "2026-08-25T09:12:00",
};

// ---------- Maggot production batches ----------
export const maggotBatches = [
  { id: "MB-1000", biopondId: "BP-014", hatchDate: "2026-08-02", ageDays: 23, initialQty: 18000, feedKg: 420, estBiomassKg: 640, estHarvestKg: 610, actualHarvestKg: null, mortality: 4.2, status: "Ready to Harvest" },
  { id: "MB-1001", biopondId: "BP-027", hatchDate: "2026-08-10", ageDays: 15, initialQty: 21000, feedKg: 310, estBiomassKg: 480, estHarvestKg: 455, actualHarvestKg: null, mortality: 3.1, status: "Growing" },
  { id: "MB-1002", biopondId: "BP-033", hatchDate: "2026-08-18", ageDays: 7, initialQty: 19500, feedKg: 96, estBiomassKg: 140, estHarvestKg: 130, actualHarvestKg: null, mortality: 1.8, status: "Newly Hatched" },
  { id: "MB-1003", biopondId: "BP-041", hatchDate: "2026-07-28", ageDays: 28, initialQty: 20000, feedKg: 505, estBiomassKg: 700, estHarvestKg: 690, actualHarvestKg: 682, mortality: 5.0, status: "Harvested" },
  { id: "MB-1004", biopondId: "BP-052", hatchDate: "2026-08-05", ageDays: 20, initialQty: 17500, feedKg: 380, estBiomassKg: 590, estHarvestKg: 560, actualHarvestKg: null, mortality: 6.7, status: "Growing" },
  { id: "MB-1005", biopondId: "BP-063", hatchDate: "2026-08-14", ageDays: 11, initialQty: 22000, feedKg: 210, estBiomassKg: 320, estHarvestKg: 305, actualHarvestKg: null, mortality: 2.4, status: "Growing" },
  { id: "MB-1006", biopondId: "BP-071", hatchDate: "2026-07-20", ageDays: 36, initialQty: 19000, feedKg: 560, estBiomassKg: 0, estHarvestKg: 0, actualHarvestKg: null, mortality: 22.5, status: "Failed" },
  { id: "MB-1007", biopondId: "BP-088", hatchDate: "2026-08-01", ageDays: 24, initialQty: 18500, feedKg: 440, estBiomassKg: 655, estHarvestKg: 620, actualHarvestKg: null, mortality: 3.9, status: "Ready to Harvest" },
];

// ---------- BSF egg production ----------
export const eggBatches = [
  { id: "EB-201", collectionDate: "2026-08-24", eggWeightG: 480, sourceCage: "CG-03", estHatchDate: "2026-08-28", actualHatchDate: null, hatchRate: null, status: "Incubating" },
  { id: "EB-200", collectionDate: "2026-08-21", eggWeightG: 512, sourceCage: "CG-01", estHatchDate: "2026-08-25", actualHatchDate: null, hatchRate: null, status: "Incubating" },
  { id: "EB-199", collectionDate: "2026-08-17", eggWeightG: 460, sourceCage: "CG-04", estHatchDate: "2026-08-21", actualHatchDate: "2026-08-21", hatchRate: 92.4, status: "Hatched" },
  { id: "EB-198", collectionDate: "2026-08-13", eggWeightG: 495, sourceCage: "CG-02", estHatchDate: "2026-08-17", actualHatchDate: "2026-08-18", hatchRate: 89.1, status: "Hatched" },
];

export const eggSummary = {
  todayKg: 0.42,
  monthlyKg: 28.5,
  collectionUnits: 4,
  avgYieldG: 487,
  nextHarvestDate: "2026-08-28",
};

// ---------- Breeder / parent stock ----------
export const breederCages = [
  { id: "CG-01", pupaeEntryDate: "2026-07-25", pupaeQty: 9000, adultEmergence: 8100, eggProductionG: 512, cycle: "Cycle 14", status: "Active", mortality: 10.0 },
  { id: "CG-02", pupaeEntryDate: "2026-07-29", pupaeQty: 8500, adultEmergence: 7820, eggProductionG: 495, cycle: "Cycle 13", status: "Active", mortality: 8.0 },
  { id: "CG-03", pupaeEntryDate: "2026-08-01", pupaeQty: 9200, adultEmergence: 8500, eggProductionG: 480, cycle: "Cycle 12", status: "Active", mortality: 7.6 },
  { id: "CG-04", pupaeEntryDate: "2026-07-18", pupaeQty: 8800, adultEmergence: 7900, eggProductionG: 460, cycle: "Cycle 15", status: "Retiring", mortality: 10.2 },
];

export const breederSummary = {
  activeCages: breederCages.filter((c) => c.status === "Active").length,
  estAdultPopulation: breederCages.reduce((s, c) => s + c.adultEmergence, 0),
  maleFemaleRatio: "48 / 52",
  pupaeIntroduced: breederCages.reduce((s, c) => s + c.pupaeQty, 0),
  avgMortality: +(breederCages.reduce((s, c) => s + c.mortality, 0) / breederCages.length).toFixed(1),
};

// ---------- Kasgot / organic fertilizer ----------
export const kasgotBatches = [
  { id: "KB-501", sourceBiopond: "BP-041", processingDate: "2026-08-23", rawWeightKg: 820, driedWeightKg: 590, packaging: "25kg Sack", stock: 210, salesStatus: "Partially Sold" },
  { id: "KB-500", sourceBiopond: "BP-036", processingDate: "2026-08-19", rawWeightKg: 760, driedWeightKg: 540, packaging: "25kg Sack", stock: 0, salesStatus: "Sold Out" },
  { id: "KB-499", sourceBiopond: "BP-029", processingDate: "2026-08-14", rawWeightKg: 890, driedWeightKg: 615, packaging: "50kg Sack", stock: 340, salesStatus: "In Stock" },
];

export const kasgotSummary = {
  todayKg: 350,
  monthlyKg: 31820,
  availableStockKg: 550,
  soldQtyKg: 4200,
};

// ---------- Hotel clients ----------
export const hotels = [
  { id: "HTL-01", name: "Grand Meruya Hotel", address: "Jl. Meruya Ilir No. 12, Jakarta Barat", phone: "021-5847221", email: "ops@grandmeruya.com", website: "grandmeruya.com", hotelPIC: { name: "Sari Wulandari", position: "Sustainability Manager", phone: "0812-7711-0091" }, contractNumber: "CTR-2025-011", contractStart: "2025-01-15", contractExpiry: "2026-09-08", status: "Contract Expiring", monthlyWasteKg: 8420, avgDailyWasteKg: 271, lastCollection: "2026-08-24" },
  { id: "HTL-02", name: "Aster Bay Resort", address: "Jl. Pantai Aster No. 5, Kuta, Bali", phone: "0361-778812", email: "green@asterbay.com", website: "asterbayresort.com", hotelPIC: { name: "I Made Wirawan", position: "General Manager", phone: "0812-7711-0092" }, contractNumber: "CTR-2024-028", contractStart: "2024-03-01", contractExpiry: "2027-03-01", status: "Active", monthlyWasteKg: 11200, avgDailyWasteKg: 361, lastCollection: "2026-08-25" },
  { id: "HTL-03", name: "Cendana Suites", address: "Jl. Cendana Raya No. 88, Yogyakarta", phone: "0274-556677", email: "info@cendanasuites.co.id", website: "cendanasuites.co.id", hotelPIC: { name: "Retno Palupi", position: "F&B Director", phone: "0812-7711-0093" }, contractNumber: "CTR-2025-004", contractStart: "2025-02-10", contractExpiry: "2026-02-10", status: "Inactive", monthlyWasteKg: 0, avgDailyWasteKg: 0, lastCollection: "2026-06-30" },
  { id: "HTL-04", name: "Java Heritage Hotel", address: "Jl. Slamet Riyadi No. 245, Solo", phone: "0271-334455", email: "operations@javaheritage.com", website: "javaheritage.com", hotelPIC: { name: "Ahmad Fauzi", position: "Operations Manager", phone: "0812-7711-0094" }, contractNumber: "CTR-2025-019", contractStart: "2025-04-01", contractExpiry: "2027-04-01", status: "Active", monthlyWasteKg: 9850, avgDailyWasteKg: 318, lastCollection: "2026-08-24" },
  { id: "HTL-05", name: "Samudra Grand Hotel", address: "Jl. Diponegoro No. 3, Surabaya", phone: "031-8899001", email: "cs@samudragrand.com", website: "samudragrand.com", hotelPIC: { name: "Lina Kurniawati", position: "Sustainability Officer", phone: "0812-7711-0095" }, contractNumber: "CTR-2023-041", contractStart: "2023-09-12", contractExpiry: "2026-09-12", status: "Contract Expiring", monthlyWasteKg: 13400, avgDailyWasteKg: 432, lastCollection: "2026-08-25" },
  { id: "HTL-06", name: "Palma Residence", address: "Jl. Palma Indah No. 17, Bandung", phone: "022-4433221", email: "hello@palmaresidence.id", website: "palmaresidence.id", hotelPIC: { name: "Yusuf Hakim", position: "General Manager", phone: "0812-7711-0096" }, contractNumber: "CTR-2025-033", contractStart: "2025-06-01", contractExpiry: "2027-06-01", status: "Active", monthlyWasteKg: 7600, avgDailyWasteKg: 245, lastCollection: "2026-08-23" },
  { id: "HTL-07", name: "Kirana Beach Hotel", address: "Jl. Kirana Pantai No. 9, Lombok", phone: "0370-661122", email: "info@kiranabeach.com", website: "kiranabeach.com", hotelPIC: { name: "Made Suastika", position: "F&B Manager", phone: "0812-7711-0097" }, contractNumber: "CTR-2024-052", contractStart: "2024-08-20", contractExpiry: "2027-08-20", status: "Active", monthlyWasteKg: 10120, avgDailyWasteKg: 326, lastCollection: "2026-08-24" },
  { id: "HTL-08", name: "Wira Garden Hotel", address: "Jl. Garden City No. 21, Medan", phone: "061-4455667", email: "ops@wiragarden.com", website: "wiragarden.com", hotelPIC: { name: "Siti Rahma", position: "Operations Manager", phone: "0812-7711-0098" }, contractNumber: "CTR-2025-047", contractStart: "2025-07-05", contractExpiry: "2027-07-05", status: "Active", monthlyWasteKg: 6980, avgDailyWasteKg: 225, lastCollection: "2026-08-22" },
];

// Vendor companies — each vendor's `pic`/`picPosition`/phone are the single
// source of truth for that vendor's contact person. Hotels linked via
// `hotelIds` display this PIC live (see server/routes/hotels.js) rather than
// storing their own separate copy, so it never drifts out of sync.
export const vendors = [
  {
    id: "VND-01",
    name: "CV Mitra Bersih Sejahtera",
    pic: "Budi Santoso",
    picPosition: "Field Coordinator",
    location: "Jl. Industri Raya No. 45, Jakarta Barat",
    phone1: "021-5588112",
    phone2: "0812-3456-7801",
    hotelIds: ["HTL-01", "HTL-03", "HTL-05", "HTL-07"],
  },
  {
    id: "VND-02",
    name: "PT Hijau Lestari Waste Management",
    pic: "Dewi Anjani",
    picPosition: "Field Coordinator",
    location: "Jl. Cempaka Putih No. 12, Jakarta Pusat",
    phone1: "021-4477223",
    phone2: "0813-2211-4470",
    hotelIds: ["HTL-02", "HTL-04", "HTL-06", "HTL-08"],
  },
];

export const wasteHistoryByHotel = (hotelId) => {
  const base = hotels.find((h) => h.id === hotelId)?.avgDailyWasteKg || 250;
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 7, 25 - (13 - i));
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      quantityKg: Math.round(base + (Math.sin(i) * base * 0.15) + (Math.random() * base * 0.1)),
      category: "Food Waste",
      vehicle: `TR-${(i % 3) + 1}`,
      driver: ["Agus Salim", "Herman Yuda", "Fajar Nugroho"][i % 3],
      operator: ["Budi Santoso", "Dewi Anjani"][i % 2],
      notes: i % 5 === 0 ? "Partial load — kitchen renovation" : "",
    };
  });
};

// ---------- Monthly sales performance ----------
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthlySales = months.map((m, i) => ({
  month: m,
  freshMaggotQty: 3800 + i * 120 + (i % 3) * 200,
  freshMaggotRevenue: (3800 + i * 120) * 12_000,
  eggQty: 18 + i * 0.8,
  eggRevenue: (18 + i * 0.8) * 1_400_000,
  kasgotQty: 2400 + i * 90,
  kasgotRevenue: (2400 + i * 90) * 3_500,
}));

export const salesSummary = {
  totalQtyKg: monthlySales.reduce((s, m) => s + m.freshMaggotQty + m.kasgotQty, 0),
  totalRevenue: monthlySales.reduce((s, m) => s + m.freshMaggotRevenue + m.eggRevenue + m.kasgotRevenue, 0),
  growthPct: 14.6,
  bestSeller: "Fresh Maggot",
};

export const salesTransactions = [
  { id: "TRX-3301", date: "2026-08-24", customer: "PT Agro Nusantara", product: "Fresh Maggot", qty: 420, unit: "kg", price: 12000, total: 5_040_000, paymentStatus: "Paid" },
  { id: "TRX-3300", date: "2026-08-23", customer: "CV Pakan Sejahtera", product: "Kasgot / Organic Fertilizer", qty: 1200, unit: "kg", price: 3500, total: 4_200_000, paymentStatus: "Paid" },
  { id: "TRX-3299", date: "2026-08-22", customer: "Tirta Farm Aquaculture", product: "Fresh Maggot", qty: 600, unit: "kg", price: 11800, total: 7_080_000, paymentStatus: "Pending" },
  { id: "TRX-3298", date: "2026-08-21", customer: "Ternak Unggas Mandiri", product: "BSF Eggs", qty: 1.2, unit: "kg", price: 1_400_000, total: 1_680_000, paymentStatus: "Paid" },
  { id: "TRX-3297", date: "2026-08-20", customer: "Kebun Organik Lestari", product: "Kasgot / Organic Fertilizer", qty: 850, unit: "kg", price: 3500, total: 2_975_000, paymentStatus: "Overdue" },
];

// ---------- Calendar events ----------
export const calendarEvents = [
  { id: "EV-1", date: "2026-08-26", type: "Maggot Harvest", title: "Harvest MB-1000", biopondId: "BP-014", batchId: "MB-1000", estQty: "610 kg", employee: "Agus Salim", status: "Scheduled" },
  { id: "EV-2", date: "2026-08-26", type: "Client Meeting", title: "Contract renewal — Grand Meruya", hotel: "Grand Meruya Hotel", subject: "Contract renewal discussion", location: "Grand Meruya Hotel, Jakarta Barat", pic: "Sari Wulandari", contact: "0812-9988-2211", notes: "Bring updated waste collection report." },
  { id: "EV-3", date: "2026-08-27", type: "Product Delivery", title: "Delivery to PT Agro Nusantara", customer: "PT Agro Nusantara", product: "Fresh Maggot", qty: "500 kg", address: "Jl. Industri Raya No. 8, Tangerang", time: "10:00", status: "Scheduled" },
  { id: "EV-4", date: "2026-08-28", type: "BSF Egg Harvest", title: "Egg harvest CG-03", cageId: "CG-03", estProduction: "480 g", employee: "Herman Yuda" },
  { id: "EV-5", date: "2026-08-31", type: "Holiday", title: "National Holiday", holidayName: "National Holiday", impact: "No collection or delivery scheduled", employeeSchedule: "Off — essential feeding crew only" },
  { id: "EV-6", date: "2026-09-01", type: "Client Meeting", title: "Onboarding — Wira Garden Hotel", hotel: "Wira Garden Hotel", subject: "Quarterly review", location: "Wira Garden Hotel, Medan", pic: "Siti Rahma", contact: "0813-4477-2200", notes: "" },
  { id: "EV-7", date: "2026-08-29", type: "Maggot Harvest", title: "Harvest MB-1007", biopondId: "BP-088", batchId: "MB-1007", estQty: "620 kg", employee: "Fajar Nugroho", status: "Scheduled" },
  { id: "EV-8", date: "2026-08-30", type: "Product Delivery", title: "Delivery to Ternak Unggas Mandiri", customer: "Ternak Unggas Mandiri", product: "BSF Eggs", qty: "1.5 kg", address: "Jl. Peternakan No. 2, Bogor", time: "14:30", status: "Scheduled" },
];

export const eventColors = {
  "Maggot Harvest": "#01613C",
  "Client Meeting": "#E36B14",
  "Product Delivery": "#2563EB",
  "Holiday": "#94A3B8",
  "BSF Egg Harvest": "#B45309",
};

// ---------- Recent operational activity ----------
export const recentActivity = [
  { id: 1, type: "harvest", text: "Maggot harvest completed for batch MB-1003 — 682 kg", user: "Agus Salim", date: "2026-08-25", time: "08:12" },
  { id: 2, type: "egg", text: "BSF egg harvest recorded for cage CG-04 — 495 g, 92.4% hatch rate", user: "Herman Yuda", date: "2026-08-25", time: "07:45" },
  { id: 3, type: "waste", text: "Organic waste received from Aster Bay Resort — 380 kg", user: "Dewi Anjani", date: "2026-08-25", time: "07:30" },
  { id: 4, type: "client", text: "New client added — Wira Garden Hotel", user: "Sales/Admin", date: "2026-08-24", time: "16:20" },
  { id: 5, type: "sale", text: "Product sold — 420 kg Fresh Maggot to PT Agro Nusantara", user: "Sales/Admin", date: "2026-08-24", time: "14:05" },
  { id: 6, type: "biopond", text: "Biopond BP-033 activated for batch MB-1002", user: "Fajar Nugroho", date: "2026-08-18", time: "09:00" },
  { id: 7, type: "biopond", text: "Biopond BP-036 emptied after kasgot processing", user: "Budi Santoso", date: "2026-08-19", time: "11:15" },
  { id: 8, type: "attendance", text: "Employee attendance submitted for 24 Aug 2026", user: "HR System", date: "2026-08-24", time: "18:00" },
  { id: 9, type: "report", text: "Weekly production report submitted", user: "Production Manager", date: "2026-08-24", time: "17:40" },
];

// ---------- Employees & attendance ----------
export const employees = [
  { id: "EMP-001", name: "Agus Salim", position: "Biopond Technician", department: "Production", phone: "0812-1111-2201", email: "agus.salim@bsfdm.com", status: "Active", joinDate: "2022-03-14" },
  { id: "EMP-002", name: "Herman Yuda", position: "Egg Collection Specialist", department: "Production", phone: "0812-1111-2202", email: "herman.yuda@bsfdm.com", status: "Active", joinDate: "2021-11-02" },
  { id: "EMP-003", name: "Fajar Nugroho", position: "Biopond Technician", department: "Production", phone: "0812-1111-2203", email: "fajar.nugroho@bsfdm.com", status: "Active", joinDate: "2023-01-20" },
  { id: "EMP-004", name: "Budi Santoso", position: "Field Coordinator", department: "Waste Collection", phone: "0812-3456-7801", email: "budi.santoso@bsfdm.com", status: "Active", joinDate: "2020-06-10" },
  { id: "EMP-005", name: "Dewi Anjani", position: "Field Coordinator", department: "Waste Collection", phone: "0813-2211-4470", email: "dewi.anjani@bsfdm.com", status: "Active", joinDate: "2021-02-18" },
  { id: "EMP-006", name: "Rangga Pratama", position: "Sales Executive", department: "Sales", phone: "0812-9988-3301", email: "rangga.pratama@bsfdm.com", status: "Active", joinDate: "2022-09-05" },
  { id: "EMP-007", name: "Maria Kusuma", position: "Finance & Admin Staff", department: "Administration", phone: "0812-9988-3302", email: "maria.kusuma@bsfdm.com", status: "On Leave", joinDate: "2019-05-22" },
  { id: "EMP-008", name: "Farm Manager", position: "Production Manager", department: "Management", phone: "0812-9988-3303", email: "manager@bsfdm.com", status: "Active", joinDate: "2018-08-01" },
];

export const attendanceToday = employees.map((e, i) => {
  const statuses = ["Present", "Present", "Present", "Late", "Present", "Present", "Leave", "Present"];
  const status = statuses[i % statuses.length];
  const clockIn = status === "Present" ? "07:58" : status === "Late" ? "08:41" : "-";
  const clockOut = status === "Present" || status === "Late" ? "16:05" : "-";
  return { employeeId: e.id, employee: e.name, date: "2026-08-25", clockIn, clockOut, status, hours: clockIn !== "-" ? 8 : 0 };
});

export const attendanceStats = {
  total: employees.length,
  present: attendanceToday.filter((a) => a.status === "Present").length,
  absent: attendanceToday.filter((a) => a.status === "Absent").length,
  late: attendanceToday.filter((a) => a.status === "Late").length,
  onLeave: attendanceToday.filter((a) => a.status === "Leave").length,
};

// ---------- Users & RBAC ----------
export const roles = [
  { id: "role-super-admin", name: "Super Admin", description: "Full system access." },
  { id: "role-production-manager", name: "Production Manager", description: "Dashboard, Production, Calendar, Reports." },
  { id: "role-production-staff", name: "Production Staff", description: "Production, Calendar, limited Dashboard." },
  { id: "role-sales-admin", name: "Sales/Admin", description: "Client, Sales Report, Calendar." },
  { id: "role-management", name: "Management", description: "Read-only Dashboard, Reports, Client summary." },
  { id: "role-operator", name: "Operator", description: "Field production operator — mobile-only access to the Operator module (Production, Calendar, Notifications)." },
];

const modules = ["Dashboard", "Production", "Calendar", "Client", "Vendor", "Employee", "Community", "Report", "Notification", "Setting"];
const permActions = ["view", "create", "edit", "delete", "export", "approve"];

const buildMatrix = (fullAccess, readOnlyModules = [], hiddenModules = []) =>
  modules.reduce((acc, mod) => {
    if (hiddenModules.includes(mod)) {
      acc[mod] = permActions.reduce((a, p) => ({ ...a, [p]: false }), {});
    } else if (readOnlyModules.includes(mod)) {
      acc[mod] = permActions.reduce((a, p) => ({ ...a, [p]: p === "view" }), {});
    } else {
      acc[mod] = permActions.reduce((a, p) => ({ ...a, [p]: fullAccess }), {});
    }
    return acc;
  }, {});

export const rolePermissions = {
  "role-super-admin": buildMatrix(true),
  "role-production-manager": buildMatrix(true, [], []),
  // fullAccess=true here (was `false`, which — since Production/Calendar
  // weren't in either list below — silently left a role literally named
  // "Production Staff" with zero access to Production or Calendar; fixed as
  // part of turning this matrix from UI-only hints into real server-enforced
  // permissions, see server/middleware/auth.js's requirePermission).
  "role-production-staff": buildMatrix(true, ["Dashboard"], ["Client", "Vendor", "Employee", "Community", "Report", "Notification", "Setting"]),
  "role-sales-admin": buildMatrix(false, [], ["Production", "Report", "Notification", "Setting"]),
  "role-management": buildMatrix(false, ["Dashboard", "Report", "Client", "Vendor", "Employee", "Community"], ["Production", "Calendar", "Notification", "Setting"]),
  // Operators never touch the admin panel — their entire experience lives in the
  // separate mobile-first /operator module, so every admin module stays hidden here.
  // (Their own field-data writes — maggot harvest, kasgot, feed, egg batches,
  // starting/releasing a biopond — go through requireOperatorOrPermission
  // instead, which lets role-operator through regardless of this matrix.)
  "role-operator": buildMatrix(false, [], modules),
};
// Sales/Admin needs Client + Calendar full, Report(sales) view — adjust manually for realism
rolePermissions["role-sales-admin"].Client = permActions.reduce((a, p) => ({ ...a, [p]: true }), {});
rolePermissions["role-sales-admin"].Calendar = permActions.reduce((a, p) => ({ ...a, [p]: true }), {});
rolePermissions["role-sales-admin"].Dashboard = permActions.reduce((a, p) => ({ ...a, [p]: p === "view" }), {});

export const users = [
  { id: "USR-01", name: "Farm Manager", email: "manager@bsfdm.com", roleId: "role-super-admin", status: "Active", lastLogin: "2026-08-25T08:02:00", createdDate: "2018-08-01" },
  { id: "USR-02", name: "Sari Pratiwi", email: "production.manager@bsfdm.com", roleId: "role-production-manager", status: "Active", lastLogin: "2026-08-25T07:40:00", createdDate: "2021-04-11" },
  { id: "USR-03", name: "Agus Salim", email: "agus.salim@bsfdm.com", roleId: "role-production-staff", status: "Active", lastLogin: "2026-08-24T17:55:00", createdDate: "2022-03-14" },
  { id: "USR-04", name: "Rangga Pratama", email: "rangga.pratama@bsfdm.com", roleId: "role-sales-admin", status: "Active", lastLogin: "2026-08-25T09:00:00", createdDate: "2022-09-05" },
  { id: "USR-05", name: "Board Director", email: "director@bsfdm.com", roleId: "role-management", status: "Inactive", lastLogin: "2026-07-30T10:12:00", createdDate: "2020-01-15" },
  { id: "USR-06", name: "Andi Setiawan", email: "andi@bsfdm.com", roleId: "role-operator", status: "Active", lastLogin: "2026-09-05T07:15:00", createdDate: "2024-02-10" },
];

// ---------- Notification settings ----------
export const notificationTypes = [
  { id: "n1", label: "Maggot Harvest Reminder", inApp: true, email: true, whatsapp: false, timing: "1 day before" },
  { id: "n2", label: "BSF Egg Harvest Reminder", inApp: true, email: true, whatsapp: false, timing: "1 day before" },
  { id: "n3", label: "Feeding Reminder", inApp: true, email: false, whatsapp: false, timing: "Same day" },
  { id: "n4", label: "Client Meeting Reminder", inApp: true, email: true, whatsapp: true, timing: "1 day before" },
  { id: "n5", label: "Product Delivery Reminder", inApp: true, email: true, whatsapp: true, timing: "Same day" },
  { id: "n6", label: "Contract Expiration", inApp: true, email: true, whatsapp: false, timing: "14 days before" },
  { id: "n7", label: "Low Product Stock", inApp: true, email: true, whatsapp: false, timing: "Same day" },
  { id: "n8", label: "Biopond Availability", inApp: true, email: false, whatsapp: false, timing: "Same day" },
  { id: "n9", label: "Production Target Warning", inApp: true, email: true, whatsapp: false, timing: "Same day" },
  { id: "n10", label: "Employee Attendance", inApp: true, email: false, whatsapp: false, timing: "Same day" },
  { id: "n11", label: "New Client", inApp: true, email: true, whatsapp: false, timing: "Same day" },
  { id: "n12", label: "New Sales Transaction", inApp: true, email: false, whatsapp: false, timing: "Same day" },
  { id: "n13", label: "System Alerts", inApp: true, email: true, whatsapp: false, timing: "Same day" },
];

const initialBiopondCount = biopondRacks.reduce((s, r) => s + r.bioponds.length, 0);
const initialOccupiedCount = biopondRacks.reduce((s, r) => s + r.bioponds.filter((b) => b.status === "Occupied").length, 0);
const initialUtilization = initialBiopondCount ? +((initialOccupiedCount / initialBiopondCount) * 100).toFixed(1) : 0;

export const systemAlerts = [
  { id: "a1", severity: "warning", title: "Harvest Due Today", message: "Biopond 14 in Rak A is scheduled for harvesting today." },
  { id: "a2", severity: "warning", title: "Contract Expiring", message: "Grand Meruya Hotel contract will expire in 14 days." },
  { id: "a3", severity: "danger", title: "Biopond Capacity Warning", message: `${initialUtilization}% of available bioponds are currently occupied.` },
  { id: "a4", severity: "success", title: "Production Target", message: "Monthly maggot production has reached 92% of the target." },
];

// ---------- New hotel contract report ----------
export const newContracts = hotels
  .filter((h) => new Date(h.contractStart) >= new Date("2025-01-01"))
  .map((h) => ({
    hotel: h.name,
    contractNumber: h.contractNumber,
    contractStart: h.contractStart,
    contractExpiry: h.contractExpiry,
    contractValue: Math.round(h.monthlyWasteKg * 3.2 * 12) || 45_000_000,
    pic: h.hotelPIC.name,
    status: h.status,
  }));

export const contractStats = {
  newClientsThisYear: newContracts.length,
  activeContracts: hotels.filter((h) => h.status === "Active").length,
  expiringContracts: hotels.filter((h) => h.status === "Contract Expiring").length,
  renewalRate: 88.5,
};

// ---------- Maggot cultivator community directory ----------
// Shown as a public distribution map + searchable list on the landing page
// (name/address/kabupaten/provinsi only — no phone) and managed in full
// (incl. phone) from the admin dashboard's Community page. `provinsi` values
// must match the official 38-province names used by the map's topojson
// (see client/src/assets/data/id-provinces.topo.json).
export const communities = [
  { name: "Rudi Hartono", phone: "0812-3344-5566", address: "Jl. Melati No. 12, Kec. Cileunyi", kabupaten: "Kabupaten Bandung", provinsi: "Jawa Barat" },
  { name: "Fitriani", phone: "0813-2211-9087", address: "Jl. Pahlawan No. 9, Kec. Cibinong", kabupaten: "Kabupaten Bogor", provinsi: "Jawa Barat" },
  { name: "Siti Aminah", phone: "0821-7765-4432", address: "Jl. Kenanga No. 5, Kec. Depok", kabupaten: "Kabupaten Sleman", provinsi: "Daerah Istimewa Yogyakarta" },
  { name: "Bambang Sutrisno", phone: "0852-1188-3345", address: "Jl. Diponegoro No. 45", kabupaten: "Kabupaten Sidoarjo", provinsi: "Jawa Timur" },
  { name: "Lukman Hakim", phone: "0878-4432-1190", address: "Jl. Veteran No. 22", kabupaten: "Kabupaten Jember", provinsi: "Jawa Timur" },
  { name: "Eko Prasetyo", phone: "0813-6654-2201", address: "Jl. Ahmad Yani No. 33", kabupaten: "Kabupaten Sragen", provinsi: "Jawa Tengah" },
  { name: "Wahyu Nugroho", phone: "0821-9987-1123", address: "Jl. Slamet Riyadi No. 61", kabupaten: "Kabupaten Klaten", provinsi: "Jawa Tengah" },
  { name: "Indah Permatasari", phone: "0822-3345-6612", address: "Jl. Kartini No. 17", kabupaten: "Kabupaten Tangerang", provinsi: "Banten" },
  { name: "Dewi Lestari", phone: "0812-5567-8821", address: "Jl. Sudirman No. 21, Kec. Mengwi", kabupaten: "Kabupaten Badung", provinsi: "Bali" },
  { name: "Ahmad Fauzi", phone: "0853-2298-4471", address: "Jl. Merdeka No. 8", kabupaten: "Kota Medan", provinsi: "Sumatera Utara" },
  { name: "Oscar Simanjuntak", phone: "0812-9987-3345", address: "Jl. Sisingamangaraja No. 18", kabupaten: "Kota Pematangsiantar", provinsi: "Sumatera Utara" },
  { name: "Hendra Saputra", phone: "0821-4432-1187", address: "Jl. Pattimura No. 3", kabupaten: "Kota Pekanbaru", provinsi: "Riau" },
  { name: "Joko Purnomo", phone: "0813-1123-9987", address: "Jl. Gajah Mada No. 14", kabupaten: "Kota Makassar", provinsi: "Sulawesi Selatan" },
  { name: "Nur Aisyah", phone: "0878-6654-3321", address: "Jl. Cendrawasih No. 4", kabupaten: "Kabupaten Bulukumba", provinsi: "Sulawesi Selatan" },
  { name: "Kartika Sari", phone: "0852-3345-9912", address: "Jl. Ahmad Dahlan No. 6", kabupaten: "Kota Balikpapan", provinsi: "Kalimantan Timur" },
  { name: "Putri Ramadhani", phone: "0822-1187-4456", address: "Jl. Antasari No. 27", kabupaten: "Kota Banjarmasin", provinsi: "Kalimantan Selatan" },
  { name: "Maria Goreti", phone: "0813-9987-2245", address: "Jl. Adisucipto No. 10", kabupaten: "Kota Kupang", provinsi: "Nusa Tenggara Timur" },
  { name: "Rahmat Hidayat", phone: "0821-6654-1198", address: "Jl. Trans Papua No. 2", kabupaten: "Kota Jayapura", provinsi: "Papua" },
];
