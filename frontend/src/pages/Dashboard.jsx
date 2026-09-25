import React from 'react'
import {
  SimpleGrid, Grid, GridItem, Card, CardHeader, CardBody, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Badge, VStack, HStack, Text, Box, Spinner, Center
} from '@chakra-ui/react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { DollarSign, Receipt, TrendingUp, Wallet, Users, Truck, Clock } from 'lucide-react'
import StatCard from '../components/common/StatCard'
import PageHeader from '../components/common/PageHeader'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../utils/format'
import { stockStatus } from '../data/products'
// `salesTrend` no longer imported statically — it now comes from context (live API data)

export default function Dashboard() {
  const { stats, sales, products, activity, salesTrend, loading } = useApp()
  const lowStockProducts = products.filter((p) => stockStatus(p).key !== 'ok').slice(0, 6)

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Box>
      <PageHeader title="نظرة عامة على المحل" subtitle="ملخص أداء اليوم" />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4} mb={6}>
        <StatCard label="مبيعات اليوم" value={formatMoney(stats.todaySales)} icon={DollarSign} accent="brand.500" />
        <StatCard label="عدد الفواتير" value={stats.invoiceCount} icon={Receipt} accent="gold.500" />
        <StatCard label="أرباح اليوم" value={formatMoney(stats.todayProfit)} icon={TrendingUp} accent="olive.500" />
        <StatCard label="رصيد الصندوق" value={formatMoney(stats.cashboxBalance)} icon={Wallet} accent="brand.400" />
        <StatCard label="ديون الحرفاء" value={formatMoney(stats.customerDebt)} icon={Users} accent="amber.500" />
        <StatCard label="ديون الموردين" value={formatMoney(stats.supplierDebt)} icon={Truck} accent="brick.500" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={5} mb={5}>
        <Card>
          <CardHeader pb={0}>
            <Heading size="sm">مبيعات آخر 7 أيام</Heading>
          </CardHeader>
          <CardBody>
            <Box h="220px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B5E6B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1B5E6B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DAC1" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
                  <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ fontFamily: 'Tajawal', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#1B5E6B" strokeWidth={2} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={0}>
            <Heading size="sm">النشاط الأخير</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {activity.slice(0, 6).map((a) => (
                <HStack key={a.id} align="flex-start" spacing={3}>
                  <Box mt={1} w="8px" h="8px" borderRadius="full" bg="gold.500" flexShrink={0} />
                  <Box>
                    <Text fontSize="sm" fontWeight="600">{a.text}</Text>
                    <HStack fontSize="xs" color="ink.muted" spacing={1}>
                      <Clock size={12} />
                      <Text>{a.time}</Text>
                    </HStack>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap={5}>
        <Card>
          <CardHeader pb={0}><Heading size="sm">المبيعات الأخيرة</Heading></CardHeader>
          <CardBody overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>رقم الفاتورة</Th>
                  <Th>الحريف</Th>
                  <Th>المبلغ</Th>
                  <Th>طريقة الدفع</Th>
                  <Th>الوقت</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sales.slice(0, 6).map((s) => (
                  <Tr key={s.id}>
                    <Td fontWeight="700">{s.id}</Td>
                    <Td>{s.customer}</Td>
                    <Td>{formatMoney(s.amount)}</Td>
                    <Td>
                      <Badge colorScheme={s.method === 'بالدين' ? 'red' : 'green'}>
                        {s.method}
                      </Badge>
                    </Td>
                    <Td>{s.time}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={0}><Heading size="sm">المنتجات التي قاربت على النفاد</Heading></CardHeader>
          <CardBody overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>المنتج</Th>
                  <Th>الكمية</Th>
                  <Th>الوحدة</Th>
                  <Th>الحالة</Th>
                </Tr>
              </Thead>
              <Tbody>
                {lowStockProducts.map((p) => {
                  const status = stockStatus(p)
                  return (
                    <Tr key={p.id}>
                      <Td>{p.name}</Td>
                      <Td>{p.stock}</Td>
                      <Td>{p.unit}</Td>
                      <Td><Badge bg={`${status.color}.500`} color="white">{status.label}</Badge></Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  )
}