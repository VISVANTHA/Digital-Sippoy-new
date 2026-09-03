import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

/**
 * Uses next-auth/jwt's getToken() rather than getServerSession(), since
 * getToken reads the session cookie straight off the passed-in request
 * instead of relying on Next's implicit request-scoped context. That
 * keeps app/api/items/route.ts's GET/POST directly callable from tests
 * with a NextRequest, the same way Phase 3's tests already call them.
 *
 * Returns the 401 response to send if the caller isn't authenticated, or
 * null if they are -- one line at the top of each handler, no duplicated
 * try/catch (see jscpd.json / lib/validate.ts for why that matters here).
 */
export async function unauthorizedResponse(request: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req: request, secret: authOptions.secret });
  if (token) {
    return null;
  }
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
