import React, { useState } from 'react'
import {
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Card, CardBody, Button, useDisclosure, useToast, Text
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import PurchaseFormModal from '../components/tables/PurchaseFormModal'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../utils/format'

const statusColor = { 'مدفوعة': 'olive', 'مدفوعة جزئيًا': 'amber', 'معلقة': 'brick' }

export default function Purchases() {
  const { purchases, suppliers, addPurchase } = useApp()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleSave = (purchase) => {
    addPurchase(purchase)
    toast({ title: 'تمت إضافة عملية الشراء بنجاح', status: 'success', duration: 2000 })
  }

  return (
    <Box>
      <PageHeader
        title="المشتريات" subtitle="إدارة عمليات الشراء والموردين"
        actions={<Button leftIcon={<Plus size={16} />} onClick={onOpen}>إضافة عملية شراء</Button>}
      />

      <Tabs colorScheme="brand">
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
                          <Td>{p.supplierName}</Td>
                          <Td>{p.date}</Td>
                          <Td fontWeight="700">{formatMoney(p.amount)}</Td>
                          <Td><Badge bg={`${statusColor[p.status] || 'gray'}.500`} color="white">{p.status}</Badge></Td>
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
                      <Tr key={s.id}>
                        <Td fontWeight="600">{s.name}</Td>
                        <Td>{s.phone}</Td>
                        <Td fontWeight="700" color={s.debt > 0 ? 'brick.500' : 'olive.500'}>{formatMoney(s.debt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <PurchaseFormModal isOpen={isOpen} onClose={onClose} onSave={handleSave} suppliers={suppliers} />
    </Box>
  )
}
