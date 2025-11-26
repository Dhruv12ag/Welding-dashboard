import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const machines = await prisma.machine.findMany({
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

    return NextResponse.json(machines, { status: 200 });
  } catch (error) {
    console.error("Error fetching machines:", error);
    return NextResponse.json(
      { error: "Failed to fetch machines" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, model, location, maxCurrent, maxVoltage } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Device name is required" },
        { status: 400 }
      );
    }

    const newMachine = await prisma.machine.create({
      data: {
        name,
        model: model || null,
        location: location || null,
        status: "active",
        maxCurrent: maxCurrent ? parseFloat(maxCurrent) : null,
        maxVoltage: maxVoltage ? parseFloat(maxVoltage) : null,
      },
    });

    return NextResponse.json(newMachine, { status: 201 });
  } catch (error) {
    console.error("Error creating machine:", error);
    return NextResponse.json(
      { error: "Failed to create machine" },
      { status: 500 }
    );
  }
}
