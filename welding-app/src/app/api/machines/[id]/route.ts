import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{ id: string }>; // because route is [id]
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    // 1) Unwrap the params Promise
    const { id } = await context.params;

    // 2) Convert id (string) → number
    const machineId = Number(id);

    // 3) Validate machineId
    if (Number.isNaN(machineId)) {
      return NextResponse.json(
        { error: "Invalid machine ID" },
        { status: 400 }
      );
    }

    // 4) Get JSON body
    const body = await req.json();
    const { maxCurrent, maxVoltage } = body;

    // 5) Check if machine exists
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    // 6) Update machine with new thresholds
    const updatedMachine = await prisma.machine.update({
      where: { id: machineId },
      data: {
        maxCurrent: maxCurrent !== undefined ? maxCurrent : machine.maxCurrent,
        maxVoltage: maxVoltage !== undefined ? maxVoltage : machine.maxVoltage,
      },
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

    return NextResponse.json(updatedMachine, { status: 200 });
  } catch (error) {
    console.error("Error updating machine thresholds:", error);
    return NextResponse.json(
      { error: "Failed to update thresholds" },
      { status: 500 }
    );
  }
}
