import React, { useState } from 'react'
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody, DrawerFooter,
  VStack, HStack, Text, Stat, StatLabel, StatNumber, SimpleGrid, Input, Button, Divider, Box
} from '@chakra-ui/react'
import { formatMoney } from '../../utils/format'

export default function CustomerDetailsDrawer({ isOpen, onClose, customer, onRegisterPayment }) {
  const [payment, setPayment] = useState('')

  if (!customer) return null

  const handlePay = () => {
    const amount = Number(payment)
    if (!amount || amount <= 0) return
    onRegisterPayment(customer.id, Math.min(amount, customer.debt))
    setPayment('')
  }

  return (
    <Drawer isOpen={isOpen} placement="end" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader fontWeight="800">{customer.name}</DrawerHeader>
        <DrawerBody>
          <VStack align="stretch" spacing={5}>
            <SimpleGrid columns={2} spacing={4}>
              <Box bg="sand.100" borderRadius="lg" p={3}>
                <Stat>
                  <StatLabel fontSize="xs">إجمالي المشتريات</StatLabel>
                  <StatNumber fontSize="lg">{formatMoney(customer.totalPurchases)}</StatNumber>
                </Stat>
              </Box>
              <Box bg="sand.100" borderRadius="lg" p={3}>
                <Stat>
                  <StatLabel fontSize="xs">الدين الحالي</StatLabel>
                  <StatNumber fontSize="lg" color={customer.debt > 0 ? 'brick.500' : 'olive.500'}>{formatMoney(customer.debt)}</StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>

            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" color="ink.muted">رقم الهاتف</Text>
              <Text fontWeight="700">{customer.phone}</Text>
            </VStack>
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" color="ink.muted">آخر عملية شراء</Text>
              <Text fontWeight="700">{customer.lastPurchase}</Text>
            </VStack>

            <Divider />

            <VStack align="stretch" spacing={3}>
              <Text fontWeight="700" fontSize="sm">تسجيل دفعة جديدة</Text>
              <HStack>
                <Input type="number" min={0} placeholder="0.000" value={payment} onChange={(e) => setPayment(e.target.value)} />
                <Button onClick={handlePay} isDisabled={customer.debt <= 0}>تسجيل</Button>
              </HStack>
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
