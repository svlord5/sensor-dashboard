"use client";

import React, { useState } from "react";
import { useSensors } from "../context/SensorContext";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Check,
  Search,
  Database,
  XOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export const AlertLogs: React.FC = () => {
  const { alerts, acknowledgeAlert, clearAlerts } = useSensors();
  const [searchTerm, setSearchTerm] = useState("");

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return <Info size={14} className="text-cyan-600 dark:text-cyan-400" />;
      case "warning":
        return <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />;
      case "error":
        return <XOctagon size={14} className="text-rose-600 dark:text-rose-400" />;
      case "success":
        return <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Info size={14} className="text-muted-foreground" />;
    }
  };

  const getSeverityStyle = (severity: string, resolved: boolean) => {
    if (resolved) {
      return "bg-muted/10 border-border text-muted-foreground opacity-55";
    }

    switch (severity) {
      case "info":
        return "bg-cyan-500/[0.02] border-border text-cyan-700 dark:text-cyan-300";
      case "warning":
        return "bg-amber-500/[0.02] border-border text-amber-700 dark:text-amber-300";
      case "error":
        return "bg-rose-500/[0.02] border-border text-rose-700 dark:text-rose-300";
      case "success":
        return "bg-emerald-500/[0.02] border-border text-emerald-700 dark:text-emerald-300";
      default:
        return "bg-muted/30 border-border text-foreground";
    }
  };

  const filteredAlerts = alerts.filter(
    (a) =>
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.trackerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.trackerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Filter system feeds by device, id, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/30 border border-border text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-ring/30 focus:ring-1 focus:ring-ring/10 font-sans"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearAlerts}
          disabled={alerts.length === 0}
          className="border-border text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto rounded-lg"
        >
          <Trash2 size={12} />
          Clear Activity Log
        </Button>
      </div>

      {/* Alert Feed Items */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {filteredAlerts.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground space-y-2">
            <Database size={24} className="mx-auto text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground/80">No active system events</p>
            <p className="text-xs text-muted-foreground">Incoming alerts will stream here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[520px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 flex items-start gap-4 border-l-2 transition-all text-xs ${getSeverityStyle(
                    alert.severity,
                    alert.resolved
                  )}`}
                  style={{
                    borderLeftColor: alert.resolved
                      ? "var(--border)"
                      : alert.severity === "error"
                      ? "#f43f5e"
                      : alert.severity === "warning"
                      ? "#eab308"
                      : alert.severity === "success"
                      ? "#10b981"
                      : "#06b6d4",
                  }}
                >
                  {/* Icon */}
                  <div className="pt-0.5 shrink-0">{getAlertIcon(alert.severity)}</div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px]">
                      <span className="font-semibold text-muted-foreground">{alert.timestamp}</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="font-semibold text-foreground/80">{alert.trackerId}</span>
                      <span className="text-muted-foreground">({alert.trackerName})</span>
                    </div>
                    <p className={`text-foreground/90 leading-relaxed ${alert.resolved ? "line-through text-muted-foreground" : ""}`}>
                      {alert.message}
                    </p>
                  </div>

                  {/* Action */}
                  {!alert.resolved && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="shrink-0 p-1.5 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Acknowledge Alert"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
