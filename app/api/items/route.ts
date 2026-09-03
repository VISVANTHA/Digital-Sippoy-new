import { NextResponse, type NextRequest } from "next/server";
import { addItem, getItems } from "@/lib/db";
import { assertItemName } from "@/lib/validate";
import { unauthorizedResponse } from "@/lib/require-session";

/**
 * Calling GET()/POST() directly (as the test suite does) bypasses
 * Next's own request pipeline, which is what normally turns an
 * uncaught rejection into a generic 500 in a real deployment. Without
 * this, an items-service outage left the promise rejecting straight
 * out of the handler instead of producing a response at all -- caught
 * by a real test, not by inspection. 502, not 500: web is a gateway,
 * and this specifically means "the upstream service failed."
 */
async function itemsServiceFailure(action: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await action();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "items-service request failed" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = await unauthorizedResponse(request);
  if (unauthorized) {
    return unauthorized;
  }

  return itemsServiceFailure(async () => {
    const items = await getItems();
    return NextResponse.json({ items });
  });
}

export async function POST(request: NextRequest) {
  const unauthorized = await unauthorizedResponse(request);
  if (unauthorized) {
    return unauthorized;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let name: string;
  try {
    name = assertItemName((body as { name?: unknown })?.name);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid `name`" },
      { status: 400 }
    );
  }

  return itemsServiceFailure(async () => {
    const item = await addItem(name);
    return NextResponse.json({ item }, { status: 201 });
  });
}
