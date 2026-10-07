import React, { useEffect, useMemo, useState } from 'react'
import {
  Box, SimpleGrid, Card, CardHeader, CardBody, Heading, HStack, Stack, Button, Table, Thead, Tbody, Tr, Th, Td,
  Text, Input, FormControl, FormLabel, Alert, AlertIcon, Badge, useToast,
} from '@chakra-ui/react'
import { Download } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../components/common/PageHeader'
import { categories, stockStatus } from '../data/products'
import { formatMoney } from '../utils/format'
import {
  getTodayRange, getWeekRange, getMonthRange, getCustomRange,
  formatDisplayDate,
} from '../utils/reportDates'
import { getReport, getReportInfo, getReportSalesTrend, getReportStatus } from '../services/api'

const periods = [
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'custom', label: 'فترة مخصصة' },
]

const periodLabels = { today: 'اليوم', week: 'هذا الأسبوع', month: 'هذا الشهر', custom: 'الفترة المحددة' }

const reportTypes = [
  { id: 'sales', label: 'المبيعات' },
  { id: 'profit', label: 'الأرباح' },
  { id: 'purchases', label: 'المشتريات' },
  { id: 'expenses', label: 'المصاريف' },
  { id: 'inventory', label: 'المخزون' },
  { id: 'debts', label: 'الديون' },
]

const pieColors = ['#1B5E6B', '#C68A2E', '#6B8E4E', '#D9A441', '#B03A2E', '#549390', '#8E6BAE']

async function downloadReportPdf({ type, period, customStart, customEnd }) {
  const params = new URLSearchParams({ period })
  if (period === 'custom') {
    if (!customStart || !customEnd) {
      throw new Error('اختر تاريخي البداية والنهاية أولاً')
    }
    params.set('startDate', customStart)
    params.set('endDate', customEnd)
  }

  const res = await getReport(type, params.toString())

  if (res.status !== 200) {
    throw new Error(res.data?.message || 'تعذّر توليد التقرير')
  }

  const blob = res.data
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${type}-report.pdf`

  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
}

function KpiCard({ label, value, hint }) {
  return (
    <Card>
      <CardBody>
        <Text fontSize="sm" color="ink.muted" fontWeight="600" mb={1}>{label}</Text>
        <Heading size="md">{value}</Heading>
        {hint && <Text fontSize="xs" color="ink.muted" mt={1}>{hint}</Text>}
      </CardBody>
    </Card>
  )
}

function EmptyState({ message }) {
  return (
    <Alert status="info" borderRadius="md">
      <AlertIcon />
      {message}
    </Alert>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState('today')
  const [reportType, setReportType] = useState('sales')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [status, setStatus] = useState({})
  const [saleTrend, setSaleTrend] = useState([])
  const [reportInfo, setReportInfo] = useState([])

  const toast = useToast()

  const range = useMemo(() => {
    if (period === 'today') return getTodayRange()
    if (period === 'week') return getWeekRange()
    if (period === 'month') return getMonthRange()
    return getCustomRange(customStart, customEnd)
  }, [period, customStart, customEnd])

  const hasRange = Boolean(range.start && range.end)

const filteredSales = useMemo(() => {
  if (reportType !== 'sales' || !reportInfo?.factures) return []
  return reportInfo.factures.map((f) => ({
    id: f.id,
    date: f.date,
    customer: f.customer,
    amount: f.amount,
    method: f.payment_method === 'cash' ? 'نقدي' : 'دين',
  }))
}, [reportType, reportInfo])

  const filteredPurchases = useMemo(() => {
    if (reportType !== 'purchases' || !reportInfo?.purchases) return []
    return reportInfo.purchases.map((p) => ({
      id: p.id,
      date: p.date,
      supplierName: p.supplier?.name || '-',
      amount: p.total_amount,
      status: p.status,
    }))
  }, [reportType, reportInfo])

  const filteredExpenses = useMemo(() => {
    // date, label, amount already match reportService's shape as-is
    return reportType === 'expenses' ? (reportInfo?.expenses || []) : []
  }, [reportType, reportInfo])

  const products = useMemo(() => {
    if (reportType !== 'inventory' || !reportInfo?.rows) return []
    // reportService's inventory rows have no `id` — use the array index
    return reportInfo.rows.map((r, i) => ({ id: i, ...r }))
  }, [reportType, reportInfo])

  const inventoryByCategory = useMemo(() => {
    if (!products.length) return []
    const totals = new Map()
    products.forEach((p) => totals.set(p.category, (totals.get(p.category) || 0) + p.stockValue))
    return Array.from(totals, ([name, value]) => ({ name, value }))
  }, [products])

  const categoryLabel = (id) => categories.find((c) => c.id === id)?.label || id

  const customersWithDebt = useMemo(() => {
    if (reportType !== 'debts' || !reportInfo?.customersOwing) return []
    return reportInfo.customersOwing.map((c) => ({ id: c.id, name: c.name, phone: c.phone, debt: c.balance }))
  }, [reportType, reportInfo])

  const suppliersWithDebt = useMemo(() => {
    if (reportType !== 'debts' || !reportInfo?.suppliersOwed) return []
    return reportInfo.suppliersOwed.map((s) => ({ id: s.id, name: s.name, phone: s.phone, debt: s.balance }))
  }, [reportType, reportInfo])

  const handleDownload = async (type) => {
    setDownloading(true)
    try {
      await downloadReportPdf({ type, period, customStart, customEnd })
    } catch (err) {
      toast({
        title: 'تعذّر تحميل التقرير',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setDownloading(false)
    }
  }

useEffect(() => {
  if (period === 'custom' && (!customStart || !customEnd)) return

  const dataShow = async () => {
    try {
      const [responseStatus, responseSalesTrend, responseReportInfo] = await Promise.all([
        getReportStatus(period, customStart, customEnd),
        getReportSalesTrend(period, customStart, customEnd),
        getReportInfo(reportType, period, customStart, customEnd),
      ])
      setStatus(responseStatus.data)
      setSaleTrend(responseSalesTrend.data.trend)
      setReportInfo(responseReportInfo.data)
    } catch (error) {
      console.log('err', error)
    }
  }

  dataShow()
}, [period, customStart, customEnd, reportType])

  return (
    <Box>
      <PageHeader title="التقارير" subtitle="تحليلات ومؤشرات المحل بناءً على البيانات الفعلية" />

      {/* Period filter */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={2} mb={3} flexWrap="wrap">
            {periods.map((p) => (
              <Button key={p.id} size="sm" variant={period === p.id ? 'solid' : 'outline'} onClick={() => setPeriod(p.id)}>
                {p.label}
              </Button>
            ))}
          </HStack>

          {period === 'custom' && (
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mb={2}>
              <FormControl>
                <FormLabel fontSize="sm">من تاريخ</FormLabel>
                <Input type="date" size="sm" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">إلى تاريخ</FormLabel>
                <Input type="date" size="sm" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} min={customStart || undefined} />
              </FormControl>
            </Stack>
          )}

          {range.error && (
            <Alert status="error" borderRadius="md" mb={2}>
              <AlertIcon />
              {range.error}
            </Alert>
          )}

          {hasRange && (
            <Text fontSize="sm" color="ink.muted">
              الفترة: {formatDisplayDate(range.start)} — {formatDisplayDate(range.end)}
            </Text>
          )}
        </CardBody>
      </Card>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={4} mb={6}>
        <KpiCard label="إجمالي المبيعات" value={formatMoney(status.totalSales)} hint={periodLabels[period]} />
        <KpiCard label="عدد عمليات البيع" value={status.salesCount} hint={periodLabels[period]} />
        <KpiCard label="متوسط قيمة الفاتورة" value={formatMoney(status.averageInvoice)} hint={periodLabels[period]} />
        <KpiCard label="إجمالي المشتريات" value={formatMoney(status.totalPurchases)} hint={periodLabels[period]} />
        <KpiCard label="إجمالي المصاريف" value={formatMoney(status.totalExpenses)} hint={periodLabels[period]} />
        <KpiCard label="عدد المنتجات" value={status.productsCount} hint="إجمالي الكتالوج الحالي" />
      </SimpleGrid>

      {/* Sales trend */}
      <Card mb={6}>
        <CardHeader pb={0}><Heading size="sm">اتجاه المبيعات — {periodLabels[period]}</Heading></CardHeader>
        <CardBody>
          {!hasRange ? (
            <EmptyState message="اختر تاريخي البداية والنهاية لعرض الاتجاه." />
          ) : !saleTrend?.length ? (
            <EmptyState message="لا توجد مبيعات مسجلة بتاريخ ضمن هذه الفترة." />
          ) : (
            <Box h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={saleTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DAC1" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ fontFamily: 'Tajawal', borderRadius: 8 }} />
                  <Bar dataKey="totalSales" fill="#1B5E6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Detailed report selector */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3} mb={4}>
        {reportTypes.map((r) => (
          <Button
            key={r.id}
            variant={reportType === r.id ? 'solid' : 'outline'}
            size="sm"
            whiteSpace="normal"
            h="auto"
            py={3}
            onClick={() => setReportType(r.id)}
          >
            {r.label}
          </Button>
        ))}
      </SimpleGrid>

      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
            <Heading size="sm">تقرير {reportTypes.find((r) => r.id === reportType)?.label}</Heading>
            <Button
              size="sm"
              leftIcon={<Download size={16} />}
              onClick={() => handleDownload(reportType)}
              isLoading={downloading}
              isDisabled={period === 'custom' && (!customStart || !customEnd)}
            >
              تحميل PDF
            </Button>
          </HStack>
        </CardHeader>
        <CardBody overflowX="auto">

          {reportType === 'sales' && (
            !hasRange ? <EmptyState message="اختر فترة صالحة لعرض المبيعات." /> :
            filteredSales.length === 0 ? <EmptyState message="لا توجد عمليات بيع مسجلة بتاريخ ضمن هذه الفترة." /> : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>التاريخ</Th>
                    <Th>رقم العملية</Th>
                    <Th>الحريف</Th>
                    <Th>المبلغ</Th>
                    <Th>طريقة الدفع</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSales.map((s) => (
                    <Tr key={s.id}>
                      <Td>{s.date}</Td>
                      <Td>{s.id}</Td>
                      <Td>{s.customer}</Td>
                      <Td fontWeight="700">{formatMoney(s.amount)}</Td>
                      <Td><Badge>{s.method}</Badge></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          )}

          {reportType === 'profit' && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              يُحسب هذا التقرير الآن من الخادم (بناءً على سعر البيع وسعر الشراء المسجَّلين لكل قطعة في عملية البيع)،
              ولذلك لا يظهر مفصّلاً في هذه الصفحة. اضغط على زر "تحميل PDF" أعلاه لعرضه بالتفصيل حسب الفترة المختارة.
            </Alert>
          )}

          {reportType === 'purchases' && (
            !hasRange ? <EmptyState message="اختر فترة صالحة لعرض المشتريات." /> :
            filteredPurchases.length === 0 ? <EmptyState message="لا توجد عمليات شراء ضمن هذه الفترة." /> : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>التاريخ</Th>
                    <Th>المورد</Th>
                    <Th>المبلغ</Th>
                    <Th>الحالة</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPurchases.map((p) => (
                    <Tr key={p.id}>
                      <Td>{p.date}</Td>
                      <Td>{p.supplierName}</Td>
                      <Td fontWeight="700">{formatMoney(p.amount)}</Td>
                      <Td><Badge>{p.status}</Badge></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          )}

          {reportType === 'expenses' && (
            !hasRange ? <EmptyState message="اختر فترة صالحة لعرض المصاريف." /> :
            filteredExpenses.length === 0 ? <EmptyState message="لا توجد مصاريف ضمن هذه الفترة." /> : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>التاريخ</Th>
                    <Th>البيان</Th>
                    <Th>المبلغ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredExpenses.map((e, i) => (
                    <Tr key={e.id ?? i}>
                      <Td>{e.date}</Td>
                      <Td>{e.label}</Td>
                      <Td fontWeight="700">{formatMoney(e.amount)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          )}

          {reportType === 'inventory' && (
            <>
              <Alert status="info" borderRadius="md" mb={4}>
                <AlertIcon />
                هذا التقرير يعرض حالة المخزون الحالية، وهو غير مرتبط بالفترة المحددة أعلاه.
              </Alert>

              {inventoryByCategory.length > 0 && (
                <Box h="220px" mb={5}>
                  <Heading size="xs" mb={2} color="ink.muted">قيمة المخزون حسب التصنيف</Heading>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={inventoryByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {inventoryByCategory.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ fontFamily: 'Tajawal', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}

              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>المنتج</Th>
                    <Th>التصنيف</Th>
                    <Th>الكمية</Th>
                    <Th>الحد الأدنى</Th>
                    <Th>سعر البيع</Th>
                    <Th>سعر الشراء</Th>
                    <Th>قيمة المخزون</Th>
                    <Th>الحالة</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((p) => {
                    const stock = stockStatus(p)
                    return (
                      <Tr key={p.id}>
                        <Td>{p.name}</Td>
                        <Td>{categoryLabel(p.category)}</Td>
                        <Td>{p.stock} {p.unit}</Td>
                        <Td>{p.minStock}</Td>
                        <Td>{formatMoney(p.price)}</Td>
                        <Td>{formatMoney(p.purchasePrice)}</Td>
                        <Td fontWeight="700">{formatMoney(p.stock * p.purchasePrice)}</Td>
                        <Td><Badge colorScheme={stock.key === 'ok' ? 'green' : stock.key === 'low' ? 'orange' : 'red'}>{stock.label}</Badge></Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </>
          )}

          {reportType === 'debts' && (
            <>
              <Alert status="info" borderRadius="md" mb={4}>
                <AlertIcon />
                هذا التقرير يعرض الديون الحالية، وهو غير مرتبط بالفترة المحددة أعلاه.
              </Alert>

              <Heading size="xs" mb={2}>ديون الحرفاء ({formatMoney(customersWithDebt.reduce((s, c) => s + c.debt, 0))})</Heading>
              {customersWithDebt.length === 0 ? (
                <EmptyState message="لا توجد ديون على الحرفاء حاليًا." />
              ) : (
                <Table size="sm" mb={6}>
                  <Thead>
                    <Tr><Th>الحريف</Th><Th>الهاتف</Th><Th>الدين</Th></Tr>
                  </Thead>
                  <Tbody>
                    {customersWithDebt.map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.name}</Td>
                        <Td>{c.phone}</Td>
                        <Td fontWeight="700">{formatMoney(c.debt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}

              <Heading size="xs" mb={2}>ديون الموردين ({formatMoney(suppliersWithDebt.reduce((s, sp) => s + sp.debt, 0))})</Heading>
              {suppliersWithDebt.length === 0 ? (
                <EmptyState message="لا توجد ديون تجاه الموردين حاليًا." />
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr><Th>المورد</Th><Th>الهاتف</Th><Th>الدين</Th></Tr>
                  </Thead>
                  <Tbody>
                    {suppliersWithDebt.map((s) => (
                      <Tr key={s.id}>
                        <Td>{s.name}</Td>
                        <Td>{s.phone}</Td>
                        <Td fontWeight="700">{formatMoney(s.debt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </>
          )}

        </CardBody>
      </Card>
    </Box>
  )
}