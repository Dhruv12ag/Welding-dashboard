import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");


  const machines = await prisma.machine.createMany({
    data: [
      { name: "Machine A", model: "ZX-200", location: "Bay 1" },
      { name: "Machine B", model: "ZX-300", location: "Bay 2" },
      { name: "Machine C", model: "YX-100", location: "Bay 3" },
      { name: "Machine D", model: "QX-500", location: "Bay 4" },
      { name: "Machine E", model: "RX-700", location: "Bay 5" },
    ],
  });

  console.log("✔ Machines created");

  
  const machineList = await prisma.machine.findMany();


  for (const m of machineList) {
    await prisma.machineThreshold.create({
      data: {
        machineId: m.id,
        currentMax: 150,
        voltageMax: 50,
        temperatureMax: 90,
        hysteresis: 5,
      },
    });
  }

  console.log("✔ Thresholds created");


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

  const exampleAlerts = [
    {
      machineId: machineList[0].id,
      parameter: "current",
      actualValue: 180,
      thresholdValue: 150,
      severity: "high",
    },
    {
      machineId: machineList[1].id,
      parameter: "voltage",
      actualValue: 60,
      thresholdValue: 50,
      severity: "medium",
    },
    {
      machineId: machineList[1].id,
      parameter: "temperature",
      actualValue: 95,
      thresholdValue: 90,
      severity: "high",
    },
    {
      machineId: machineList[2].id,
      parameter: "current",
      actualValue: 170,
      thresholdValue: 150,
      severity: "medium",
    },
    {
      machineId: machineList[3].id,
      parameter: "temperature",
      actualValue: 98,
      thresholdValue: 90,
      severity: "high",
    },
    {
      machineId: machineList[4].id,
      parameter: "voltage",
      actualValue: 58,
      thresholdValue: 50,
      severity: "medium",
    },
  ];

  for (const alert of exampleAlerts) {
    await prisma.alert.create({ data: alert });
  }

  console.log("✔ Alerts created");

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
