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
    origin: "*", // In production, replace with your frontend URL
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

// Define Types for Request Body
interface SensorData {
  machineId: number;
  voltage: number;
  current: number;
  temperature?: number;
}

// --- API Endpoint for ESP32 ---
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

    // 2. Emit to Frontend (Instant Live Update)
    io.emit(`machine-${machineId}`, reading);

    // 3. Check Thresholds & Generate Alerts
    const thresholds = await prisma.machineThreshold.findFirst({
      where: { machineId: Number(machineId) },
    });

    if (thresholds) {
      await checkAndCreateAlert(
        Number(machineId),
        "current",
        current,
        thresholds.currentMax
      );
      if (thresholds.voltageMax) {
        await checkAndCreateAlert(
          Number(machineId),
          "voltage",
          voltage,
          thresholds.voltageMax
        );
      }
    }

    console.log(`[Recv] M:${machineId} | V:${voltage} | I:${current}`);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).send("Server Error");
  }
});

// Helper: Create Alert
async function checkAndCreateAlert(
  machineId: number,
  parameter: string,
  actual: number,
  limit: number
) {
  if (actual > limit) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        machineId: machineId,
        parameter: parameter,
        status: "active",
      },
    });

    if (!existingAlert) {
      const newAlert = await prisma.alert.create({
        data: {
          machineId,
          parameter,
          actualValue: actual,
          thresholdValue: limit,
          severity: "HIGH",
          status: "active",
        },
      });
      io.emit("new-alert", newAlert);
      console.log(
        `!!! ALERT CREATED: ${parameter} is ${actual} (Limit: ${limit})`
      );
    }
  }
}

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
