import React from 'react'
import { FeedItem } from '../lib/types'

export default function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article style={{
      border: '1px solid #1f2937', borderRadius: 10, padding: 12,
      background: 'linear-gradient(180deg, rgba(31,41,55,0.35), rgba(17,24,39,0.35))'
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, padding: '2px 6px', border: '1px solid #374151', borderRadius: 999 }}>
          {item.source}
        </span>
        <time style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(item.date).toLocaleString()}</time>
      </div>
      <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 16, fontWeight: 600, display: 'inline-block' }}>
        {item.title}
      </a>
    </article>
  )
}
