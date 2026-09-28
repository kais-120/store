import React, { useState } from 'react'
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody, DrawerFooter,
  VStack, HStack, Text, Stat, StatLabel, StatNumber, SimpleGrid, Input, Button, Divider, Box,
  useToast, FormControl, FormErrorMessage
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { formatMoney } from '../../utils/format'
import { payCustomerDebt } from '../../services/api'

export default function CustomerDetailsDrawer({ isOpen, onClose, customer, onRegisterPayment }) {
  const toast = useToast()

  if (!customer) return null

  const paymentSchema = Yup.object().shape({
    amount: Yup.number()
      .typeError('أدخل رقمًا صحيحًا')
      .required('المبلغ مطلوب')
      .moreThan(0, 'يجب أن يكون المبلغ أكبر من صفر')
      .max(customer.balance, `المبلغ يتجاوز الدين المتبقي (${formatMoney(customer.balance)})`),
  })

  const handlePay = async (values, { setSubmitting, resetForm }) => {
    const amount = Number(values.amount)

    try {
      const { data } = await payCustomerDebt({
        customer_id: customer.id,
        amount,
      })

      onRegisterPayment(customer.id, amount, data)
      resetForm()

      toast({
        title: 'تم تسجيل الدفعة',
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: 'فشل تسجيل الدفعة',
        description: err?.response?.data?.message || 'حدث خطأ ما',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSubmitting(false)
    }
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
                  <StatNumber fontSize="lg" color={customer.balance > 0 ? 'brick.500' : 'olive.500'}>{formatMoney(customer.balance)}</StatNumber>
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

            <Formik
              initialValues={{ amount: '' }}
              validationSchema={paymentSchema}
              onSubmit={handlePay}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="700" fontSize="sm">تسجيل دفعة جديدة</Text>
                    <HStack align="start">
                      <FormControl isInvalid={!!errors.amount && touched.amount}>
                        <Field
                          as={Input}
                          type="number"
                          name="amount"
                          min={0}
                          step="0.001"
                          placeholder="0.000"
                          isDisabled={isSubmitting || customer.balance <= 0}
                        />
                        <FormErrorMessage>{errors.amount}</FormErrorMessage>
                      </FormControl>
                      <Button
                        type="submit"
                        isDisabled={customer.balance <= 0}
                        isLoading={isSubmitting}
                      >
                        تسجيل
                      </Button>
                    </HStack>
                  </VStack>
                </Form>
              )}
            </Formik>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}