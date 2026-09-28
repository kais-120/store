import React, { useState, useRef } from 'react'
import {
  Box, SimpleGrid, Card, CardBody, CardHeader, Flex, Heading, Stat, StatLabel, StatNumber,
  Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Center, useToast, useDisclosure,
  InputGroup, InputLeftElement, InputRightElement, Input, IconButton, HStack, Text, Select
} from '@chakra-ui/react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { TrendingDown, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import StatCard from '../components/common/StatCard'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Pagination from '../components/common/Pagination'
import ExpensesFormModal, { EXPENSE_CATEGORIES } from '../components/tables/ExpensesFormModal'
import useDebounce from '../hook/useDebounce'
import { formatMoney } from '../utils/format'
import { createExpense, getExpenses, updateExpense, deleteExpense } from '../services/api'

const PAGE_SIZE = 10

export default function Accounts() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const formDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()
  const cancelRef = useRef()

  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // --- Filters (handled by the server) ---
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const debouncedSearch = useDebounce(searchTerm.trim(), 300)

  const { data, isLoading, isFetching, isPlaceholderData,error,isError } = useQuery({
    queryKey: ['expenses', { search: debouncedSearch, category: categoryFilter, dateFrom, dateTo, page }],
    queryFn: async () => {
      const res = await getExpenses({
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: PAGE_SIZE,
      })
      return {
        rows: res.data.data,
        pagination: res.data.pagination,
        summary: res.data.summary,
      }
    },
    placeholderData: keepPreviousData,
  })
  if (isError) console.log('expenses query error', error)

  const expenses = data?.rows ?? []
  const pages = data?.pagination?.pages ?? 1
  const totalExpense = Number(data?.summary?.total) || 0
  const totalFilteredExpense = Number(data?.summary?.filteredTotal) || 0

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['expenses'] })

  const onSearchChange = (value) => { setSearchTerm(value); setPage(1) }
  const onCategoryChange = (value) => { setCategoryFilter(value); setPage(1) }
  const onDateFromChange = (value) => { setDateFrom(value); setPage(1) }
  const onDateToChange = (value) => { setDateTo(value); setPage(1) }

  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const openAdd = () => { setEditing(null); formDisclosure.onOpen() }
  const openEdit = (e) => { setEditing(e); formDisclosure.onOpen() }
  const closeForm = () => { formDisclosure.onClose(); setEditing(null) }

  // returns true on success so the modal knows it can reset
  const handleSaveExpense = async (values) => {
    const isEdit = !!editing
    try {
      if (isEdit) {
        await updateExpense(editing.id, values)
      } else {
        await createExpense(values)
      }
      refresh()
      closeForm()
      toast({
        title: isEdit ? 'تم تعديل المصروف بنجاح' : 'تمت إضافة المصروف بنجاح',
        status: 'success',
        duration: 2000,
      })
      return true
    } catch (error) {
      console.log('err', error)
      toast({
        title:
          error?.response?.data?.message ||
          (isEdit ? 'حدث خطأ أثناء تعديل المصروف' : 'حدث خطأ أثناء إضافة المصروف'),
        status: 'error',
        duration: 3000,
      })
      return false
    }
  }

  const confirmDelete = (e) => { setDeleteTarget(e); confirmDisclosure.onOpen() }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteExpense(deleteTarget.id)
      toast({ title: 'تم حذف المصروف بنجاح', status: 'info', duration: 2000 })
      // if that was the last item on this page, step back one page
      if (expenses.length === 1 && page > 1) setPage((p) => p - 1)
      refresh()
    } catch (error) {
      console.log('err', error)
      toast({
        title: 'فشل حذف المصروف',
        description: error?.response?.data?.message || 'حدث خطأ، حاول مجددًا',
        status: 'error',
        duration: 3000,
      })
    }
  }

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
        <Button leftIcon={<Plus size={16} />} colorScheme="brand" size="sm" onClick={openAdd}>
          إضافة مصروف
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1 }} spacing={4} mb={6}>
        <StatCard label="إجمالي المصاريف" value={formatMoney(totalExpense)} icon={TrendingDown} accent="brick.500" />
      </SimpleGrid>

      {/* Filters */}
      <Card mb={4}>
        <CardBody>
          <Flex gap={3} align="center" flexWrap="wrap">
            <InputGroup w={{ base: 'full', md: '260px' }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="بحث بالبيان..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <InputRightElement>{isFetching && <Spinner size="xs" />}</InputRightElement>
            </InputGroup>

            <Select
              placeholder="كل الفئات"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              w={{ base: 'full', md: '200px' }}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            <HStack spacing={2} align="center" flexWrap="wrap" w={{ base: 'full', md: 'auto' }}>
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">من</Text>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                w="160px"
                max={dateTo || undefined}
              />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">إلى</Text>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                w="160px"
                min={dateFrom || undefined}
              />
            </HStack>

            <Button onClick={resetFilters} variant="outline" flexShrink={0}>
              اعادة تعيين
            </Button>
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
          ) : expenses.length === 0 ? (
            <EmptyState
              title="لا توجد مصاريف"
              message="لا توجد مصاريف مطابقة. أضف مصروفًا جديدًا أو غيّر الفلاتر."
              actionLabel="إضافة مصروف"
              onAction={openAdd}
            />
          ) : (
            <Table size="sm" opacity={isPlaceholderData ? 0.6 : 1} transition="opacity 0.15s">
              <Thead>
                <Tr>
                  <Th>البيان</Th>
                  <Th>الفئة</Th>
                  <Th>المبلغ</Th>
                  <Th>التاريخ</Th>
                  <Th textAlign="left">الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenses.map((e) => (
                  <Tr key={e.id}>
                    <Td fontWeight="600">{e.label}</Td>
                    <Td>{e.category || '—'}</Td>
                    <Td fontWeight="700" color="brick.500">{formatMoney(Number(e.amount))}</Td>
                    <Td>{e.date ? String(e.date).slice(0, 10) : ''}</Td>
                    <Td>
                      <HStack spacing={1} justify="flex-end">
                        <IconButton
                          aria-label="تعديل"
                          icon={<Pencil size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(e)}
                        />
                        <IconButton
                          aria-label="حذف"
                          icon={<Trash2 size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(e)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Pagination page={page} pages={pages} onChange={setPage} isLoading={isPlaceholderData} />

      <ExpensesFormModal
        isOpen={formDisclosure.isOpen}
        onClose={closeForm}
        onSave={handleSaveExpense}
        initialData={editing}
      />

      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen}
        onClose={confirmDisclosure.onClose}
        onConfirm={handleDelete}
        cancelRef={cancelRef}
        title="حذف المصروف"
        body={`هل تريد حذف "${deleteTarget?.label}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </Box>
  )
}