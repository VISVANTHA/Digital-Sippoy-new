/**
 * Deliberate lint-rule fixture: Unused Variable Detection, Naming
 * Convention Validation, and Complexity/Structural Threshold
 * Monitoring, per the gap-analysis reports' recommendation to plant a
 * real, detectable finding for each rule rather than leaving the
 * tooling's capability unproven. Same spirit as lib/db-clone.ts for
 * duplication: never imported by real app code, and every rule it
 * trips is configured as "warn" (see eslint.config.mjs), so this file
 * never blocks a build or a merge.
 */

// Unused Variable Detection
export function unusedBindingExample(name: string): string {
  const unusedScratch = name.toUpperCase(); // never read -- intentional
  return name.trim();
}

// Naming Convention Validation (should be camelCase, not Snake_Case)
export function Get_Legacy_Items(): string[] {
  return [];
}

// Complexity Rule Detection / Structural Threshold Monitoring: nested
// past max-depth:3, and uses single quotes to also trip the style rule.
export function overNestedExample(value: number): string {
  if (value > 0) {
    if (value > 10) {
      if (value > 20) {
        if (value > 30) {
          return 'huge';
        }
        return 'large';
      }
      return 'medium';
    }
    return 'small';
  }
  return 'non-positive';
}

// Cyclomatic Complexity / Cognitive Complexity: deliberately high
// branching and nesting (a loop wrapping nested conditionals plus a
// switch) so both the `complexity` and `sonarjs/cognitive-complexity`
// ESLint rules have a real, non-blocking finding to report.
export function highComplexityExample(a: number, b: number, c: string): string {
  let result = "";
  if (a !== 0) {
    for (let i = 0; i < a; i++) {
      if (b > 0) {
        if (i % 2 === 0) {
          result += "pe";
        } else {
          result += "po";
        }
      } else if (b < 0) {
        if (i % 2 === 0) {
          result += "ne";
        } else {
          result += "no";
        }
      } else {
        result += "z";
      }
    }
  }

  switch (c) {
  case "x":
    result += "-x";
    break;
  case "y":
    result += "-y";
    break;
  case "z":
    result += "-z";
    break;
  default:
    result += "-?";
  }

  return result;
}
