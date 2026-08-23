import { describe, expect, test } from "bun:test";
import { getAuthFeedback, type AuthFeedback } from "#/lib/auth-feedback";

const cases = [
  [
    200,
    {
      kind: "success",
      title: "Authorized",
      description: "Your invite code has been validated",
    },
  ],
  [
    400,
    {
      kind: "error",
      title: "Invite code required",
      description: "Enter an invite code and try again",
    },
  ],
  [
    401,
    {
      kind: "error",
      title: "Invalid invite code",
      description: "Please check your invite code and try again",
    },
  ],
  [
    503,
    {
      kind: "error",
      title: "Invite service unavailable",
      description: "Please try again later",
    },
  ],
  [
    500,
    {
      kind: "error",
      title: "Something went wrong",
      description: "Please try again later",
    },
  ],
] as const satisfies ReadonlyArray<readonly [number, AuthFeedback]>;

describe("getAuthFeedback", () => {
  for (const [status, expected] of cases) {
    test(`maps HTTP ${status} to typed, non-secret feedback`, () => {
      const feedback: AuthFeedback = getAuthFeedback(status);

      expect(feedback).toEqual(expected);
      expect(Object.keys(feedback).toSorted()).toEqual(["description", "kind", "title"]);
      expect(["success", "error"]).toContain(feedback.kind);
      expect(typeof feedback.title).toBe("string");
      expect(typeof feedback.description).toBe("string");
    });
  }
});
