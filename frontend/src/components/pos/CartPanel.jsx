import React, { useState } from 'react'
import {
  Box, VStack, HStack, Text, IconButton, Divider, Input, Flex, InputGroup, InputRightAddon
} from '@chakra-ui/react'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { formatMoney, formatQty, isWeighedUnit, lineTotal, priceDivisor, smallUnit } from '../../utils/format'

// Editor for items sold by kg:
//  - +/- buttons move by 100 g / 100 ml
//  - type grams (or ml) directly (e.g. 500)
//  - type an amount in money (e.g. 2 DT) and the weight is calculated
function WeighedQty({ item, onInc, onDec, onSetQty }) {
  const [focus, setFocus] = useState(null) // 'g' | 'money' | null
  const [draft, setDraft] = useState('')

  const { label, factor } = smallUnit(item.unit)
  const grams = Math.round(item.qty * factor)
  const money = lineTotal(item).toFixed(3)

  const handleGrams = (e) => {
    setDraft(e.target.value)
    const g = Math.max(0, Number(e.target.value) || 0)
    onSetQty(item.id, g / factor)
  }

  const handleMoney = (e) => {
    setDraft(e.target.value)
    const m = Math.max(0, Number(e.target.value) || 0)
    // money -> weight (rounded to 1 g / 1 ml); the typed amount is kept as the exact line total
    const qty = (m / item.price) * priceDivisor(item.unit)
    onSetQty(item.id, Math.round(qty * factor) / factor, m > 0 ? m : undefined)
  }

  const start = (field, value) => () => { setFocus(field); setDraft(String(value)) }

  return (
    <VStack align="stretch" spacing={2}>
      <HStack spacing={1}>
        <IconButton aria-label="نقص" icon={<Minus size={13} />} size="xs" variant="outline" onClick={() => onDec(item.id)} />
        <InputGroup size="sm">
          <Input
            type="number" min={0} textAlign="center"
            value={focus === 'g' ? draft : grams}
            onFocus={start('g', grams)} onBlur={() => setFocus(null)}
            onChange={handleGrams}
          />
          <InputRightAddon>{label}</InputRightAddon>
        </InputGroup>
        <IconButton aria-label="زيادة" icon={<Plus size={13} />} size="xs" variant="outline" onClick={() => onInc(item.id)} />
      </HStack>
      <InputGroup size="sm">
        <Input
          type="number" min={0} textAlign="center" placeholder="بالمبلغ"
          value={focus === 'money' ? draft : money}
          onFocus={start('money', money)} onBlur={() => setFocus(null)}
          onChange={handleMoney}
        />
        <InputRightAddon>د.ت</InputRightAddon>
      </InputGroup>
    </VStack>
  )
}

export default function CartPanel({ cart, onInc, onDec, onRemove, onSetQty, discount, onDiscountChange }) {
  const subtotal = cart.reduce((s, i) => s + lineTotal(i), 0)
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
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="700" noOfLines={1}>{item.name}</Text>
                  <IconButton aria-label="حذف" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => onRemove(item.id)} />
                </HStack>
                <HStack justify="space-between" align="flex-end">
                  {isWeighedUnit(item.unit) ? (
                    <Box flex="1" maxW="190px">
                      <WeighedQty item={item} onInc={onInc} onDec={onDec} onSetQty={onSetQty} />
                    </Box>
                  ) : (
                    <HStack spacing={1}>
                      <IconButton aria-label="نقص" icon={<Minus size={13} />} size="xs" onClick={() => onDec(item.id)} variant="outline" />
                      <Text fontSize="sm" fontWeight="700" minW="46px" textAlign="center">{formatQty(item.qty, item.step)} {item.unit}</Text>
                      <IconButton aria-label="زيادة" icon={<Plus size={13} />} size="xs" onClick={() => onInc(item.id)} variant="outline" />
                    </HStack>
                  )}
                  <Text fontSize="sm" fontWeight="800" color="brand.600">{formatMoney(lineTotal(item))}</Text>
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
