import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  tone = "danger",
  loading = false,
}) {
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={title ?? t("ui.confirmDelete.title")} maxWidth={420}
      footer={
        <>
          <button className="db-btn db-btn-outline" onClick={onClose} disabled={loading}>{t("common.cancel")}</button>
          <button className={`db-btn ${tone === "danger" ? "db-btn-danger" : "db-btn-primary"}`} onClick={onConfirm} disabled={loading}>
            {loading ? t("ui.confirmDelete.pleaseWait") : (confirmLabel ?? t("common.delete"))}
          </button>
        </>
      }
    >
      <div className={`db-confirm ${tone === "warn" ? "warn" : ""}`}>
        <div className="ic-wrap">
          {tone === "danger" ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
