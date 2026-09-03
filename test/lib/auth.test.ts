import assert from "node:assert/strict";
import { authOptions } from "../../lib/auth";

describe("lib/auth.ts", () => {
  const [provider] = authOptions.providers;

  it("configures a single credentials provider with a demo-friendly secret", () => {
    assert.equal(provider.type, "credentials");
    assert.ok(authOptions.secret, "a secret must always be set, even the documented demo default");
  });

  it("authorize() accepts the configured demo username/password", async () => {
    const user = await provider.options.authorize?.(
      { username: "admin", password: "changeme" },
      {} as never
    );
    assert.ok(user);
    assert.equal(user?.name, "admin");
  });

  it("authorize() rejects a wrong password", async () => {
    const user = await provider.options.authorize?.(
      { username: "admin", password: "wrong" },
      {} as never
    );
    assert.equal(user, null);
  });

  it("authorize() rejects a wrong username", async () => {
    const user = await provider.options.authorize?.(
      { username: "someone-else", password: "changeme" },
      {} as never
    );
    assert.equal(user, null);
  });

  it("authorize() rejects undefined credentials instead of throwing", async () => {
    const user = await provider.options.authorize?.(undefined, {} as never);
    assert.equal(user, null);
  });
});

describe("lib/auth.ts env var overrides", () => {
  const authModulePath = require.resolve("../../lib/auth");
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    delete require.cache[authModulePath];
  });

  it("DEMO_USERNAME/DEMO_PASSWORD env vars override the defaults", async () => {
    process.env.DEMO_USERNAME = "custom-user";
    process.env.DEMO_PASSWORD = "custom-pass";
    delete require.cache[authModulePath];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reloaded = require("../../lib/auth") as typeof import("../../lib/auth");
    const [provider] = reloaded.authOptions.providers;

    const rejected = await provider.options.authorize?.(
      { username: "admin", password: "changeme" },
      {} as never
    );
    assert.equal(rejected, null);

    const accepted = await provider.options.authorize?.(
      { username: "custom-user", password: "custom-pass" },
      {} as never
    );
    assert.ok(accepted);
  });

  it("NEXTAUTH_SECRET env var overrides the documented demo default", () => {
    process.env.NEXTAUTH_SECRET = "a-real-secret-from-the-environment";
    delete require.cache[authModulePath];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reloaded = require("../../lib/auth") as typeof import("../../lib/auth");
    assert.equal(reloaded.authOptions.secret, "a-real-secret-from-the-environment");
  });
});
