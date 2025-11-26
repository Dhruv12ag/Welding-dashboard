import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create machines with default thresholds
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

  // Create 250 live readings
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

  // Create sample alerts
  const exampleAlerts = [
    {
      machineId: machineList[0].id,
      parameter: "current",
      actualValue: 180,
      thresholdValue: 200,
      severity: "high" as const,
      status: "active" as const,
    },
    {
      machineId: machineList[1].id,
      parameter: "voltage",
      actualValue: 38,
      thresholdValue: 40,
      severity: "medium" as const,
      status: "active" as const,
    },
    {
      machineId: machineList[1].id,
      parameter: "current",
      actualValue: 190,
      thresholdValue: 200,
      severity: "high" as const,
      status: "active" as const,
    },
    {
      machineId: machineList[2].id,
      parameter: "current",
      actualValue: 170,
      thresholdValue: 200,
      severity: "medium" as const,
      status: "resolved" as const,
      durationMs: 3600000,
    },
    {
      machineId: machineList[3].id,
      parameter: "voltage",
      actualValue: 35,
      thresholdValue: 40,
      severity: "high" as const,
      status: "resolved" as const,
      durationMs: 1800000,
    },
    {
      machineId: machineList[4].id,
      parameter: "current",
      actualValue: 165,
      thresholdValue: 200,
      severity: "medium" as const,
      status: "resolved" as const,
      durationMs: 900000,
    },
  ];

  for (const alert of exampleAlerts) {
    await prisma.alert.create({ data: alert });
  }

  console.log("✔ Alerts created");

  console.log("✓ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
