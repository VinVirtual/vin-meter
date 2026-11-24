// Repository checks: SKILL.md is valid and matches the repository, every file it mentions
// exists, and nothing private or third-party-branded is committed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROOT } from './helpers.mjs'

const NAME = 'vin-meter'
const skillText = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8')

function frontmatter (text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text)
  if (!m) return null
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (kv) data[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  return { data, body: m[2] }
}

/** Files git would publish; a plain walk when this is not a git checkout. */
function publishedFiles () {
  const r = spawnSync('git', ['-C', ROOT, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  if (r.status === 0 && r.stdout) return r.stdout.split('\0').filter(Boolean)
  const out = []
  const walk = (d) => {
    for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
      if (['.git', 'node_modules', '.scratch'].includes(e.name)) continue
      const rel = path.join(d, e.name)
      if (e.isDirectory()) walk(rel); else out.push(rel)
    }
  }
  walk('')
  return out
}
const BINARY = /\.(png|jpe?g|gif|webp|pdf|docx|xlsx|pptx|mp4|zip)$/i
const textFiles = () => publishedFiles().filter(f => !BINARY.test(f) && fs.existsSync(path.join(ROOT, f)))

test('SKILL.md frontmatter: name matches the repository, description within limits and says when to use it', () => {
  const fm = frontmatter(skillText)
  assert.ok(fm, 'SKILL.md has no frontmatter')
  assert.equal(fm.data.name, NAME)
  assert.match(fm.data.name, /^[a-z0-9]+(-[a-z0-9]+)*$/)
  assert.ok(fm.data.description, 'description missing')
  assert.ok(fm.data.description.length <= 1024, `description is ${fm.data.description.length} characters`)
  assert.ok(!/[<>]/.test(fm.data.description), 'description must not contain < or >')
  assert.match(fm.data.description, /\buse (when|for|before|after)\b/i)
  assert.ok(fm.body.trim().length > 200, 'SKILL.md body is empty')
  assert.ok(fm.body.split('\n').length < 500, 'SKILL.md body should stay under 500 lines')
})

test('every references/ and scripts/ path that SKILL.md mentions exists', () => {
  const refs = new Set()
  for (const m of skillText.matchAll(/`((?:references|scripts)\/[A-Za-z0-9_./-]+)`/g)) refs.add(m[1])
  for (const m of skillText.matchAll(/\]\(((?:references|scripts)\/[^)\s]+)\)/g)) refs.add(m[1])
  for (const r of refs) assert.ok(fs.existsSync(path.join(ROOT, r)), `SKILL.md mentions ${r}, which does not exist`)
})

test('README installs into a folder named like the skill and links the licence', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes(`git clone https://github.com/VinVirtual/${NAME} ~/.claude/skills/${NAME}`))
  assert.ok(readme.includes(`/plugin install ${NAME}@vinskills`))
  assert.match(readme, /\(LICENSE\)/)
  assert.match(fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8'), /Copyright \(c\) \d{4} Lashvin Manimaran/)
})

test('no third-party tool names, old names or private material in any committed file', () => {
  // Names are split so this file does not match itself.
  const banned = [['code', 'burn'], ['vin-', 'burn'], ['ser', 'ena'], ['head', 'room'], ['any', 'doc'], ['code', '-mode'], ['code ', 'mode'], ['east', 'world'], ['crowd', '-lights'], ['photo', '-drop'], ['virtu', 'als']].map(p => p.join(''))
  for (const f of textFiles()) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8').toLowerCase()
    for (const b of banned) assert.ok(!text.includes(b), `${f} mentions "${b}"`)
  }
})

test('no personal e-mail addresses or absolute home paths in committed files', () => {
  const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
  const home = new RegExp('/' + 'home/[a-z]|/' + 'Users/[A-Za-z]')
  for (const f of textFiles()) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8')
    for (const m of text.matchAll(email)) {
      const ok = /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(m[0]) || /@users\.noreply\.github\.com$/.test(m[0]) || /@(example\.(com|org|net)|[a-z0-9.-]+\.example)$/i.test(m[0]) || /vin-privacy: allow/.test(text.slice(text.lastIndexOf('\n', m.index) + 1, text.indexOf('\n', m.index)))
      assert.ok(ok, `${f}: e-mail address ${m[0]}`)
    }
    const lines = text.split('\n').filter(l => home.test(l) && !/vin-privacy: allow/.test(l))
    assert.deepEqual(lines, [], `${f}: absolute home path`)
  }
})
