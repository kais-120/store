import React from 'react'
import { Box, VStack, HStack, Text, IconButton, Divider, Input, Flex } from '@chakra-ui/react'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { formatMoney, formatQty } from '../../utils/format'

export default function CartPanel({ cart, onInc, onDec, onRemove, discount, onDiscountChange }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const total = Math.max(0, subtotal - (discount || 0))

  return (
    <Flex direction="column" h="100%">
      <Box flex="1" overflowY="auto" px={1}>
        {cart.length === 0 ? (
          <VStack py={12} color="ink.muted" spacing={3}>
            <ShoppingBag size={32} />
            <Text fontWeight="600" fontSize="sm">السلة فارغة، اختر منتجًا لإضافته</Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={3}>
            {cart.map((item) => (
              <Box key={item.id} borderBottom="1px solid" borderColor="sand.200" pb={3}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" fontWeight="700" noOfLines={1}>{item.name}</Text>
                  <IconButton aria-label="حذف" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => onRemove(item.id)} />
                </HStack>
                <HStack justify="space-between">
                  <HStack spacing={1}>
                    <IconButton aria-label="نقص" icon={<Minus size={13} />} size="xs" onClick={() => onDec(item.id)} variant="outline" />
                    <Text fontSize="sm" fontWeight="700" minW="46px" textAlign="center">{formatQty(item.qty, item.step)} {item.unit}</Text>
                    <IconButton aria-label="زيادة" icon={<Plus size={13} />} size="xs" onClick={() => onInc(item.id)} variant="outline" />
                  </HStack>
                  <Text fontSize="sm" fontWeight="800" color="brand.600">{formatMoney(item.price * item.qty)}</Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <Divider my={3} />

      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontSize="sm" color="ink.muted">المجموع الفرعي</Text>
          <Text fontSize="sm" fontWeight="700">{formatMoney(subtotal)}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color="ink.muted">التخفيض</Text>
          <Input
            size="sm" w="110px" type="number" min={0} textAlign="end"
            value={discount || ''} placeholder="0.000"
            onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
          />
        </HStack>
        <HStack justify="space-between" pt={1}>
          <Text fontWeight="800">المجموع النهائي</Text>
          <Text fontWeight="900" fontSize="xl" color="brand.600">{formatMoney(total)}</Text>
        </HStack>
      </VStack>
    </Flex>
  )
}
