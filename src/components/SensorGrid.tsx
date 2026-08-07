"use client";

import React, { useState } from "react";
import { useSensors } from "../context/SensorContext";
import { TrackerSensor, SensorType, SensorStatus } from "../lib/sensors";
import {
  Thermometer,
  Zap,
  Battery,
  Navigation,
  ShieldAlert,
  Eye,
  Search,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Filter } from "lucide-react";
interface SensorGridProps {
  onViewDetails: (sensor: TrackerSensor) => void;
  onTroubleshoot: (sensor: TrackerSensor) => void;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ onViewDetails, onTroubleshoot }) => {
  const { sensors, triggerSignalLoss } = useSensors();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Healths");

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case "environmental":
        return <Thermometer size={15} className="text-rose-500" />;
      case "motion":
        return <Zap size={15} className="text-purple-500" />;
      case "asset":
        return <Navigation size={15} className="text-emerald-500" />;
      case "power":
        return <Battery size={15} className="text-blue-500" />;
    }
  };

  const getStatusBadge = (status: SensorStatus, warningText?: string) => {
    switch (status) {
      case "online":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
            <span className="relative flex h-1.5 w-1.5 animate-pulse">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Active
          </span>
        );
      case "warning":
        return (
          <span
            title={warningText}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-semibold truncate max-w-[120px]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            {warningText?.split(":")[0] || "Warning"}
          </span>
        );
      case "lost":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            Offline
          </span>
        );
    }
  };

  // Filter Logic
  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type Filter Logic
    let matchesType = true;
    if (typeFilter !== "All Types") {
      if (typeFilter === "Assets (GPS)") matchesType = sensor.type === "asset";
      else matchesType = sensor.type === typeFilter.toLowerCase();
    }
    
    // Status Filter Logic
    let matchesStatus = true;
    if (statusFilter !== "All Healths") {
      if (statusFilter === "Warnings") matchesStatus = sensor.status === "warning";
      else matchesStatus = sensor.status === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 mt-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search devices by ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border text-foreground h-9 shadow-sm text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground hidden sm:block" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "All Types")}>
              <SelectTrigger className="h-9 w-[150px] bg-background border-border text-foreground text-xs shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="Motion">Motion</SelectItem>
                <SelectItem value="Assets (GPS)">Assets (GPS)</SelectItem>
                <SelectItem value="Power">Power</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "All Healths")}>
            <SelectTrigger className="h-9 w-[130px] bg-background border-border text-foreground text-xs shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All Healths">All Healths</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Warnings">Warnings</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid items */}
      {filteredSensors.length === 0 ? (
        <div className="p-16 rounded-xl bg-muted/20 border border-border border-dashed text-center space-y-2">
          <WifiOff className="mx-auto text-muted-foreground animate-bounce" size={24} />
          <p className="text-sm text-foreground font-semibold">No active trackers match criteria</p>
          <p className="text-xs text-muted-foreground">Adjust filters or check connection simulator.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSensors.map((sensor) => {
              return (
                <motion.div
                  key={sensor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col p-6 rounded-xl bg-card border border-border transition-all duration-200 group relative overflow-hidden shadow-xs hover:shadow-sm"
                >
                  {/* Pulse indicator background inside lost items */}
                  {sensor.status === "lost" && (
                    <div className="absolute inset-0 bg-rose-500/[0.01] pointer-events-none" />
                  )}

                  {/* Header info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-border">
                        {getSensorIcon(sensor.type)}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-foreground group-hover:text-muted-foreground transition-colors leading-tight">
                          {sensor.name}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">
                          {sensor.id}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(sensor.status, sensor.warningReason)}
                  </div>

                  {/* Metrics panel */}
                  <div className="flex-1 space-y-4 text-xs">
                    {/* Metrics values grid */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-border/50 text-xs">
                      {/* Metric 1: Temp */}
                      <div>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">
                          Temperature
                        </span>
                        <span className="text-base font-bold text-foreground tabular-nums">
                          {sensor.status === "lost" ? "—" : `${sensor.metrics.temperature}°C`}
                        </span>
                      </div>

                      {/* Metric 2: Vibration */}
                      <div>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">
                          Vibration
                        </span>
                        <span className="text-base font-bold text-foreground tabular-nums">
                          {sensor.status === "lost" ? "—" : `${sensor.metrics.vibration} g`}
                        </span>
                      </div>
                    </div>

                    {/* Progress meters for battery & location */}
                    <div className="space-y-3.5 mb-4">
                      {/* Battery level */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                          <span>Battery Health</span>
                          <span className={sensor.metrics.battery < 20 ? "text-rose-500 font-bold animate-pulse" : "text-foreground"}>
                            {sensor.status === "lost" ? "0%" : `${sensor.metrics.battery}%`}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              sensor.status === "lost"
                                ? "w-0"
                                : sensor.metrics.battery < 20
                                ? "bg-rose-500"
                                : "bg-foreground"
                            }`}
                            style={{ width: sensor.status === "lost" ? "0%" : `${sensor.metrics.battery}%` }}
                          />
                        </div>
                      </div>

                      {/* Location details */}
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground uppercase tracking-wider">
                        <span>Location</span>
                        <span className="font-semibold text-foreground/85 normal-case">
                          {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions area */}
                  <div className="flex items-center gap-2 pt-2">
                    {sensor.status === "lost" ? (
                      <Button
                        onClick={() => onTroubleshoot(sensor)}
                        className="w-full font-bold"
                      >
                        <ShieldAlert size={14} className="mr-1.5" />
                        Troubleshoot
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onViewDetails(sensor)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          <Eye size={14} className="mr-1.5" />
                          Diagnostics
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Simulate Outage"
                          onClick={() => triggerSignalLoss(sensor.id)}
                          className="border border-border hover:bg-rose-500/10 hover:border-rose-500/20 text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg"
                        >
                          <WifiOff size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
