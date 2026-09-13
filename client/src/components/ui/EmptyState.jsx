import React from "react";
import { Inbox, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function EmptyState({ icon: Icon = Inbox, title, message = "" }) {
  const { t } = useLanguage();
  return (
    <div className="db-empty">
      <div className="ic"><Icon size={24} /></div>
      <h4>{title ?? t("ui.emptyState.title")}</h4>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorState({ message }) {
  const { t } = useLanguage();
  const resolvedMessage = message ?? t("ui.errorState.message");
  return (
    <div className="db-error">
      <AlertCircle size={18} />
      <span>{resolvedMessage}</span>
    </div>
  );
}

export function Skeleton({ height = 16, width = "100%", style }) {
  return <div className="db-skeleton" style={{ height, width, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="db-card">
      <Skeleton height={13} width="40%" style={{ marginBottom: 14 }} />
      <Skeleton height={28} width="60%" style={{ marginBottom: 10 }} />
      <Skeleton height={12} width="50%" />
    </div>
  );
}
