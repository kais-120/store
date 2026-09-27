import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Textarea, FormErrorMessage, VStack
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  label: Yup.string()
    .trim()
    .required('عنوان المصروف مطلوب'),
  category: Yup.string()
    .trim()
    .nullable(),
  amount: Yup.number()
    .typeError('المبلغ يجب أن يكون رقماً')
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .required('المبلغ مطلوب'),
  date: Yup.date()
    .typeError('التاريخ غير صالح')
    .required('التاريخ مطلوب'),
  note: Yup.string()
    .trim()
    .nullable(),
})

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function ExpensesFormModal({ isOpen, onClose, onSave, initialData }) {
  const formik = useFormik({
    initialValues: {
      label: initialData?.label || '',
      category: initialData?.category || '',
      amount: initialData?.amount ?? '',
      date: initialData?.date || todayISO(),
      note: initialData?.note || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onSave({
        label: values.label.trim(),
        category: values.category ? values.category.trim() : null,
        amount: Number(values.amount),
        date: values.date,
        note: values.note ? values.note.trim() : null,
      })
      resetForm()
      onClose()
    },
  })

  // Reset form whenever the modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          label: initialData?.label || '',
          category: initialData?.category || '',
          amount: initialData?.amount ?? '',
          date: initialData?.date || todayISO(),
          note: initialData?.note || '',
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen])

  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={formik.handleSubmit} noValidate>
        <ModalHeader fontWeight="800">
          {initialData ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={formik.touched.label && !!formik.errors.label}>
              <FormLabel fontSize="sm" fontWeight="700">عنوان المصروف</FormLabel>
              <Input
                name="label"
                value={formik.values.label}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="مثال: فاتورة الكهرباء"
              />
              <FormErrorMessage>{formik.errors.label}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.touched.category && !!formik.errors.category}>
              <FormLabel fontSize="sm" fontWeight="700">الفئة</FormLabel>
              <Input
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="مثال: فواتير (اختياري)"
              />
              <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={formik.touched.amount && !!formik.errors.amount}>
              <FormLabel fontSize="sm" fontWeight="700">المبلغ (د.ت)</FormLabel>
              <Input
                type="number"
                step="0.001"
                min="0"
                name="amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="0.000"
              />
              <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={formik.touched.date && !!formik.errors.date}>
              <FormLabel fontSize="sm" fontWeight="700">التاريخ</FormLabel>
              <Input
                type="date"
                name="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.touched.note && !!formik.errors.note}>
              <FormLabel fontSize="sm" fontWeight="700">ملاحظات</FormLabel>
              <Textarea
                name="note"
                value={formik.values.note}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="ملاحظات إضافية (اختياري)"
                rows={3}
              />
              <FormErrorMessage>{formik.errors.note}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} me={3}>إلغاء</Button>
          <Button type="submit" isLoading={formik.isSubmitting}>
            {initialData ? 'حفظ' : 'إضافة'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}