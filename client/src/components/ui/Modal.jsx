import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, maxWidth = 520 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="db-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="db-modal" style={{ maxWidth }}>
        <div className="db-modal-head">
          <h3>{title}</h3>
          <button aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="db-modal-body">{children}</div>
        {footer && <div className="db-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
