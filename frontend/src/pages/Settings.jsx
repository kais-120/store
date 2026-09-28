import React, { useEffect, useState } from 'react'
import {
  Box, Card, CardBody, CardHeader, Heading, SimpleGrid, FormControl, FormLabel, Input,
  Button, VStack, useToast, Spinner, Center
} from '@chakra-ui/react'
import PageHeader from '../components/common/PageHeader'
import { getAppSetting, updateAppSetting } from '../services/api' // adjust path
import { getProfile, updateProfile } from '../services/api' // adjust path

export default function Settings() {
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [settingId, setSettingId] = useState(null)

  const [shop, setShop] = useState({ name: '', currency: '' })
  const [user, setUser] = useState({ full_name: '', username: '' })
  const [system, setSystem] = useState({ lowStockAlert: '', invoicePrefix: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [settingRes, profileRes] = await Promise.all([getAppSetting(), getProfile()])

        const setting = settingRes.data?.data ?? settingRes.data
        setSettingId(setting.id)
        setShop({ name: setting.shop_name, currency: setting.currency })
        setSystem({
          lowStockAlert: String(setting.low_stock_alert),
          invoicePrefix: setting.invoice_prefix,
        })

        const profile = profileRes.data?.user ?? profileRes.data
        setUser({ full_name: profile.full_name, username: profile.username })
      } catch (err) {
        toast({
          title: 'تعذر تحميل الإعدادات',
          description: err.response?.data?.message,
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const save = async (label, key, request) => {
    try {
      setSaving(key)
      await request()
      toast({ title: `تم حفظ ${label} بنجاح`, status: 'success', duration: 2000 })
    } catch (err) {
      toast({
        title: `تعذر حفظ ${label}`,
        description: err.response?.data?.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving('')
    }
  }

  const saveShop = () =>
    save('معلومات المحل', 'shop', () =>
      updateAppSetting(settingId, { shop_name: shop.name })
    )

  const saveUser = () =>
    save('معلومات المستخدم', 'user', () =>
      updateProfile({ full_name: user.full_name })
    )

  const saveSystem = () =>
    save('إعدادات النظام', 'system', () =>
      updateAppSetting(settingId, {
        low_stock_alert: Number(system.lowStockAlert),
        invoice_prefix: system.invoicePrefix,
      })
    )

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="lg" />
      </Center>
    )
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
                <FormLabel fontSize="sm" fontWeight="700">العملة</FormLabel>
                <Input value={shop.currency} isReadOnly bg="sand.100" />
              </FormControl>
              <Button alignSelf="flex-start" onClick={saveShop} isLoading={saving === 'shop'}>
                حفظ التغييرات
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader pb={0}><Heading size="sm">معلومات المستخدم</Heading></CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">الاسم الكامل</FormLabel>
                <Input
                  value={user.full_name}
                  onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">اسم المستخدم</FormLabel>
                <Input value={user.username} isReadOnly bg="sand.100" />
              </FormControl>
              <Button alignSelf="flex-start" onClick={saveUser} isLoading={saving === 'user'}>
                حفظ التغييرات
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card gridColumn={{ xl: 'span 2' }}>
          <CardHeader pb={0}><Heading size="sm">إعدادات النظام</Heading></CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">تنبيه انخفاض المخزون (الحد الأدنى الافتراضي)</FormLabel>
                <Input
                  type="number"
                  value={system.lowStockAlert}
                  onChange={(e) => setSystem({ ...system, lowStockAlert: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">بادئة رقم الفاتورة</FormLabel>
                <Input
                  value={system.invoicePrefix}
                  onChange={(e) => setSystem({ ...system, invoicePrefix: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>
            <Button mt={4} onClick={saveSystem} isLoading={saving === 'system'}>
              حفظ التغييرات
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}