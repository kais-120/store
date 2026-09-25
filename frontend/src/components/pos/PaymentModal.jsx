import React, { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Select, VStack, HStack, Text, Box
} from '@chakra-ui/react'
import { formatMoney } from '../../utils/format'
import { createSale } from '../../services/api'

const METHODS = [{key:'cash',label:"نقدا"}, {key:'debt',label:"بالدين"}]

export default function PaymentModal({ isOpen, onClose, total, customers, onConfirm }) {
  const [method, setMethod] = useState('cash')
  const [customerId, setCustomerId] = useState(null)
  const [paid, setPaid] = useState('')

  // reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod('cash')
      setCustomerId(null)
      setPaid('')
    }
  }, [isOpen])

  const paidAmount = paid === '' ? total : Number(paid)
  const change = method === 'cash' ? Math.max(0, paidAmount - total) : 0

  const needsCustomer = method === 'debt' && customerId === null
  const notEnoughCash = method === 'cash' && paidAmount < total
  const canConfirm = !needsCustomer && !notEnoughCash

  const handleConfirm = () => {
    if (!canConfirm) return
      onConfirm({ method, customerId, paidAmount:total })
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
                  <Button key={m.key} flex="1" size="sm"  variant={method === m.key ? 'solid' : 'outline'} onClick={() => setMethod(m.key)}>
                    {m.label}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <FormControl isRequired={method === 'debt'}>
              <FormLabel fontSize="sm" fontWeight="700">الحريف</FormLabel>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">حريف عابر</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {needsCustomer && (
                <Text mt={1} fontSize="xs" color="red.500">اختر حريفًا مسجلاً لتسجيل البيع بالدين</Text>
              )}
            </FormControl>

            {method === 'cash' && (
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
