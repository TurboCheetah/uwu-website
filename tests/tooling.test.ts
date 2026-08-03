import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

interface PackageManifest {
  name?: string
  private?: boolean
  packageManager?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
}

interface BunLock {
  workspaces?: Record<string, {
    dependencies?: Record<string, string>
  }>
  packages?: Record<string, [string, ...unknown[]]>
}

const radixSlot = '@radix-ui/react-slot'
const radixSlotVersion = '1.3.3'
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as PackageManifest
const bunLock = Bun.JSONC.parse(readFileSync(new URL('../bun.lock', import.meta.url), 'utf8')) as BunLock
const buttonSource = readFileSync(new URL('../components/ui/button.tsx', import.meta.url), 'utf8')

describe('root package contract', () => {
  test('keeps the package identity private', () => {
    expect(packageJson.name).toBe('uwu.ee')
    expect(packageJson.private).toBe(true)
  })

  test('pins the Bun package manager', () => {
    expect(packageJson.packageManager).toBe('bun@1.3.14')
  })

  test('declares Radix Slot as an exact runtime dependency', () => {
    expect(packageJson.dependencies?.[radixSlot]).toBe(radixSlotVersion)
  })

  test('keeps the existing package scripts unchanged', () => {
    expect(packageJson.scripts).toEqual({
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'test': 'bun test',
      'test:auth': 'bun test tests/auth.test.ts',
      'lint': 'eslint .',
      'lint:fix': 'eslint . --fix',
      'typecheck:ci': 'tsc --noEmit',
    })
  })
})

describe('Radix Slot dependency artifacts', () => {
  test('is imported directly by Button', () => {
    expect(buttonSource).toMatch(/import\s+\{\s*Slot\s*\}\s+from\s+['"]@radix-ui\/react-slot['"]/)
  })

  test('is mirrored exactly in the Bun workspace root', () => {
    expect(bunLock.workspaces?.['']?.dependencies?.[radixSlot]).toBe(radixSlotVersion)
  })

  test('has the exact resolved identity in the Bun lockfile', () => {
    expect(bunLock.packages?.[radixSlot]?.[0]).toBe(`${radixSlot}@${radixSlotVersion}`)
  })
})
