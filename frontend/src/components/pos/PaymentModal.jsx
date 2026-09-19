import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Select, VStack, HStack, Text, Box
} from '@chakra-ui/react'
import { formatMoney } from '../../utils/format'

const METHODS = ['نقدًا', 'بطاقة', 'بالدين']

export default function PaymentModal({ isOpen, onClose, total, customers, onConfirm }) {
  const [method, setMethod] = useState('نقدًا')
  const [customerId, setCustomerId] = useState('walkin')
  const [paid, setPaid] = useState('')

  // reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod('نقدًا')
      setCustomerId('walkin')
      setPaid('')
    }
  }, [isOpen])

  const paidAmount = paid === '' ? total : Number(paid)
  const change = method === 'نقدًا' ? Math.max(0, paidAmount - total) : 0

  const needsCustomer = method === 'بالدين' && customerId === 'walkin'
  const notEnoughCash = method === 'نقدًا' && paidAmount < total
  const canConfirm = !needsCustomer && !notEnoughCash

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({ method, customerId, paidAmount })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="800">إتمام البيع</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box bg="sand.100" borderRadius="lg" p={4} textAlign="center">
              <Text fontSize="sm" color="ink.muted">المبلغ المطلوب</Text>
              <Text fontSize="3xl" fontWeight="900" color="brand.600">{formatMoney(total)}</Text>
            </Box>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">طريقة الدفع</FormLabel>
              <HStack spacing={2}>
                {METHODS.map((m) => (
                  <Button key={m} flex="1" size="sm" variant={method === m ? 'solid' : 'outline'} onClick={() => setMethod(m)}>
                    {m}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <FormControl isRequired={method === 'بالدين'}>
              <FormLabel fontSize="sm" fontWeight="700">الحريف</FormLabel>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="walkin">حريف عابر</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {needsCustomer && (
                <Text mt={1} fontSize="xs" color="red.500">اختر حريفًا مسجلاً لتسجيل البيع بالدين</Text>
              )}
            </FormControl>

            {method === 'نقدًا' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">المبلغ المدفوع</FormLabel>
                <Input type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={total.toFixed(3)} />
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color="ink.muted">الباقي للحريف</Text>
                  <Text fontSize="sm" fontWeight="800">{formatMoney(change)}</Text>
                </HStack>
                {notEnoughCash && (
                  <Text mt={1} fontSize="xs" color="red.500">المبلغ المدفوع أقل من المجموع</Text>
                )}
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} me={3}>إلغاء</Button>
          <Button onClick={handleConfirm} isDisabled={!canConfirm}>تأكيد الدفع</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
