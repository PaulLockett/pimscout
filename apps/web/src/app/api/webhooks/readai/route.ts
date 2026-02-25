import { NextResponse } from "next/server";

// Read.ai meeting transcript webhook — SCO-9
export async function POST(request: Request) {
  const body = await request.json();
  console.log("Read.ai webhook received:", JSON.stringify(body).slice(0, 200));

  // TODO (SCO-9): Validate payload, trigger enrichment workflow via Temporal
  return NextResponse.json({ received: true });
}
