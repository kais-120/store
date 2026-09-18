import React, { useState } from 'react'
import {
  Box, Flex, VStack, Heading, Text, FormControl, FormLabel, Input, InputGroup,
  InputRightElement, IconButton, Button, Alert, AlertIcon, Icon
} from '@chakra-ui/react'
import { Eye, EyeOff, Store } from 'lucide-react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/dashboard'} replace />
  }

  const validate = () => {
    const next = {}
    if (!username.trim()) next.username = 'اسم المستخدم مطلوب'
    if (!password.trim()) next.password = 'كلمة المرور مطلوبة'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const ok = login(username.trim(), password)
      setLoading(false)
      if (ok) {
        navigate(location.state?.from || '/dashboard', { replace: true })
      } else {
        setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    }, 600)
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.700" px={4}
      bgGradient="linear(to-br, brand.700, brand.900)">
      <Box bg="white" borderRadius="2xl" boxShadow="0 20px 60px rgba(7,29,34,0.35)" w="full" maxW="420px" p={{ base: 6, md: 9 }}>
        <VStack spacing={1} mb={7}>
          <Flex w="60px" h="60px" borderRadius="xl" bg="gold.500" align="center" justify="center" mb={2}>
            <Icon as={Store} boxSize={7} color="white" />
          </Flex>
          <Heading size="lg" fontWeight="800">مغازة البركة</Heading>
          <Text color="ink.muted" fontSize="sm">نظام إدارة المحل</Text>
        </VStack>

        {authError && (
          <Alert status="error" borderRadius="lg" mb={4} fontSize="sm">
            <AlertIcon />
            {authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.username}>
              <FormLabel fontSize="sm" fontWeight="700">اسم المستخدم</FormLabel>
              <Input
                placeholder="admin"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: '' })) }}
                size="lg" borderRadius="lg"
              />
              {errors.username && <Text color="brick.500" fontSize="xs" mt={1}>{errors.username}</Text>}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontSize="sm" fontWeight="700">كلمة المرور</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  borderRadius="lg"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="إظهار كلمة المرور" variant="ghost" size="sm"
                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    onClick={() => setShowPassword((s) => !s)}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && <Text color="brick.500" fontSize="xs" mt={1}>{errors.password}</Text>}
            </FormControl>

            <Button type="submit" size="lg" isLoading={loading} loadingText="جارٍ الدخول..." mt={2}>
              تسجيل الدخول
            </Button>
          </VStack>
        </form>

        <Text fontSize="xs" color="ink.muted" textAlign="center" mt={6}>
          admin / 123456 — بيانات دخول تجريبية
        </Text>
      </Box>
    </Flex>
  )
}
