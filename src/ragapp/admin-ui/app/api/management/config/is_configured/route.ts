import { NextResponse } from "next/server";
import { useModelConfigStore } from "@/lib/stores/model-config";

export async function GET() {
  try {
    return NextResponse.json(useModelConfigStore.getState().isConfigured());
  } catch (error) {
    // Handle case where store is not available (e.g., during SSR)
    return NextResponse.json(false);
  }
}
