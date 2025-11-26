import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// Fix for BigInt serialization in JSON
// @ts-ignore: checking for BigInt prototype
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Enable CORS so your Next.js app (localhost:3000) can connect to this (localhost:3001)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ==================== CONFIGURATION ====================
const ALERT_CONFIG = {
  BREACH_THRESHOLD: 50, // Alert if >50% readings exceed limit
  RECOVERY_THRESHOLD: 70, // Auto-resolve if >70% readings are normal
  READING_WINDOW_SIZE: 100, // Use last 100 readings
};

// ==================== IN-MEMORY READING STORAGE ====================
interface ReadingWindow {
  current: number[];
  voltage: number[];
}

const readingWindows = new Map<number, ReadingWindow>();

// ==================== HELPER: GET OR CREATE READING WINDOW ====================
function getReadingWindow(machineId: number): ReadingWindow {
  if (!readingWindows.has(machineId)) {
    readingWindows.set(machineId, { current: [], voltage: [] });
  }
  return readingWindows.get(machineId)!;
}

// ==================== HELPER: ADD READING TO WINDOW ====================
function addReadingToWindow(
  machineId: number,
  parameter: "current" | "voltage",
  value: number
): void {
  const window = getReadingWindow(machineId);
  const readings = window[parameter];

  readings.push(value);

  // Keep only last 100 readings
  if (readings.length > ALERT_CONFIG.READING_WINDOW_SIZE) {
    readings.shift();
  }
}

// ==================== HELPER: CALCULATE BREACH PERCENTAGE ====================
async function calculateBreachPercentage(
  machineId: number,
  parameter: "current" | "voltage",
  threshold: number
): Promise<{ breachPercentage: number; totalReadings: number }> {
  const window = getReadingWindow(machineId);
  const readings = window[parameter];

  // Wait for 100 readings before checking
  if (readings.length < ALERT_CONFIG.READING_WINDOW_SIZE) {
    return { breachPercentage: 0, totalReadings: readings.length };
  }

  const breachCount = readings.filter((v) => v > threshold).length;
  const breachPercentage = (breachCount / readings.length) * 100;

  return { breachPercentage, totalReadings: readings.length };
}

// ==================== HELPER: DETERMINE SEVERITY ====================
function determineSeverity(
  actualValue: number,
  thresholdValue: number
): string {
  const excess = actualValue - thresholdValue;

  if (excess <= 5) return "low";
  if (excess <= 15) return "medium";
  return "high";
}

// ==================== HELPER: CHECK AND CREATE/RESOLVE ALERTS ====================
async function checkAndManageAlerts(
  machineId: number,
  parameter: "current" | "voltage",
  actualValue: number,
  threshold: number
): Promise<void> {
  const { breachPercentage, totalReadings } = await calculateBreachPercentage(
    machineId,
    parameter,
    threshold
  );

  // Get or create ThresholdBreach record
  let breach = await prisma.thresholdBreach.findUnique({
    where: { machineId_parameter: { machineId, parameter } },
  });

  if (!breach) {
    breach = await prisma.thresholdBreach.create({
      data: {
        machineId,
        parameter,
        lastReading: actualValue,
        breachCount: 0,
        normalCount: 0,
      },
    });
  }

  // ===== CONDITION 1: NOT ENOUGH DATA YET =====
  if (totalReadings < ALERT_CONFIG.READING_WINDOW_SIZE) {
    console.log(
      `[${machineId}-${parameter}] Waiting for data: ${totalReadings}/${ALERT_CONFIG.READING_WINDOW_SIZE}`
    );
    return;
  }

  // ===== CONDITION 2: BREACH DETECTED (>50%) =====
  if (breachPercentage > ALERT_CONFIG.BREACH_THRESHOLD) {
    // Check if alert already exists
    if (breach.activeAlertId) {
      console.log(
        `[${machineId}-${parameter}] Alert already active. Breach: ${breachPercentage.toFixed(
          1
        )}%`
      );
      return;
    }

    // Create NEW alert
    const severity = determineSeverity(actualValue, threshold);
    const newAlert = await prisma.alert.create({
      data: {
        machineId,
        parameter,
        actualValue,
        thresholdValue: threshold,
        severity,
        status: "active",
      },
    });

    // Update ThresholdBreach to link to this alert
    await prisma.thresholdBreach.update({
      where: { machineId_parameter: { machineId, parameter } },
      data: { activeAlertId: newAlert.id },
    });

    io.emit("new-alert", newAlert);
    console.log(
      `✓ ALERT CREATED [${machineId}-${parameter}]: ${actualValue.toFixed(
        2
      )} / ${threshold} (Severity: ${severity}, Breach: ${breachPercentage.toFixed(
        1
      )}%)`
    );
  }

  // ===== CONDITION 3: RECOVERY DETECTED (<30% breach = >70% normal) =====
  else if (breachPercentage < 100 - ALERT_CONFIG.RECOVERY_THRESHOLD) {
    // Check if there's an active alert to resolve
    if (breach.activeAlertId) {
      const activeAlert = await prisma.alert.findUnique({
        where: { id: breach.activeAlertId },
      });

      if (activeAlert && activeAlert.status === "active") {
        // Calculate duration
        const now = new Date();
        const duration = now.getTime() - activeAlert.createdAt.getTime();

        // Resolve the alert
        await prisma.alert.update({
          where: { id: activeAlert.id },
          data: {
            status: "resolved",
            resolvedAt: now,
            durationMs: duration, // Store as number, Prisma will convert to BigInt
          },
        });

        // Clear the alert reference
        await prisma.thresholdBreach.update({
          where: { machineId_parameter: { machineId, parameter } },
          data: { activeAlertId: null },
        });

        io.emit("alert-resolved", {
          id: activeAlert.id,
          resolvedAt: now,
          durationMs: duration,
        });

        const durationSecs = (duration / 1000).toFixed(1);
        console.log(
          `✓ ALERT RESOLVED [${machineId}-${parameter}]: Duration: ${durationSecs}s, Breach: ${breachPercentage.toFixed(
            1
          )}%`
        );
      }
    }
  }

  // Update last reading
  await prisma.thresholdBreach.update({
    where: { machineId_parameter: { machineId, parameter } },
    data: { lastReading: actualValue },
  });
}

// ==================== DEFINE TYPES ====================
interface SensorData {
  machineId: number;
  voltage: number;
  current: number;
  temperature?: number;
}

// ==================== API ENDPOINT FOR ESP32 ====================
app.post("/api/readings", async (req: Request, res: Response) => {
  try {
    const { machineId, voltage, current, temperature } = req.body as SensorData;

    // 1. Save Reading to Database
    const reading = await prisma.liveReading.create({
      data: {
        machineId: Number(machineId),
        currentValue: Number(current),
        voltageValue: Number(voltage),
        temperatureValue: temperature ? Number(temperature) : null,
      },
    });

    // 2. Add to in-memory window
    addReadingToWindow(machineId, "current", Number(current));
    if (voltage !== undefined) {
      addReadingToWindow(machineId, "voltage", Number(voltage));
    }

    // 3. Emit to Frontend (Instant Live Update)
    io.emit(`machine-${machineId}`, reading);

    // 4. Get machine thresholds
    const machine = await prisma.machine.findUnique({
      where: { id: Number(machineId) },
    });

    if (!machine) {
      return res.status(404).send("Machine not found");
    }

    // Use provided thresholds or defaults
    const maxCurrent = machine.maxCurrent || 200;
    const maxVoltage = machine.maxVoltage || 40;

    // 5. Check and Manage Alerts for CURRENT
    await checkAndManageAlerts(
      Number(machineId),
      "current",
      Number(current),
      maxCurrent
    );

    // 6. Check and Manage Alerts for VOLTAGE
    if (voltage !== undefined) {
      await checkAndManageAlerts(
        Number(machineId),
        "voltage",
        Number(voltage),
        maxVoltage
      );
    }

    console.log(
      `[Recv] M:${machineId} | I:${current}A | V:${voltage}V | T:${
        temperature || "N/A"
      }°C`
    );
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).send("Server Error");
  }
});

// ==================== API ENDPOINT: GET MACHINES ====================
app.get("/api/machines", async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        model: true,
        location: true,
        status: true,
        maxCurrent: true,
        maxVoltage: true,
        createdAt: true,
      },
    });

    res.json(machines);
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
});

// ==================== API ENDPOINT: GET ALERTS ====================
app.get("/api/alerts", async (req: Request, res: Response) => {
  try {
    const { status, machineId, severity, limit = 100, offset = 0 } = req.query;

    // Build where clause
    const where: any = {};

    if (status && (status === "active" || status === "resolved")) {
      where.status = status;
    }

    if (machineId) {
      where.machineId = Number(machineId);
    }

    if (severity && ["low", "medium", "high"].includes(String(severity))) {
      where.severity = severity;
    }

    // Fetch alerts with pagination
    const alerts = await prisma.alert.findMany({
      where,
      include: { machine: true },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    // Calculate durations for resolved alerts
    const alertsWithDuration = alerts.map((alert) => ({
      ...alert,
      durationSeconds: alert.durationMs
        ? Number(alert.durationMs) / 1000
        : null,
    }));

    res.json(alertsWithDuration);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ==================== START SERVER ====================
const PORT = 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Backend running on port ${PORT}`);
  console.log(
    `✓ Alert Config: Breach>${ALERT_CONFIG.BREACH_THRESHOLD}%, Recovery>${ALERT_CONFIG.RECOVERY_THRESHOLD}% normal`
  );
  console.log(`✓ Reading window: ${ALERT_CONFIG.READING_WINDOW_SIZE} readings`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
