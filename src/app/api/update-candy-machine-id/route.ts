import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    const { candyMachineId } = await request.json();

    if (!candyMachineId) {
      return NextResponse.json(
        { error: "Candy Machine ID is required" },
        { status: 400 }
      );
    }

    // Path to candyMachineMint.ts file
    const candyMachineFilePath = path.join(
      process.cwd(),
      "src",
      "lib",
      "candyMachineMint.ts"
    );

    // Read current file content
    const fileContent = fs.readFileSync(candyMachineFilePath, "utf8");

    // Replace the CANDY_MACHINE_ID value
    const updatedContent = fileContent.replace(
      /const CANDY_MACHINE_ID = "[^"]*";/,
      `const CANDY_MACHINE_ID = "${candyMachineId}";`
    );

    // Write back to file
    fs.writeFileSync(candyMachineFilePath, updatedContent, "utf8");

    console.log(
      "✅ Successfully updated CANDY_MACHINE_ID in candyMachineMint.ts"
    );
    console.log(`🆔 New Candy Machine ID: ${candyMachineId}`);

    return NextResponse.json({
      success: true,
      message: "Candy Machine ID updated successfully",
      candyMachineId,
    });
  } catch (error) {
    console.error("❌ Failed to update CANDY_MACHINE_ID:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
