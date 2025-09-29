import React, { useEffect, useMemo, useState } from 'react'
import { FeedItem } from './lib/types'
import { formatSectionDate, getLastNDates, groupByDay, sortDesc } from './lib/utils'
import FeedCard from './components/FeedCard'

const DAYS = 3

export default function App() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const dates = getLastNDates(DAYS)
        const results: FeedItem[] = []
        for (const d of dates) {
          try {
            const res = await fetch(`./data/summary-${d}.json`, { cache: 'no-store' })
            if (!res.ok) continue
            const arr = (await res.json()) as FeedItem[]
            arr.forEach(x => results.push(x))
          } catch (e) {
            // ignore missing
          }
        }
        setItems(sortDesc(results))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const grouped = useMemo(() => groupByDay(items), [items])

  return (
    <main>
      {loading && <p>読み込み中...</p>}
      {!loading && items.length === 0 && (
        <p>データがありません。GitHub Actions のスケジュールが実行されると表示されます。</p>
      )}
      {Object.entries(grouped).map(([day, list]) => (
        <section key={day} style={{ margin: '16px 0' }}>
          <h2 style={{ fontSize: 16, color: '#93c5fd', margin: '12px 4px' }}>{formatSectionDate(day)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {list.map((item, idx) => (
              <FeedCard key={`${day}-${idx}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
