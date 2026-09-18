import React, { useState, useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  VStack, HStack, Button, Text, Select, Input, FormControl, FormLabel, SimpleGrid, Box
} from '@chakra-ui/react'
import { formatMoney } from '../../utils/format'

const methods = [
  { id: 'نقدًا', label: 'نقدًا', emoji: '💵' },
  { id: 'بطاقة', label: 'بطاقة', emoji: '💳' },
  { id: 'بالدين', label: 'بالدين', emoji: '📝' },
]

export default function PaymentModal({ isOpen, onClose, total, customers, onConfirm }) {
  const [method, setMethod] = useState('نقدًا')
  const [customerId, setCustomerId] = useState('walkin')
  const [paidAmount, setPaidAmount] = useState('')

  const selectedCustomer = useMemo(() => customers.find((c) => c.id === customerId), [customers, customerId])
  const change = Math.max(0, Number(paidAmount || 0) - total)
  const canConfirm = method !== 'بالدين' ? true : customerId !== 'walkin'

  const handleConfirm = () => {
    onConfirm({ method, customerId, paidAmount: Number(paidAmount || 0) })
    setPaidAmount('')
    setMethod('نقدًا')
    setCustomerId('walkin')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="800">إتمام عملية الدفع</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box bg="sand.100" borderRadius="lg" p={4} textAlign="center">
              <Text fontSize="sm" color="ink.muted">المجموع النهائي</Text>
              <Text fontSize="2xl" fontWeight="900" color="brand.600">{formatMoney(total)}</Text>
            </Box>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="700">طريقة الدفع</FormLabel>
              <SimpleGrid columns={3} spacing={2}>
                {methods.map((m) => (
                  <Button
                    key={m.id} size="sm" variant={method === m.id ? 'solid' : 'outline'}
                    onClick={() => setMethod(m.id)}
                  >
                    {m.emoji} {m.label}
                  </Button>
                ))}
              </SimpleGrid>
            </FormControl>

            {method === 'بالدين' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700">اختيار الحريف</FormLabel>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="walkin" disabled>اختر حريفًا...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                {selectedCustomer && (
                  <Text fontSize="xs" color="ink.muted" mt={1}>
                    الدين الحالي: {formatMoney(selectedCustomer.debt)}
                  </Text>
                )}
              </FormControl>
            )}

            {method === 'نقدًا' && (
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">المبلغ المدفوع</FormLabel>
                  <Input type="number" min={0} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0.000" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">الباقي</FormLabel>
                  <Input isReadOnly value={change.toFixed(3)} bg="sand.100" />
                </FormControl>
              </SimpleGrid>
            )}

            {method !== 'بالدين' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">اختيار الحريف (اختياري)</FormLabel>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="walkin">حريف عابر</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3} w="full">
            <Button variant="ghost" onClick={onClose} flex="1">إلغاء</Button>
            <Button flex="1" isDisabled={!canConfirm} onClick={handleConfirm}>إتمام البيع</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
