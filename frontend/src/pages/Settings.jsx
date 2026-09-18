import React, { useState } from 'react'
import {
  Box, Card, CardBody, CardHeader, Heading, SimpleGrid, FormControl, FormLabel, Input,
  Button, VStack, useToast, Select
} from '@chakra-ui/react'
import PageHeader from '../components/common/PageHeader'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { currentUser } = useApp()
  const toast = useToast()

  const [shop, setShop] = useState({ name: 'مغازة البركة', address: 'تونس', phone: '71000000', currency: 'د.ت' })
  const [user, setUser] = useState({ name: currentUser.name, username: currentUser.username, phone: '20000000' })
  const [system, setSystem] = useState({ lowStockAlert: '5', invoicePrefix: 'F-', taxRate: '0' })

  const save = (label) => {
    toast({ title: `تم حفظ ${label} بنجاح`, status: 'success', duration: 2000 })
  }

  return (
    <Box>
      <PageHeader title="الإعدادات" subtitle="إدارة معلومات المحل والنظام" />

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        <Card>
          <CardHeader pb={0}><Heading size="sm">معلومات المحل</Heading></CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">اسم المحل</FormLabel>
                <Input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">العنوان</FormLabel>
                <Input value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">رقم الهاتف</FormLabel>
                <Input value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">العملة</FormLabel>
                <Input value={shop.currency} isReadOnly bg="sand.100" />
              </FormControl>
              <Button alignSelf="flex-start" onClick={() => save('معلومات المحل')}>حفظ التغييرات</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={0}><Heading size="sm">معلومات المستخدم</Heading></CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">الاسم الكامل</FormLabel>
                <Input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">اسم المستخدم</FormLabel>
                <Input value={user.username} isReadOnly bg="sand.100" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">رقم الهاتف</FormLabel>
                <Input value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
              </FormControl>
              <Button alignSelf="flex-start" onClick={() => save('معلومات المستخدم')}>حفظ التغييرات</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card gridColumn={{ xl: 'span 2' }}>
          <CardHeader pb={0}><Heading size="sm">إعدادات النظام</Heading></CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">تنبيه انخفاض المخزون (الحد الأدنى الافتراضي)</FormLabel>
                <Input type="number" value={system.lowStockAlert} onChange={(e) => setSystem({ ...system, lowStockAlert: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">بادئة رقم الفاتورة</FormLabel>
                <Input value={system.invoicePrefix} onChange={(e) => setSystem({ ...system, invoicePrefix: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">لغة الواجهة</FormLabel>
                <Select value="ar" isReadOnly><option value="ar">العربية</option></Select>
              </FormControl>
            </SimpleGrid>
            <Button mt={4} onClick={() => save('إعدادات النظام')}>حفظ التغييرات</Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
