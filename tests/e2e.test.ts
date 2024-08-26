import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import { restoreCache, saveCache } from '@actions/cache'
import { describe, expect, test } from 'vitest'

const TEST_TEMP_DIR = path.join(import.meta.dirname, 'temp')
await fs.mkdir(TEST_TEMP_DIR, { recursive: true })
const testFilePath = path.join(TEST_TEMP_DIR, 'test.bin')

const MB = 1024 * 1024

describe('save and restore cache with @actions/cache package', () => {
  for (const size of [5 * MB, 50 * MB, 500 * MB, 1024 * MB])
    test(`${size} Bytes`, { timeout: 60_000 }, async () => {
      // save
      const expectedContents = crypto.randomBytes(size)
      await fs.writeFile(testFilePath, expectedContents)
      await saveCache([testFilePath], 'cache-key')
      await fs.rm(testFilePath)

      // restore
      const cacheHitKey = await restoreCache([testFilePath], 'cache-key')
      expect(cacheHitKey).toBe('cache-key')

      // check contents
      const restoredContents = await fs.readFile(testFilePath)
      expect(restoredContents.compare(expectedContents)).toBe(0)
    })
})
