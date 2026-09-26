import React from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BiopondProvider } from "./context/BiopondContext.jsx";
import { ProductionLogProvider } from "./context/ProductionLogContext.jsx";
import Landing from "./pages/Landing.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import KnowledgeBasePage from "./pages/KnowledgeBase.jsx";
import KnowledgeBaseArticlePage from "./pages/KnowledgeBaseArticle.jsx";

// ---------- Admin (desktop panel) ----------
import ProtectedRoute from "./admin/ProtectedRoute.jsx";
import PlanGate from "./admin/PlanGate.jsx";
import DashboardLayout from "./admin/components/DashboardLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import Production from "./admin/pages/Production.jsx";
import Sales from "./admin/pages/Sales.jsx";
import CalendarPage from "./admin/pages/CalendarPage.jsx";
import Clients from "./admin/pages/Clients.jsx";
import ClientDetail from "./admin/pages/ClientDetail.jsx";
import Vendors from "./admin/pages/Vendors.jsx";
import Community from "./admin/pages/Community.jsx";
import Reports from "./admin/pages/Reports.jsx";
import Notifications from "./admin/pages/Notifications.jsx";
import Settings from "./admin/pages/Settings.jsx";
import Upgrade from "./admin/pages/Upgrade.jsx";
import PlatformAdmin from "./admin/pages/PlatformAdmin.jsx";
import KnowledgeBaseAdmin from "./admin/pages/KnowledgeBase.jsx";
import PlatformOwnerGate from "./admin/PlatformOwnerGate.jsx";

// ---------- Operator (mobile-first field module) ----------
import OperatorRoute from "./operator/OperatorRoute.jsx";
import OperatorLayout from "./operator/components/OperatorLayout.jsx";
import OperatorHome from "./operator/pages/OperatorHome.jsx";
import OperatorProduction from "./operator/pages/OperatorProduction.jsx";
import BiopondForm from "./operator/pages/BiopondForm.jsx";
import MaggotHarvestForm from "./operator/pages/MaggotHarvestForm.jsx";
import EggHarvestForm from "./operator/pages/EggHarvestForm.jsx";
import KasgotForm from "./operator/pages/KasgotForm.jsx";
import BreederForm from "./operator/pages/BreederForm.jsx";
import FeedForm from "./operator/pages/FeedForm.jsx";
import SalesForm from "./operator/pages/SalesForm.jsx";
import OperatorCalendar from "./operator/pages/OperatorCalendar.jsx";
import OperatorNotifications from "./operator/pages/OperatorNotifications.jsx";
import OperatorProfile from "./operator/pages/OperatorProfile.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BiopondProvider>
          <ProductionLogProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticlePage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="production" element={<Production />} />
                <Route path="sales" element={<Sales />} />
                <Route path="calendar" element={<PlanGate module="Calendar"><CalendarPage /></PlanGate>} />
                <Route path="clients" element={<PlanGate module="Client"><Clients /></PlanGate>} />
                <Route path="clients/:clientId" element={<PlanGate module="Client"><ClientDetail /></PlanGate>} />
                <Route path="vendors" element={<PlanGate module="Vendor"><Vendors /></PlanGate>} />
                <Route path="community" element={<PlanGate module="Community"><Community /></PlanGate>} />
                <Route path="reports" element={<PlanGate module="Report"><Reports /></PlanGate>} />
                <Route path="notifications" element={<PlanGate module="Notification"><Notifications /></PlanGate>} />
                <Route path="settings" element={<PlanGate module="Setting"><Settings /></PlanGate>} />
                <Route path="upgrade" element={<Upgrade />} />
                <Route path="knowledge-base" element={<PlatformOwnerGate><KnowledgeBaseAdmin /></PlatformOwnerGate>} />
                <Route path="platform" element={<PlatformOwnerGate><PlatformAdmin /></PlatformOwnerGate>} />
              </Route>

              <Route
                path="/operator"
                element={
                  <OperatorRoute>
                    <OperatorLayout />
                  </OperatorRoute>
                }
              >
                <Route index element={<OperatorHome />} />
                <Route path="production" element={<OperatorProduction />} />
                <Route path="production/biopond" element={<BiopondForm />} />
                <Route path="production/maggot-harvest" element={<MaggotHarvestForm />} />
                <Route path="production/egg-harvest" element={<EggHarvestForm />} />
                <Route path="production/kasgot" element={<KasgotForm />} />
                <Route path="production/breeder" element={<BreederForm />} />
                <Route path="production/feed" element={<FeedForm />} />
                <Route path="production/sales" element={<SalesForm />} />
                <Route path="calendar" element={<OperatorCalendar />} />
                <Route path="notifications" element={<OperatorNotifications />} />
                <Route path="profile" element={<OperatorProfile />} />
              </Route>
            </Routes>
          </ProductionLogProvider>
        </BiopondProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
