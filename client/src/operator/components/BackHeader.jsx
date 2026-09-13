import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function BackHeader({ title, to = -1 }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="op-back-header">
      <button className="op-back-btn" aria-label={t("operatorNav.back")} onClick={() => (typeof to === "number" ? navigate(to) : navigate(to))}>
        <ArrowLeft size={18} />
      </button>
      <h1>{title}</h1>
    </div>
  );
}
