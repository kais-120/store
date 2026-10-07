/**
 * utils/dateRange.js
 * Turns a { period, date, startDate, endDate } query into a concrete
 * { start, end, label } Date range used to filter reports.
 *
 * period: 'today' | 'week' | 'month' | 'custom'
 *  - today  -> current calendar day
 *  - week   -> current week (Monday -> Sunday)
 *  - month  -> current calendar month
 *  - custom -> requires either:
 *        date: 'YYYY-MM-DD'                 (single day)
 *      or startDate & endDate: 'YYYY-MM-DD'  (range)
 */

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatDMY(d) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getDateRange({ period, date, startDate, endDate }) {
  const now = new Date();

  switch (period) {
    case 'today': {
      return { start: startOfDay(now), end: endOfDay(now), label: `اليوم (${formatDMY(now)})` };
    }

    case 'week': {
      const day = now.getDay(); // 0 = Sunday ... 6 = Saturday
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: startOfDay(monday),
        end: endOfDay(sunday),
        label: `هذا الأسبوع (${formatDMY(monday)} - ${formatDMY(sunday)})`,
      };
    }

    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: startOfDay(first),
        end: endOfDay(last),
        label: `هذا الشهر (${formatDMY(first)} - ${formatDMY(last)})`,
      };
    }

    case 'custom': {
      if (startDate && endDate) {
        return {
          start: startOfDay(startDate),
          end: endOfDay(endDate),
          label: `من ${formatDMY(startDate)} إلى ${formatDMY(endDate)}`,
        };
      }
      if (date) {
        return { start: startOfDay(date), end: endOfDay(date), label: formatDMY(date) };
      }
      const err = new Error('يجب إرسال "date" أو "startDate" و "endDate" عند اختيار فترة مخصّصة');
      err.status = 400;
      throw err;
    }

    default: {
      const err = new Error('الفترة غير صالحة. القيم المسموحة: today, week, month, custom');
      err.status = 400;
      throw err;
    }
  }
}

module.exports = { getDateRange, formatDMY };