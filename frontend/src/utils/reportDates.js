// Reusable date-range helpers for reports.
// All comparisons are done on local dates (no UTC conversion) to avoid
// timezone off-by-one bugs with 'YYYY-MM-DD' strings.

const WEEKDAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null
  const [y, m, d] = parts
  return new Date(y, m - 1, d)
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDisplayDate(date) {
  if (!date) return ''
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function getTodayRange() {
  const now = new Date()
  return { start: startOfDay(now), end: endOfDay(now), error: null }
}

// Week starts on Saturday (Sat..Fri), matching local business-week convention.
export function getWeekRange() {
  const now = new Date()
  const day = now.getDay() // Sun=0 .. Sat=6
  const diffFromSaturday = (day + 1) % 7
  const start = startOfDay(now)
  start.setDate(start.getDate() - diffFromSaturday)
  const end = endOfDay(new Date(start))
  end.setDate(start.getDate() + 6)
  return { start, end, error: null }
}

export function getMonthRange() {
  const now = new Date()
  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { start, end, error: null }
}

export function getCustomRange(startStr, endStr) {
  if (!startStr || !endStr) return { start: null, end: null, error: null }
  const start = parseLocalDate(startStr)
  const end = parseLocalDate(endStr)
  if (!start || !end) return { start: null, end: null, error: 'تاريخ غير صالح' }
  if (start > end) return { start: null, end: null, error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية أو يساويه' }
  return { start: startOfDay(start), end: endOfDay(end), error: null }
}

export function isDateInRange(dateStr, start, end) {
  if (!dateStr || !start || !end) return false
  const d = parseLocalDate(dateStr)
  if (!d) return false
  return d >= start && d <= end
}

export function filterByDateRange(records, dateField, start, end) {
  if (!start || !end) return []
  return records.filter((r) => isDateInRange(r[dateField], start, end))
}

// Builds one bucket per day between start and end (inclusive), with both a
// weekday label (good for a 7-day week) and a short date label (good for
// longer ranges like a month, where weekday names would repeat).
export function buildDayBuckets(start, end) {
  const buckets = []
  const cur = startOfDay(new Date(start))
  const last = startOfDay(new Date(end))
  while (cur <= last) {
    buckets.push({
      iso: toISO(cur),
      weekday: WEEKDAY_LABELS[cur.getDay()],
      shortDate: `${cur.getDate()}/${cur.getMonth() + 1}`,
    })
    cur.setDate(cur.getDate() + 1)
  }
  return buckets
}

export function groupAmountByDay(records, dateField, amountField, start, end, labelType = 'weekday') {
  const buckets = buildDayBuckets(start, end)
  const sums = new Map(buckets.map((b) => [b.iso, 0]))
  records.forEach((r) => {
    const dStr = r[dateField]
    if (dStr && sums.has(dStr)) {
      sums.set(dStr, sums.get(dStr) + (Number(r[amountField]) || 0))
    }
  })
  return buckets.map((b) => ({
    day: labelType === 'weekday' ? b.weekday : b.shortDate,
    value: +sums.get(b.iso).toFixed(3),
  }))
}