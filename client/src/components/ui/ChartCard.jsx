import React from "react";
import { BarChart3 } from "lucide-react";
import { EmptyState, Skeleton } from "./EmptyState.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ChartCard({ title, subtitle, controls, children, footer, loading, empty, emptyMessage, height = 280 }) {
  const { t } = useLanguage();
  return (
    <div className="db-card">
      <div className="db-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
        {controls && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{controls}</div>}
      </div>

      {loading ? (
        <Skeleton height={height} />
      ) : empty ? (
        <div style={{ minHeight: height, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState icon={BarChart3} title={t("ui.chartCard.noData")} message={emptyMessage || t("ui.chartCard.tryDifferentFilter")} />
        </div>
      ) : (
        children
      )}

      {footer && !loading && !empty && <div className="db-metric-row">{footer}</div>}
    </div>
  );
}
