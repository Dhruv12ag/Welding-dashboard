
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { machineId: string } }
) {
  try {
    const { machineId } = params;

    if (!machineId) {
      return NextResponse.json(
        { error: "Machine ID is required" },
        { status: 400 }
      );
    }

    const latestReading = await prisma.liveReading.findFirst({
      where: {
        machineId: parseInt(machineId),
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(latestReading, { status: 200 });
  } catch (error) {
    console.error("Error fetching latest reading:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest reading" },
      { status: 500 }
    );
  }
}
