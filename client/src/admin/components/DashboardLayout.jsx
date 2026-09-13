import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "../dashboard.css";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`db db-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      onClick={(e) => { if (mobileOpen && e.target.classList.contains("db-shell")) setMobileOpen(false); }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="db-main">
        <Header onMenuToggle={() => setMobileOpen((o) => !o)} />
        <div className="db-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
