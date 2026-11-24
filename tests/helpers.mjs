// Shared test helpers: the repository root, temp folders, running the CLI.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const here = (...p) => path.join(ROOT, ...p)

export function tmpdir (prefix = 'vin-meter-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

export function runNode (script, args = [], opts = {}) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 60000, ...opts })
}

export function has (cmd, args = ['--version']) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  return !r.error
}
