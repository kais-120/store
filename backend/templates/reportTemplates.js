/**
 * templates/reportTemplates.js
 * Builds the full HTML document for each report type. Kept separate from
 * pdfGenerator.js so the markup/styling can be tweaked without touching
 * the rendering logic.
 */

const { formatDMY } = require('../utils/dateRange');

const money = (v, currency) => `${Number(v || 0).toFixed(3)} ${currency}`;

function layout({ shopName, reportTitle, periodLabel, summaryHtml, bodyHtml }) {
  const generatedAt = formatDMY(new Date());
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif;
    direction: rtl;
    color: #1a1a1a;
    margin: 0;
    font-size: 12px;
  }
  .header {
    border-bottom: 3px solid #2c7a4b;
    padding-bottom: 10px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header h1 { margin: 0; font-size: 20px; color: #2c7a4b; }
  .header .shop { font-size: 13px; color: #555; margin-top: 4px; }
  .header .meta { text-align: left; font-size: 11px; color: #555; }
  .summary { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .summary .card {
    flex: 1; min-width: 130px;
    background: #f4f9f6; border: 1px solid #d7ead9; border-radius: 8px;
    padding: 10px 12px;
  }
  .summary .card .label { font-size: 10px; color: #666; }
  .summary .card .value { font-size: 16px; font-weight: 700; color: #1f5c37; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; text-align: right; }
  th { background: #2c7a4b; color: #fff; font-weight: 600; }
  tr:nth-child(even) { background: #f8faf9; }
  .section-title { font-size: 14px; font-weight: 700; margin: 18px 0 6px; color: #2c7a4b; }
  .empty { text-align: center; color: #999; padding: 18px; border: 1px dashed #ddd; border-radius: 6px; }
  .total-row td { font-weight: 700; background: #eef6ef; }
  .warn { color: #b3261e; font-weight: 700; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${reportTitle}</h1>
      <div class="shop">${shopName}</div>
    </div>
    <div class="meta">
      <div>الفترة: ${periodLabel}</div>
      <div>تاريخ الإصدار: ${generatedAt}</div>
    </div>
  </div>
  ${summaryHtml}
  ${bodyHtml}
</body>
</html>`;
}

function summaryCard(label, value) {
  return `<div class="card"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

// ---------- تقرير المبيعات ----------
function buildSalesReport({ shopName, currency, periodLabel, data }) {
  const { sales, totals, count } = data;
  const rows = sales.length
    ? sales
        .map(
          (s) => `<tr>
            <td>${s.id}</td>
            <td>${formatDMY(s.date)}</td>
            <td>${s.customer?.name || 'زبون عابر'}</td>
            <td>${s.payment_method === 'cash' ? 'نقدي' : 'دين'}</td>
            <td>${money(s.total_amount, currency)}</td>
          </tr>`
        )
        .join('')
    : '';

  const bodyHtml = sales.length
    ? `<table>
        <thead><tr><th>رقم البيع</th><th>التاريخ</th><th>الزبون</th><th>طريقة الدفع</th><th>المبلغ</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row"><td colspan="4">الإجمالي</td><td>${money(totals.totalAmount, currency)}</td></tr>
        </tbody>
      </table>`
    : `<div class="empty">لا توجد مبيعات خلال هذه الفترة</div>`;

  const summaryHtml = `<div class="summary">
    ${summaryCard('عدد عمليات البيع', count)}
    ${summaryCard('إجمالي المبيعات', money(totals.totalAmount, currency))}
    ${summaryCard('مبيعات نقدية', money(totals.cashAmount, currency))}
    ${summaryCard('مبيعات بالدين', money(totals.debtAmount, currency))}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير المبيعات', periodLabel, summaryHtml, bodyHtml });
}

// ---------- تقرير الأرباح ----------
function buildProfitReport({ shopName, currency, periodLabel, data }) {
  const { rows, totals } = data;
  const tableRows = rows.length
    ? rows
        .map(
          (r) => `<tr>
            <td>${r.name}</td>
            <td>${r.category}</td>
            <td>${r.quantity}</td>
            <td>${money(r.revenue, currency)}</td>
            <td>${money(r.cost, currency)}</td>
            <td>${money(r.profit, currency)}</td>
          </tr>`
        )
        .join('')
    : '';

  const bodyHtml = rows.length
    ? `<table>
        <thead><tr><th>المنتج</th><th>الفئة</th><th>الكمية المباعة</th><th>المبيعات</th><th>التكلفة</th><th>الربح</th></tr></thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td colspan="2">الإجمالي</td>
            <td>${totals.quantity}</td>
            <td>${money(totals.revenue, currency)}</td>
            <td>${money(totals.cost, currency)}</td>
            <td>${money(totals.profit, currency)}</td>
          </tr>
        </tbody>
      </table>`
    : `<div class="empty">لا توجد مبيعات لاحتساب الأرباح خلال هذه الفترة</div>`;

  const margin = totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : '0.0';

  const summaryHtml = `<div class="summary">
    ${summaryCard('إجمالي المبيعات', money(totals.revenue, currency))}
    ${summaryCard('إجمالي التكلفة', money(totals.cost, currency))}
    ${summaryCard('صافي الربح', money(totals.profit, currency))}
    ${summaryCard('هامش الربح', margin + '%')}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير الأرباح', periodLabel, summaryHtml, bodyHtml });
}

// ---------- تقرير المشتريات ----------
const purchaseStatusLabel = { pending: 'قيد الانتظار', paid: 'مدفوع', debt: 'دين' };

function buildPurchasesReport({ shopName, currency, periodLabel, data }) {
  const { purchases, totals, count } = data;
  const rows = purchases.length
    ? purchases
        .map(
          (p) => `<tr>
            <td>${p.id}</td>
            <td>${formatDMY(p.date)}</td>
            <td>${p.supplier?.name || '-'}</td>
            <td>${purchaseStatusLabel[p.status] || p.status}</td>
            <td>${money(p.total_amount, currency)}</td>
          </tr>`
        )
        .join('')
    : '';

  const bodyHtml = purchases.length
    ? `<table>
        <thead><tr><th>رقم الشراء</th><th>التاريخ</th><th>المورّد</th><th>الحالة</th><th>المبلغ</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row"><td colspan="4">الإجمالي</td><td>${money(totals.totalAmount, currency)}</td></tr>
        </tbody>
      </table>`
    : `<div class="empty">لا توجد مشتريات خلال هذه الفترة</div>`;

  const summaryHtml = `<div class="summary">
    ${summaryCard('عدد عمليات الشراء', count)}
    ${summaryCard('إجمالي المشتريات', money(totals.totalAmount, currency))}
    ${summaryCard('مدفوعة', money(totals.byStatus.paid, currency))}
    ${summaryCard('ديون على المحل', money(totals.byStatus.debt, currency))}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير المشتريات', periodLabel, summaryHtml, bodyHtml });
}

// ---------- تقرير المصاريف ----------
function buildExpensesReport({ shopName, currency, periodLabel, data }) {
  const { expenses, totals, byCategory } = data;
  const rows = expenses.length
    ? expenses
        .map(
          (e) => `<tr>
            <td>${formatDMY(e.date)}</td>
            <td>${e.label}</td>
            <td>${e.category || '-'}</td>
            <td>${e.note || '-'}</td>
            <td>${money(e.amount, currency)}</td>
          </tr>`
        )
        .join('')
    : '';

  const bodyHtml = expenses.length
    ? `<table>
        <thead><tr><th>التاريخ</th><th>العنوان</th><th>الفئة</th><th>ملاحظات</th><th>المبلغ</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row"><td colspan="4">الإجمالي</td><td>${money(totals.totalAmount, currency)}</td></tr>
        </tbody>
      </table>
      ${
        byCategory.length
          ? `<div class="section-title">حسب الفئة</div>
             <table>
               <thead><tr><th>الفئة</th><th>المبلغ</th></tr></thead>
               <tbody>${byCategory
                 .map((c) => `<tr><td>${c.category}</td><td>${money(c.amount, currency)}</td></tr>`)
                 .join('')}</tbody>
             </table>`
          : ''
      }`
    : `<div class="empty">لا توجد مصاريف خلال هذه الفترة</div>`;

  const summaryHtml = `<div class="summary">
    ${summaryCard('عدد المصاريف', totals.count)}
    ${summaryCard('إجمالي المصاريف', money(totals.totalAmount, currency))}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير المصاريف', periodLabel, summaryHtml, bodyHtml });
}

// ---------- تقرير المخزون ----------
function buildInventoryReport({ shopName, currency, periodLabel, data }) {
  const { rows, totals, count } = data;
  const tableRows = rows.length
    ? rows
        .map(
          (r) => `<tr>
            <td>${r.name}</td>
            <td>${r.category}</td>
            <td>${r.stock} ${r.unit}</td>
            <td>${r.minStock} ${r.unit}</td>
            <td>${money(r.purchasePrice, currency)}</td>
            <td>${money(r.price, currency)}</td>
            <td>${money(r.stockValue, currency)}</td>
            <td>${r.lowStock ? '<span class="warn">مخزون منخفض</span>' : 'جيد'}</td>
          </tr>`
        )
        .join('')
    : '';

  const bodyHtml = rows.length
    ? `<table>
        <thead><tr><th>المنتج</th><th>الفئة</th><th>الكمية المتوفرة</th><th>الحد الأدنى</th><th>سعر الشراء</th><th>سعر البيع</th><th>قيمة المخزون</th><th>الحالة</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`
    : `<div class="empty">لا توجد منتجات مسجلة</div>`;

  const summaryHtml = `<div class="summary">
    ${summaryCard('عدد المنتجات', count)}
    ${summaryCard('قيمة المخزون (سعر الشراء)', money(totals.totalStockValue, currency))}
    ${summaryCard('منتجات منخفضة المخزون', totals.lowStockCount)}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير المخزون', periodLabel, summaryHtml, bodyHtml });
}

// ---------- تقرير الديون ----------
function buildDebtsReport({ shopName, currency, periodLabel, data }) {
  const { customersOwing, suppliersOwed, customerPayments, newCustomerDebts, supplierTransactions, totals } = data;

  const customersTable = customersOwing.length
    ? `<table>
        <thead><tr><th>الزبون</th><th>الهاتف</th><th>المبلغ المستحق</th></tr></thead>
        <tbody>${customersOwing
          .map((c) => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${money(c.balance, currency)}</td></tr>`)
          .join('')}</tbody>
      </table>`
    : `<div class="empty">لا يوجد زبائن عليهم ديون حالياً</div>`;

  const suppliersTable = suppliersOwed.length
    ? `<table>
        <thead><tr><th>المورّد</th><th>الهاتف</th><th>المبلغ المستحق</th></tr></thead>
        <tbody>${suppliersOwed
          .map((s) => `<tr><td>${s.name}</td><td>${s.phone}</td><td>${money(s.balance, currency)}</td></tr>`)
          .join('')}</tbody>
      </table>`
    : `<div class="empty">لا توجد مستحقات لموردين حالياً</div>`;

  const paymentsTable = customerPayments.length
    ? `<table>
        <thead><tr><th>التاريخ</th><th>الزبون</th><th>المبلغ المدفوع</th></tr></thead>
        <tbody>${customerPayments
          .map((p) => `<tr><td>${formatDMY(p.date)}</td><td>${p.customer?.name || '-'}</td><td>${money(p.amount, currency)}</td></tr>`)
          .join('')}</tbody>
      </table>`
    : `<div class="empty">لا توجد تسديدات من الزبائن خلال هذه الفترة</div>`;

  const newDebtsTable = newCustomerDebts.length
    ? `<table>
        <thead><tr><th>التاريخ</th><th>الزبون</th><th>مبلغ الدين الجديد</th></tr></thead>
        <tbody>${newCustomerDebts
          .map((s) => `<tr><td>${formatDMY(s.date)}</td><td>${s.customer?.name || 'زبون عابر'}</td><td>${money(s.total_amount, currency)}</td></tr>`)
          .join('')}</tbody>
      </table>`
    : `<div class="empty">لا توجد ديون جديدة على الزبائن خلال هذه الفترة</div>`;

  const supplierTxLabel = { purchase: 'شراء', payment: 'تسديد' };
  const supplierTxTable = supplierTransactions.length
    ? `<table>
        <thead><tr><th>التاريخ</th><th>المورّد</th><th>النوع</th><th>المبلغ</th></tr></thead>
        <tbody>${supplierTransactions
          .map(
            (t) =>
              `<tr><td>${formatDMY(t.date)}</td><td>${t.suppliers?.name || '-'}</td><td>${supplierTxLabel[t.type] || t.type}</td><td>${money(t.amount, currency)}</td></tr>`
          )
          .join('')}</tbody>
      </table>`
    : `<div class="empty">لا توجد معاملات موردين خلال هذه الفترة</div>`;

  const bodyHtml = `
    <div class="section-title">ديون الزبائن الحالية (مستحقة للمحل)</div>
    ${customersTable}
    <div class="section-title">مستحقات الموردين الحالية (على المحل)</div>
    ${suppliersTable}
    <div class="section-title">تسديدات الزبائن خلال الفترة</div>
    ${paymentsTable}
    <div class="section-title">ديون جديدة على الزبائن خلال الفترة</div>
    ${newDebtsTable}
    <div class="section-title">معاملات الموردين خلال الفترة</div>
    ${supplierTxTable}
  `;

  const summaryHtml = `<div class="summary">
    ${summaryCard('إجمالي ديون الزبائن', money(totals.totalCustomerDebt, currency))}
    ${summaryCard('إجمالي مستحقات الموردين', money(totals.totalSupplierDebt, currency))}
    ${summaryCard('تسديدات خلال الفترة', money(totals.periodPaymentsIn, currency))}
    ${summaryCard('ديون جديدة خلال الفترة', money(totals.periodNewDebt, currency))}
  </div>`;

  return layout({ shopName, reportTitle: 'تقرير الديون', periodLabel, summaryHtml, bodyHtml });
}

module.exports = {
  buildSalesReport,
  buildProfitReport,
  buildPurchasesReport,
  buildExpensesReport,
  buildInventoryReport,
  buildDebtsReport,
};