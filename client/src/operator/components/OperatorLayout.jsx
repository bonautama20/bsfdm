import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, Layers, CalendarDays, Bell } from "lucide-react";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import "../operator.css";

const navItems = [
  { to: "/operator", key: "operatorNav.home", icon: Home, end: true },
  { to: "/operator/production", key: "operatorNav.production", icon: Layers },
  { to: "/operator/calendar", key: "operatorNav.calendar", icon: CalendarDays },
  { to: "/operator/notifications", key: "operatorNav.notifications", icon: Bell },
];

export default function OperatorLayout() {
  const { unreadCount } = useProductionLog();
  const { t } = useLanguage();

  return (
    <div className="op">
      <div className="op-shell">
        <Outlet />
        <nav className="op-bottom-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `op-nav-item${isActive ? " active" : ""}`}
            >
              <item.icon size={21} />
              {item.key === "operatorNav.notifications" && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
