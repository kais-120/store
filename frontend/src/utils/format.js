export const formatMoney = (value) => {
  const n = Number(value || 0)
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ت'
}

export const formatQty = (value, step = 1) => {
  const n = Number(value || 0)
  if (step < 1 || !Number.isInteger(n)) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  }
  return n.toLocaleString('en-US')
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const nowTime = () => new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
