"use client";

import React, { useEffect, useState } from "react";
import { useSensors } from "../context/SensorContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  Thermometer,
  Battery,
  Zap,
  Gauge
} from "lucide-react";

export const AnalyticsCharts: React.FC = () => {
  const { sensors } = useSensors();
  const [mounted, setMounted] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "vibration" | "battery" | "pressure">("temperature");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground text-sm">
        Initializing Diagnostics...
      </div>
    );
  }

  // Get active sensors
  const activeSensors = sensors.filter((s) => s.status !== "lost");

  // Calculate Overview Stats
  const avgTemp = activeSensors.length
    ? (activeSensors.reduce((acc, s) => acc + s.metrics.temperature, 0) / activeSensors.length).toFixed(1)
    : "N/A";
  const avgBattery = activeSensors.length
    ? Math.round(activeSensors.reduce((acc, s) => acc + s.metrics.battery, 0) / activeSensors.length)
    : 0;
  const maxVibe = activeSensors.length
    ? Math.max(...activeSensors.map((s) => s.metrics.vibration)).toFixed(2)
    : "0.00";
  const lostPercentage = sensors.length
    ? Math.round((sensors.filter((s) => s.status === "lost").length / sensors.length) * 100)
    : 0;

  // Build combined real-time timeline data
  const historyLengths = activeSensors.map((s) => s.history.length);
  const maxHistory = Math.max(...historyLengths, 0);

  const timelineData = Array.from({ length: maxHistory }).map((_, index) => {
    const dataPoint: any = { name: "" };

    activeSensors.forEach((sensor) => {
      const historyItem = sensor.history[index];
      if (historyItem) {
        dataPoint.name = historyItem.timestamp.split(" ")[0]; // short time string
        dataPoint[sensor.name] = historyItem[selectedMetric];
      }
    });

    return dataPoint;
  });

  // Battery bar data
  const batteryData = sensors.map((s) => ({
    name: s.id,
    fullName: s.name,
    battery: s.status === "lost" ? 0 : s.metrics.battery,
    status: s.status,
  }));

  // Vibration load data
  const vibrationData = activeSensors.map((s) => ({
    name: s.id,
    vibration: s.metrics.vibration,
    temperature: s.metrics.temperature,
  }));

  const colors = ["#06b6d4", "#a78bfa", "#f43f5e", "#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#fb7185"];

  return (
    <div className="space-y-6">
      {/* Overview Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Temp */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/30 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest flex items-center gap-1.5">
              <Thermometer size={14} className="text-rose-500" />
              Average Temp
            </span>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight tabular-nums group-hover:text-rose-500 transition-colors duration-300">
                {avgTemp}°C
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Active hardware average</p>
            </div>
          </div>
        </div>

        {/* Card 2: Peak Vibration */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={14} className="text-purple-500" />
              Peak Vibration
            </span>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight tabular-nums group-hover:text-purple-500 transition-colors duration-300">
                {maxVibe}g
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Max structural load</p>
            </div>
          </div>
        </div>

        {/* Card 3: Battery */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest flex items-center gap-1.5">
              <Battery size={14} className="text-emerald-500" />
              Avg Battery
            </span>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight tabular-nums group-hover:text-emerald-500 transition-colors duration-300">
                {avgBattery}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">System cell charge</p>
            </div>
          </div>
        </div>

        {/* Card 4: Lost Rate */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-1.5">
              <Gauge size={14} className="text-cyan-500" />
              Offline Rate
            </span>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight tabular-nums group-hover:text-cyan-500 transition-colors duration-300">
                {lostPercentage}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Ratio of inactive units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Realtime Chart Area */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-6">
        {/* Main Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={18} className="text-muted-foreground" />
              Live Metrics
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time update stream for active devices.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex bg-muted p-1 rounded-lg border border-border self-start text-xs font-semibold">
            {[
              { id: "temperature", label: "Temp", icon: Thermometer, tip: "View temperature telemetry" },
              { id: "vibration", label: "Vibration", icon: Zap, tip: "View structural vibration loads" },
              { id: "battery", label: "Battery", icon: Battery, tip: "View system power and cell charge" },
              { id: "pressure", label: "Pressure", icon: Gauge, tip: "View environmental pressure data" }
            ].map((m) => (
              <button
                key={m.id}
                title={m.tip}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedMetric === m.id
                    ? "bg-card text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <m.icon size={14} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="h-[360px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" domain={selectedMetric === "battery" ? [0, 100] : ["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "12px" }} />
              {activeSensors.map((sensor, i) => {
                const colors = ["#0ea5e9", "#8b5cf6", "#f43f5e", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"];
                const color = colors[i % colors.length];
                return (
                  <Line
                    key={sensor.id}
                    type="monotone"
                    dataKey={sensor.name}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                    animationDuration={300}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of secondary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Battery Distribution */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Battery Comparison</h4>
            <p className="text-xs text-muted-foreground">Current charge capacities per tracking device.</p>
          </div>
          <div className="h-[240px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Battery"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="battery" radius={[4, 4, 0, 0]}>
                  {batteryData.map((entry, index) => {
                    const fill =
                      entry.status === "lost"
                        ? "#ef4444"
                        : entry.battery < 20
                        ? "#f59e0b"
                        : "#10b981";
                    return <Bar key={`cell-${index}`} fill={fill} dataKey="battery" />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Vibration load curve */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Vibration Load Metrics</h4>
            <p className="text-xs text-muted-foreground">Real-time vibration load profile across devices.</p>
          </div>
          <div className="h-[240px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vibrationData}>
                <defs>
                  <linearGradient id="colorVibe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
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
                  dataKey="vibration"
                  stroke="#8b5cf6"
                  strokeOpacity={1}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVibe)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
