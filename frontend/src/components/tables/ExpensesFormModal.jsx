import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Textarea, FormErrorMessage, VStack, Select
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export const EXPENSE_CATEGORIES = [
  'فواتير',
  'أجور',
  'إيجار',
  'شراء بضاعة',
  'نقل',
  'صيانة',
  'أخرى',
]

const validationSchema = Yup.object({
  label: Yup.string()
    .trim()
    .required('عنوان المصروف مطلوب'),
  category: Yup.string()
    .trim()
    .required('الفئة مطلوبة'),
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

// local date (toISOString would give the UTC date, which can be off by one day)
const todayISO = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const buildInitialValues = (initialData) => ({
  label: initialData?.label || '',
  category: initialData?.category || '',
  amount: initialData?.amount ?? '',
  date: initialData?.date ? String(initialData.date).slice(0, 10) : todayISO(),
  note: initialData?.note || '',
})

export default function ExpensesFormModal({ isOpen, onClose, onSave, initialData }) {
  const formik = useFormik({
    initialValues: buildInitialValues(initialData),
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // parent returns true on success, false on failure (modal stays open on failure)
      const ok = await onSave({
        label: values.label.trim(),
        category: values.category.trim(),
        amount: Number(values.amount),
        date: values.date,
        note: values.note ? values.note.trim() : null,
      })
      if (ok) resetForm()
    },
  })

  // Reset form whenever the modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm({ values: buildInitialValues(initialData) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen])

  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  // keep a previously saved custom category selectable when editing
  const categoryOptions =
    initialData?.category && !EXPENSE_CATEGORIES.includes(initialData.category)
      ? [...EXPENSE_CATEGORIES, initialData.category]
      : EXPENSE_CATEGORIES

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

            <FormControl isRequired isInvalid={formik.touched.category && !!formik.errors.category}>
              <FormLabel fontSize="sm" fontWeight="700">الفئة</FormLabel>
              <Select
                name="category"
                placeholder="اختر الفئة"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
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