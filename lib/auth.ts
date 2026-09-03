import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Single demo user, not a real user store: this fixture's API previously
 * had no authentication at all (documented as an accepted gap in
 * COMPLIANCE.md). A real user DB/sign-up flow is out of scope for a
 * minimal CRUD fixture, but the app needed a genuine, working session
 * check for the "Authentication & Authorization Weakness Detection"
 * finding to be actually addressed rather than just documented.
 */
const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "admin";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "changeme";

export const authOptions: NextAuthOptions = {
  // Documented, insecure-by-design default so the fixture keeps building
  // and running out of the box, like every other branch in this repo --
  // README.md tells anyone deploying this for real to override it.
  secret: process.env.NEXTAUTH_SECRET ?? "digital-sippoy-demo-secret-not-for-production",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Demo credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.username === DEMO_USERNAME &&
          credentials?.password === DEMO_PASSWORD
        ) {
          return { id: "demo-user", name: DEMO_USERNAME };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};
