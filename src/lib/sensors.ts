export interface SensorMetric {
  timestamp: string;
  temperature: number;
  vibration: number;
  battery: number;
  pressure: number;
}

export type SensorType = "environmental" | "motion" | "asset" | "power";
export type SensorStatus = "online" | "warning" | "lost";

export interface TrackerSensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  metrics: SensorMetric;
  history: SensorMetric[];
  location: {
    lat: number;
    lng: number;
    bearing: number; // for smooth moving direction
  };
  lastSeen: string;
  lostReason?: string;
  warningReason?: string;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  trackerId: string;
  trackerName: string;
  severity: "info" | "warning" | "error" | "success";
  message: string;
  resolved: boolean;
}

// Initial center coordinates for the tracking map simulation (e.g., Manhattan)
const CENTER_LAT = 40.758896;
const CENTER_LNG = -73.985130;

export const INITIAL_SENSORS: TrackerSensor[] = [
  {
    id: "TRK-01",
    name: "Vaccine Cold Chain A",
    type: "environmental",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: -18.5,
      vibration: 0.15,
      battery: 94,
      pressure: 1.01,
    },
    history: [],
    location: {
      lat: CENTER_LAT + 0.005,
      lng: CENTER_LNG - 0.008,
      bearing: 45,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-02",
    name: "Main Turbine Rotation",
    type: "motion",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: 42.1,
      vibration: 0.95,
      battery: 100, // Wired, always full
      pressure: 2.4,
    },
    history: [],
    location: {
      lat: CENTER_LAT - 0.003,
      lng: CENTER_LNG + 0.002,
      bearing: 0,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-03",
    name: "Logistics Van #12",
    type: "asset",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: 22.4,
      vibration: 0.65,
      battery: 82,
      pressure: 2.2, // Tire pressure
    },
    history: [],
    location: {
      lat: CENTER_LAT - 0.012,
      lng: CENTER_LNG - 0.015,
      bearing: 180,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-04",
    name: "Cryo Storage Tank B",
    type: "environmental",
    status: "warning",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: -72.0,
      vibration: 0.04,
      battery: 15, // Low battery warning
      pressure: 8.5,
    },
    history: [],
    location: {
      lat: CENTER_LAT + 0.001,
      lng: CENTER_LNG + 0.009,
      bearing: 90,
    },
    lastSeen: new Date().toLocaleTimeString(),
    warningReason: "Battery critical (< 20%)",
  },
  {
    id: "TRK-05",
    name: "HVAC Compressor North",
    type: "motion",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: 55.6,
      vibration: 1.45,
      battery: 88,
      pressure: 4.8,
    },
    history: [],
    location: {
      lat: CENTER_LAT + 0.011,
      lng: CENTER_LNG - 0.003,
      bearing: 270,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-06",
    name: "Fleet Delivery Drone #4",
    type: "asset",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: 15.2,
      vibration: 1.1,
      battery: 64,
      pressure: 0.98,
    },
    history: [],
    location: {
      lat: CENTER_LAT - 0.006,
      lng: CENTER_LNG + 0.012,
      bearing: 320,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-07",
    name: "Emergency Backup Generator",
    type: "power",
    status: "online",
    metrics: {
      timestamp: new Date().toLocaleTimeString(),
      temperature: 38.9,
      vibration: 0.3,
      battery: 98,
      pressure: 1.05,
    },
    history: [],
    location: {
      lat: CENTER_LAT + 0.007,
      lng: CENTER_LNG + 0.007,
      bearing: 120,
    },
    lastSeen: new Date().toLocaleTimeString(),
  },
  {
    id: "TRK-08",
    name: "Port Cargo Pallet Beta",
    type: "asset",
    status: "lost",
    metrics: {
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
      temperature: 10.5,
      vibration: 0.0,
      battery: 0,
      pressure: 1.0,
    },
    history: [],
    location: {
      lat: CENTER_LAT + 0.015,
      lng: CENTER_LNG - 0.012,
      bearing: 220,
    },
    lastSeen: new Date(Date.now() - 180000).toLocaleTimeString(),
    lostReason: "Voltage collapse / zero-battery cutoff",
  },
];

// Initialize history
INITIAL_SENSORS.forEach(sensor => {
  const base = sensor.metrics;
  const history: SensorMetric[] = [];
  for (let i = 10; i >= 0; i--) {
    const time = new Date(Date.now() - i * 10000).toLocaleTimeString();
    history.push({
      timestamp: time,
      temperature: base.temperature + (Math.random() - 0.5) * 2,
      vibration: Math.max(0, base.vibration + (Math.random() - 0.5) * 0.1),
      battery: Math.max(0, Math.min(100, base.battery + (sensor.id === "TRK-02" ? 0 : -0.2))),
      pressure: Math.max(0.1, base.pressure + (Math.random() - 0.5) * 0.05),
    });
  }
  sensor.history = history;
});

// Update function to simulate real-time jitter and coordinate drifting
export function updateSensorData(
  sensor: TrackerSensor,
  tempWarningThreshold: number = 60,
  vibrateWarningThreshold: number = 1.8
): { updatedSensor: TrackerSensor; newAlert?: Omit<AlertLog, "id" | "timestamp"> } {
  if (sensor.status === "lost") {
    return { updatedSensor: sensor };
  }

  const timeStr = new Date().toLocaleTimeString();
  const currentMetrics = sensor.metrics;

  // 1. Sim drift/jitters
  let batteryChange = sensor.id === "TRK-02" ? 0 : -Math.random() * 0.05;
  if (sensor.id === "TRK-04" && Math.random() < 0.1) {
    // Battery drops faster for the warning storage
    batteryChange = -0.5;
  }

  const nextBattery = Math.max(0, parseFloat((currentMetrics.battery + batteryChange).toFixed(1)));
  const nextTemp = parseFloat((currentMetrics.temperature + (Math.random() - 0.5) * 0.8).toFixed(1));
  const nextVibe = parseFloat(Math.max(0.01, currentMetrics.vibration + (Math.random() - 0.5) * 0.15).toFixed(2));
  const nextPress = parseFloat(Math.max(0.1, currentMetrics.pressure + (Math.random() - 0.5) * 0.04).toFixed(2));

  // Drift position for assets/drones
  let nextLat = sensor.location.lat;
  let nextLng = sensor.location.lng;
  let nextBearing = sensor.location.bearing;

  if (sensor.type === "asset" && sensor.id !== "TRK-08") {
    // Move slowly along the bearing
    const speed = sensor.id === "TRK-06" ? 0.0003 : 0.0001; // Drone is faster
    const rad = (sensor.location.bearing * Math.PI) / 180;
    nextLat += speed * Math.cos(rad) + (Math.random() - 0.5) * 0.00005;
    nextLng += speed * Math.sin(rad) + (Math.random() - 0.5) * 0.00005;

    // Occasionally change bearing
    if (Math.random() < 0.15) {
      nextBearing = (nextBearing + (Math.random() - 0.5) * 45 + 360) % 360;
    }
  }

  const newMetrics: SensorMetric = {
    timestamp: timeStr,
    temperature: nextTemp,
    vibration: nextVibe,
    battery: nextBattery,
    pressure: nextPress,
  };

  const newHistory = [...sensor.history.slice(1), newMetrics];

  // 2. Alert & status transition evaluation
  let nextStatus: SensorStatus = "online";
  let warningReason = "";
  let newAlert: Omit<AlertLog, "id" | "timestamp"> | undefined = undefined;

  if (nextBattery <= 0) {
    nextStatus = "lost";
    newAlert = {
      trackerId: sensor.id,
      trackerName: sensor.name,
      severity: "error",
      message: `Tracker battery depleted completely. Connection offline.`,
      resolved: false,
    };
  } else if (nextBattery < 20) {
    nextStatus = "warning";
    warningReason = `Battery low: ${nextBattery}%`;
    if (sensor.status === "online") {
      newAlert = {
        trackerId: sensor.id,
        trackerName: sensor.name,
        severity: "warning",
        message: `Low Battery warning: ${nextBattery}% capacity remaining.`,
        resolved: false,
      };
    }
  } else if (nextTemp > tempWarningThreshold) {
    nextStatus = "warning";
    warningReason = `Temperature high: ${nextTemp}°C`;
    if (sensor.status === "online") {
      newAlert = {
        trackerId: sensor.id,
        trackerName: sensor.name,
        severity: "warning",
        message: `High Temperature alert: ${nextTemp}°C (Threshold: ${tempWarningThreshold}°C).`,
        resolved: false,
      };
    }
  } else if (nextVibe > vibrateWarningThreshold) {
    nextStatus = "warning";
    warningReason = `Vibration critical: ${nextVibe}g`;
    if (sensor.status === "online") {
      newAlert = {
        trackerId: sensor.id,
        trackerName: sensor.name,
        severity: "warning",
        message: `Excessive Vibration detected: ${nextVibe}g (Threshold: ${vibrateWarningThreshold}g).`,
        resolved: false,
      };
    }
  }

  const updatedSensor: TrackerSensor = {
    ...sensor,
    status: nextStatus,
    metrics: newMetrics,
    history: newHistory,
    location: {
      lat: nextLat,
      lng: nextLng,
      bearing: nextBearing,
    },
    lastSeen: timeStr,
    warningReason: nextStatus === "warning" ? warningReason : undefined,
    lostReason: nextStatus === "lost" ? "Battery depleted" : undefined,
  };

  return { updatedSensor, newAlert };
}
