import React, { useEffect, useState } from 'react'
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
import { getActivity, getCategoryBreakdown, getLastSale, getLowStockProducts, getSalesTrend, getStats } from '../services/api'
// `salesTrend` no longer imported statically — it now comes from context (live API data)

export default function Dashboard() {
  const { stats, sales, products, activity, salesTrend, loading } = useApp()
  const [data,setData] = useState({
    stats:{},
    activity:[],
    salesTrend:[],
    lastSale:[],
    lowStockProducts:[]

  })

  useEffect(()=>{
      const dataFetch = async () =>{
        try{
          const [responseGetStats,responseGetActivity,responseGetSalesTrend,responseGetCategoryBreakdown,responseLastSale,responseLowStockProducts] = await Promise.all([
            getStats(),
            getActivity(),
            getSalesTrend(),
            getCategoryBreakdown(),
            getLastSale(),
            getLowStockProducts(),

          ])
      setData({
        stats: responseGetStats.data,
        activity: responseGetActivity.data,
        salesTrend: responseGetSalesTrend.data,
        lastSale:responseLastSale.data,
        lowStockProducts:responseLowStockProducts.data
      });
        }catch{
          console.error("error")
        }
      }
      dataFetch()
  },[])

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
        <StatCard label="مبيعات اليوم" value={formatMoney(data.stats.todaySales)} icon={DollarSign} accent="brand.500" />
        <StatCard label="عدد الفواتير" value={data.stats.invoiceCount} icon={Receipt} accent="gold.500" />
        <StatCard label="أرباح اليوم" value={formatMoney(data.stats.todayProfit)} icon={TrendingUp} accent="olive.500" />
        <StatCard label="رصيد الصندوق" value={formatMoney(data.stats.cashboxBalance)} icon={Wallet} accent="brand.400" />
        <StatCard label="ديون الحرفاء" value={formatMoney(data.stats.customerDebt)} icon={Users} accent="amber.500" />
        <StatCard label="ديون الموردين" value={formatMoney(data.stats.supplierDebt)} icon={Truck} accent="brick.500" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={5} mb={5}>
        <Card>
          <CardHeader pb={0}>
            <Heading size="sm">مبيعات آخر 7 أيام</Heading>
          </CardHeader>
          <CardBody>
            <Box h="220px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              {activity.map((a) => (
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
                {data.lastSale.map((s) => (
                  <Tr key={s.id}>
                    <Td fontWeight="700">{s.id}</Td>
                    <Td>{s.customer}</Td>
                    <Td>{formatMoney(s.amount)}</Td>
                    <Td>
                      <Badge colorScheme={s.payment_method === 'debt' ? 'red' : 'green'}>
                        {s.payment_method === 'debt' ? 'بالدين' : 'نقدا'}
                      </Badge>
                    </Td>
                    <Td>{new Date(s.time).toLocaleTimeString("fr-FR")}</Td>
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
    {data?.lowStockProducts?.length > 0 ? (
      data.lowStockProducts.map((p) => (
        <Tr key={p.id}>
          <Td>{p.name}</Td>
          <Td>{p.stock}</Td>
          <Td>{p.unit}</Td>
          <Td>
            <Badge bg="yellow.500" color="white">
              {status}
            </Badge>
          </Td>
        </Tr>
      ))
    ) : (
      <Tr>
        <Td colSpan={4} textAlign="center" py={6} color="gray.500">
          لا توجد منتجات منخفضة المخزون
        </Td>
      </Tr>
    )}
  </Tbody>
</Table>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  )
}