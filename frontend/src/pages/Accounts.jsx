import React from 'react'
import {
  Box, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber, Tabs, TabList, TabPanels,
  Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import StatCard from '../components/common/StatCard'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../utils/format'

export default function Accounts() {
  const { cashbox, incomes, expenses, customers, suppliers, stats } = useApp()

  return (
    <Box>
      <PageHeader title="الحسابات" subtitle="الصندوق والمداخيل والمصاريف والديون" />

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
        <StatCard label="الرصيد الحالي" value={formatMoney(cashbox)} icon={Wallet} accent="brand.500" />
        <StatCard label="إجمالي المداخيل" value={formatMoney(stats.totalIncome)} icon={TrendingUp} accent="olive.500" />
        <StatCard label="إجمالي المصاريف" value={formatMoney(stats.totalExpense)} icon={TrendingDown} accent="brick.500" />
      </SimpleGrid>

      <Tabs colorScheme="brand">
        <TabList overflowX="auto" whiteSpace="nowrap">
          <Tab fontWeight="700">المداخيل</Tab>
          <Tab fontWeight="700">المصاريف</Tab>
          <Tab fontWeight="700">ديون الحرفاء</Tab>
          <Tab fontWeight="700">ديون الموردين</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card><CardBody overflowX="auto">
              {incomes.length === 0 ? <EmptyState /> : (
                <Table size="sm">
                  <Thead><Tr><Th>البيان</Th><Th>المبلغ</Th><Th>التاريخ</Th></Tr></Thead>
                  <Tbody>{incomes.map((i) => (
                    <Tr key={i.id}><Td fontWeight="600">{i.label}</Td><Td fontWeight="700" color="olive.500">{formatMoney(i.amount)}</Td><Td>{i.date}</Td></Tr>
                  ))}</Tbody>
                </Table>
              )}
            </CardBody></Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card><CardBody overflowX="auto">
              {expenses.length === 0 ? <EmptyState /> : (
                <Table size="sm">
                  <Thead><Tr><Th>البيان</Th><Th>المبلغ</Th><Th>التاريخ</Th></Tr></Thead>
                  <Tbody>{expenses.map((e) => (
                    <Tr key={e.id}><Td fontWeight="600">{e.label}</Td><Td fontWeight="700" color="brick.500">{formatMoney(e.amount)}</Td><Td>{e.date}</Td></Tr>
                  ))}</Tbody>
                </Table>
              )}
            </CardBody></Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card><CardBody overflowX="auto">
              <Table size="sm">
                <Thead><Tr><Th>الحريف</Th><Th>الهاتف</Th><Th>الدين</Th></Tr></Thead>
                <Tbody>{customers.filter((c) => c.debt > 0).map((c) => (
                  <Tr key={c.id}><Td fontWeight="600">{c.name}</Td><Td>{c.phone}</Td><Td fontWeight="700" color="brick.500">{formatMoney(c.debt)}</Td></Tr>
                ))}</Tbody>
              </Table>
            </CardBody></Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card><CardBody overflowX="auto">
              <Table size="sm">
                <Thead><Tr><Th>المورد</Th><Th>الهاتف</Th><Th>الدين</Th></Tr></Thead>
                <Tbody>{suppliers.filter((s) => s.debt > 0).map((s) => (
                  <Tr key={s.id}><Td fontWeight="600">{s.name}</Td><Td>{s.phone}</Td><Td fontWeight="700" color="brick.500">{formatMoney(s.debt)}</Td></Tr>
                ))}</Tbody>
              </Table>
            </CardBody></Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
