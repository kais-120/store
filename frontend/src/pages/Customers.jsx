import React, { useState, useMemo, useRef } from 'react'
import {
  Box, InputGroup, InputLeftElement, Input, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, Card, CardBody, useDisclosure, useToast, Text
} from '@chakra-ui/react'
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import CustomerFormModal from '../components/tables/CustomerFormModal'
import CustomerDetailsDrawer from '../components/tables/CustomerDetailsDrawer'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../utils/format'

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, registerCustomerPayment } = useApp()
  const toast = useToast()
  const formDisclosure = useDisclosure()
  const detailsDisclosure = useDisclosure()
  const confirmDisclosure = useDisclosure()
  const cancelRef = useRef()

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => customers.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()) || c.phone.includes(query.trim())
  ), [customers, query])

  const openAdd = () => { setEditing(null); formDisclosure.onOpen() }
  const openEdit = (c) => { setEditing(c); formDisclosure.onOpen() }
  const openDetails = (c) => { setViewing(c); detailsDisclosure.onOpen() }

  const handleSave = (data) => {
    if (editing) {
      updateCustomer(editing.id, data)
      toast({ title: 'تم تعديل بيانات الحريف', status: 'success', duration: 2000 })
    } else {
      addCustomer(data)
      toast({ title: 'تمت إضافة الحريف بنجاح', status: 'success', duration: 2000 })
    }
  }

  const confirmDelete = (c) => { setDeleteTarget(c); confirmDisclosure.onOpen() }
  const handleDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id)
      toast({ title: 'تم حذف الحريف', status: 'info', duration: 2000 })
    }
  }

  const currentViewing = useMemo(() => customers.find((c) => c.id === viewing?.id) || viewing, [customers, viewing])

  return (
    <Box>
      <PageHeader
        title="الحرفاء" subtitle={`${customers.length} حريف مسجل`}
        actions={<Button leftIcon={<Plus size={16} />} onClick={openAdd}>إضافة حريف</Button>}
      />

      <InputGroup maxW="320px" mb={4}>
        <InputLeftElement pointerEvents="none"><Search size={16} color="#6B6660" /></InputLeftElement>
        <Input placeholder="ابحث بالاسم أو الهاتف..." value={query} onChange={(e) => setQuery(e.target.value)} bg="white" />
      </InputGroup>

      <Card>
        <CardBody overflowX="auto">
          {filtered.length === 0 ? <EmptyState text="لا يوجد حرفاء مطابقون" /> : (
            <Table size="sm">
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
                {filtered.map((c) => (
                  <Tr key={c.id}>
                    <Td fontWeight="600">{c.name}</Td>
                    <Td>{c.phone}</Td>
                    <Td>{formatMoney(c.totalPurchases)}</Td>
                    <Td fontWeight="700" color={c.debt > 0 ? 'brick.500' : 'olive.500'}>{formatMoney(c.debt)}</Td>
                    <Td>{c.lastPurchase}</Td>
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

      <CustomerFormModal isOpen={formDisclosure.isOpen} onClose={formDisclosure.onClose} onSave={handleSave} initialData={editing} />
      <CustomerDetailsDrawer
        isOpen={detailsDisclosure.isOpen} onClose={detailsDisclosure.onClose}
        customer={currentViewing} onRegisterPayment={registerCustomerPayment}
      />
      <ConfirmDialog
        isOpen={confirmDisclosure.isOpen} onClose={confirmDisclosure.onClose} onConfirm={handleDelete}
        cancelRef={cancelRef} title="حذف الحريف" body={`هل تريد حذف "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </Box>
  )
}
