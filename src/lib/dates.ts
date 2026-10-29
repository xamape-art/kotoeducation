// "YYYY-MM-DD" for a date in the browser's time zone (toISOString would use UTC and can give yesterday)
export function toDbDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayDb() {
  return toDbDate(new Date())
}

// Parse "YYYY-MM-DD" as a local date (new Date(str) would read it as UTC)
export function parseDbDate(dbDate: string) {
  const [y, m, d] = dbDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}
