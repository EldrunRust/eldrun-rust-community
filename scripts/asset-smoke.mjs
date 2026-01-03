const base = process.argv[2] || 'http://localhost:3002'
const mode = process.argv[3] || 'throttled'

const pages = [
  '/',
  '/news',
  '/forum',
  '/shop',
  '/casino',
  '/classes',
  '/features',
  '/profile',
  '/chat',
  '/heatmap',
]

const reAttr = /(?:src|href)=(?:"|')([^"']+)(?:"|')/g
const reUrl = /url\((?:"|')?([^"')]+)(?:"|')?\)/g

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const norm = (u) => {
  if (!u) return null
  if (u.startsWith('http://') || u.startsWith('https://')) {
    try {
      const x = new URL(u)
      if (x.origin !== new URL(base).origin) return null
      return x.pathname + (x.search || '')
    } catch {
      return null
    }
  }
  if (u.startsWith('//')) return null
  if (u.startsWith('data:')) return null
  if (!u.startsWith('/')) return null
  return u
}

const okStatus = new Set([200, 204, 301, 302, 307, 308])

async function main() {
  console.log('[asset-smoke] base:', base)
  console.log('[asset-smoke] mode:', mode)

  const assets = new Set()

  console.log('[asset-smoke] crawl pages...')
  for (const p of pages) {
    try {
      const r = await fetch(base + p, { redirect: 'follow' })
      const html = await r.text()

      for (const re of [reAttr, reUrl]) {
        re.lastIndex = 0
        let m
        while ((m = re.exec(html))) {
          const u = norm(m[1])
          if (u) assets.add(u)
        }
      }

      console.log(' page', p, '->', r.status, 'assets', assets.size)
      if (mode === 'throttled') await sleep(250)
    } catch (e) {
      console.log(' page', p, '-> ERR')
    }
  }

  const list = [...assets].sort()
  console.log('[asset-smoke] check assets...', list.length)

  const bad = []
  for (let i = 0; i < list.length; i++) {
    const u = list[i]
    try {
      const r = await fetch(base + u, { redirect: 'manual' })
      const st = r.status
      if (!okStatus.has(st)) {
        bad.push([u, st, r.headers.get('location') || ''])
      }
    } catch {
      bad.push([u, 'ERR', ''])
    }

    if ((i + 1) % 10 === 0) {
      console.log(' checked', i + 1, '/', list.length, 'bad', bad.length)
    }

    if (mode === 'throttled') await sleep(150)
  }

  console.log('[asset-smoke] DONE. bad=', bad.length)
  for (const [u, st, loc] of bad.slice(0, 200)) {
    console.log(st, u, loc ? `-> ${loc}` : '')
  }

  process.exitCode = bad.length ? 1 : 0
}

main().catch((e) => {
  console.error('[asset-smoke] fatal:', e)
  process.exit(2)
})
