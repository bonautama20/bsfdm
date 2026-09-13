import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function DataTable({ columns, rows, pageSize = 8, emptyTitle, emptyMessage }) {
  const { t } = useLanguage();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    const accessor = col?.sortValue || ((r) => r[sortKey]);
    return [...rows].sort((a, b) => {
      const av = accessor(a), bv = accessor(b);
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? t("ui.dataTable.noRecords")} message={emptyMessage ?? t("ui.dataTable.tryAdjusting")} />;
  }

  return (
    <div>
      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.sortable ? "sortable" : ""} onClick={() => toggleSort(c.key, c.sortable)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c.label}
                    {c.sortable && sortKey === c.key && (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={row.id || row.key || i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="db-pagination">
          <span>{t("ui.dataTable.page")} {currentPage} {t("ui.dataTable.of")} {totalPages} · {sorted.length} {t("ui.dataTable.records")}</span>
          <div className="pages">
            <button disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map((n) => (
              <button key={n} className={n === currentPage ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
