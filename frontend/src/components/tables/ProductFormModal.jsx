import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Select, SimpleGrid
} from '@chakra-ui/react'
import { categories } from '../../data/products'

const emptyForm = { name: '', category: 'food', price: '', purchasePrice: '', unit: 'قطعة', stock: '', minStock: '5', step: '1' }

export default function ProductFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, price: String(initialData.price), purchasePrice: String(initialData.purchasePrice), stock: String(initialData.stock), minStock: String(initialData.minStock), step: String(initialData.step) })
    } else {
      setForm(emptyForm)
    }
  }, [initialData, isOpen])

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price) return
    onSave({
      ...form,
      price: Number(form.price),
      purchasePrice: Number(form.purchasePrice || 0),
      stock: Number(form.stock || 0),
      minStock: Number(form.minStock || 5),
      step: Number(form.step || 1),
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="800">{initialData ? 'تعديل منتج' : 'إضافة منتج جديد'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={2} spacing={4}>
            <FormControl gridColumn="span 2" isRequired>
              <FormLabel fontSize="sm" fontWeight="700">اسم المنتج</FormLabel>
              <Input value={form.name} onChange={handleChange('name')} placeholder="مثال: سكر 1 كغ" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">التصنيف</FormLabel>
              <Select value={form.category} onChange={handleChange('category')}>
                {categories.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">الوحدة</FormLabel>
              <Select value={form.unit} onChange={handleChange('unit')}>
                {['قطعة', 'كغ', 'غ', 'لتر', 'مل'].map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">سعر الشراء</FormLabel>
              <Input type="number" min={0} value={form.purchasePrice} onChange={handleChange('purchasePrice')} placeholder="0.000" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">سعر البيع</FormLabel>
              <Input type="number" min={0} value={form.price} onChange={handleChange('price')} placeholder="0.000" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">الكمية الحالية</FormLabel>
              <Input type="number" min={0} value={form.stock} onChange={handleChange('stock')} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">الحد الأدنى للتنبيه</FormLabel>
              <Input type="number" min={0} value={form.minStock} onChange={handleChange('minStock')} />
            </FormControl>
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} me={3}>إلغاء</Button>
          <Button onClick={handleSubmit}>{initialData ? 'حفظ التعديلات' : 'إضافة المنتج'}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
