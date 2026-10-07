import React from 'react'
import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

const LoadingPage = () => {
  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" />
        <Text fontSize="md" color="gray.600">
          جاري التحميل...
        </Text>
      </VStack>
    </Center>
  )
}

export default LoadingPage