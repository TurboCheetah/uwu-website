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
const eslintConfigUrl = new URL("../eslint.config.js", import.meta.url);
const nextConfigUrls = [
  new URL("../next.config.js", import.meta.url),
  new URL("../next.config.mjs", import.meta.url),
  new URL("../next.config.ts", import.meta.url),
];
const oxfmtConfigUrl = new URL("../.oxfmtrc.json", import.meta.url);
const oxlintConfigUrl = new URL("../.oxlintrc.json", import.meta.url);

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

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
      "typecheck:ci": "tsc --noEmit",
    });
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
