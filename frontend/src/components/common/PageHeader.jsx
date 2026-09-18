import React from 'react'
import { Flex, Box, Text, HStack } from '@chakra-ui/react'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={5}>
      <Box>
        <Text fontSize="xl" fontWeight="800">{title}</Text>
        {subtitle && <Text fontSize="sm" color="ink.muted">{subtitle}</Text>}
      </Box>
      {actions && <HStack spacing={2}>{actions}</HStack>}
    </Flex>
  )
}
