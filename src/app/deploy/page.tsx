"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useSensors } from "../../context/SensorContext";
import { SensorType } from "../../lib/sensors";
import { Cpu, Thermometer, ShieldAlert, Battery, ArrowLeft, Zap, Navigation, Signal, Radio, Terminal, Sliders } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Slider } from "../../components/ui/slider";

export default function DeployPage() {
  const router = useRouter();
  const { addSensor } = useSensors();

  const [name, setName] = useState("");
  const [type, setType] = useState<SensorType>("environmental");
  const [temp, setTemp] = useState<number | string>(20);
  const [vibration, setVibration] = useState<number | string>(0.2);
  const [battery, setBattery] = useState<number | string>(100);
  const [mockId, setMockId] = useState("");

  useEffect(() => {
    // Generate a mock ID just for the preview
    setMockId(`SN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  }, []);

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSensor(name, type, Number(temp) || 0, Number(vibration) || 0, Number(battery) || 0);
    router.push("/");
  };

  const getTypeIcon = (t: SensorType) => {
    switch (t) {
      case "environmental": return <Thermometer size={32} className="text-rose-500" />;
      case "motion": return <Zap size={32} className="text-purple-500" />;
      case "asset": return <Navigation size={32} className="text-emerald-500" />;
      case "power": return <Battery size={32} className="text-blue-500" />;
    }
  };

  const getTypeName = (t: SensorType) => {
    switch (t) {
      case "environmental": return "Environmental Node";
      case "motion": return "Motion Tracker";
      case "asset": return "GPS Asset Beacon";
      case "power": return "Power Monitor";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 flex items-center justify-center pt-24 pb-12">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          
          {/* LEFT: PREVIEW PANE */}
          <div className="md:w-5/12 flex flex-col relative w-full pt-12">
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs mb-6">
              <Signal size={14} className="text-emerald-500" />
              Preview
            </div>

            <div className="w-full">
              {/* Preview Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {getTypeIcon(type)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground leading-tight">
                        {name || "Unnamed Device"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{mockId}</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Ready
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-medium mb-1">Temp</div>
                    <div className="text-sm font-semibold">{Number(temp) || 0}°C</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-medium mb-1">Vibe</div>
                    <div className="text-sm font-semibold">{(Number(vibration) || 0).toFixed(2)}g</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-medium mb-1">Battery</div>
                    <div className="text-sm font-semibold text-emerald-500">{Number(battery) || 0}%</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-between text-[11px] text-muted-foreground">
                  <span>{getTypeName(type)}</span>
                  <span className="font-mono">192.168.1.xxx</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONFIGURATION FORM */}
          <div className="md:w-7/12 w-full">
            <div className="mb-8">
              <button 
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Initialize Beacon
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                Configure a new hardware tracking node. This device will instantly appear on the operations dashboard upon launch.
              </p>
            </div>

            <form id="deploy-form" onSubmit={handleDeploy} className="space-y-8">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Device Descriptor
                  </label>
                  <Input
                    required
                    placeholder="e.g. Area 51 Perimeter Sensor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Sensor Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["environmental", "motion", "asset", "power"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          type === t 
                            ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary" 
                            : "bg-card border-border text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className={type === t ? "text-primary" : "text-muted-foreground"}>
                          {t === "environmental" && <Thermometer size={18} />}
                          {t === "motion" && <Zap size={18} />}
                          {t === "asset" && <Navigation size={18} />}
                          {t === "power" && <Battery size={18} />}
                        </div>
                        <div className="text-sm font-medium">
                          {getTypeName(t).split(" ")[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Initial Calibration</h3>

                {/* Temperature */}
                <div className="flex gap-4 md:gap-6 items-start p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-1">
                    <Thermometer size={18} className="text-rose-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Target Temperature</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          value={temp ?? ""} 
                          onChange={(e) => setTemp(e.target.value.replace(/[^0-9.-]/g, ''))} 
                          className="w-20 h-8 text-right font-mono text-sm bg-background"
                        />
                        <span className="text-sm text-muted-foreground font-medium w-4">°C</span>
                      </div>
                    </div>
                    <Slider min={-80} max={80} step={1} value={isNaN(Number(temp)) ? 0 : Number(temp)} onValueChange={(val: any) => setTemp(val)} className="py-2 cursor-pointer" />
                  </div>
                </div>

                {/* Vibration */}
                <div className="flex gap-4 md:gap-6 items-start p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-1">
                    <ShieldAlert size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Baseline Vibration</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          value={vibration ?? ""} 
                          onChange={(e) => setVibration(e.target.value.replace(/[^0-9.-]/g, ''))} 
                          className="w-20 h-8 text-right font-mono text-sm bg-background"
                        />
                        <span className="text-sm text-muted-foreground font-medium w-4">g</span>
                      </div>
                    </div>
                    <Slider min={0.01} max={3.0} step={0.05} value={isNaN(Number(vibration)) ? 0 : Number(vibration)} onValueChange={(val: any) => setVibration(val)} className="py-2 cursor-pointer" />
                  </div>
                </div>

                {/* Battery */}
                <div className="flex gap-4 md:gap-6 items-start p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                    <Battery size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Battery Initialization</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="text" 
                          inputMode="decimal"
                          value={battery ?? ""} 
                          onChange={(e) => setBattery(e.target.value.replace(/[^0-9.-]/g, ''))} 
                          className="w-20 h-8 text-right font-mono text-sm bg-background"
                        />
                        <span className="text-sm text-muted-foreground font-medium w-4">%</span>
                      </div>
                    </div>
                    <Slider min={5} max={100} step={1} value={isNaN(Number(battery)) ? 0 : Number(battery)} onValueChange={(val: any) => setBattery(val)} className="py-2 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="px-6">
                  Cancel
                </Button>
                <Button type="submit" form="deploy-form" className="px-8">
                  Launch Beacon
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
