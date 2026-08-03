import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

interface PackageManifest {
  name?: string;
  private?: boolean;
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

const radixSlot = "@radix-ui/react-slot";
const radixSlotVersion = "1.3.3";
const nextReactCompatibilityPins = {
  next: "16.3.0",
  react: "19.2.8",
  "react-dom": "19.2.8",
} as const;
const runtimeDependencyPins = {
  "@radix-ui/react-slot": "1.3.3",
  "class-variance-authority": "0.7.1",
  clsx: "2.1.1",
  "lucide-react": "1.28.0",
  ...nextReactCompatibilityPins,
  sonner: "2.0.7",
  "tailwind-merge": "3.6.0",
} as const;
const developmentDependencyPins = {
  "@types/node": "26.1.2",
  "@types/react": "19.2.18",
  "@types/react-dom": "19.2.4",
  typescript: "7.0.2",
} as const;
const tailwindDependencyPins = {
  "@tailwindcss/postcss": "4.3.3",
  postcss: "8.5.25",
  tailwindcss: "4.3.3",
} as const;
const semanticColors = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;
const lightThemeTokens = {
  background: "0 0% 100%",
  foreground: "222.2 84% 4.9%",
  card: "0 0% 100%",
  "card-foreground": "222.2 84% 4.9%",
  popover: "0 0% 100%",
  "popover-foreground": "222.2 84% 4.9%",
  primary: "262.1 83.3% 57.8%",
  "primary-foreground": "210 40% 98%",
  secondary: "210 40% 96.1%",
  "secondary-foreground": "222.2 47.4% 11.2%",
  muted: "210 40% 96.1%",
  "muted-foreground": "215.4 16.3% 46.9%",
  accent: "210 40% 96.1%",
  "accent-foreground": "222.2 47.4% 11.2%",
  destructive: "0 84.2% 60.2%",
  "destructive-foreground": "210 40% 98%",
  border: "214.3 31.8% 91.4%",
  input: "214.3 31.8% 91.4%",
  ring: "262.1 83.3% 57.8%",
} as const;
const darkThemeTokens = {
  background: "222.2 84% 4.9%",
  foreground: "210 40% 98%",
  card: "222.2 84% 4.9%",
  "card-foreground": "210 40% 98%",
  popover: "222.2 84% 4.9%",
  "popover-foreground": "210 40% 98%",
  primary: "263.4 70% 50.4%",
  "primary-foreground": "210 40% 98%",
  secondary: "217.2 32.6% 17.5%",
  "secondary-foreground": "210 40% 98%",
  muted: "217.2 32.6% 17.5%",
  "muted-foreground": "215 20.2% 65.1%",
  accent: "217.2 32.6% 17.5%",
  "accent-foreground": "210 40% 98%",
  destructive: "0 62.8% 30.6%",
  "destructive-foreground": "210 40% 98%",
  border: "217.2 32.6% 17.5%",
  input: "217.2 32.6% 17.5%",
  ring: "263.4 70% 50.4%",
} as const;
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
const buttonSource = readFileSync(new URL("../components/ui/button.tsx", import.meta.url), "utf8");
const inputSource = readFileSync(new URL("../components/ui/input.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);
const legacyHeadUrl = new URL("../app/head.tsx", import.meta.url);
const layoutSource = readFileSync(layoutUrl, "utf8");
const eslintConfigUrl = new URL("../eslint.config.js", import.meta.url);
const nextConfigUrls = [
  new URL("../next.config.js", import.meta.url),
  new URL("../next.config.mjs", import.meta.url),
  new URL("../next.config.ts", import.meta.url),
];
const oxfmtConfigUrl = new URL("../.oxfmtrc.json", import.meta.url);
const oxlintConfigUrl = new URL("../.oxlintrc.json", import.meta.url);
const globalsCss = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const componentsConfig = JSON.parse(
  readFileSync(new URL("../components.json", import.meta.url), "utf8"),
) as { tailwind?: { config?: string } };
const postcssConfigUrl = new URL("../postcss.config.mjs", import.meta.url);
const legacyPostcssConfigUrl = new URL("../postcss.config.cjs", import.meta.url);
const tailwindConfigUrl = new URL("../tailwind.config.js", import.meta.url);
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
const readmeSource = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const agentsSource = readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

describe("Next App Router metadata artifacts", () => {
  test("uses typed Metadata and Viewport exports in the root layout", () => {
    expect(layoutSource).toMatch(
      /import\s+type\s*\{[^}]*\bMetadata\b[^}]*\bViewport\b[^}]*\}\s+from\s+["']next["']/,
    );
    expect(layoutSource).toMatch(/export\s+const\s+metadata\s*:\s*Metadata\s*=\s*\{/);
    expect(layoutSource).toMatch(/\btitle\s*:\s*["']uwu["']/);
    expect(layoutSource).toMatch(/\bdescription\s*:\s*["']OwO What’s This["']/);
    expect(layoutSource).toMatch(/\bother\s*:\s*\{\s*title\s*:\s*["']uwu["']\s*,?\s*\}/);
    expect(layoutSource).toMatch(/\bopenGraph\s*:\s*\{[^}]*\btype\s*:\s*["']website["']/);
    expect(layoutSource).toMatch(
      /\bopenGraph\s*:\s*\{[^}]*\burl\s*:\s*["']https:\/\/uwu\.ee\/["']/,
    );
    expect(layoutSource).not.toMatch(/\b(?:robots|alternates|icons)\s*:/);

    expect(layoutSource).toMatch(/export\s+const\s+viewport\s*:\s*Viewport\s*=\s*\{/);
    expect(layoutSource).toMatch(/\bwidth\s*:\s*["']device-width["']/);
    expect(layoutSource).toMatch(/\binitialScale\s*:\s*1\b/);
    expect(layoutSource).toMatch(/\bthemeColor\s*:\s*["']#818CF8["']/);
    expect(layoutSource).not.toMatch(/\b(?:maximumScale|userScalable|colorScheme)\s*:/);
  });

  test("removes stale raw head artifacts without introducing duplicate tags", () => {
    expect(existsSync(legacyHeadUrl)).toBe(false);
    expect(layoutSource).not.toMatch(/<\s*head\b/i);
    expect(layoutSource).not.toMatch(/<\s*(?:title|meta)\b/i);

    const appSources = collectSourceFiles(new URL("../app", import.meta.url).pathname).map((path) =>
      readFileSync(path, "utf8"),
    );
    expect(appSources.join("\n")).not.toMatch(
      /<\s*meta\b[^>]*(?:name\s*=\s*["'](?:viewport|theme-color|title|description)["']|property\s*=\s*["']og:(?:type|url)["'])/i,
    );
  });
});

describe("root package contract", () => {
  test("keeps the package identity private", () => {
    expect(packageJson.name).toBe("uwu.ee");
    expect(packageJson.private).toBe(true);
  });

  test("pins the Bun package manager", () => {
    expect(packageJson.packageManager).toBe("bun@1.3.14");
  });

  test("declares Radix Slot as an exact runtime dependency", () => {
    expect(packageJson.dependencies?.[radixSlot]).toBe(radixSlotVersion);
  });

  test("pins the Next and React compatibility group exactly", () => {
    for (const [name, version] of Object.entries(nextReactCompatibilityPins)) {
      expect(packageJson.dependencies?.[name]).toBe(version);
      expect(bunLock.workspaces?.[""]?.dependencies?.[name]).toBe(version);
      expect(bunLock.packages?.[name]?.[0]).toBe(`${name}@${version}`);
    }
    expect(packageJson.dependencies?.react).toBe(packageJson.dependencies?.["react-dom"]);
  });

  test("removes the obsolete App Router experiment configuration", () => {
    for (const configUrl of nextConfigUrls) expect(existsSync(configUrl)).toBe(false);
  });

  test("pins compatible UI packages as exact runtime dependencies", () => {
    for (const [name, version] of Object.entries(runtimeDependencyPins)) {
      expect(packageJson.dependencies?.[name]).toBe(version);
      expect(packageJson.devDependencies?.[name]).toBeUndefined();
      expect(bunLock.workspaces?.[""]?.dependencies?.[name]).toBe(version);
      expect(bunLock.packages?.[name]?.[0]).toBe(`${name}@${version}`);
    }
  });

  test("pins type tooling as exact development dependencies", () => {
    for (const [name, version] of Object.entries(developmentDependencyPins)) {
      expect(packageJson.devDependencies?.[name]).toBe(version);
      expect(packageJson.dependencies?.[name]).toBeUndefined();
      expect(bunLock.workspaces?.[""]?.devDependencies?.[name]).toBe(version);
      expect(bunLock.packages?.[name]?.[0]).toBe(`${name}@${version}`);
    }
  });

  test("removes the unused legacy Next font package from artifacts and source", () => {
    expect(packageJson.dependencies?.["@next/font"]).toBeUndefined();
    expect(packageJson.devDependencies?.["@next/font"]).toBeUndefined();
    expect(bunLockSource).not.toContain('"@next/font"');

    const sourceFiles = ["app", "components", "pages"].flatMap((directory) =>
      collectSourceFiles(new URL(`../${directory}`, import.meta.url).pathname),
    );
    for (const sourceFile of sourceFiles) {
      expect(readFileSync(sourceFile, "utf8")).not.toMatch(/(?:@next\/font|next\/font)/);
    }
  });

  test("defines the canonical package scripts", () => {
    expect(packageJson.scripts).toEqual({
      dev: "next dev",
      build: "next build",
      start: "next start",
      test: "bun test",
      "test:auth": "bun test tests/auth.test.ts",
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
  const setupBun = "oven-sh/setup-bun@b7a1c7ccf290d58743029c4f6903da283811b979";
  const cache = "actions/cache@9255dc7a253b0ccc959486e2bca901246202afeb";
  const codeqlDigest = "5d4e8d1aca955e8d8589aabd499c5cae939e33c7";
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
    expect(ciWorkflowSource).toContain(`uses: ${cache} # v5`);
    expect(ciWorkflowSource).not.toContain("bun-version:");
    expect(ciWorkflowSource.match(/oven-sh\/setup-bun@/g)).toHaveLength(1);
    expect(ciWorkflowSource).not.toContain("GITHUB_TOKEN");

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
    ]);
    expect(renovateConfig.labels).toEqual(["Meta: Dependencies"]);
    expect(renovateConfig.schedule).toEqual(["before 12pm on Sunday"]);
    expect(renovateConfig.customManagers).toEqual([
      {
        customType: "regex",
        managerFilePatterns: ["/(^|/)package\\.json$/"],
        matchStrings: ['"packageManager"\\s*:\\s*"bun@(?<currentValue>[^"\\s]+)"'],
        depNameTemplate: "bun",
        datasourceTemplate: "npm",
        versioningTemplate: "semver",
      },
    ]);

    const groupRules = renovateConfig.packageRules?.filter((rule) => "groupName" in rule);
    expect(groupRules).toEqual([
      { groupName: "Bun", matchPackageNames: ["bun", "@types/bun"] },
      {
        groupName: "Next.js and React",
        matchPackageNames: ["next", "react", "react-dom", "@types/react", "@types/react-dom"],
      },
      {
        groupName: "Tailwind CSS",
        matchPackageNames: ["tailwindcss", "@tailwindcss/postcss"],
      },
      { groupName: "Oxc tooling", matchPackageNames: ["oxfmt", "oxlint"] },
    ]);
    expect(renovateConfig.packageRules).toContainEqual({
      matchUpdateTypes: ["minor", "patch", "pin", "digest"],
      automerge: true,
    });
    expect(renovateConfig.vulnerabilityAlerts).toBeUndefined();
    expect(renovateConfig.osvVulnerabilityAlerts).toBeUndefined();
    expect(JSON.stringify(renovateConfig)).not.toMatch(/security label/i);
  });
});

describe("TypeScript 7 migration artifacts", () => {
  test("pins the exact native TypeScript compiler identity", () => {
    expect(packageJson.devDependencies?.typescript).toBe("7.0.2");
    expect(bunLock.workspaces?.[""]?.devDependencies?.typescript).toBe("7.0.2");
    expect(bunLock.packages?.typescript?.[0]).toBe("typescript@7.0.2");
  });

  test("uses the exact Next-compatible compiler contract", () => {
    expect(tsconfig.compilerOptions).toMatchObject({
      target: "ES2017",
      moduleResolution: "Bundler",
      types: ["bun"],
      strict: true,
      noEmit: true,
      plugins: [{ name: "next" }],
      paths: { "#/*": ["./*"] },
      lib: ["dom", "dom.iterable", "esnext"],
    });
    expect(tsconfig.compilerOptions?.baseUrl).toBeUndefined();
    expect(String(tsconfig.compilerOptions?.target).toLowerCase()).not.toBe("es5");
    expect(String(tsconfig.compilerOptions?.moduleResolution).toLowerCase()).not.toMatch(
      /^(?:node|node10)$/,
    );
    expect(tsconfig.include).toEqual([
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
    ]);
    expect(tsconfig.exclude).toEqual(["node_modules", "temp-shadcn-demo"]);
  });

  test("ignores generated TypeScript artifacts without tracking them", () => {
    expect(gitignoreSource.split(/\r?\n/)).toContain("next-env.d.ts");
    expect(gitignoreSource.split(/\r?\n/)).toContain("*.tsbuildinfo");
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
    expect(packageJson.devDependencies?.oxfmt).toBe("0.62.0");
    expect(packageJson.devDependencies?.oxlint).toBe("1.77.0");
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
      ignorePatterns: [".hermes/**"],
    });
  });

  test("configures non-type-aware OXLint coverage explicitly", () => {
    expect(existsSync(oxlintConfigUrl)).toBe(true);
    const config = JSON.parse(readFileSync(oxlintConfigUrl, "utf8")) as OxlintConfig;

    expect(config).toEqual({
      $schema: "./node_modules/oxlint/configuration_schema.json",
      categories: {
        correctness: "error",
        suspicious: "error",
      },
      plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "jsx-a11y", "nextjs"],
      env: {
        browser: true,
      },
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    });
    expect(JSON.stringify(config)).not.toMatch(/typeAware|tsgolint|experimental/i);
  });
});

describe("Tailwind CSS 4 migration artifacts", () => {
  test("pins the exact CSS toolchain identities without Autoprefixer", () => {
    for (const [name, version] of Object.entries(tailwindDependencyPins)) {
      expect(packageJson.devDependencies?.[name]).toBe(version);
      expect(packageJson.dependencies?.[name]).toBeUndefined();
      expect(bunLock.workspaces?.[""]?.devDependencies?.[name]).toBe(version);
      expect(bunLock.packages?.[name]?.[0]).toBe(`${name}@${version}`);
    }
    expect(packageJson.devDependencies?.autoprefixer).toBeUndefined();
    expect(packageJson.dependencies?.autoprefixer).toBeUndefined();
    expect(bunLock.packages?.autoprefixer).toBeUndefined();
  });

  test("uses only the framework-native ESM PostCSS plugin", () => {
    expect(existsSync(postcssConfigUrl)).toBe(true);
    expect(existsSync(legacyPostcssConfigUrl)).toBe(false);
    const source = existsSync(postcssConfigUrl) ? readFileSync(postcssConfigUrl, "utf8") : "";
    expect(source).toBe(
      'export default {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\n',
    );
  });

  test("removes legacy Tailwind configuration and selects CSS-first ShadCN configuration", () => {
    expect(existsSync(tailwindConfigUrl)).toBe(false);
    expect(componentsConfig.tailwind?.config).toBe("");
  });

  test("uses CSS-first Tailwind directives and preserves semantic theme mappings", () => {
    expect(globalsCss).toContain('@import "tailwindcss";');
    expect(globalsCss).toContain("@custom-variant dark (&:is(.dark *));");
    expect(globalsCss).toContain("@theme inline {");
    expect(globalsCss).toMatch(
      /--font-sans:\s+ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",/,
    );
    expect(globalsCss).not.toMatch(/@tailwind\b|@config\b|oklch\(/i);
    for (const color of semanticColors) {
      expect(globalsCss).toContain(`--color-${color}: var(--${color});`);
    }
    expect(globalsCss).toContain("--radius-sm: calc(var(--radius) - 4px);");
    expect(globalsCss).toContain("--radius-md: calc(var(--radius) - 2px);");
    expect(globalsCss).toContain("--radius-lg: var(--radius);");
  });

  test("preserves every exact HSL coordinate and legacy radius semantic", () => {
    for (const [name, coordinates] of Object.entries(lightThemeTokens)) {
      expect(globalsCss).toContain(`--${name}: hsl(${coordinates});`);
    }
    for (const [name, coordinates] of Object.entries(darkThemeTokens)) {
      expect(globalsCss).toContain(`--${name}: hsl(${coordinates});`);
    }
    expect(globalsCss).toContain("--radius: 0rem;");
    expect(globalsCss).not.toMatch(/hsl\(\s*var\(--/);
  });

  test("preserves the v3 system font stack and accessible hidden outlines", () => {
    expect(buttonSource).toContain("outline-hidden");
    expect(inputSource).toContain("outline-hidden");
    expect(`${buttonSource}\n${inputSource}`).not.toMatch(/\boutline-none\b/);
  });

  test("preserves the legacy underline and sRGB gradient rendering", () => {
    expect(pageSource).toContain("bg-primary-gradient");
    expect(pageSource).not.toMatch(
      /\b(?:bg-gradient-to-b|from-transparent|to-primary\/50|underline-offset-3)\b/,
    );
    expect(globalsCss).toContain("color-mix(in srgb, var(--primary) 50%, transparent)");
  });
});

describe("maintainer documentation artifacts", () => {
  test("documents the supported stack, commands, auth contract, and UI invariants", () => {
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

    const sharedArchitectureMarkers = [
      "Next.js 16.3",
      "React 19.2",
      "TypeScript 7",
      "Tailwind CSS 4",
      "App Router",
      "Pages API",
      "/api/auth",
      "INVITE_CODE",
      "503",
      "AV1 MP4",
      "WebM",
      "fallback MP4",
      "no-scroll",
    ];
    for (const marker of sharedArchitectureMarkers) {
      expect(readmeSource).toContain(marker);
      expect(agentsSource).toContain(marker);
    }

    const agentContractMarkers = [
      "OXFmt",
      "OXLint",
      "syntax-aware",
      "timing-safe",
      "UTF-16",
      "Allow: POST",
      "400",
      "401",
      "200",
      "ArrowRight",
      "next-env.d.ts",
      "*.tsbuildinfo",
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
      /Next\.js 16\.1\.1/,
    ];
    for (const source of [readmeSource, agentsSource]) {
      for (const marker of staleMarkers) expect(source).not.toMatch(marker);
    }
  });
});

describe("Radix Slot dependency artifacts", () => {
  test("is imported directly by Button", () => {
    expect(buttonSource).toMatch(/import\s+\{\s*Slot\s*\}\s+from\s+['"]@radix-ui\/react-slot['"]/);
  });

  test("is mirrored exactly in the Bun workspace root", () => {
    expect(bunLock.workspaces?.[""]?.dependencies?.[radixSlot]).toBe(radixSlotVersion);
  });

  test("has the exact resolved identity in the Bun lockfile", () => {
    expect(bunLock.packages?.[radixSlot]?.[0]).toBe(`${radixSlot}@${radixSlotVersion}`);
  });
});
