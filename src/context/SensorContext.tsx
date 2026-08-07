"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  TrackerSensor,
  AlertLog,
  INITIAL_SENSORS,
  updateSensorData,
  SensorType,
  SensorStatus
} from "../lib/sensors";

interface SensorContextType {
  sensors: TrackerSensor[];
  alerts: AlertLog[];
  isSimulating: boolean;
  simulationSpeed: number; // in ms
  tempWarningThreshold: number;
  vibrateWarningThreshold: number;
  setSimulationSpeed: (speed: number) => void;
  setIsSimulating: (sim: boolean) => void;
  setTempWarningThreshold: (temp: number) => void;
  setVibrateWarningThreshold: (vib: number) => void;
  triggerSignalLoss: (id: string) => void;
  reconnectSensor: (id: string, stepCallback?: (step: number) => void) => Promise<boolean>;
  addSensor: (name: string, type: SensorType, temp: number, vibration: number, battery: number) => void;
  clearAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensors, setSensors] = useState<TrackerSensor[]>(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<AlertLog[]>([
    {
      id: "alert-init-1",
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
      trackerId: "TRK-08",
      trackerName: "Port Cargo Pallet Beta",
      severity: "error",
      message: "Connection Offline: Voltage collapse / zero-battery cutoff",
      resolved: false,
    },
    {
      id: "alert-init-2",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      trackerId: "TRK-04",
      trackerName: "Cryo Storage Tank B",
      severity: "warning",
      message: "Battery level critical: 15% capacity remaining.",
      resolved: false,
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1500); // 1.5 seconds default
  const [tempWarningThreshold, setTempWarningThreshold] = useState(60);
  const [vibrateWarningThreshold, setVibrateWarningThreshold] = useState(1.8);

  const isSimulatingRef = useRef(isSimulating);
  const simulationSpeedRef = useRef(simulationSpeed);
  const tempThresholdRef = useRef(tempWarningThreshold);
  const vibrateThresholdRef = useRef(vibrateWarningThreshold);

  // Sync refs to avoid interval resetting
  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  useEffect(() => {
    simulationSpeedRef.current = simulationSpeed;
  }, [simulationSpeed]);

  useEffect(() => {
    tempThresholdRef.current = tempWarningThreshold;
  }, [tempWarningThreshold]);

  useEffect(() => {
    vibrateThresholdRef.current = vibrateWarningThreshold;
  }, [vibrateWarningThreshold]);

  // Main simulation loop
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const runLoop = () => {
      if (isSimulatingRef.current) {
        setSensors((prevSensors) => {
          const newAlertsList: AlertLog[] = [];
          const updated = prevSensors.map((sensor) => {
            const { updatedSensor, newAlert } = updateSensorData(
              sensor,
              tempThresholdRef.current,
              vibrateThresholdRef.current
            );
            if (newAlert) {
              newAlertsList.push({
                ...newAlert,
                id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toLocaleTimeString(),
              });
            }
            return updatedSensor;
          });

          if (newAlertsList.length > 0) {
            setAlerts((prevAlerts) => [
              ...newAlertsList,
              ...prevAlerts
            ].slice(0, 100)); // Cap logs at 100 entries
          }

          return updated;
        });
      }
      timerId = setTimeout(runLoop, simulationSpeedRef.current);
    };

    timerId = setTimeout(runLoop, simulationSpeedRef.current);
    return () => clearTimeout(timerId);
  }, []);

  // Trigger manual tracker signal outage
  const triggerSignalLoss = (id: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated: TrackerSensor = {
            ...s,
            status: "lost",
            lostReason: "Manual override: signal jammed or beacon deactivated",
          };

          const newAlert: AlertLog = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toLocaleTimeString(),
            trackerId: s.id,
            trackerName: s.name,
            severity: "error",
            message: `Emergency: Tracker connection severed by manual command.`,
            resolved: false,
          };
          setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
          return updated;
        }
        return s;
      })
    );
  };

  // Reconnect a tracker via diagnostic steps
  const reconnectSensor = async (id: string, stepCallback?: (step: number) => void): Promise<boolean> => {
    // Step 1: Ping RF Antenna
    stepCallback?.(1);
    await new Promise((r) => setTimeout(r, 1000));

    // Step 2: Clear Voltage Errors & Reboot Firmware
    stepCallback?.(2);
    await new Promise((r) => setTimeout(r, 1200));

    // Step 3: Establish Encryption Handshake
    stepCallback?.(3);
    await new Promise((r) => setTimeout(r, 800));

    let success = false;

    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          success = true;
          // Recreate history base on connection restore
          const timeStr = new Date().toLocaleTimeString();
          const baseMetric = {
            timestamp: timeStr,
            temperature: s.type === "environmental" ? 18.5 : 25.0,
            vibration: s.type === "motion" ? 0.35 : 0.05,
            battery: 100, // Recharged / rebooted
            pressure: 1.01,
          };
          const newHistory = [...s.history.slice(1), baseMetric];

          const updated: TrackerSensor = {
            ...s,
            status: "online",
            lostReason: undefined,
            warningReason: undefined,
            metrics: baseMetric,
            history: newHistory,
            lastSeen: timeStr,
          };

          const newAlert: AlertLog = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timeStr,
            trackerId: s.id,
            trackerName: s.name,
            severity: "success",
            message: `Telemetry restored. Sensor handshakes completed successfully.`,
            resolved: true,
          };
          setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
          return updated;
        }
        return s;
      })
    );

    stepCallback?.(4); // Finished
    return success;
  };

  // Add new mock tracker
  const addSensor = (name: string, type: SensorType, temp: number, vibration: number, battery: number) => {
    setSensors((prev) => {
      const nextIdNum = prev.reduce((max, s) => {
        const num = parseInt(s.id.split("-")[1]);
        return num > max ? num : max;
      }, 0) + 1;
      const id = `TRK-${nextIdNum.toString().padStart(2, "0")}`;

      const timeStr = new Date().toLocaleTimeString();
      const initialMetric = {
        timestamp: timeStr,
        temperature: temp,
        vibration: vibration,
        battery: battery,
        pressure: 1.0,
      };

      const history = Array.from({ length: 11 }).map((_, i) => ({
        timestamp: new Date(Date.now() - (10 - i) * 10000).toLocaleTimeString(),
        temperature: temp + (Math.random() - 0.5) * 1,
        vibration: Math.max(0, vibration + (Math.random() - 0.5) * 0.1),
        battery: Math.max(0, Math.min(100, battery - (10 - i) * 0.05)),
        pressure: 1.0,
      }));

      const newSensor: TrackerSensor = {
        id,
        name,
        type,
        status: battery < 20 ? "warning" : "online",
        metrics: initialMetric,
        history,
        location: {
          lat: 40.758896 + (Math.random() - 0.5) * 0.03,
          lng: -73.985130 + (Math.random() - 0.5) * 0.03,
          bearing: Math.floor(Math.random() * 360),
        },
        lastSeen: timeStr,
        warningReason: battery < 20 ? "Initial low battery allocation" : undefined,
      };

      const newAlert: AlertLog = {
        id: `alert-${Date.now()}`,
        timestamp: timeStr,
        trackerId: id,
        trackerName: name,
        severity: "info",
        message: `Registered new tracking beacon ${id} (${type.toUpperCase()}).`,
        resolved: true,
      };
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);

      return [...prev, newSensor];
    });
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  return (
    <SensorContext.Provider
      value={{
        sensors,
        alerts,
        isSimulating,
        simulationSpeed,
        tempWarningThreshold,
        vibrateWarningThreshold,
        setSimulationSpeed,
        setIsSimulating,
        setTempWarningThreshold,
        setVibrateWarningThreshold,
        triggerSignalLoss,
        reconnectSensor,
        addSensor,
        clearAlerts,
        acknowledgeAlert,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensors must be used within a SensorProvider");
  }
  return context;
};
