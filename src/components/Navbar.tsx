"use client";

import React, { useEffect, useState } from "react";
import { useSensors } from "../context/SensorContext";
import {
  Radio,
  Play,
  Pause,
  Sun,
  Moon,
  Plus,
  Clock,
  Compass,
  Activity,
  Sliders,
  Database,
  ArrowUp,
  TriangleAlert,
  ArrowDown
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isSimulating, setIsSimulating, sensors, alerts } = useSensors();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [uptime, setUptime] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const navItems = [
    { id: "overview", label: "Operations Room", shortLabel: "Home", icon: Compass },
    { id: "analytics", label: "Analytics", shortLabel: "Analytics", icon: Activity },
    { id: "simulator", label: "Control Center", shortLabel: "Controls", icon: Sliders },
    { id: "alerts", label: "Feeds", shortLabel: "Feeds", icon: Database },
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeCount = sensors.filter((s) => s.status === "online").length;
  const warningsCount = sensors.filter((s) => s.status === "warning").length;
  const lostCount = sensors.filter((s) => s.status === "lost").length;

  return (
    <>
      <nav 
      className={`fixed z-40 transition-all duration-300 flex items-center justify-between px-6 py-3 backdrop-blur-md ${
        scrolled 
          ? "top-4 left-4 right-4 rounded-full border border-border/50 shadow-lg bg-background/60" 
          : "top-0 left-0 right-0 border-b border-border bg-background/80"
      }`}
    >
      {/* Left: Brand & Nav Links */}
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="flex flex-col mr-6">
            <span className="text-sm font-bold leading-none">track&lost</span>
            <span className="text-[10px] text-muted-foreground font-medium">Device Monitor</span>
          </div>
        </Link>

        {/* Shadcnspace-style Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab(item.id);
                  } else {
                    router.push("/");
                  }
                }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted/60 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                  {item.id === "alerts" && alerts.filter((a) => !a.resolved).length > 0 && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-foreground text-background font-bold">
                      {alerts.filter((a) => !a.resolved).length}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Controls & Status */}
      <div className="flex items-center gap-4">
        {/* Status Pills */}
        <div className="hidden lg:flex items-center gap-4 mr-3 text-sm font-bold tabular-nums">
          <div className="flex items-center gap-1.5 text-foreground" title="Live Sensors">
            <ArrowUp size={16} strokeWidth={3} className="text-emerald-500" />
            {activeCount}
          </div>
          <div className="flex items-center gap-1.5 text-foreground" title="Lost Sensors">
            <ArrowDown size={16} strokeWidth={3} className="text-rose-500" />
            {lostCount}
          </div>
          <div className="flex items-center gap-1.5 text-foreground" title="Warning Sensors">
            <TriangleAlert size={16} strokeWidth={3} className="text-amber-500" />
            {warningsCount}
          </div>
          <div className="h-4 w-px bg-border mx-2" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-[11px] font-bold text-foreground tabular-nums tracking-wide shadow-sm">
            <Clock size={12} className="text-muted-foreground" />
            {formatUptime(uptime)}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {pathname !== "/deploy" && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border text-foreground hover:bg-muted"
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause Sim" : "Resume Sim"}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </Button>

          {pathname !== "/deploy" && (
            <Link href="/deploy">
              <Button size="sm" className="h-8 font-bold rounded-lg px-2 sm:px-3 flex items-center gap-1.5">
                <Plus size={14} />
                <span className="hidden sm:inline">Deploy Tracker</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50">
        <nav className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.3)] rounded-[2rem]">
          <div className="flex items-center justify-between px-3 py-3.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveTab) {
                      setActiveTab(item.id);
                    } else {
                      router.push("/");
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center w-full gap-1.5 text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.shortLabel || item.label}</span>
                  {item.id === "alerts" && alerts.filter((a) => !a.resolved).length > 0 && (
                    <span className="absolute top-0 right-3 translate-x-1/2 -translate-y-1/2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1 shadow-sm ring-2 ring-zinc-900">
                      {alerts.filter((a) => !a.resolved).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};
