"use client";

import React, { useState, useEffect } from "react";
import { SensorProvider } from "../context/SensorContext";
import { Navbar } from "../components/Navbar";
import { SensorGrid } from "../components/SensorGrid";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { ControlSimulator } from "../components/ControlSimulator";
import { AlertLogs } from "../components/AlertLogs";
import { SensorDetailModal } from "../components/SensorDetailModal";
import { TrackerSensor } from "../lib/sensors";
import { Compass, Activity, Sliders, Database } from "lucide-react";

export default function Home() {
  return <DashboardContent />;
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedSensor, setSelectedSensor] = useState<TrackerSensor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<"details" | "history" | "map">("details");

  const handleOpenDetails = (sensor: TrackerSensor) => {
    setSelectedSensor(sensor);
    setModalInitialTab("details");
    setIsDetailOpen(true);
  };

  const handleOpenTroubleshoot = (sensor: TrackerSensor) => {
    setSelectedSensor(sensor);
    setModalInitialTab("details"); // Wizard is within the details tab for lost sensors
    setIsDetailOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <SensorGrid
            onViewDetails={handleOpenDetails}
            onTroubleshoot={handleOpenTroubleshoot}
          />
        );
      case "analytics":
        return <AnalyticsCharts />;
      case "simulator":
        return <ControlSimulator />;
      case "alerts":
        return <AlertLogs />;
      default:
        return (
          <SensorGrid
            onViewDetails={handleOpenDetails}
            onTroubleshoot={handleOpenTroubleshoot}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview": return { title: "Operations Room", desc: "Live fleet monitoring and command center." };
      case "analytics": return { title: "System Analytics", desc: "Real-time telemetry and structural load analysis." };
      case "simulator": return { title: "Control Center", desc: "Direct command interface and device management." };
      case "alerts": return { title: "System Feeds", desc: "Security logs, events, and anomaly detection." };
      default: return { title: "Operations Room", desc: "Live fleet monitoring and command center." };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 px-6 pb-6 pt-32 md:px-8 md:pb-8 md:pt-32 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* Dynamic Page Header */}
          <div className="flex flex-col gap-1.5 pb-6 border-b border-border/50">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{desc}</p>
          </div>

          {renderTabContent()}
        </div>
      </main>

      {/* Unified Diagnostic / Recovery Modal */}
      <SensorDetailModal
        sensor={selectedSensor}
        isOpen={isDetailOpen}
        initialTab={modalInitialTab}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSensor(null);
        }}
      />
    </div>
  );
}
