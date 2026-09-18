import React, { useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Select, VStack
} from '@chakra-ui/react'

export default function PurchaseFormModal({ isOpen, onClose, onSave, suppliers }) {
  const [supplierId, setSupplierId] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('مدفوعة')

  const handleSubmit = () => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    if (!supplier || !amount) return
    onSave({ supplierId, supplierName: supplier.name, amount: Number(amount), status })
    setSupplierId(''); setAmount(''); setStatus('مدفوعة')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="800">إضافة عملية شراء</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">المورد</FormLabel>
              <Select placeholder="اختر موردًا..." value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">المبلغ</FormLabel>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.000" />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">حالة الدفع</FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="مدفوعة">مدفوعة</option>
                <option value="مدفوعة جزئيًا">مدفوعة جزئيًا</option>
                <option value="معلقة">معلقة</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} me={3}>إلغاء</Button>
          <Button onClick={handleSubmit}>إضافة</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
