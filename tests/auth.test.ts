import type { NextApiRequest, NextApiResponse } from "next";
import process from "node:process";
import { afterEach, describe, expect, test } from "bun:test";
import handler from "../pages/api/auth";

interface AuthResponse {
  authorized: boolean;
}

const originalInviteCode = process.env.INVITE_CODE;

afterEach(() => {
  if (originalInviteCode === undefined) delete process.env.INVITE_CODE;
  else process.env.INVITE_CODE = originalInviteCode;
});

function invoke(method: string | undefined, body: unknown) {
  const statuses: number[] = [];
  const payloads: AuthResponse[] = [];
  const headers: Array<[string, string]> = [];

  const response = {
    status(status: number) {
      statuses.push(status);
      return response;
    },
    json(payload: AuthResponse) {
      payloads.push(payload);
      return response;
    },
    setHeader(name: string, value: string) {
      headers.push([name, value]);
      return response;
    },
  } as unknown as NextApiResponse<AuthResponse>;

  handler({ method, body } as NextApiRequest, response);

  return { headers, payloads, statuses };
}

function expectResponse(
  result: ReturnType<typeof invoke>,
  status: number,
  authorized: boolean,
  headers: Array<[string, string]> = [],
) {
  expect(result.statuses).toEqual([status]);
  expect(result.payloads).toEqual([{ authorized }]);
  expect(result.headers).toEqual(headers);
}

describe("invite authentication API", () => {
  const rejectedMethods: Array<[string, string | undefined]> = [
    ["GET", "GET"],
    ["PUT", "PUT"],
    ["a missing method", undefined],
  ];

  for (const [name, method] of rejectedMethods) {
    test(`rejects ${name}`, () => {
      process.env.INVITE_CODE = "secret";
      expectResponse(invoke(method, { inviteCode: "secret" }), 405, false, [["Allow", "POST"]]);
    });
  }

  const invalidConfigurations: Array<[string, string | undefined]> = [
    ["missing configuration", undefined],
    ["empty configuration", ""],
    ["whitespace configuration", "   "],
  ];

  for (const [name, inviteCode] of invalidConfigurations) {
    test(`fails closed for ${name}`, () => {
      if (inviteCode === undefined) delete process.env.INVITE_CODE;
      else process.env.INVITE_CODE = inviteCode;

      expectResponse(invoke("POST", { inviteCode: "secret" }), 503, false);
    });
  }

  const malformedBodies: Array<[string, unknown]> = [
    ["null body", null],
    ["array body", []],
    ["string body", "secret"],
    ["number body", 42],
    ["function body", () => "secret"],
    ["missing invite code", {}],
    ["null invite code", { inviteCode: null }],
    ["number invite code", { inviteCode: 42 }],
    ["boolean invite code", { inviteCode: true }],
    ["empty invite code", { inviteCode: "" }],
    ["whitespace invite code", { inviteCode: "   " }],
    ["inherited invite code", Object.create({ inviteCode: "secret" })],
    [
      "throwing invite code getter",
      Object.defineProperty({}, "inviteCode", {
        get() {
          throw new Error("untrusted getter");
        },
      }),
    ],
    [
      "revoked proxy body",
      (() => {
        const { proxy, revoke } = Proxy.revocable({ inviteCode: "secret" }, {});
        revoke();
        return proxy;
      })(),
    ],
  ];

  for (const [name, body] of malformedBodies) {
    test(`rejects ${name}`, () => {
      process.env.INVITE_CODE = "secret";
      expectResponse(invoke("POST", body), 400, false);
    });
  }

  test("rejects an incorrect non-empty invite code", () => {
    process.env.INVITE_CODE = "secret";
    expectResponse(invoke("POST", { inviteCode: "wrong" }), 401, false);
  });

  test("rejects values with unequal UTF-8 byte lengths", () => {
    process.env.INVITE_CODE = "é";
    expectResponse(invoke("POST", { inviteCode: "e" }), 401, false);
  });

  test("accepts only the exact configured invite code", () => {
    process.env.INVITE_CODE = " secret ";
    expectResponse(invoke("POST", { inviteCode: " secret " }), 200, true);
    expectResponse(invoke("POST", { inviteCode: "secret" }), 401, false);
  });

  test("accepts an exact Unicode invite code", () => {
    process.env.INVITE_CODE = "秘密🔐";
    expectResponse(invoke("POST", { inviteCode: "秘密🔐" }), 200, true);
  });

  test("preserves distinct UTF-16 code-unit sequences", () => {
    const distinctCodes = ["\uD800", "\uDC00", "\uFFFD"];

    for (const configuredCode of distinctCodes) {
      process.env.INVITE_CODE = configuredCode;
      for (const submittedCode of distinctCodes) {
        expectResponse(
          invoke("POST", { inviteCode: submittedCode }),
          submittedCode === configuredCode ? 200 : 401,
          submittedCode === configuredCode,
        );
      }
    }
  });
});
