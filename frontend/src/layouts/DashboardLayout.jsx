import React, { useState } from 'react'
import { Flex, Box, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

const titles = {
  '/dashboard': 'الرئيسية',
  '/sales': 'المبيعات',
  '/inventory': 'المخزون',
  '/purchases': 'المشتريات',
  '/customers': 'الحرفاء',
  '/accounts': 'الحسابات',
  '/reports': 'التقارير',
  '/settings': 'الإعدادات',
}

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'مغازة البركة'

  return (
    <Flex h="100vh" bg="sand.100" overflow="hidden">
      <Box display={{ base: 'none', lg: 'block' }}>
        <Sidebar />
      </Box>

      <Drawer isOpen={isOpen} placement="end" onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <Sidebar onNavigate={() => setIsOpen(false)} />
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex="1" overflow="hidden">
        <Header title={title} onOpenSidebar={() => setIsOpen(true)} />
        <Box flex="1" overflowY="auto" p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
