import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { authOptions } from "../../lib/auth";

/**
 * Mints a real next-auth JWT (signed with the same secret authOptions
 * uses) and attaches it as the session cookie, so tests exercise the
 * actual token verification path in lib/require-session.ts rather than
 * mocking it away.
 */
type SimpleRequestInit = { method?: string; headers?: HeadersInit; body?: BodyInit };

export async function authenticatedRequest(
  url: string,
  init?: SimpleRequestInit
): Promise<NextRequest> {
  const token = await encode({
    token: { name: "admin", sub: "demo-user" },
    secret: authOptions.secret as string,
  });
  const headers = new Headers(init?.headers);
  headers.set("Cookie", `next-auth.session-token=${token}`);
  return new NextRequest(url, { method: init?.method, headers, body: init?.body });
}

export function anonymousRequest(url: string, init?: SimpleRequestInit): NextRequest {
  return new NextRequest(url, init);
}
