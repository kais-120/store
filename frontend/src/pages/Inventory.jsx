import React, { useState, useRef } from 'react'
import {
  Box, InputGroup, InputLeftElement, InputRightElement, Input, HStack, Text, Button, Select, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Card, CardBody, useDisclosure, useToast
} from '@chakra-ui/react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ProductFormModal from '../components/tables/ProductFormModal'
import useDebounce from '../hook/useDebounce'
import { stockStatus } from '../data/products'
import { formatMoney } from '../utils/format'
import { createProduct, deleteProduct, getCategories, getProducts, updateProduct } from '../services/api'

const PAGE_SIZE = 10

// API returns numeric fields as strings ("123.000") — normalize once
const normalizeProduct = (p) => ({
  ...p,
  price: Number(p.price),
  purchase_price: Number(p.purchase_price),
  stock: Number(p.stock),
  min_stock: Number(p.min_stock),
  step: Number(p.step),
})

export default function Inventory() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirmDisclosure = useDisclosure()
  const cancelRef = useRef()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedQuery = useDebounce(query.trim(), 300)

  // products: search, category and page are all handled by the server
  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['products', 'inventory', { search: debouncedQuery, category, page }],
    queryFn: async () => {
      const res = await getProducts({
        search: debouncedQuery || undefined,
        category: category === 'all' ? undefined : category,
        page,
        limit: PAGE_SIZE,
      })
      return {
        rows: res.data.data.map(normalizeProduct),
        pagination: res.data.pagination,
      }
    },
    placeholderData: keepPreviousData, // keep the old page visible while the next one loads
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await getCategories()).data.data,
    staleTime: 5 * 60 * 1000,
  })

  const products = data?.rows ?? []
  const total = data?.pagination?.total ?? 0
  const pages = data?.pagination?.pages ?? 1

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['products'] })

  const onSearchChange = (value) => { setQuery(value); setPage(1) }
  const onCategoryChange = (value) => { setCategory(value); setPage(1) }

  const openAdd = () => { setEditing(null); onOpen() }
  const openEdit = (p) => { setEditing(p); onOpen() }

  const handleSave = async (formData) => {
    if (editing) {
      await updateProduct(editing.id, formData)
      toast({ title: 'تم تعديل المنتج بنجاح', status: 'success', duration: 2000 })
    } else {
      await createProduct(formData)
      toast({ title: 'تمت إضافة المنتج بنجاح', status: 'success', duration: 2000 })
    }
    refresh()
  }

  const confirmDelete = (p) => { setDeleteTarget(p); confirmDisclosure.onOpen() }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget.id)
      toast({ title: 'تم حذف المنتج', status: 'info', duration: 2000 })
      // if that was the last item on this page, step back one page
      if (products.length === 1 && page > 1) setPage((p) => p - 1)
      refresh()
    } catch (err) {
      toast({
        title: 'فشل حذف المنتج',
        description: err?.response?.data?.message || 'حدث خطأ، حاول مجددًا',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const catLabel = (p) => categories.find((c) => String(c.id) === String(p.category_id))?.name || '—'

  return (
    <Box>
      <PageHeader
        title="المخزون" subtitle={`${total} منتج مسجل`}
        actions={<Button leftIcon={<Plus size={16} />} onClick={openAdd}>إضافة منتج</Button>}
      />

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none"><Search size={16} color="#6B6660" /></InputLeftElement>
          <Input placeholder="ابحث عن منتج..." value={query} onChange={(e) => onSearchChange(e.target.value)} bg="white" />
          <InputRightElement>{isFetching && <Spinner size="xs" />}</InputRightElement>
        </InputGroup>
        <Select maxW="200px" value={category} onChange={(e) => onCategoryChange(e.target.value)} bg="white">
          <option value="all">الكل</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </HStack>

      <Card>
        <CardBody overflowX="auto">
          {isLoading ? null : products.length === 0 ? <EmptyState text="لا توجد منتجات مطابقة" /> : (
            <Table size="sm" opacity={isPlaceholderData ? 0.6 : 1} transition="opacity 0.15s">
              <Thead>
                <Tr>
                  <Th>المنتج</Th>
                  <Th>التصنيف</Th>
                  <Th>الكمية</Th>
                  <Th>الوحدة</Th>
                  <Th>سعر الشراء</Th>
                  <Th>سعر البيع</Th>
                  <Th>الحالة</Th>
                  <Th>الإجراءات</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((p) => {
                  const status = stockStatus(p)
                  return (
                    <Tr key={p.id}>
                      <Td fontWeight="600">{p.name}</Td>
                      <Td>{catLabel(p)}</Td>
                      <Td>{p.stock}</Td>
                      <Td>{p.unit}</Td>
                      <Td>{formatMoney(p.purchase_price)}</Td>
                      <Td fontWeight="700">{formatMoney(p.price)}</Td>
                      <Td><Badge bg={`${status.color}.500`} color="white">{status.label}</Badge></Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton aria-label="تعديل" icon={<Pencil size={14} />} size="xs" variant="ghost" onClick={() => openEdit(p)} />
                          <IconButton aria-label="حذف" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => confirmDelete(p)} />
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {total > 0 && (
        <HStack mt={4} justify="center" spacing={3}>
          {/* RTL layout: "previous" points right, "next" points left */}
          <IconButton
            aria-label="الصفحة السابقة" icon={<ChevronRight size={16} />} size="sm" variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            isDisabled={page <= 1}
          />
          <Text fontSize="sm">صفحة {page} من {pages}</Text>
          <IconButton
            aria-label="الصفحة التالية" icon={<ChevronLeft size={16} />} size="sm" variant="outline"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            isDisabled={page >= pages || isPlaceholderData}
          />
        </HStack>
      )}

      <ProductFormModal isOpen={isOpen} onClose={onClose} onSave={handleSave} initialData={editing} />
      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen} onClose={confirmDisclosure.onClose} onConfirm={handleDelete}
        cancelRef={cancelRef} title="حذف المنتج" body={`هل تريد حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </Box>
  )
}