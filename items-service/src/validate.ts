import { z } from "zod";

/**
 * Same validation rule as the web gateway used to enforce directly before
 * the microservices split -- now items-service is the one place that
 * actually writes to storage, so this is where the rule has to live.
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
