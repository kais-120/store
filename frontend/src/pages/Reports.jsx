import React, { useState } from 'react'
import {
  Box, SimpleGrid, Card, CardHeader, CardBody, Heading, HStack, Button, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../components/common/PageHeader'
import { useApp } from '../context/AppContext'
import { salesTrend, categoryBreakdown } from '../data/dashboard'
import { formatMoney } from '../utils/format'

const periods = [
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'custom', label: 'فترة مخصصة' },
]

const pieColors = ['#1B5E6B', '#C68A2E', '#6B8E4E', '#D9A441', '#B03A2E', '#549390']

const reportTypes = [
  { id: 'sales', label: 'تقرير المبيعات' },
  { id: 'profit', label: 'تقرير الأرباح' },
  { id: 'purchases', label: 'تقرير المشتريات' },
  { id: 'expenses', label: 'تقرير المصاريف' },
  { id: 'inventory', label: 'تقرير المخزون' },
  { id: 'debts', label: 'تقرير الديون' },
]

export default function Reports() {
  const { customers, suppliers, products, sales } = useApp()
  const [period, setPeriod] = useState('today')

  const summaryRows = [
    { label: 'إجمالي المبيعات', value: formatMoney(sales.reduce((s, i) => s + i.amount, 0)) },
    { label: 'عدد المنتجات', value: products.length },
    { label: 'إجمالي ديون الحرفاء', value: formatMoney(customers.reduce((s, c) => s + c.debt, 0)) },
    { label: 'إجمالي ديون الموردين', value: formatMoney(suppliers.reduce((s, sp) => s + sp.debt, 0)) },
  ]

  return (
    <Box>
      <PageHeader title="التقارير" subtitle="تحليلات ومؤشرات المحل" />

      <HStack spacing={2} mb={6} flexWrap="wrap">
        {periods.map((p) => (
          <Button key={p.id} size="sm" variant={period === p.id ? 'solid' : 'outline'} onClick={() => setPeriod(p.id)}>
            {p.label}
          </Button>
        ))}
      </HStack>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={6}>
        <Card>
          <CardHeader pb={0}><Heading size="sm">تقرير المبيعات الأسبوعي</Heading></CardHeader>
          <CardBody>
            <Box h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DAC1" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ fontFamily: 'Tajawal', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#1B5E6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={0}><Heading size="sm">تقرير المخزون حسب التصنيف</Heading></CardHeader>
          <CardBody>
            <Box h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mb={6}>
        <CardHeader pb={0}><Heading size="sm">ملخص عام</Heading></CardHeader>
        <CardBody overflowX="auto">
          <Table size="sm">
            <Tbody>
              {summaryRows.map((r) => (
                <Tr key={r.label}>
                  <Td fontWeight="600" color="ink.muted">{r.label}</Td>
                  <Td fontWeight="800">{r.value}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3}>
        {reportTypes.map((r) => (
          <Button key={r.id} variant="outline" size="sm" whiteSpace="normal" h="auto" py={3}>
            {r.label}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  )
}
