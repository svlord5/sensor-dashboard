"use client";

import React, { useState, useEffect } from "react";
import { SensorProvider } from "../context/SensorContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center font-mono text-xs">
        Initializing operational telemetry links...
      </div>
    );
  }

  return <SensorProvider>{children}</SensorProvider>;
}
