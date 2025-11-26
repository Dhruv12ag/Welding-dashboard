import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.liveReading.deleteMany();
  await prisma.thresholdBreach.deleteMany();
  await prisma.machine.deleteMany();

  // -----------------------------
  // 1️⃣ Create Machines
  // -----------------------------
  const machines = await prisma.machine.createMany({
    data: [
      {
        name: "Machine A",
        model: "ZX-200",
        location: "Bay 1",
        maxCurrent: 200,
        maxVoltage: 40,
      },
      {
        name: "Machine B",
        model: "ZX-300",
        location: "Bay 2",
        maxCurrent: 200,
        maxVoltage: 40,
      },
      {
        name: "Machine C",
        model: "YX-100",
        location: "Bay 3",
        maxCurrent: 200,
        maxVoltage: 40,
      },
      {
        name: "Machine D",
        model: "QX-500",
        location: "Bay 4",
        maxCurrent: 200,
        maxVoltage: 40,
      },
      {
        name: "Machine E",
        model: "RX-700",
        location: "Bay 5",
        maxCurrent: 200,
        maxVoltage: 40,
      },
    ],
  });

  console.log("✔ Machines created");

  const machineList = await prisma.machine.findMany();

  // -----------------------------
  // 2️⃣ Create 250 random readings
  // -----------------------------
  let readingCount = 0;
  for (let i = 0; i < 250; i++) {
    const machine = machineList[Math.floor(Math.random() * machineList.length)];

    await prisma.liveReading.create({
      data: {
        machineId: machine.id,
        currentValue: 80 + Math.random() * 120,
        voltageValue: 30 + Math.random() * 30,
        temperatureValue: 25 + Math.random() * 70,
      },
    });

    readingCount++;
  }

  console.log(`✔ ${readingCount} live readings created`);

  // -----------------------------
  // 3️⃣ Create alerts
  // -----------------------------
  const alerts = [
    {
      machineId: machineList[0].id,
      parameter: "current",
      actualValue: 180,
      thresholdValue: 150,
      severity: "high",
      status: "resolved",
      resolvedAt: new Date(Date.now() - 60000), // 1 minute ago
      durationMs: BigInt(60000), // 1 minute duration
    },
    {
      machineId: machineList[1].id,
      parameter: "voltage",
      actualValue: 45,
      thresholdValue: 40,
      severity: "medium",
      status: "active",
    },
    {
      machineId: machineList[1].id,
      parameter: "current",
      actualValue: 210,
      thresholdValue: 200,
      severity: "high",
      status: "resolved",
      resolvedAt: new Date(Date.now() - 120000), // 2 minutes ago
      durationMs: BigInt(120000), // 2 minute duration
    },
    {
      machineId: machineList[2].id,
      parameter: "current",
      actualValue: 170,
      thresholdValue: 150,
      severity: "medium",
      status: "active",
    },
    {
      machineId: machineList[3].id,
      parameter: "voltage",
      actualValue: 42,
      thresholdValue: 40,
      severity: "low",
      status: "resolved",
      resolvedAt: new Date(Date.now() - 300000), // 5 minutes ago
      durationMs: BigInt(180000), // 3 minute duration
    },
    {
      machineId: machineList[4].id,
      parameter: "voltage",
      actualValue: 48,
      thresholdValue: 40,
      severity: "high",
      status: "active",
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }

  console.log("✔ Alerts created");
  console.log("🌱 Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Error during seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
