// Mirrors priceDivisor / lineTotal from the frontend utils/format.js
// 'غ' products: qty in grams, price per 100 g. All other units: price per qty unit.
const priceDivisor = (unit) => (unit === "غ" ? 100 : 1);

const computeLineTotal = (price, quantity, unit) =>
  Number(((Number(price) * Number(quantity)) / priceDivisor(unit)).toFixed(3));

module.exports = { priceDivisor, computeLineTotal };