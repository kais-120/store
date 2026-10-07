// utils/timeAgo.js
const TIMEZONE = 'Africa/Tunis'

const formatter = new Intl.DateTimeFormat('ar-TN-u-nu-latn', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// Exact date and time, e.g. 28/09/2026 14:30
function exactTime(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const parts = Object.fromEntries(
    formatter.formatToParts(d).map((p) => [p.type, p.value])
  )

  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
}

// Relative time (kept from the original)
function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  return `منذ ${days} يوم`
}

module.exports = { timeAgo, exactTime }