import React, { useState, useMemo } from 'react'
import {
  Grid, GridItem, Box, InputGroup, InputLeftElement, Input, HStack, Button, Card, CardBody,
  useToast, useDisclosure, Text
} from '@chakra-ui/react'
import { Search, Printer, XCircle, PauseCircle } from 'lucide-react'
import ProductGrid from '../components/pos/ProductGrid'
import CartPanel from '../components/pos/CartPanel'
import PaymentModal from '../components/pos/PaymentModal'
import { useApp } from '../context/AppContext'
import { categories } from '../data/products'
import { formatMoney, lineTotal, startQty } from '../utils/format'

export default function Sales() {
  const { products, customers, completeSale } = useApp()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [heldCart, setHeldCart] = useState(null)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'all' || p.category === category
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [products, category, query])

  // never let the cart quantity go above the stock, and keep 3 decimals (1 g precision)
  const clampQty = (id, qty) => {
    const product = products.find((p) => p.id === id)
    const max = product ? product.stock : Infinity
    return Math.min(Math.max(0, +Number(qty).toFixed(3)), max)
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (
          i.id === product.id
            ? { ...i, qty: clampQty(i.id, i.qty + (product.step || 1)), fixedTotal: undefined }
            : i
        ))
      }
      // start: 1 kg / 1 L / 1 piece, or 100 g for gram products; +/- move by the product step
      return [...prev, { ...product, qty: Math.min(startQty(product.unit), product.stock) }]
    })
  }

  const inc = (id) => {
    const product = products.find((p) => p.id === id)
    setCart((prev) => prev.map((i) => (
      i.id === id ? { ...i, qty: clampQty(id, i.qty + (product?.step || 1)), fixedTotal: undefined } : i
    )))
  }

  const dec = (id) => {
    const product = products.find((p) => p.id === id)
    setCart((prev) => prev
      .map((i) => (i.id === id ? { ...i, qty: +(i.qty - (product?.step || 1)).toFixed(3), fixedTotal: undefined } : i))
      .filter((i) => i.qty > 0))
  }

  // set an exact quantity (typed grams or typed money). fixedTotal = the exact amount typed by the cashier
  const setQty = (id, qty, fixedTotal) => {
    setCart((prev) => prev.map((i) => {
      if (i.id !== id) return i
      const q = clampQty(id, qty)
      return { ...i, qty: q, fixedTotal: q === +Number(qty).toFixed(3) ? fixedTotal : undefined }
    }))
  }

  const remove = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  // lines with 0 quantity (while the cashier is typing) are ignored
  const validCart = cart.filter((i) => i.qty > 0)
  const total = Math.max(0, validCart.reduce((s, i) => s + lineTotal(i), 0) - discount)

  const cancelSale = () => {
    setCart([])
    setDiscount(0)
  }

  const holdSale = () => {
    if (cart.length === 0) return
    setHeldCart(cart)
    setCart([])
    setDiscount(0)
    toast({ title: 'تم تعليق البيع', status: 'info', duration: 2000 })
  }

  const resumeHeld = () => {
    if (!heldCart) return
    setCart(heldCart)
    setHeldCart(null)
  }

  const handleConfirmPayment = ({ method, customerId, paidAmount }) => {
    const result = completeSale({ cart: validCart, customerId, method, paidAmount, discount })
    onClose()
    setCart([])
    setDiscount(0)
    toast({
      title: 'تمت عملية البيع بنجاح',
      description: `${result.invoiceId} — ${formatMoney(result.total)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap={5} h={{ xl: 'calc(100vh - 130px)' }}>
      <GridItem overflow="hidden" display="flex" flexDirection="column">
        <VStackFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
        <Box flex="1" overflowY="auto" mt={4} pe={1}>
          <ProductGrid products={filteredProducts} onAdd={addToCart} />
        </Box>
      </GridItem>

      <GridItem>
        <Card h="100%">
          <CardBody display="flex" flexDirection="column">
            <CartPanel
              cart={cart} onInc={inc} onDec={dec} onRemove={remove} onSetQty={setQty}
              discount={discount} onDiscountChange={setDiscount}
            />
            <HStack mt={4} spacing={2}>
              <Button flex="1" size="lg" isDisabled={validCart.length === 0} onClick={onOpen}>
                إتمام البيع
              </Button>
            </HStack>
            <HStack mt={2} spacing={2}>
              <Button flex="1" size="sm" variant="outline" leftIcon={<PauseCircle size={15} />} onClick={holdSale} isDisabled={cart.length === 0}>
                تعليق البيع
              </Button>
              <Button flex="1" size="sm" variant="outline" colorScheme="red" leftIcon={<XCircle size={15} />} onClick={cancelSale} isDisabled={cart.length === 0}>
                إلغاء البيع
              </Button>
              <Button flex="1" size="sm" variant="outline" leftIcon={<Printer size={15} />} onClick={() => window.print()} isDisabled={cart.length === 0}>
                طباعة
              </Button>
            </HStack>
            {heldCart && (
              <Button mt={2} size="sm" variant="ghost" onClick={resumeHeld}>
                استرجاع البيع المعلق ({heldCart.length} منتج)
              </Button>
            )}
          </CardBody>
        </Card>
      </GridItem>

      <PaymentModal isOpen={isOpen} onClose={onClose} total={total} customers={customers} onConfirm={handleConfirmPayment} />
    </Grid>
  )
}

function VStackFilters({ query, setQuery, category, setCategory }) {
  return (
    <Box>
      <InputGroup mb={3}>
        <InputLeftElement pointerEvents="none"><Search size={16} color="#6B6660" /></InputLeftElement>
        <Input placeholder="ابحث عن منتج..." value={query} onChange={(e) => setQuery(e.target.value)} bg="white" />
      </InputGroup>
      <HStack spacing={2} overflowX="auto" pb={1}>
        {categories.map((c) => (
          <Button
            key={c.id} size="sm" flexShrink={0}
            variant={category === c.id ? 'solid' : 'outline'}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </Button>
        ))}
      </HStack>
    </Box>
  )
}
