import React, { useState, useMemo, useRef } from 'react'
import {
  Box, InputGroup, InputLeftElement, InputRightElement, Input, HStack, Button, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Card, CardBody, useDisclosure, useToast
} from '@chakra-ui/react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Pagination from '../components/common/Pagination'
import CustomerFormModal from '../components/tables/CustomerFormModal'
import CustomerDetailsDrawer from '../components/tables/CustomerDetailsDrawer'
import { useApp } from '../context/AppContext'
import useDebounce from '../hook/useDebounce'
import { formatMoney } from '../utils/format'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/api'

const PAGE_SIZE = 10

export default function Customers() {
  const { registerCustomerPayment } = useApp()
  const toast = useToast()
  const queryClient = useQueryClient()
  const formDisclosure = useDisclosure()
  const detailsDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()
  const cancelRef = useRef()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedQuery = useDebounce(query.trim(), 300)

  // search (name or phone) and page are handled by the server
  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['customers', { search: debouncedQuery, page }],
    queryFn: async () => {
      const res = await getCustomers({
        search: debouncedQuery || undefined,
        page,
        limit: PAGE_SIZE,
      })
      return { rows: res.data.data, pagination: res.data.pagination }
    },
    placeholderData: keepPreviousData,
  })

  const customers = data?.rows ?? []
  const total = data?.pagination?.total ?? 0
  const pages = data?.pagination?.pages ?? 1

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['customers'] })

  const onSearchChange = (value) => { setQuery(value); setPage(1) }

  const openAdd = () => { setEditing(null); formDisclosure.onOpen() }
  const openEdit = (c) => { setEditing(c); formDisclosure.onOpen() }
  const openDetails = (c) => { setViewing(c); detailsDisclosure.onOpen() }

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await updateCustomer(editing.id, formData)
        toast({ title: 'تم تعديل بيانات الحريف', status: 'success', duration: 2000 })
      } else {
        await createCustomer(formData)
        toast({ title: 'تمت إضافة الحريف بنجاح', status: 'success', duration: 2000 })
      }
      refresh()
    } catch (err) {
      toast({
        title: 'حدث خطأ أثناء حفظ بيانات الحريف',
        description: err?.response?.data?.message,
        status: 'error',
        duration: 3000,
      })
      throw err // lets the form modal know the save failed (stay open)
    }
  }

  const confirmDelete = (c) => { setDeleteTarget(c); confirmDisclosure.onOpen() }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCustomer(deleteTarget.id)
      toast({ title: 'تم حذف الحريف', status: 'info', duration: 2000 })
      // if that was the last item on this page, step back one page
      if (customers.length === 1 && page > 1) setPage((p) => p - 1)
      refresh()
    } catch (err) {
      toast({
        title: 'فشل حذف الحريف',
        description: err?.response?.data?.message || 'حدث خطأ، حاول مجددًا',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleRegisterPayment = async (...args) => {
    await registerCustomerPayment(...args)
    refresh()
  }

  // keep the drawer in sync with fresh data after a payment
  const currentViewing = useMemo(
    () => customers.find((c) => c.id === viewing?.id) || viewing,
    [customers, viewing]
  )

  return (
    <Box>
      <PageHeader
        title="الحرفاء" subtitle={`${total} حريف مسجل`}
        actions={<Button leftIcon={<Plus size={16} />} onClick={openAdd}>إضافة حريف</Button>}
      />

      <InputGroup maxW="320px" mb={4}>
        <InputLeftElement pointerEvents="none"><Search size={16} color="#6B6660" /></InputLeftElement>
        <Input placeholder="ابحث بالاسم أو الهاتف..." value={query} onChange={(e) => onSearchChange(e.target.value)} bg="white" />
        <InputRightElement>{isFetching && <Spinner size="xs" />}</InputRightElement>
      </InputGroup>

      <Card>
        <CardBody overflowX="auto">
          {isLoading ? null : customers.length === 0 ? <EmptyState text="لا يوجد حرفاء مطابقون" /> : (
            <Table size="sm" opacity={isPlaceholderData ? 0.6 : 1} transition="opacity 0.15s">
              <Thead>
                <Tr>
                  <Th>الاسم</Th>
                  <Th>الهاتف</Th>
                  <Th>إجمالي المشتريات</Th>
                  <Th>الدين</Th>
                  <Th>آخر عملية شراء</Th>
                  <Th>الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {customers.map((c) => (
                  <Tr key={c.id}>
                    <Td fontWeight="600">{c.name}</Td>
                    <Td>{c.phone}</Td>
                    <Td>{formatMoney(c.totalPurchases)}</Td>
                    <Td fontWeight="700" color={Number(c.balance) > 0 ? 'brick.500' : 'olive.500'}>{formatMoney(c.balance)}</Td>
                    <Td>{c.lastSale}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label="عرض" icon={<Eye size={14} />} size="xs" variant="ghost" onClick={() => openDetails(c)} />
                        <IconButton aria-label="تعديل" icon={<Pencil size={14} />} size="xs" variant="ghost" onClick={() => openEdit(c)} />
                        <IconButton aria-label="حذف" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => confirmDelete(c)} />
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

      <CustomerFormModal isOpen={formDisclosure.isOpen} onClose={formDisclosure.onClose} onSave={handleSave} initialData={editing} />
      <CustomerDetailsDrawer
        isOpen={detailsDisclosure.isOpen} onClose={detailsDisclosure.onClose}
        customer={currentViewing} onRegisterPayment={handleRegisterPayment}
      />
      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen} onClose={confirmDisclosure.onClose} onConfirm={handleDelete}
        cancelRef={cancelRef} title="حذف الحريف" body={`هل تريد حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </Box>
  )
}