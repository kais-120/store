import React, { useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('اسم التصنيف مطلوب')
    .min(2, 'اسم التصنيف يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم التصنيف يجب ألا يتجاوز 100 حرف'),
})

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
    },

    validationSchema,

    enableReinitialize: true,

    onSubmit: async (values, { resetForm }) => {
      await onSave({
        name: values.name.trim(),
      })

      resetForm()
      onClose()
    },
  })

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          name: initialData?.name || '',
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
    >
      <ModalOverlay />

      <ModalContent
        as="form"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <ModalHeader fontWeight="800">
          {initialData
            ? 'تعديل التصنيف'
            : 'إضافة تصنيف جديد'}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl
              isRequired
              isInvalid={
                formik.touched.name &&
                !!formik.errors.name
              }
            >
              <FormLabel
                fontSize="sm"
                fontWeight="700"
              >
                اسم التصنيف
              </FormLabel>

              <Input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="مثال: مشروبات"
                autoFocus
              />

              <FormErrorMessage>
                {formik.errors.name}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            me={3}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            colorScheme="brand"
            isLoading={formik.isSubmitting}
          >
            {initialData ? 'حفظ التغييرات' : 'إضافة'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}