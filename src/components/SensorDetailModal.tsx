"use client";

import React, { useState, useEffect } from "react";
import { TrackerSensor } from "../lib/sensors";
import { useSensors } from "../context/SensorContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { SlideToConfirmButton } from "./ui/slide-to-confirm-button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  Thermometer,
  Zap,
  Battery,
  ShieldAlert,
  Clock,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Activity,
  MapPin,
  Tag,
  WifiOff
} from "lucide-react";
import confetti from "canvas-confetti";

interface SensorDetailModalProps {
  sensor: TrackerSensor | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "details" | "history" | "map";
}

export const SensorDetailModal: React.FC<SensorDetailModalProps> = ({
  sensor,
  isOpen,
  onClose,
  initialTab = "details"
}) => {
  const { reconnectSensor, triggerSignalLoss } = useSensors();
  const [activeSubTab, setActiveSubTab] = useState<"details" | "history" | "map">(initialTab);

  // Troubleshooting Wizard State
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [wizardProgress, setWizardProgress] = useState<string>("");
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSubTab(initialTab);
      setWizardStep(0);
      setIsReconnecting(false);
      setWizardProgress("");
    }
  }, [isOpen, initialTab]);

  if (!sensor) return null;

  const handleStartTroubleshoot = async () => {
    setIsReconnecting(true);
    try {
      await reconnectSensor(sensor.id, (step) => {
        setWizardStep(step);
        switch (step) {
          case 1:
            setWizardProgress("Pinging remote transceiver...");
            break;
          case 2:
            setWizardProgress("Rebooting firmware components...");
            break;
          case 3:
            setWizardProgress("Establishing handshake key...");
            break;
          case 4:
            setWizardProgress("Connection restored successfully!");
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#fafafa", "#a1a1aa", "#18181b"],
            });
            break;
        }
      });
    } catch (err) {
      setWizardProgress("Diagnostics failed. Retry connection.");
      setIsReconnecting(false);
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case "environmental":
        return "#f43f5e"; // rose
      case "motion":
        return "#a78bfa"; // purple
      case "asset":
        return "#10b981"; // emerald
      case "power":
        return "#3b82f6"; // blue
      default:
        return "#06b6d4";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-[650px] bg-card border border-border text-foreground p-6 shadow-xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <DialogTitle className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
                {sensor.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  {sensor.id}
                </span>
                {sensor.status === "lost" && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Offline
                  </span>
                )}
                {sensor.status === "warning" && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Warning
                  </span>
                )}
                {sensor.status === "online" && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-md border border-border shadow-sm">
                <Tag size={12} /> {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor
              </span>
            </div>
          </div>

          {/* Dialog Tabs */}
          <div className="flex bg-muted p-1 rounded-lg border border-border self-start mt-4 text-[10px] font-bold">
            <button
              onClick={() => setActiveSubTab("details")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === "details"
                  ? "bg-card text-foreground border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Cpu size={12} />
              Diagnostics
            </button>
            <button
              onClick={() => setActiveSubTab("history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === "history"
                  ? "bg-card text-foreground border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Activity size={12} />
              History
            </button>
            <button
              onClick={() => setActiveSubTab("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === "map"
                  ? "bg-card text-foreground border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <MapPin size={12} />
              Location
            </button>
          </div>
        </DialogHeader>

        {/* Tab Content 1: Details / Diagnostics */}
        {activeSubTab === "details" && (
          <div className="py-4 space-y-4">
            {sensor.status === "lost" ? (
              // Lost Diagnostic Wizard
              <div className="p-5 rounded-xl bg-rose-500/[0.02] border border-rose-500/20 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5 animate-pulse" size={18} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-rose-500">Connection Dropped</h4>
                    <p className="text-xs text-muted-foreground">
                      Reason: <span className="text-rose-500 font-semibold">{sensor.lostReason || "Signal loss detected"}</span>
                    </p>
                  </div>
                </div>

                {/* Wizard Steps UI */}
                {wizardStep > 0 && (
                  <div className="space-y-3 text-[11px] bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-1.5">
                      <span>Reconnection sequence</span>
                      <span className="text-foreground font-bold">Step {wizardStep}/4</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                          wizardStep >= 1 ? "bg-foreground text-background border-transparent font-bold" : "bg-muted text-muted-foreground border-border"
                        }`}>
                          1
                        </span>
                        <span className={wizardStep === 1 ? "text-foreground font-semibold" : wizardStep > 1 ? "text-muted-foreground line-through" : "text-muted-foreground/60"}>
                          Ping receiver antenna
                        </span>
                        {wizardStep === 1 && <RefreshCw size={10} className="animate-spin text-muted-foreground" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                          wizardStep >= 2 ? "bg-foreground text-background border-transparent font-bold" : "bg-muted text-muted-foreground border-border"
                        }`}>
                          2
                        </span>
                        <span className={wizardStep === 2 ? "text-foreground font-semibold" : wizardStep > 2 ? "text-muted-foreground line-through" : "text-muted-foreground/60"}>
                          Reboot firmware caps
                        </span>
                        {wizardStep === 2 && <RefreshCw size={10} className="animate-spin text-muted-foreground" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                          wizardStep >= 3 ? "bg-foreground text-background border-transparent font-bold" : "bg-muted text-muted-foreground border-border"
                        }`}>
                          3
                        </span>
                        <span className={wizardStep === 3 ? "text-foreground font-semibold" : wizardStep > 3 ? "text-muted-foreground line-through" : "text-muted-foreground/60"}>
                          Handshake connection
                        </span>
                        {wizardStep === 3 && <RefreshCw size={10} className="animate-spin text-muted-foreground" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                          wizardStep >= 4 ? "bg-emerald-500 text-white border-transparent font-bold" : "bg-muted text-muted-foreground border-border"
                        }`}>
                          ✓
                        </span>
                        <span className={wizardStep === 4 ? "text-emerald-500 font-bold animate-pulse" : "text-muted-foreground/60"}>
                          Handshake established!
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground mt-2 bg-card p-2 rounded border border-border">
                      Status: {wizardProgress}
                    </div>
                  </div>
                )}

                {/* Controls */}
                {wizardStep === 0 && (
                  <div className="pt-2 flex justify-center">
                    <SlideToConfirmButton
                      label="Slide to restore connection"
                      confirmedLabel="Restoring..."
                      onConfirm={handleStartTroubleshoot}
                    />
                  </div>
                )}

                {wizardStep === 4 && (
                  <Button
                    onClick={onClose}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold border border-transparent"
                  >
                    <CheckCircle className="mr-1.5" size={16} />
                    Complete
                  </Button>
                )}
              </div>
            ) : (
              // Active Sensor Details
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">LAST PING</span>
                    <p className="text-foreground font-semibold">{sensor.lastSeen}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">DEVICE HEALTH</span>
                    <p className={`font-semibold ${sensor.status === "warning" ? "text-amber-500" : "text-emerald-500"}`}>
                      {sensor.status === "warning" ? sensor.warningReason || "Warning Active" : "100% Operational"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold border-b border-border pb-1.5">
                    Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="font-semibold text-foreground/80 font-mono">0xEF{sensor.id.split("-")[1]}A2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency Band:</span>
                      <span className="font-semibold text-foreground/80">915.2 MHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <span className="font-semibold text-foreground/80">AES-256-GCM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firmware:</span>
                      <span className="font-semibold text-foreground/80">v3.4.12</span>
                    </div>
                  </div>
                </div>

                {/* Force Outage trigger */}
                <div className="pt-4 flex justify-center w-full">
                  <SlideToConfirmButton
                    label="Slide to force disconnect"
                    confirmedLabel="Disconnected"
                    onConfirm={() => {
                      triggerSignalLoss(sensor.id);
                      onClose();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: History graphs */}
        {activeSubTab === "history" && (
          <div className="py-4 space-y-4">
            <div className="text-xs text-muted-foreground leading-normal mb-2">
              Telemetric history graph mapping the last 10 packet transmissions of {sensor.name}.
            </div>

            {/* Area chart mapping temperature */}
            <div className="h-64 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensor.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getMetricColor(sensor.type)} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={getMetricColor(sensor.type)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="var(--muted-foreground)" tickFormatter={(t) => t.split(" ")[0]} />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke={getMetricColor(sensor.type)}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMetric)"
                  />
                  <Area
                    type="monotone"
                    dataKey="vibration"
                    name="Vibration (g)"
                    stroke="#c084fc"
                    strokeWidth={1.5}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab Content 3: Locator Map SVG */}
        {activeSubTab === "map" && (
          <div className="py-4 space-y-4">
            <div className="text-xs text-muted-foreground">
              Coordinates: {sensor.location.lat.toFixed(6)} N, {sensor.location.lng.toFixed(6)} W.
            </div>

            {/* Schematic SVG Map */}
            <div className="relative aspect-square w-full max-h-[300px] mx-auto bg-muted/20 border border-border rounded-xl overflow-hidden flex items-center justify-center">
              {/* Radar circular guidelines */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-border/60" />
              <div className="absolute w-[50%] h-[50%] rounded-full border border-border/40" />
              <div className="absolute w-[20%] h-[20%] rounded-full border border-border/20" />

              {/* Grid cross lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-border/30" />
                <div className="absolute h-full w-[1px] bg-border/30" />
              </div>

              {/* Center server node */}
              <div className="absolute w-2 h-2 rounded-full bg-foreground shadow-xs z-10" />

              {/* Pulsing Beacon Dot relative to coordinates */}
              {(() => {
                const centerLat = 40.758896;
                const centerLng = -73.985130;
                const scale = 4000;

                const xOffset = (sensor.location.lng - centerLng) * scale;
                const yOffset = -(sensor.location.lat - centerLat) * scale;

                const clampedX = Math.max(-45, Math.min(45, xOffset * 100));
                const clampedY = Math.max(-45, Math.min(45, yOffset * 100));

                const colorClass =
                  sensor.status === "lost"
                    ? "bg-rose-500 shadow-rose-500/50 border-rose-400"
                    : sensor.status === "warning"
                    ? "bg-amber-500 shadow-amber-500/50 border-amber-400"
                    : "bg-emerald-500 shadow-emerald-500/50 border-emerald-400";

                return (
                  <div
                    className="absolute"
                    style={{
                      left: `calc(50% + ${clampedX}%)`,
                      top: `calc(50% + ${clampedY}%)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Compass direction bearing arrow */}
                    {sensor.status !== "lost" && (
                      <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-muted-foreground/80 transition-transform duration-300"
                        style={{ transform: `translateX(-50%) rotate(${sensor.location.bearing}deg)` }}
                      >
                        <Navigation size={10} fill="currentColor" />
                      </div>
                    )}

                    {/* Radar ping rings */}
                    <span className="relative flex h-4.5 w-4.5 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                        sensor.status === "lost" ? "bg-rose-500" : sensor.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-slate-950 ${colorClass}`} />
                    </span>

                    {/* Label */}
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-card border border-border text-[8px] whitespace-nowrap text-muted-foreground">
                      {sensor.id}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <Button
            onClick={onClose}
            size="sm"
            className="w-full md:w-auto border border-border bg-card hover:bg-muted text-foreground shadow-none"
          >
            Close Panel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
