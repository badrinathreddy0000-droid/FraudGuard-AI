import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import PredictPage from "./pages/PredictPage";
import BatchPage from "./pages/BatchPage";
import ModelLabPage from "./pages/ModelLabPage";
import TransactionsPage from "./pages/TransactionsPage";
import RulesPage from "./pages/RulesPage";
import SystemStatusPage from "./pages/SystemStatusPage";
import api from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState({ username: "analyst", role: "analyst", email: "analyst@fraudguard.ai" });
  const [activeModel, setActiveModel] = useState("Class-weighted LightGBM");
  const [systemOnline, setSystemOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check health and active model on mount
  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      await api.getHealth();
      setSystemOnline(true);
      const res = await api.getActiveModel();
      if (res.data?.active_model) {
        setActiveModel(res.data.active_model);
      }
    } catch (e) {
      setSystemOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return { title: "Executive Operations Overview", subtitle: "Real-time transaction risk scoring & enterprise telemetry" };
      case "predict":
        return { title: "Real-Time Transaction Inspector", subtitle: "Instant LightGBM scoring & local feature attribution" };
      case "batch":
        return { title: "Bulk CSV Evaluation Console", subtitle: "Process batches of IEEE-CIS transactions with automated triage" };
      case "lab":
        return { title: "Class Imbalance Research Lab", subtitle: "Direct benchmark comparison from your IEEE-CIS Colab notebook" };
      case "transactions":
        return { title: "Investigation & Audit Ledger", subtitle: "Investigate flagged anomalies and submit analyst override decisions" };
      case "rules":
        return { title: "Rules Engine & Risk Thresholds", subtitle: "Configure heuristic safety rails and decision boundaries" };
      case "system":
        return { title: "System Environment & Dataset Verification", subtitle: "Validate notebook preservation, paths, and Kaggle dataset configuration" };
      default:
        return { title: "FraudGuard AI", subtitle: "Enterprise Risk Detection" };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        systemOnline={systemOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={title}
          subtitle={subtitle}
          onRefresh={checkStatus}
          isRefreshing={isRefreshing}
          activeModel={activeModel}
        />

        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === "predict" && <PredictPage />}
          {activeTab === "batch" && <BatchPage />}
          {activeTab === "lab" && <ModelLabPage onActiveModelChange={setActiveModel} />}
          {activeTab === "transactions" && <TransactionsPage />}
          {activeTab === "rules" && <RulesPage />}
          {activeTab === "system" && <SystemStatusPage />}
        </main>
      </div>
    </div>
  );
}
