"use client";

import React from "react";
import { useSensors } from "../context/SensorContext";
import { Slider } from "./ui/slider";
import { SlideToConfirmButton } from "./ui/slide-to-confirm-button";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import {
  Sliders,
  Flame,
  Activity,
  AlertTriangle,
  Power,
  Zap,
  TrendingDown
} from "lucide-react";

export const ControlSimulator: React.FC = () => {
  const {
    sensors,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    tempWarningThreshold,
    setTempWarningThreshold,
    vibrateWarningThreshold,
    setVibrateWarningThreshold,
    triggerSignalLoss,
  } = useSensors();

  const handleRandomSignalLoss = () => {
    const onlineSensors = sensors.filter((s) => s.status !== "lost");
    if (onlineSensors.length === 0) return;
    const randomSensor = onlineSensors[Math.floor(Math.random() * onlineSensors.length)];
    triggerSignalLoss(randomSensor.id);
  };

  const getSpeedLabel = (ms: number) => {
    if (ms <= 500) return "0.5s (Fast)";
    if (ms <= 1000) return "1.0s";
    if (ms <= 1500) return "1.5s (Normal)";
    if (ms <= 3000) return "3.0s";
    return "5.0s (Slow)";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Sim Speed & General Controls */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders size={16} className="text-muted-foreground" />
            Simulation Clock
          </h3>
          <p className="text-xs text-muted-foreground">
            Control the interval frequency for environmental updates.
          </p>
        </div>

        {/* Sim toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-border">
          <span className="text-xs text-foreground font-semibold flex items-center gap-1.5">
            <Power size={14} className={isSimulating ? "text-emerald-500 animate-pulse" : "text-muted-foreground"} />
            Simulator Active
          </span>
          <Switch checked={isSimulating} onCheckedChange={setIsSimulating} />
        </div>

        {/* Speed Slider */}
        <div className="space-y-3 p-3.5 rounded-lg bg-muted/20 border border-border">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Update frequency</span>
            <span className="text-cyan-500 font-bold">{getSpeedLabel(simulationSpeed)}</span>
          </div>
          <Slider
            min={500}
            max={5000}
            step={500}
            value={simulationSpeed}
            onValueChange={(val: any) => setSimulationSpeed(val)}
            className="py-1 cursor-pointer"
          />
          <p className="text-[10px] text-muted-foreground">
            Adjusting this scales update speed and live dashboard drift animations.
          </p>
        </div>
      </div>

      {/* Column 2: Warning Thresholds */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Alert Thresholds
          </h3>
          <p className="text-xs text-muted-foreground">
            Modify trigger limits. Exceeding thresholds triggers warnings.
          </p>
        </div>

        {/* Temp Warning Slider */}
        <div className="space-y-3 p-3.5 rounded-lg bg-muted/20 border border-border">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-rose-500" />
              Temperature Bound
            </span>
            <span className="text-rose-500 font-bold">{tempWarningThreshold}°C</span>
          </div>
          <Slider
            min={30}
            max={80}
            step={1}
            value={tempWarningThreshold}
            onValueChange={(val: any) => setTempWarningThreshold(val)}
            className="py-1 cursor-pointer"
          />
        </div>

        {/* Vibration Warning Slider */}
        <div className="space-y-3 p-3.5 rounded-lg bg-muted/20 border border-border">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Activity size={12} className="text-purple-500" />
              Vibration Limit
            </span>
            <span className="text-purple-500 font-bold">{vibrateWarningThreshold}g</span>
          </div>
          <Slider
            min={0.5}
            max={3.0}
            step={0.1}
            value={vibrateWarningThreshold}
            onValueChange={(val: any) => setVibrateWarningThreshold(val)}
            className="py-1 cursor-pointer"
          />
        </div>
      </div>

      {/* Column 3: Manual Disruption Injector */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap size={16} className="text-rose-500 animate-pulse" />
            Outage Simulation
          </h3>
          <p className="text-xs text-muted-foreground">
            Simulate connections failures for dashboard testing.
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          <div className="flex justify-center w-full">
            <SlideToConfirmButton
              label="Slide to simulate outage"
              confirmedLabel="Disconnecting..."
              onConfirm={handleRandomSignalLoss}
              className="w-full"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border text-[10px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground/80 uppercase">Simulator Helper:</p>
            <p>1. Simulates packet loss on a random active device tracker.</p>
            <p>2. The device transitions to the "Offline" state.</p>
            <p>3. Allows testing the recovery flow to restore signal connection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
