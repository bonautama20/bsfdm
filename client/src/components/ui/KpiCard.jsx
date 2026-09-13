import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({ icon: Icon, label, value, todayLabel, trend, onClick }) {
  const up = trend >= 0;
  return (
    <div className={`db-card db-kpi ${onClick ? "clickable" : ""}`} onClick={onClick}>
      <div className="ic-wrap"><Icon size={20} /></div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="foot">
        {todayLabel && <span className="today">{todayLabel}</span>}
        {typeof trend === "number" && (
          <span className={`trend ${up ? "up" : "down"}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
