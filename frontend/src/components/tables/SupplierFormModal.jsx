import React, { useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, FormErrorMessage, VStack
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('الاسم الكامل مطلوب'),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9]{8}$/, 'رقم الهاتف يجب أن يتكون من 8 أرقام')
    .required('رقم الهاتف مطلوب'),
})

export default function SupplierFormModal({ isOpen, onClose, onSave, initialData,isSaving }) {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onSave({ name: values.name.trim(), phone: values.phone.trim() })
      resetForm()
      onClose()
    },
  })

  // Reset form whenever the modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          name: initialData?.name || '',
          phone: initialData?.phone || '',
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
          {initialData ? 'تعديل بيانات مورد' : 'إضافة مورد جديد'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={formik.touched.name && !!formik.errors.name}>
              <FormLabel fontSize="sm" fontWeight="700">الاسم مورد</FormLabel>
              <Input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="مثال: محمد الطرابلسي"
              />
              <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={formik.touched.phone && !!formik.errors.phone}>
              <FormLabel fontSize="sm" fontWeight="700">رقم الهاتف</FormLabel>
              <Input
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="20123456"
              />
              <FormErrorMessage>{formik.errors.phone}</FormErrorMessage>
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