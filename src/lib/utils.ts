export function getLastNDates(n: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    d.setUTCDate(now.getUTCDate() - i)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    dates.push(`${y}${m}${day}`)
  }
  return dates
}

export function sortDesc(items: any[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function groupByDay<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, it) => {
    const d = new Date(it.date)
    const day = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
    acc[day] ||= []
    acc[day].push(it)
    return acc
  }, {} as Record<string, T[]>)
}

export function formatSectionDate(yyyymmdd: string) {
  return `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`
}
