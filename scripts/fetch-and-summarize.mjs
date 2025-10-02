/*
  Fetch RSS & GitHub releases, summarize by Claude, and save to public/data/summary-YYYYMMDD.json
*/
import fs from 'fs'
import path from 'path'
import Parser from 'rss-parser'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataDir = path.join(root, 'public', 'data')
const configPath = path.join(root, 'config', 'sources.json')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const MAX_ITEMS = Number(process.env.MAX_ITEMS || '40') // item cap per day

function yyyymmddUTC(date = new Date()) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }


async function fetchRSS(rssList) {
  const parser = new Parser()
  const out = []
  for (const url of rssList) {
    try {
      const feed = await parser.parseURL(url)
      for (const item of feed.items || []) {
        if (!item.link || !item.title) continue
        const content = item['content:encoded'] || item.content || item.summary || item.contentSnippet || ''
        out.push({
          title: item.title,
          date: item.isoDate || item.pubDate || new Date().toISOString(),
          source: feed.title || 'RSS',
          url: item.link,
          raw: content
        })
      }
      await sleep(300)
    } catch (e) {
      console.error('RSS fetch error', url, e.message)
    }
  }
  return out
}

async function fetchGitHubReleases(repos) {
  const out = []
  for (const repo of repos) {
    try {
      const headers = {
        'accept': 'application/vnd.github+json',
        'user-agent': 'dev-feed-script'
      }
      if (GITHUB_TOKEN) headers['authorization'] = `Bearer ${GITHUB_TOKEN}`
      const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, { headers })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const arr = await res.json()
      for (const r of arr) {
        out.push({
          title: `${repo} – ${r.name || r.tag_name}`,
          date: r.published_at || r.created_at || new Date().toISOString(),
          source: 'GitHub',
          url: r.html_url,
          raw: r.body || ''
        })
      }
      await sleep(200)
    } catch (e) {
      console.error('GitHub fetch error', repo, e.message)
    }
  }
  return out
}

async function fetchTwitter(users) {
  const out = []
  for (const user of users || []) {
    const rssUrl = `https://nitter.net/${user}/rss`
    try {
      const parser = new Parser()
      const feed = await parser.parseURL(rssUrl)
      for (const item of feed.items || []) {
        if (!item.link || !item.title) continue
        out.push({
          title: item.title.replace(/\s+/g, ' ').slice(0, 120),
          date: item.isoDate || item.pubDate || new Date().toISOString(),
          source: 'Twitter',
          url: item.link,
          raw: item.contentSnippet || ''
        })
      }
    } catch (e) {
      console.warn('Twitter(Nitter) fetch skipped', user, e.message)
    }
  }
  return out
}

function rotateOldFiles(dir, keepDays = 3) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir).filter(f => /^summary-\d{8}\.json$/.test(f))
  const today = new Date()
  const limit = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (keepDays - 1)))
  for (const f of files) {
    const m = f.match(/summary-(\d{8})\.json/)
    if (!m) continue
    const y = +m[1].slice(0,4)
    const mo = +m[1].slice(4,6) - 1
    const d = +m[1].slice(6,8)
    const fileDate = new Date(Date.UTC(y, mo, d))
    if (fileDate < limit) {
      fs.unlinkSync(path.join(dir, f))
      console.log('deleted old', f)
    }
  }
}

async function main() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  const [rssItems, ghItems, twItems] = await Promise.all([
    fetchRSS(config.rss || []),
    fetchGitHubReleases(config.github_repos || []),
    fetchTwitter(config.twitter_users || [])
  ])

  const merged = [...rssItems, ...ghItems, ...twItems]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Deduplicate by URL and cap items for cost control
  const seen = new Set()
  const deduped = []
  for (const it of merged) {
    if (!it.url || seen.has(it.url)) continue
    seen.add(it.url)
    deduped.push(it)
  }
  const limited = deduped.slice(0, Math.max(0, MAX_ITEMS))

  const processed = limited.map(it => ({
    title: it.title,
    date: new Date(it.date).toISOString(),
    source: it.source,
    url: it.url,
    content: it.raw || ''
  }))

  const filename = `summary-${yyyymmddUTC()}.json`
  const outPath = path.join(dataDir, filename)
  fs.writeFileSync(outPath, JSON.stringify(processed, null, 2))
  console.log('written', outPath)

  rotateOldFiles(dataDir, 3)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
