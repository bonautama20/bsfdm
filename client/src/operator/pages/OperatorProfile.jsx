import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const initials = (name = "") => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function OperatorProfile() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <BackHeader title={t("operatorHome.profile")} to="/operator" />
      <div className="op-content">
        <div className="op-profile-card">
          <div className="op-avatar">{initials(session?.user?.name || "Operator")}</div>
          <h2>{session?.user?.name || "Operator"}</h2>
          <div className="email">{session?.user?.email}</div>
        </div>

        <div>
          <div className="op-profile-row"><span className="l">{t("operatorProfile.role")}</span><span className="v">{session?.role?.name || "Operator"}</span></div>
          <div className="op-profile-row"><span className="l">{t("common.status")}</span><span className="v">{t(`status.${session?.user?.status || "Active"}`)}</span></div>
          <div className="op-profile-row"><span className="l">{t("operatorProfile.employeeId")}</span><span className="v">{session?.user?.id || "—"}</span></div>
        </div>

        <button className="op-logout-btn" onClick={handleLogout}>
          <LogOut size={17} /> {t("operatorProfile.logout")}
        </button>
      </div>
    </>
  );
}
