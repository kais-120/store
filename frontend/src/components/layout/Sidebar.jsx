import React from 'react'
import { Box, VStack, HStack, Text, Flex, Icon, Divider } from '@chakra-ui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, ShoppingCart, Package, Truck, Users, Wallet, BarChart3, Settings, LogOut, Store } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/dashboard', label: 'الرئيسية', icon: Home },
  { to: '/sales', label: 'المبيعات', icon: ShoppingCart },
  { to: '/inventory', label: 'المخزون', icon: Package },
  { to: '/purchases', label: 'المشتريات', icon: Truck },
  { to: '/customers', label: 'الحرفاء', icon: Users },
  { to: '/accounts', label: 'الحسابات', icon: Wallet },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
]

export default function Sidebar({ onNavigate }) {
  const { logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Flex direction="column" h="100%" bg="brand.700" color="white" w="260px" py={5} px={3}>
      <HStack px={2} mb={6} spacing={3}>
        <Flex align="center" justify="center" w="42px" h="42px" borderRadius="lg" bg="gold.500" flexShrink={0}>
          <Icon as={Store} boxSize={5} color="white" />
        </Flex>
        <Box>
          <Text fontWeight="800" fontSize="lg" lineHeight="1.1">مغازة البركة</Text>
          <Text fontSize="xs" color="whiteAlpha.700">نظام إدارة المحل</Text>
        </Box>
      </HStack>

      <VStack align="stretch" spacing={1} flex="1" overflowY="auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <HStack
                px={3} py={2.5} borderRadius="lg" spacing={3}
                bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                borderInlineStart={isActive ? '3px solid' : '3px solid transparent'}
                borderInlineStartColor={isActive ? 'gold.400' : 'transparent'}
                _hover={{ bg: 'whiteAlpha.100' }}
                transition="background 0.15s"
              >
                <Icon as={item.icon} boxSize={4.5} color={isActive ? 'gold.300' : 'whiteAlpha.800'} />
                <Text fontWeight={isActive ? '700' : '500'} fontSize="sm">{item.label}</Text>
              </HStack>
            )}
          </NavLink>
        ))}
      </VStack>

      <Divider borderColor="whiteAlpha.200" my={3} />

      <VStack align="stretch" spacing={1}>
        <NavLink to="/settings" onClick={onNavigate} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <HStack px={3} py={2.5} borderRadius="lg" spacing={3} bg={isActive ? 'whiteAlpha.200' : 'transparent'} _hover={{ bg: 'whiteAlpha.100' }}>
              <Icon as={Settings} boxSize={4.5} color="whiteAlpha.800" />
              <Text fontSize="sm" fontWeight="500">الإعدادات</Text>
            </HStack>
          )}
        </NavLink>
        <HStack px={3} py={2.5} borderRadius="lg" spacing={3} cursor="pointer" _hover={{ bg: 'whiteAlpha.100' }} onClick={handleLogout}>
          <Icon as={LogOut} boxSize={4.5} color="whiteAlpha.800" />
          <Text fontSize="sm" fontWeight="500">تسجيل الخروج</Text>
        </HStack>
      </VStack>
    </Flex>
  )
}
