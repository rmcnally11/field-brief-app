import { NextRequest, NextResponse } from "next/server";
import { getArea } from "@/lib/data/areas";
import { loadOfficialLayers } from "@/lib/layers";

export async function GET(request: NextRequest) {
  const area = getArea(request.nextUrl.searchParams.get("area"));
  try {
    const layers = await loadOfficialLayers(area);
    return NextResponse.json({ area: { id: area.id, name: area.name }, ...layers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Layers failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
