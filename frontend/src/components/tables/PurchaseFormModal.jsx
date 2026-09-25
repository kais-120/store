import React, { useEffect, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, FormErrorMessage, Input, Select, VStack, HStack, Box, Text, IconButton,
  Divider, useToast
} from '@chakra-ui/react'
import { Plus, Trash } from 'lucide-react'
import { Formik, Form, FieldArray, getIn } from 'formik'
import * as Yup from 'yup'
import { getProducts, getSuppliers } from '../../services/api'

const emptyItem = () => ({ product_id: '', quantity: '', purchase_price: '' })

const initialValues = {
  supplier_id: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'paid',
  items: [emptyItem()]
}

const validationSchema = Yup.object().shape({
  supplier_id: Yup.string().required('الرجاء اختيار المورد'),
  date: Yup.string().required('الرجاء تحديد تاريخ الشراء'),
  status: Yup.string().required(),
  items: Yup.array()
    .of(
      Yup.object().shape({
        product_id: Yup.string().required('الرجاء اختيار المنتج'),
        quantity: Yup.number()
          .typeError('الكمية يجب أن تكون رقمًا')
          .positive('الكمية يجب أن تكون أكبر من 0')
          .required('الكمية مطلوبة'),
        purchase_price: Yup.number()
          .typeError('السعر يجب أن يكون رقمًا')
          .positive('سعر الشراء يجب أن يكون أكبر من 0')
          .required('السعر مطلوب')
      })
    )
    .min(1, 'الرجاء إضافة منتج واحد على الأقل')
    .test('unique-product', 'لا يمكن اختيار نفس المنتج أكثر من مرة', (items) => {
      if (!items) return true
      const ids = items.map((i) => i.product_id).filter(Boolean)
      return new Set(ids).size === ids.length
    })
})

// helper to surface the array-level "unique-product" error (Yup .test errors on
// an array field land on the array path itself, not on a specific row)
const getArrayError = (errors, touched, field) => {
  const err = getIn(errors, field)
  return typeof err === 'string' ? err : undefined
}

export default function PurchaseFormModal({ isOpen, onClose, onSave, isSaving }) {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    const dataShow = async () => {
      try {
        const [responseProduct, responseSuppliers] = await Promise.all([
          getProducts(),
          getSuppliers()
        ])
        setProducts(responseProduct.data.data)
        setSuppliers(responseSuppliers.data.data)
      } catch (error) {
        console.log('err', error)
      }
    }

    dataShow()
  }, [isSaving])

  const getRowTotal = (item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.purchase_price) || 0
    return qty * price
  }

  const isProductTakenElsewhere = (items, product_id, currentIndex) =>
    items.some((item, i) => i !== currentIndex && item.product_id === product_id)

  const handleSubmit = (values, { resetForm }) => {
    const supplier = suppliers.find((s) => String(s.id) === String(values.supplier_id))

    const purchaseItems = values.items.map((item) => {
      const product = products.find((p) => String(p.id) === String(item.product_id))
      const quantity = Number(item.quantity)
      const purchase_price = Number(item.purchase_price)
      return {
        product_id: item.product_id,
        productName: product ? product.name : '',
        quantity,
        purchase_price,
        total: quantity * purchase_price
      }
    })

    const purchase = {
      supplier_id: values.supplier_id,
      supplierName: supplier ? supplier.name : '',
      date: values.date,
      status: values.status,
      items: purchaseItems,
      totalAmount: purchaseItems.reduce((sum, i) => sum + i.total, 0)
    }

    onSave(purchase)
    resetForm()
    onClose()
  }

  const handleInvalidSubmit = (errors) => {
    const firstError =
      errors.supplier_id ||
      errors.date ||
      (typeof errors.items === 'string' ? errors.items : null) ||
      (Array.isArray(errors.items) &&
        errors.items.find(Boolean) &&
        Object.values(errors.items.find(Boolean))[0])

    if (firstError) {
      toast({ title: firstError, status: 'error' })
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, touched, setFieldValue, handleChange, validateForm, submitForm, resetForm }) => {
        const totalAmount = values.items.reduce((sum, item) => sum + getRowTotal(item), 0)

        const handleClose = () => {
          resetForm()
          onClose()
        }

        const handleAttemptSubmit = async () => {
          const validationErrors = await validateForm()
          if (Object.keys(validationErrors).length > 0) {
            handleInvalidSubmit(validationErrors)
            return
          }
          submitForm()
        }

        return (
          <Modal isOpen={isOpen} onClose={handleClose} isCentered size="2xl" dir="rtl">
            <ModalOverlay />
            <ModalContent as={Form}>
              <ModalHeader fontWeight="800">إضافة عملية شراء</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} align="flex-start">
                    <FormControl isRequired isInvalid={!!errors.supplier_id}>
                      <FormLabel fontSize="sm" fontWeight="700">المورد</FormLabel>
                      <Select
                        name="supplier_id"
                        placeholder="اختر موردًا..."
                        value={values.supplier_id}
                        onChange={handleChange}
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.supplier_id}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={!!errors.date}>
                      <FormLabel fontSize="sm" fontWeight="700">تاريخ الشراء</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={values.date}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.date}</FormErrorMessage>
                    </FormControl>
                  </HStack>

                  <Divider />

                  <FieldArray name="items">
                    {({ push, remove }) => {
                      const arrayError = getArrayError(errors, touched, 'items')
                      return (
                        <Box>
                          <Text fontSize="sm" fontWeight="700" mb={2}>قائمة المنتجات</Text>
                          {arrayError && (
                            <Text fontSize="sm" color="red.500" mb={2}>{arrayError}</Text>
                          )}
                          <VStack spacing={3} align="stretch">
                            {values.items.map((item, index) => {
                              const rowTotal = getRowTotal(item)
                              const itemErrors = getIn(errors, `items[${index}]`) || {}
                              const availableProducts = products?.filter(
                                (p) => !isProductTakenElsewhere(values.items, String(p.id), index)
                              )
                              const selectedStillVisible = availableProducts?.some(
                                (p) => String(p.id) === String(item.product_id)
                              )

                              return (
                                <Box
                                  key={index}
                                  borderWidth="1px"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                  p={3}
                                >
                                  <HStack align="flex-start" spacing={3}>
                                    <FormControl isRequired flex="1" isInvalid={!!itemErrors.product_id}>
                                      <FormLabel fontSize="xs" fontWeight="600">المنتج</FormLabel>
                                      <Select
                                        placeholder="اختر منتجًا..."
                                        value={item.product_id}
                                        onChange={(e) =>
                                          setFieldValue(`items[${index}].product_id`, e.target.value)
                                        }
                                      >
                                        {availableProducts?.map((p) => (
                                          <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        {item.product_id && !selectedStillVisible && (
                                          <option value={item.product_id}>
                                            {products.find((p) => String(p.id) === String(item.product_id))?.name}
                                          </option>
                                        )}
                                      </Select>
                                      <FormErrorMessage>{itemErrors.product_id}</FormErrorMessage>
                                    </FormControl>

                                    <IconButton
                                      aria-label="حذف المنتج"
                                      icon={<Trash size={18} />}
                                      variant="ghost"
                                      colorScheme="red"
                                      mt={7}
                                      onClick={() => values.items.length > 1 && remove(index)}
                                      isDisabled={values.items.length === 1}
                                    />
                                  </HStack>

                                  <HStack spacing={3} mt={3} align="flex-start">
                                    <FormControl isRequired isInvalid={!!itemErrors.quantity}>
                                      <FormLabel fontSize="xs" fontWeight="600">الكمية</FormLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={item.quantity}
                                        onChange={(e) =>
                                          setFieldValue(`items[${index}].quantity`, e.target.value)
                                        }
                                      />
                                      <FormErrorMessage>{itemErrors.quantity}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isRequired isInvalid={!!itemErrors.purchase_price}>
                                      <FormLabel fontSize="xs" fontWeight="600">سعر الوحدة</FormLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={item.purchase_price}
                                        onChange={(e) =>
                                          setFieldValue(`items[${index}].purchase_price`, e.target.value)
                                        }
                                      />
                                      <FormErrorMessage>{itemErrors.purchase_price}</FormErrorMessage>
                                    </FormControl>
                                  </HStack>

                                  <HStack justify="space-between" mt={3} pt={2} borderTopWidth="1px" borderColor="gray.100">
                                    <Text fontSize="sm" color="gray.600" fontWeight="600">مجموع هذا المنتج</Text>
                                    <Text fontSize="md" fontWeight="800" color="teal.600">
                                      {rowTotal.toFixed(3)}
                                    </Text>
                                  </HStack>
                                </Box>
                              )
                            })}
                          </VStack>

                          <Button
                            leftIcon={<Plus size={16} />}
                            variant="outline"
                            size="sm"
                            mt={3}
                            onClick={() => push(emptyItem())}
                          >
                            إضافة منتج آخر
                          </Button>
                        </Box>
                      )
                    }}
                  </FieldArray>

                  <Divider />

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">حالة الدفع</FormLabel>
                    <Select name="status" value={values.status} onChange={handleChange}>
                      <option value="paid">مدفوعة</option>
                      <option value="debt">بالدين</option>
                      <option value="pending">معلقة</option>
                    </Select>
                  </FormControl>

                  <HStack justify="space-between" bg="gray.50" p={3} borderRadius="md">
                    <Text fontWeight="700">الإجمالي الكلي:</Text>
                    <Text fontWeight="800" fontSize="lg">{totalAmount.toFixed(3)}</Text>
                  </HStack>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={handleClose} me={3}>إلغاء</Button>
                <Button onClick={handleAttemptSubmit} isLoading={isSaving} type="button">إضافة</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )
      }}
    </Formik>
  )
}