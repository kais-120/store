import React, { useEffect, useState } from 'react'
import { Flex, HStack, Text, Avatar, IconButton, Box, Menu, MenuButton, MenuList, MenuItem, useBreakpointValue } from '@chakra-ui/react'
import { Menu as MenuIcon, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../../services/api' // adjust path

const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

const roleLabels = {
  admin: 'مدير',
}

export default function Header({ title, onOpenSidebar }) {
  const { logout } = useApp()
  const navigate = useNavigate()
  const showMenuBtn = useBreakpointValue({ base: true, lg: false })
  const today = new Date()
  const dateLabel = `${dayNames[today.getDay()]}، ${today.toLocaleDateString('ar-TN')}`

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile()
        setProfile(res.data?.user ?? res.data)
      } catch (err) {
        console.error('getProfile error:', err)
      }
    }

    load()

    // refresh when Settings saves the profile
    const onUpdated = (e) => {
      if (e.detail) setProfile((prev) => ({ ...prev, ...e.detail }))
      else load()
    }
    window.addEventListener('profile-updated', onUpdated)
    return () => window.removeEventListener('profile-updated', onUpdated)
  }, [])

  const displayName = profile?.full_name || ''
  const displayRole = roleLabels[profile?.role] || profile?.role || ''

  return (
    <Flex
      as="header" align="center" justify="space-between"
      bg="white" borderBottom="1px solid" borderColor="sand.300"
      px={{ base: 4, md: 6 }} py={3} position="sticky" top={0} zIndex={10}
    >
      <HStack spacing={3}>
        {showMenuBtn && (
          <IconButton aria-label="القائمة" icon={<MenuIcon size={20} />} variant="ghost" onClick={onOpenSidebar} />
        )}
        <Box>
          <Text fontWeight="800" fontSize="lg">{title}</Text>
          <Text fontSize="xs" color="ink.muted">{dateLabel}</Text>
        </Box>
      </HStack>

      <Menu>
        <MenuButton>
          <HStack spacing={2} cursor="pointer">
            <Avatar size="sm" name={displayName} bg="brand.500" color="white" />
            <Box display={{ base: 'none', md: 'block' }} textAlign="start">
              <Text fontSize="sm" fontWeight="700">{displayName}</Text>
              <Text fontSize="xs" color="ink.muted">{displayRole}</Text>
            </Box>
            <ChevronDown size={16} />
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem icon={<Settings size={16} />} onClick={() => navigate('/settings')}>الإعدادات</MenuItem>
          <MenuItem icon={<LogOut size={16} />} onClick={() => { logout(); navigate('/login') }}>تسجيل الخروج</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}