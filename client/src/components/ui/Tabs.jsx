import React from "react";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="db-tabs">
      {tabs.map((t) => (
        <button key={t.value} className={`db-tab ${active === t.value ? "active" : ""}`} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
