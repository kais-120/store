import React, { useState, useMemo, useRef } from 'react'
import {
  Box, InputGroup, InputLeftElement, Input, HStack, Button, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, IconButton, Card, CardBody, useDisclosure, useToast
} from '@chakra-ui/react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ProductFormModal from '../components/tables/ProductFormModal'
import { useApp } from '../context/AppContext'
import { categories, stockStatus } from '../data/products'
import { formatMoney } from '../utils/format'
import useFetchData from '../hook/useFetchData'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/api'

export default function Inventory() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirmDisclosure = useDisclosure()
  const cancelRef = useRef()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // used purely as a "refetch trigger" for useFetchData
  const [isSaving, setIsSaving] = useState(false)

  const { data: products, isLoading } = useFetchData(getProducts, isSaving)

  const filtered = useMemo(() => (products || []).filter((p) => {
    const matchCat = category === 'all' || p.category === category
    const matchQuery = p.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchCat && matchQuery
  }), [products, category, query])

  const openAdd = () => { setEditing(null); onOpen() }
  const openEdit = (p) => { setEditing(p); onOpen() }

  const handleSave = async (data) => {
    if (editing) {
      await updateProduct(editing.id, data)
      toast({ title: 'تم تعديل المنتج بنجاح', status: 'success', duration: 2000 })
    } else {
      await createProduct(data)
      toast({ title: 'تمت إضافة المنتج بنجاح', status: 'success', duration: 2000 })
    }
    // flip the flag so useFetchData's useEffect dependency changes and refetches
    setIsSaving((prev) => !prev)
  }

  const confirmDelete = (p) => { setDeleteTarget(p); confirmDisclosure.onOpen() }
  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id)
      toast({ title: 'تم حذف المنتج', status: 'info', duration: 2000 })
      setIsSaving((prev) => !prev)
    }
  }

  return (
    <Box>
      <PageHeader
        title="المخزون" subtitle={`${(products || []).length} منتج مسجل`}
        actions={<Button leftIcon={<Plus size={16} />} onClick={openAdd}>إضافة منتج</Button>}
      />

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none"><Search size={16} color="#6B6660" /></InputLeftElement>
          <Input placeholder="ابحث عن منتج..." value={query} onChange={(e) => setQuery(e.target.value)} bg="white" />
        </InputGroup>
        <Select maxW="200px" value={category} onChange={(e) => setCategory(e.target.value)} bg="white">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
      </HStack>

      <Card>
        <CardBody overflowX="auto">
          {isLoading ? null : filtered.length === 0 ? <EmptyState text="لا توجد منتجات مطابقة" /> : (
            <Table size="sm">
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
                {filtered.map((p) => {
                  const status = stockStatus(p)
                  const catLabel = categories.find((c) => c.id === p.category)?.label || p.category
                  return (
                    <Tr key={p.id}>
                      <Td fontWeight="600">{p.name}</Td>
                      <Td>{catLabel}</Td>
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

      <ProductFormModal isOpen={isOpen} onClose={onClose} onSave={handleSave} initialData={editing} />
      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen} onClose={confirmDisclosure.onClose} onConfirm={handleDelete}
        cancelRef={cancelRef} title="حذف المنتج" body={`هل تريد حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </Box>
  )
}