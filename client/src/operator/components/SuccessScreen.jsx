import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home, Eye } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function SuccessScreen({ title, message, viewTo, onViewRecord }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="op-content no-pad-top" style={{ display: "flex", alignItems: "center", minHeight: "70vh" }}>
      <div className="op-success" style={{ width: "100%" }}>
        <div className="ic-wrap"><CheckCircle2 size={36} /></div>
        <h2>{title ?? t("operator.successDefaultTitle")}</h2>
        {message && <p>{message}</p>}
        <div className="actions">
          {(viewTo || onViewRecord) && (
            <button className="op-btn-line" onClick={() => (onViewRecord ? onViewRecord() : navigate(viewTo))}>
              <Eye size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> {t("operator.viewRecord")}
            </button>
          )}
          <button className="op-btn-solid" onClick={() => navigate("/operator")}>
            <Home size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> {t("operator.backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
