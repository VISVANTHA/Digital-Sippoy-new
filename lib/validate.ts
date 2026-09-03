import { z } from "zod";

/**
 * Shared by app/api/items/route.ts and lib/db.ts so the "name" rule is
 * defined once instead of copy-pasted in both places (see jscpd.json /
 * the Redundancy Localization finding this replaces).
 *
 * Uses a zod schema rather than a hand-written check so the rule is
 * declarative and includes a max length -- the security report's Input
 * Validation Testing finding noted the previous manual check had no
 * length cap at all.
 */
export const ITEM_NAME_MAX_LENGTH = 200;

const itemNameSchema = z.string().trim().min(1).max(ITEM_NAME_MAX_LENGTH);

export function assertItemName(name: unknown): string {
  const result = itemNameSchema.safeParse(name);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue?.code === "too_big") {
      throw new Error(`\`name\` must be ${ITEM_NAME_MAX_LENGTH} characters or fewer`);
    }
    throw new Error("`name` is required and must be a non-empty string");
  }
  return result.data;
}
