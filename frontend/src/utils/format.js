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

// ---- Products sold by weight / volume --------------------------------------
// كغ  : qty in kg, price per kg, shown in grams.   start 1 kg,  +/- 100 g
// لتر : qty in L,  price per L,  shown in ml.      start 1 L,   +/- 100 ml
// غ   : qty in grams, price per 100 g.              start 100 g, +/- 100 g
export const isWeighedUnit = (unit) => ['كغ', 'غ', 'لتر'].includes(unit)

// how many "qty units" the price refers to (a 'غ' product is priced per 100 g, its qty is in grams)
export const priceDivisor = (unit) => (unit === 'غ' ? 100 : 1)

// small unit shown in the cart + how many of them are in one qty unit
export const smallUnit = (unit) => {
  if (unit === 'لتر') return { label: 'مل', factor: 1000 }
  if (unit === 'غ') return { label: 'غ', factor: 1 }
  return { label: 'غ', factor: 1000 }
}

// default step and starting quantity in the cart
export const defaultStep = (unit) => (unit === 'غ' ? 100 : 0.1)
export const startQty = (unit) => (unit === 'غ' ? 100 : 1)

// price basis label for forms
export const priceBasis = (unit) => (unit === 'لتر' ? 'للتر' : unit === 'غ' ? 'لكل 100 غ' : 'للكغ')

// Line total: if the cashier typed an amount (e.g. 2 DT), keep that exact amount
export const lineTotal = (item) =>
  item.fixedTotal != null ? item.fixedTotal : (item.price * item.qty) / priceDivisor(item.unit)