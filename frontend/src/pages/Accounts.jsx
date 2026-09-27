import React, { useMemo, useState } from 'react'
import {
  Box, SimpleGrid, Card, CardBody, CardHeader, Flex, Heading, Stat, StatLabel, StatNumber,
  Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Center, useToast,
  InputGroup, InputLeftElement, Input, IconButton, HStack, Text
} from '@chakra-ui/react'
import { Wallet, TrendingDown, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import StatCard from '../components/common/StatCard'
import ExpensesFormModal from '../components/tables/ExpensesFormModal'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../utils/format'
import useFetchData from '../hook/useFetchData'      // adjust path
import { createExpense, getExpense } from '../services/api'

export default function Accounts() {
  const { cashbox } = useApp()
  const toast = useToast()

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false) // toggled after save to refetch

  const { data: expenses, isLoading } = useFetchData(getExpense, isSaving)

  const handleSaveExpense = async (values) => {
    try {
      await createExpense(values)
      setIsSaving((prev) => !prev)
      setIsExpenseModalOpen(false)
      toast({ title: 'تمت إضافة المصروف بنجاح', status: 'success', duration: 2000 })
    } catch (error) {
      console.log('err', error)
      toast({
        title: error?.response?.data?.message || 'حدث خطأ أثناء إضافة المصروف',
        status: 'error',
        duration: 3000,
      })
    }
  }

  // --- Filters (client-side) ---
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const resetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
  }

  const filteredExpenses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return (expenses || []).filter((e) => {
      const day = e.date ? String(e.date).slice(0, 10) : ''
      if (term && !e.label?.toLowerCase().includes(term)) return false
      if (day && dateFrom && day < dateFrom) return false
      if (day && dateTo && day > dateTo) return false
      return true
    })
  }, [expenses, searchTerm, dateFrom, dateTo])

  const totalFilteredExpense = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const totalExpense = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  // Placeholder handlers for row actions — UI structure only, no logic implemented yet.
  const noop = () => {}

  return (
    <Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={3}
        mb={4}
      >
        <PageHeader title="المصاريف" subtitle="متابعة وإدارة جميع مصاريف الصندوق" />
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="brand"
          size="sm"
          onClick={() => setIsExpenseModalOpen(true)}
        >
          إضافة مصروف
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={6}>
        <StatCard label="الرصيد الحالي" value={formatMoney(cashbox)} icon={Wallet} accent="brand.500" />
        <StatCard label="إجمالي المصاريف" value={formatMoney(totalExpense)} icon={TrendingDown} accent="brick.500" />
      </SimpleGrid>

      {/* Filters */}
      <Card mb={4}>
        <CardBody>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align={{ base: 'stretch', md: 'center' }}
          >
            <InputGroup maxW={{ base: 'full', md: '320px' }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="بحث بالبيان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <HStack spacing={2} align="center" flexWrap="wrap">
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">من</Text>
              <Input
                type="date"
                size="md"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                maxW="170px"
                max={dateTo || undefined}
              />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">إلى</Text>
              <Input
                type="date"
                size="md"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                maxW="170px"
                min={dateFrom || undefined}
              />
              <Button onClick={resetFilters}>اعادة تعيين</Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      <Card>
        <CardHeader pb={0}>
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={2}
          >
            <Heading size="sm">قائمة المصاريف</Heading>
            <Stat size="sm" textAlign="left">
              <StatLabel fontSize="xs" color="gray.500">المجموع</StatLabel>
              <StatNumber fontSize="md" color="brick.500">{formatMoney(totalFilteredExpense)}</StatNumber>
            </Stat>
          </Flex>
        </CardHeader>
        <CardBody overflowX="auto">
          {isLoading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              title="لا توجد مصاريف"
              message="لم يتم تسجيل أي مصروف بعد. أضف أول مصروف لمتابعة النفقات."
              actionLabel="إضافة مصروف"
              onAction={() => setIsExpenseModalOpen(true)}
            />
          ) : (
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>البيان</Th>
                  <Th>المبلغ</Th>
                  <Th>التاريخ</Th>
                  <Th textAlign="left">الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredExpenses.map((e) => (
                  <Tr key={e.id}>
                    <Td fontWeight="600">{e.label}</Td>
                    <Td fontWeight="700" color="brick.500">{formatMoney(Number(e.amount))}</Td>
                    <Td>{e.date ? String(e.date).slice(0, 10) : ''}</Td>
                    <Td>
                      <HStack spacing={1} justify="flex-end">
                        <IconButton aria-label="عرض" icon={<Eye size={16} />} size="sm" variant="ghost" onClick={noop} />
                        <IconButton aria-label="تعديل" icon={<Pencil size={16} />} size="sm" variant="ghost" onClick={noop} />
                        <IconButton aria-label="حذف" icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" onClick={noop} />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <ExpensesFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </Box>
  )
}