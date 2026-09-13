import React from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const TONE_MAP = {
  // green
  Active: "green", Present: "green", "In Stock": "green", Paid: "green",
  "Ready to Harvest": "green", Hatched: "green", Growing: "green", Scheduled: "green",
  // orange / warning
  "Contract Expiring": "orange", Late: "orange", Pending: "orange",
  "Partially Sold": "orange", Incubating: "orange", "Newly Hatched": "orange",
  Maintenance: "orange", Retiring: "orange",
  // red / danger
  Inactive: "red", Absent: "red", Failed: "red", Overdue: "red", "Sold Out": "gray",
  // blue / info
  "In Use": "blue", Harvested: "blue",
  // gray
  Leave: "gray", "On Leave": "gray", Holiday: "gray", Available: "gray",
};

export default function Badge({ children, tone }) {
  const { t } = useLanguage();
  const resolved = tone || TONE_MAP[children] || "gray";
  const key = `status.${children}`;
  const label = typeof children === "string" ? t(key) : children;
  return <span className={`db-badge ${resolved}`}>{label === key ? children : label}</span>;
}
