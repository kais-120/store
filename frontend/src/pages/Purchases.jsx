import React, { useState } from 'react'
import {
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Card, CardBody, Button, useDisclosure, useToast
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import PurchaseFormModal from '../components/tables/PurchaseFormModal'
import SupplierFormModal from '../components/tables/SupplierFormModal'
import SupplierDetailsDrawer from '../components/tables/SupplierDetailsDrawer'
import { formatMoney } from '../utils/format'
import useFetchData from '../hook/useFetchData'
import { createPurchase, createSupplier, getPurchases, getSuppliers } from '../services/api'

const statusLabel = {
  paid: 'مدفوعة',
  debt: 'دين',
  pending: 'معلقة',
}
const statusColor = { paid: 'olive', debt: 'brick', pending: 'amber' }

export default function Purchases() {
  const [tabIndex, setTabIndex] = useState(0)
  const [isSavingPurchase, setIsSavingPurchase] = useState(false)
  const [isSavingSupplier, setIsSavingSupplier] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: purchases = [] } = useFetchData(getPurchases, refreshKey)
  const { data: suppliers = [] } = useFetchData(getSuppliers, refreshKey)

  const purchaseModal = useDisclosure()
  const supplierModal = useDisclosure()
  const supplierDrawer = useDisclosure()

  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const toast = useToast()

  const handleSavePurchase = async (purchase) => {
    setIsSavingPurchase(true)
    try {
      await createPurchase(purchase)
      toast({ title: 'تمت إضافة عملية الشراء بنجاح', status: 'success', duration: 2000 })
      purchaseModal.onClose()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast({
        title: 'حدث خطأ أثناء حفظ بيانات الشراء',
        description: err?.response?.data?.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSavingPurchase(false)
    }
  }

  const handleSaveSupplier = async (supplier) => {
    setIsSavingSupplier(true)
    try {
      await createSupplier(supplier)
      toast({ title: 'تمت إضافة المورد بنجاح', status: 'success', duration: 2000 })
      supplierModal.onClose()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast({
        title: 'حدث خطأ أثناء حفظ بيانات المورد',
        description: err?.response?.data?.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSavingSupplier(false)
    }
  }

  const handleOpenSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    supplierDrawer.onOpen()
  }

  const handleRegisterSupplierPayment = (supplierId, amount) => {
    setSelectedSupplier((prev) =>
      prev && prev.id === supplierId ? { ...prev, balance: prev.balance - amount } : prev
    )
    setRefreshKey((k) => k + 1)
  }

  return (
    <Box>
      <PageHeader
        title="المشتريات"
        subtitle="إدارة عمليات الشراء والموردين"
        actions={
          tabIndex === 0 ? (
            <Button leftIcon={<Plus size={16} />} onClick={purchaseModal.onOpen}>
              إضافة عملية شراء
            </Button>
          ) : (
            <Button leftIcon={<Plus size={16} />} onClick={supplierModal.onOpen}>
              إضافة مورد
            </Button>
          )
        }
      />

      <Tabs colorScheme="brand" index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab fontWeight="700">المشتريات</Tab>
          <Tab fontWeight="700">الموردون</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card>
              <CardBody overflowX="auto">
                {purchases.length === 0 ? <EmptyState text="لا توجد عمليات شراء" /> : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>رقم العملية</Th>
                        <Th>المورد</Th>
                        <Th>التاريخ</Th>
                        <Th>المبلغ</Th>
                        <Th>الحالة</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {purchases.map((p) => (
                        <Tr key={p.id}>
                          <Td fontWeight="700">{p.id}</Td>
                          <Td>{p?.supplier?.name}</Td>
                          <Td>{new Date(p.date).toLocaleDateString('fr-FR')}</Td>
                          <Td fontWeight="700">{formatMoney(p.total_amount)}</Td>
                          <Td>
                            <Badge bg={`${statusColor[p.status] || 'gray'}.500`} color="white">
                              {statusLabel[p.status] || p.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card>
              <CardBody overflowX="auto">
                {suppliers.length === 0 ? <EmptyState text="لا يوجد موردون" /> : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>اسم المورد</Th>
                        <Th>الهاتف</Th>
                        <Th>الدين المستحق</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {suppliers.map((s) => (
                        <Tr
                          key={s.id}
                          onClick={() => handleOpenSupplier(s)}
                          cursor="pointer"
                          _hover={{ bg: 'sand.50' }}
                        >
                          <Td fontWeight="600">{s.name}</Td>
                          <Td>{s.phone}</Td>
                          <Td fontWeight="700" color={s.balance > 0 ? 'brick.500' : 'olive.500'}>
                            {formatMoney(s.balance)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <PurchaseFormModal
        isOpen={purchaseModal.isOpen}
        onClose={purchaseModal.onClose}
        onSave={handleSavePurchase}
        isSaving={isSavingPurchase}
        suppliers={suppliers}
      />

      <SupplierFormModal
        isOpen={supplierModal.isOpen}
        onClose={supplierModal.onClose}
        onSave={handleSaveSupplier}
        isSaving={isSavingSupplier}
      />

      <SupplierDetailsDrawer
        isOpen={supplierDrawer.isOpen}
        onClose={supplierDrawer.onClose}
        supplier={selectedSupplier}
        onRegisterPayment={handleRegisterSupplierPayment}
      />
    </Box>
  )
}