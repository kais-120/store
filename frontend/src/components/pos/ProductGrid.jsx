import React from 'react'
import { SimpleGrid, Box, Text, VStack, Badge } from '@chakra-ui/react'
import { formatMoney } from '../../utils/format'
import { stockStatus } from '../../data/products'

export default function ProductGrid({ products, onAdd }) {
  if (products.length === 0) {
    return <Text color="ink.muted" textAlign="center" py={10}>لا توجد منتجات مطابقة للبحث</Text>
  }

  return (
    <SimpleGrid columns={{ base: 2, sm: 3, xl: 4 }} spacing={3}>
      {products.map((p) => {
        const status = stockStatus(p)
        const disabled = status.key === 'out'
        return (
          <Box
            key={p.id}
            as="button"
            onClick={() => !disabled && onAdd(p)}
            textAlign="start"
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="sand.300"
            p={3}
            opacity={disabled ? 0.5 : 1}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            _hover={!disabled ? { borderColor: 'brand.400', boxShadow: '0 4px 14px rgba(27,94,107,0.12)' } : {}}
            transition="all 0.12s"
          >
            <VStack align="stretch" spacing={1.5}>
              <Text fontSize="sm" fontWeight="700" noOfLines={2} minH="40px">{p.name}</Text>
              <Text fontSize="md" fontWeight="800" color="brand.600">{formatMoney(p.price)}</Text>
              <Badge alignSelf="flex-start" bg={`${status.color}.500`} color="white" fontSize="10px">
                {disabled ? status.label : `${p.stock} ${p.unit}`}
              </Badge>
            </VStack>
          </Box>
        )
      })}
    </SimpleGrid>
  )
}
