import React, { useMemo } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, FormErrorMessage, Input, Select, SimpleGrid
} from '@chakra-ui/react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { categories } from '../../data/products'
import { isWeighedUnit, defaultStep, priceBasis } from '../../utils/format'

const UNITS = ['قطعة', 'كغ', 'غ', 'لتر']

const emptyForm = {
  name: '',
  category: 'food',
  price: '',
  purchase_price: '',
  unit: 'قطعة',
  stock: '',
  min_stock: '5',
  step: '1',
}

const numberField = (requiredMsg) =>
  Yup.number()
    .typeError('أدخل رقمًا صحيحًا')
    .min(0, 'يجب ألا تقل القيمة عن 0')
    .required(requiredMsg)

const validationSchema = Yup.object({
  name: Yup.string().trim().required('اسم المنتج مطلوب'),
  category: Yup.string().required('التصنيف مطلوب'),
  unit: Yup.string().oneOf(UNITS, 'وحدة غير صالحة').required('الوحدة مطلوبة'),
  purchase_price: numberField('سعر الشراء مطلوب'),
  price: numberField('سعر البيع مطلوب'),
  stock: numberField('الكمية الحالية مطلوبة'),
  min_stock: Yup.number()
    .typeError('أدخل رقمًا صحيحًا')
    .min(0, 'يجب ألا تقل القيمة عن 0'),
  step: Yup.number().min(0),
})

export default function ProductFormModal({ isOpen, onClose, onSave, initialData }) {
  const initialValues = useMemo(() => {
    if (!initialData) return emptyForm
    return {
      ...initialData,
      price: String(initialData.price),
      purchase_price: String(initialData.purchase_price),
      stock: String(initialData.stock),
      min_stock: String(initialData.min_stock),
      step: String(initialData.step),
    }
  }, [initialData])

  const handleFormSubmit = (values) => {
    // cast strings -> numbers using the schema, then apply the defaults
    const v = validationSchema.cast(values)
    onSave({
      ...v,
      name: v.name.trim(),
      purchase_price: v.purchase_price || 0,
      stock: v.stock || 0,
      min_stock: values.min_stock === '' ? 5 : v.min_stock,
      // weighed products: 100 g / 100 ml steps
      step: isWeighedUnit(v.unit) ? defaultStep(v.unit) : Number(values.step || 1),
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        {/* Formik lives inside ModalContent, so it remounts (and resets) each time the modal opens */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => {
            const weighed = isWeighedUnit(values.unit)
            const invalid = (key) => Boolean(touched[key] && errors[key])
            const field = (key) => ({
              name: key,
              value: values[key],
              onChange: handleChange,
              onBlur: handleBlur,
            })

            return (
              <>
                <ModalHeader fontWeight="800">
                  {initialData ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl gridColumn="span 2" isRequired isInvalid={invalid('name')}>
                      <FormLabel fontSize="sm" fontWeight="700">اسم المنتج</FormLabel>
                      <Input {...field('name')} placeholder="مثال: سكر 1 كغ" />
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={invalid('category')}>
                      <FormLabel fontSize="sm" fontWeight="700">التصنيف</FormLabel>
                      <Select {...field('category')}>
                        {categories.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.category}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={invalid('unit')}>
                      <FormLabel fontSize="sm" fontWeight="700">الوحدة</FormLabel>
                      <Select {...field('unit')}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </Select>
                      <FormErrorMessage>{errors.unit}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={invalid('purchase_price')}>
                      <FormLabel fontSize="sm" fontWeight="700">
                        {weighed ? `سعر الشراء (${priceBasis(values.unit)})` : 'سعر الشراء'}
                      </FormLabel>
                      <Input type="number" min={0} {...field('purchase_price')} placeholder="0.000" />
                      <FormErrorMessage>{errors.purchase_price}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={invalid('price')}>
                      <FormLabel fontSize="sm" fontWeight="700">
                        {weighed ? `سعر البيع (${priceBasis(values.unit)})` : 'سعر البيع'}
                      </FormLabel>
                      <Input type="number" min={0} {...field('price')} placeholder="0.000" />
                      <FormErrorMessage>{errors.price}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={invalid('stock')}>
                      <FormLabel fontSize="sm" fontWeight="700">
                        {weighed ? `الكمية الحالية (${values.unit})` : 'الكمية الحالية'}
                      </FormLabel>
                      <Input type="number" min={0} {...field('stock')} />
                      <FormErrorMessage>{errors.stock}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={invalid('min_stock')}>
                      <FormLabel fontSize="sm" fontWeight="700">الحد الأدنى للتنبيه</FormLabel>
                      <Input type="number" min={0} {...field('min_stock')} />
                      <FormErrorMessage>{errors.min_stock}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" onClick={onClose} me={3}>إلغاء</Button>
                  <Button onClick={handleSubmit}>
                    {initialData ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </Button>
                </ModalFooter>
              </>
            )
          }}
        </Formik>
      </ModalContent>
    </Modal>
  )
}