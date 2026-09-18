import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, VStack
} from '@chakra-ui/react'

export default function CustomerFormModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (initialData) { setName(initialData.name); setPhone(initialData.phone) }
    else { setName(''); setPhone('') }
  }, [initialData, isOpen])

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return
    onSave({ name: name.trim(), phone: phone.trim() })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="800">{initialData ? 'تعديل بيانات الحريف' : 'إضافة حريف جديد'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">الاسم الكامل</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: محمد الطرابلسي" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="700">رقم الهاتف</FormLabel>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="20123456" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} me={3}>إلغاء</Button>
          <Button onClick={handleSubmit}>{initialData ? 'حفظ' : 'إضافة'}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
