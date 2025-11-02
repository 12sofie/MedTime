import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test the database connection by showing all tables
    const tables = await query("SHOW TABLES")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      tables,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
