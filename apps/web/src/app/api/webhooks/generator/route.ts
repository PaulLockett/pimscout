import { NextResponse } from "next/server";

// Generator founder profile webhook — SCO-4
export async function POST(request: Request) {
  const body = await request.json();
  console.log("Generator webhook received:", JSON.stringify(body).slice(0, 200));

  // TODO (SCO-4): Validate payload, start founderIntakeWorkflow via Temporal
  return NextResponse.json({ received: true });
}
