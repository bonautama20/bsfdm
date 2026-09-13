import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Layers, CalendarDays, Building2, Handshake, FileBarChart2,
  Bell, Settings, ChevronLeft, Users, Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { ROUTE_MODULES, isModuleLocked } from "../../data/planModules.js";

const navItems = [
  { to: "/dashboard", key: "sidebar.dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/production", key: "sidebar.production", icon: Layers },
  { to: "/dashboard/calendar", key: "sidebar.calendar", icon: CalendarDays },
  { to: "/dashboard/clients", key: "sidebar.client", icon: Building2 },
  { to: "/dashboard/vendors", key: "sidebar.vendor", icon: Handshake },
  { to: "/dashboard/community", key: "sidebar.community", icon: Users },
  { to: "/dashboard/reports", key: "sidebar.report", icon: FileBarChart2 },
  { to: "/dashboard/notifications", key: "sidebar.notification", icon: Bell },
  { to: "/dashboard/settings", key: "sidebar.setting", icon: Settings },
];

const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function Sidebar({ collapsed, onToggle }) {
  const { session } = useAuth();
  const { t } = useLanguage();
  const plan = session?.organization?.plan;

  return (
    <aside className="db-sidebar">
      <div className="db-collapse-btn" onClick={onToggle} role="button" aria-label="Toggle sidebar">
        <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </div>

      <div className="db-sidebar-top">
        <svg className="mark" viewBox="0 0 40 40" fill="none">
          <polygon points="20,3 34.6,11.5 34.6,28.5 20,37 5.4,28.5 5.4,11.5" fill="#E36B14" />
        </svg>
        <div>
          <div className="name">BSFDM</div>
          <span className="sub">{t("sidebar.farmManagement")}</span>
        </div>
      </div>

      <nav className="db-nav">
        {navItems.map((item) => {
          const locked = isModuleLocked(ROUTE_MODULES[item.to], plan);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `db-nav-item${isActive ? " active" : ""}${locked ? " locked" : ""}`}
              title={locked ? t("plan.lockedTooltip") : t(item.key)}
            >
              <item.icon size={19} />
              <span>{t(item.key)}</span>
              {locked && <Lock size={13} className="lock-ic" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="db-sidebar-bottom">
        <div className="db-profile">
          <div className="db-avatar">{initials(session?.user?.name || "Farm Manager")}</div>
          <div className="db-profile-meta">
            <div className="n">{session?.user?.name || "Farm Manager"}</div>
            <div className="r">{session?.role?.name || "Super Admin"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
