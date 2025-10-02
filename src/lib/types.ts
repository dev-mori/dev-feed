export type SourceType = 'RSS' | 'GitHub' | 'Twitter'

export interface FeedItem {
  title: string
  date: string // ISO string
  source: 'Qiita' | 'Zenn' | 'GitHub' | 'Twitter' | string
  url: string
  content: string
}
