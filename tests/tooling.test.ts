import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "bun:test";

interface PackageManifest {
  name?: string;
  private?: boolean;
  type?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface OxfmtConfig {
  $schema?: string;
  ignorePatterns?: string[];
  [key: string]: unknown;
}

interface OxlintConfig {
  $schema?: string;
  ignorePatterns?: string[];
  categories?: Record<string, string>;
  plugins?: string[];
  env?: Record<string, boolean>;
  rules?: Record<string, string>;
}

interface BunLock {
  workspaces?: Record<
    string,
    {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }
  >;
  packages?: Record<string, [string, ...unknown[]]>;
}

interface TypeScriptConfig {
  compilerOptions?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
}

interface RenovateConfig {
  extends?: string[];
  labels?: string[];
  schedule?: string[];
  customManagers?: Array<Record<string, unknown>>;
  packageRules?: Array<Record<string, unknown>>;
  vulnerabilityAlerts?: unknown;
  osvVulnerabilityAlerts?: unknown;
}

interface WorkflowStep {
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
  env?: Record<string, unknown>;
}

interface WorkflowJob {
  name?: string;
  "runs-on"?: string;
  "timeout-minutes"?: number;
  permissions?: Record<string, string>;
  steps: WorkflowStep[];
}

interface CiWorkflow {
  on: {
    push: { branches: string[]; tags: string[] };
    pull_request: { branches: string[] };
  };
  permissions: Record<string, string>;
  concurrency: {
    group: string;
    "cancel-in-progress": boolean;
  };
  jobs: Record<string, WorkflowJob>;
}

const developmentDependencyPins = {
  "@types/bun": "1.4.0",
  "@types/node": "26.4.1",
  oxfmt: "0.66.0",
  oxlint: "1.81.0",
  typescript: "7.0.2",
  vite: "8.2.2",
} as const;

const asciiLogoHash = "cd96401a7f34602bbf6c17b4a22c1be653899d041f5ddd986d38fac9a4ff556b";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as PackageManifest;
const bunLock = Bun.JSONC.parse(
  readFileSync(new URL("../bun.lock", import.meta.url), "utf8"),
) as BunLock;
const bunLockSource = readFileSync(new URL("../bun.lock", import.meta.url), "utf8");
const gitignoreSource = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
const tsconfig = JSON.parse(
  readFileSync(new URL("../tsconfig.json", import.meta.url), "utf8"),
) as TypeScriptConfig;
const indexSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
const logoSource = readFileSync(new URL("../src/logo.ts", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const eslintConfigUrl = new URL("../eslint.config.js", import.meta.url);
const oxfmtConfigUrl = new URL("../.oxfmtrc.json", import.meta.url);
const oxlintConfigUrl = new URL("../.oxlintrc.json", import.meta.url);
const ciWorkflowSource = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
const codeqlWorkflowSource = readFileSync(
  new URL("../.github/workflows/codeql-analysis.yml", import.meta.url),
  "utf8",
);
const renovateConfig = JSON.parse(
  readFileSync(new URL("../.github/renovate.json", import.meta.url), "utf8"),
) as RenovateConfig;
const vercelConfig = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
) as {
  $schema?: string;
  framework?: string;
  installCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
};
const readmeSource = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const agentsSource = readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split("\n")
  .filter((file) => file.length > 0 && existsSync(join(repoRoot, file)));

describe("root package contract", () => {
  test("keeps the package identity private", () => {
    expect(packageJson.name).toBe("uwu.ee");
    expect(packageJson.private).toBe(true);
    expect(packageJson.type).toBe("module");
  });

  test("pins the Bun package manager", () => {
    expect(packageJson.packageManager).toBe("bun@1.4.0");
  });

  test("keeps @types/bun synchronized with packageManager", () => {
    expect(packageJson.devDependencies?.["@types/bun"]).toBe(
      packageJson.packageManager?.replace("bun@", ""),
    );
  });

  test("pins the Vite TypeScript toolchain as exact development dependencies", () => {
    expect(packageJson.dependencies).toBeUndefined();
    for (const [name, version] of Object.entries(developmentDependencyPins)) {
      expect(packageJson.devDependencies?.[name]).toBe(version);
      expect(bunLock.workspaces?.[""]?.devDependencies?.[name]).toBe(version);
      expect(bunLock.packages?.[name]?.[0]).toBe(`${name}@${version}`);
    }
  });

  test("removes the Next, React, Tailwind, and ShadCN stack", () => {
    const removed = [
      "next",
      "react",
      "react-dom",
      "@types/react",
      "@types/react-dom",
      "tailwindcss",
      "@tailwindcss/postcss",
      "postcss",
      "radix-ui",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "sonner",
      "tailwind-merge",
    ];
    for (const name of removed) {
      expect(packageJson.dependencies?.[name]).toBeUndefined();
      expect(packageJson.devDependencies?.[name]).toBeUndefined();
      expect(bunLock.workspaces?.[""]?.dependencies?.[name]).toBeUndefined();
      expect(bunLock.workspaces?.[""]?.devDependencies?.[name]).toBeUndefined();
    }
    expect(bunLockSource).not.toContain('"next@');
    expect(existsSync(new URL("../components.json", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../postcss.config.mjs", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../app", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../components", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../pages", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../lib", import.meta.url))).toBe(false);
  });

  test("defines the canonical package scripts", () => {
    expect(packageJson.scripts).toEqual({
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      test: "bun test",
      format: "oxfmt .",
      "format:check": "oxfmt --check .",
      lint: "oxlint .",
      "lint:fix": "oxlint --fix .",
      typecheck: "tsc --noEmit",
    });
  });
});

describe("repository automation artifacts", () => {
  const checkout = "actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98";
  const setupBun = "oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6";
  const cache = "actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9";
  const codeqlDigest = "cdf488f595d80d6e07e03d4674febd5ab45fa938";
  const concurrency =
    "${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}";

  test("runs one pinned, least-privilege CI quality job for every ref", () => {
    expect(ciWorkflowSource).toMatch(/push:\s*\n\s*branches: \["\*\*"\]\s*\n\s*tags: \["\*\*"\]/);
    expect(ciWorkflowSource).toMatch(/pull_request:\s*\n\s*branches: \["\*\*"\]/);
    expect(ciWorkflowSource).toContain("permissions:\n  contents: read");
    expect(ciWorkflowSource).toContain(`group: ${concurrency}`);
    expect(ciWorkflowSource).toContain("cancel-in-progress: true");
    expect(ciWorkflowSource).toMatch(/jobs:\s*\n  quality:\s*\n/);
    const jobsSource = ciWorkflowSource.split("\njobs:\n", 2)[1] ?? "";
    expect([...jobsSource.matchAll(/^  [a-z][\w-]*:\s*$/gm)].map(([job]) => job.trim())).toEqual([
      "quality:",
    ]);
    expect(ciWorkflowSource).toContain("runs-on: ubuntu-latest");
    expect(ciWorkflowSource).toContain("timeout-minutes: 20");
    expect(ciWorkflowSource).toContain(`uses: ${checkout}`);
    expect(ciWorkflowSource).toContain(`uses: ${setupBun} # v2`);
    expect(ciWorkflowSource).toContain(`uses: ${cache} # v6`);
    expect(ciWorkflowSource.match(/oven-sh\/setup-bun@/g)).toHaveLength(1);
    expect(ciWorkflowSource).not.toContain("GITHUB_TOKEN");

    const ciWorkflow = Bun.YAML.parse(ciWorkflowSource) as CiWorkflow;
    expect(Object.keys(ciWorkflow.jobs)).toEqual(["quality"]);
    expect(ciWorkflow.jobs.quality).toMatchObject({
      name: "Quality",
      "runs-on": "ubuntu-latest",
      "timeout-minutes": 20,
      permissions: { contents: "read" },
    });
    expect(
      ciWorkflow.jobs.quality?.steps.find((step) => step.uses?.startsWith("oven-sh/setup-bun@"))
        ?.with,
    ).toEqual({
      "bun-version": packageJson.packageManager?.replace("bun@", ""),
    });

    const commands = [...ciWorkflowSource.matchAll(/^\s+run: (.+)$/gm)].map((match) => match[1]);
    expect(commands).toEqual([
      "bun install --frozen-lockfile",
      "bun run format:check",
      "bun run lint",
      "bun run typecheck",
      "bun run test",
      "bun run build",
    ]);
  });

  test("uses a concise pinned advanced CodeQL workflow for JavaScript and TypeScript", () => {
    expect(codeqlWorkflowSource).toMatch(/push:\s*\n\s*branches: \["\*\*"\]/);
    expect(codeqlWorkflowSource).toMatch(/pull_request:\s*\n\s*branches: \["\*\*"\]/);
    expect(codeqlWorkflowSource).not.toMatch(/push:[\s\S]*?tags:/);
    expect(codeqlWorkflowSource).toContain('cron: "28 14 * * 1"');
    expect(codeqlWorkflowSource).toContain("permissions: {}");
    expect(codeqlWorkflowSource).toContain(`group: ${concurrency}`);
    expect(codeqlWorkflowSource).toContain("cancel-in-progress: true");
    expect(codeqlWorkflowSource).toContain("name: JS/TS");
    expect(codeqlWorkflowSource).toContain("timeout-minutes: 15");
    expect(codeqlWorkflowSource).toMatch(
      /permissions:\s*\n\s*contents: read\s*\n\s*security-events: write/,
    );
    expect(codeqlWorkflowSource).toContain(`uses: ${checkout}`);
    expect(codeqlWorkflowSource).toContain(`uses: github/codeql-action/init@${codeqlDigest} # v4`);
    expect(codeqlWorkflowSource).toContain("languages: javascript-typescript");
    expect(codeqlWorkflowSource).toContain("build-mode: none");
    expect(codeqlWorkflowSource).toContain(
      `uses: github/codeql-action/analyze@${codeqlDigest} # v4`,
    );
    expect(codeqlWorkflowSource).not.toMatch(/autobuild|matrix|boilerplate/i);
  });

  test("pins every GitHub Action reference to a full commit digest", () => {
    const actionUses =
      `${ciWorkflowSource}\n${codeqlWorkflowSource}`.match(/^\s*-?\s*uses:\s*\S+/gm) ?? [];
    expect(actionUses.length).toBeGreaterThan(0);
    for (const use of actionUses) expect(use).toMatch(/@[0-9a-f]{40}(?:\s|$)/);
  });

  test("groups coupled Renovate updates and tracks the root Bun packageManager", () => {
    expect(renovateConfig.extends).toEqual([
      "config:recommended",
      "helpers:pinGitHubActionDigests",
      "group:allNonMajor",
      ":enableVulnerabilityAlerts",
    ]);
    expect(renovateConfig.labels).toEqual(["Meta: Dependencies"]);
    expect(renovateConfig.schedule).toEqual(["before 12pm on Sunday"]);
    expect(renovateConfig.customManagers).toEqual([
      {
        customType: "regex",
        managerFilePatterns: ["/(^|/)package\\.json$/"],
        matchStrings: ['\\"packageManager\\"\\s*:\\s*\\"bun@(?<currentValue>[^\\"]+)\\"'],
        depNameTemplate: "bun",
        datasourceTemplate: "npm",
        versioningTemplate: "semver",
        autoReplaceStringTemplate: '"packageManager": "bun@{{{newValue}}}"',
      },
    ]);

    const groupRules = renovateConfig.packageRules?.filter((rule) => "groupName" in rule);
    expect(groupRules).toEqual([
      { groupName: "Bun runtime", matchPackageNames: ["bun", "@types/bun"] },
      { groupName: "Oxc tooling", matchPackageNames: ["oxfmt", "oxlint"] },
    ]);
    const automergeRules = renovateConfig.packageRules?.filter((rule) => rule.automerge === true);
    expect(automergeRules).toEqual([
      {
        matchManagers: ["bun"],
        matchUpdateTypes: ["minor", "patch", "pin"],
        automerge: true,
      },
    ]);
    expect(renovateConfig.packageRules).toContainEqual({
      matchManagers: ["github-actions"],
      automerge: false,
    });
    expect(renovateConfig.packageRules).toContainEqual({
      matchUpdateTypes: ["major"],
      automerge: false,
    });
    expect(renovateConfig.packageRules).toContainEqual({
      matchJsonata: ["$exists(vulnerabilityFixVersion)"],
      automerge: false,
    });

    const rules = renovateConfig.packageRules ?? [];
    const automergeIndex = rules.findIndex((rule) => rule.automerge === true);
    const githubActionsIndex = rules.findIndex(
      (rule) => Array.isArray(rule.matchManagers) && rule.matchManagers.includes("github-actions"),
    );
    const vulnerabilityIndex = rules.findIndex(
      (rule) =>
        Array.isArray(rule.matchJsonata) &&
        rule.matchJsonata.includes("$exists(vulnerabilityFixVersion)"),
    );
    expect(githubActionsIndex).toBeGreaterThan(automergeIndex);
    expect(vulnerabilityIndex).toBeGreaterThan(automergeIndex);
    expect(JSON.stringify(automergeRules)).not.toMatch(/digest|github-actions|custom\.regex/);
    expect(renovateConfig.osvVulnerabilityAlerts).toBe(true);
    expect(renovateConfig.vulnerabilityAlerts).toEqual({
      addLabels: ["security"],
      vulnerabilityFixStrategy: "lowest",
    });
  });
});

describe("TypeScript 7 compiler artifacts", () => {
  test("pins the exact native TypeScript compiler identity", () => {
    expect(packageJson.devDependencies?.typescript).toBe("7.0.2");
    expect(bunLock.workspaces?.[""]?.devDependencies?.typescript).toBe("7.0.2");
    expect(bunLock.packages?.typescript?.[0]).toBe("typescript@7.0.2");
  });

  test("uses a Next-free Bundler compiler contract", () => {
    expect(tsconfig.compilerOptions).toMatchObject({
      target: "ESNext",
      moduleResolution: "bundler",
      types: ["bun", "vite/client"],
      strict: true,
      noEmit: true,
    });
    expect(tsconfig.compilerOptions?.baseUrl).toBeUndefined();
    expect(tsconfig.compilerOptions?.plugins).toBeUndefined();
    expect(tsconfig.compilerOptions?.jsx).toBeUndefined();
    expect(String(tsconfig.compilerOptions?.moduleResolution).toLowerCase()).not.toMatch(
      /^(?:node|node10)$/,
    );
    expect(tsconfig.include).toEqual(["src", "tests", "vite.config.ts"]);
  });

  test("ignores generated TypeScript artifacts without tracking them", () => {
    expect(gitignoreSource.split(/\r?\n/)).toContain("*.tsbuildinfo");
    expect(gitignoreSource.split(/\r?\n/)).toContain("dist");
    expect(
      execFileSync("git", ["ls-files", "--", "next-env.d.ts", "tsconfig.tsbuildinfo"], {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
      }),
    ).toBe("");
  });
});

describe("Oxc tooling artifacts", () => {
  test("pins only the exact Oxc development tools", () => {
    expect(packageJson.devDependencies?.oxfmt).toBe("0.66.0");
    expect(packageJson.devDependencies?.oxlint).toBe("1.81.0");
    expect(packageJson.devDependencies?.eslint).toBeUndefined();
    expect(packageJson.devDependencies?.["@antfu/eslint-config"]).toBeUndefined();
  });

  test("removes the legacy ESLint configuration", () => {
    expect(existsSync(eslintConfigUrl)).toBe(false);
  });

  test("uses only operational OXFmt configuration", () => {
    expect(existsSync(oxfmtConfigUrl)).toBe(true);
    const config = JSON.parse(readFileSync(oxfmtConfigUrl, "utf8")) as OxfmtConfig;

    expect(config).toEqual({
      $schema: "./node_modules/oxfmt/configuration_schema.json",
      ignorePatterns: [".hermes/**", "dist/**", "src/logo.ts"],
    });
  });

  test("configures non-type-aware OXLint coverage explicitly", () => {
    expect(existsSync(oxlintConfigUrl)).toBe(true);
    const config = JSON.parse(readFileSync(oxlintConfigUrl, "utf8")) as OxlintConfig;

    expect(config).toEqual({
      $schema: "./node_modules/oxlint/configuration_schema.json",
      ignorePatterns: [".hermes/**", "dist/**"],
      categories: {
        correctness: "error",
        suspicious: "error",
      },
      plugins: ["eslint", "typescript", "unicorn", "oxc"],
      env: {
        browser: true,
        node: true,
      },
    });
    expect(JSON.stringify(config)).not.toMatch(/typeAware|tsgolint|experimental/i);
    for (const plugin of ["react", "nextjs", "jsx-a11y"]) {
      expect(config.plugins).not.toContain(plugin);
    }
  });
});

describe("CRT landing page artifacts", () => {
  test("keeps public metadata, the envelope mark, and the service caption", () => {
    expect(indexSource).toMatch(/<title>uwu<\/title>/);
    expect(indexSource).toMatch(/name="description"\s+content="OwO What’s This"/);
    expect(indexSource).toMatch(/property="og:url"\s+content="https:\/\/uwu\.ee\/"/);
    expect(indexSource).toMatch(/name="theme-color"\s+content="#818CF8"/);
    expect(indexSource).toContain('content="width=device-width, initial-scale=1"');
    expect(indexSource).not.toMatch(/maximum-scale|user-scalable/);
    expect(indexSource).toContain('src="/src/main.ts"');
    expect(indexSource).toContain('<pre id="c"></pre>');
    expect(indexSource).toContain(">Anonymous email forwarding service<");
    expect(indexSource).not.toMatch(/<h[1-6]\b/i);
    expect(indexSource).not.toMatch(/id="t"/);
    expect(indexSource).not.toMatch(/uwu@ee|~\/mail|\$/);
    expect(indexSource).not.toMatch(/<video\b/i);
    expect(indexSource).not.toMatch(/<form\b/i);
    expect(indexSource).not.toMatch(/invite/i);
    expect(styleSource).toContain("#caption");
    expect(styleSource).toMatch(
      /#caption\s*\{[^}]*color:\s*#ffffff[^}]*text-shadow:\s*0 0 5px #292929,\s*0 0 5px #ffffff/s,
    );
    expect(styleSource).not.toMatch(/#caption\s*\{[^}]*var\(--greyed\)/s);
    expect(styleSource).not.toMatch(/#t\b/);
  });

  test("keeps a hashed envelope ASCII mark with a highlighted uwu seal", () => {
    expect(logoSource).toContain("«uwu»");
    expect(logoSource).toMatch(/uwuowoqwq/);
    expect(logoSource).toMatch(/ {8,}/);
    expect(logoSource.split("\n").length).toBeGreaterThan(16);
    expect(createHash("sha256").update(logoSource).digest("hex")).toBe(asciiLogoHash);
    expect(mainSource).toContain('asciiLogo.split("«uwu»")');
    expect(mainSource).toContain('highlight.textContent = "«uwu»"');
  });

  test("keeps CRT scanlines, flicker, bloom, curvature, and indigo tokens", () => {
    expect(styleSource).toContain("--main: #818cf8");
    expect(styleSource).toContain("--greyed: #7b82c9");
    expect(styleSource).toContain("--text: #dfdfdf");
    expect(styleSource).toContain("@keyframes flicker");
    expect(styleSource).toContain("animation: flicker 0.15s infinite");
    expect(styleSource).toContain("prefers-reduced-motion");
    expect(styleSource).toContain("100% 2px");
    expect(styleSource).toContain("3px 100%");
    expect(styleSource).toContain("perspective(1100px)");
    expect(styleSource).toContain("rotateX(3.5deg)");
    expect(styleSource).toContain("inset 0 0 12vw");
    expect(styleSource).toContain("overflow: hidden");
    expect(styleSource).not.toMatch(/@import\s+"tailwindcss"/);
    expect(styleSource).not.toMatch(/@theme\b/);
  });

  test("removes invite auth, INVITE_CODE, and public video sources", () => {
    expect(trackedFiles.some((file) => file.startsWith("pages/api/"))).toBe(false);
    expect(trackedFiles.some((file) => file.startsWith("api/"))).toBe(false);
    expect(trackedFiles).not.toContain("public/assets/bg_av1.mp4");
    expect(trackedFiles).not.toContain("public/assets/bg.webm");
    expect(trackedFiles).not.toContain("public/assets/bg.mp4");
    expect(existsSync(new URL("../public/assets/bg_av1.mp4", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../pages/api/auth.ts", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../api/auth.ts", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../tests/auth.test.ts", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../lib/auth-feedback.ts", import.meta.url))).toBe(false);

    const sources = [
      indexSource,
      styleSource,
      logoSource,
      mainSource,
      readmeSource,
      agentsSource,
    ].join("\n");
    expect(sources).not.toMatch(/INVITE_CODE/);
    expect(sources).not.toMatch(/\/api\/auth/);
    expect(sources).not.toMatch(/bg_av1\.mp4|bg\.webm|bg\.mp4/);
  });

  test("deploys the Vite static dist output on Vercel", () => {
    expect(existsSync(new URL("../vercel.json", import.meta.url))).toBe(true);
    expect(vercelConfig).toEqual({
      $schema: "https://openapi.vercel.sh/vercel.json",
      framework: "vite",
      installCommand: "bun install --frozen-lockfile",
      buildCommand: "bun run build",
      outputDirectory: "dist",
    });
    expect(packageJson.scripts?.build).toBe("vite build");
  });
});

describe("maintainer documentation artifacts", () => {
  test("documents the supported stack, commands, and page invariants", () => {
    const canonicalCommands = [
      "bun install --frozen-lockfile",
      "bun run dev",
      "bun run format:check",
      "bun run lint",
      "bun run typecheck",
      "bun run test",
      "bun run build",
    ];
    for (const command of canonicalCommands) {
      expect(readmeSource).toContain(command);
      expect(agentsSource).toContain(command);
    }

    const bunRuntimeVersion = packageJson.packageManager?.replace("bun@", "") ?? "";
    expect(bunRuntimeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    const sharedArchitectureMarkers = [
      `Bun ${bunRuntimeVersion}`,
      "Vite 8.2",
      "TypeScript 7",
      "anonymous email forwarding",
      "CRT",
      "ASCII",
      "envelope",
      "no-scroll",
      "vercel.json",
      "dist",
    ];
    for (const marker of sharedArchitectureMarkers) {
      expect(readmeSource).toContain(marker);
      expect(agentsSource).toContain(marker);
    }

    const agentContractMarkers = [
      "OXFmt",
      "OXLint",
      "syntax-aware",
      "scanlines",
      "flicker",
      "curvature",
      "prefers-reduced-motion",
      "envelope",
      "Anonymous email forwarding service",
      "CodeQL",
      "Renovate",
      "Never push",
    ];
    for (const marker of agentContractMarkers) expect(agentsSource).toContain(marker);

    const staleMarkers = [
      /npm run/,
      /yarn/,
      /pnpm/,
      /next\/font/,
      /api\/hello/,
      /typecheck:ci/,
      /ESLint/,
      /No test suite/,
      /experimental\.appDir/,
      /Next\.js/,
      /ShadCN/,
      /Tailwind/,
      /INVITE_CODE/,
      /\/api\/auth/,
      /\[uwu@ee\]/,
    ];
    for (const source of [readmeSource, agentsSource]) {
      for (const marker of staleMarkers) expect(source).not.toMatch(marker);
      expect(source).not.toMatch(/without horizontal or vertical overflow/i);
      expect(source).not.toMatch(/for horizontal or vertical overflow/i);
      expect(source).toMatch(/hidden overflow/i);
      expect(source).toMatch(/horizontal clipping/i);
    }
  });
});
