import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { initialProducts, stockStatus } from '../data/products'
import { initialCustomers, walkInCustomer } from '../data/customers'
import { initialSuppliers, initialPurchases } from '../data/suppliers'
import { initialSales } from '../data/sales'
import { dashboardStats, initialActivity } from '../data/dashboard'
import { todayISO, nowTime } from '../utils/format'

const AppContext = createContext(null)

const AUTH_KEY = 'baraka_auth'
const DUMMY_USER = { username: 'admin', password: '123456', name: 'المدير العام' }

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')

  const [products, setProducts] = useState(initialProducts)
  const [customers, setCustomers] = useState(initialCustomers)
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [purchases, setPurchases] = useState(initialPurchases)
  const [sales, setSales] = useState(initialSales)
  const [activity, setActivity] = useState(initialActivity)

  const [cashbox, setCashbox] = useState(dashboardStats.cashboxBalance)
  const [incomes, setIncomes] = useState([
    { id: 'in1', label: 'مبيعات نقدية', amount: 850.0, date: '2026-09-17' },
    { id: 'in2', label: 'تسديد دين حريف', amount: 200.0, date: '2026-09-16' },
  ])
  const [expenses, setExpenses] = useState([
    { id: 'ex1', label: 'فاتورة كهرباء', amount: 145.0, date: '2026-09-12' },
    { id: 'ex2', label: 'صيانة ثلاجة', amount: 80.0, date: '2026-09-08' },
  ])

  const login = useCallback((username, password) => {
    if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
      localStorage.setItem(AUTH_KEY, 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }, [])

  const pushActivity = useCallback((text) => {
    setActivity((prev) => [{ id: `a${Date.now()}`, text, time: 'الآن' }, ...prev].slice(0, 12))
  }, [])

  const addProduct = useCallback((product) => {
    setProducts((prev) => [{ ...product, id: `p${Date.now()}` }, ...prev])
    pushActivity(`تمت إضافة منتج جديد: ${product.name}`)
  }, [pushActivity])

  const updateProduct = useCallback((id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addCustomer = useCallback((customer) => {
    setCustomers((prev) => [{ ...customer, id: `c${Date.now()}`, totalPurchases: 0, debt: 0, lastPurchase: '-' }, ...prev])
  }, [])

  const updateCustomer = useCallback((id, patch) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const registerCustomerPayment = useCallback((id, amount) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, debt: Math.max(0, c.debt - amount) } : c)))
    setCashbox((prev) => prev + amount)
    setIncomes((prev) => [{ id: `in${Date.now()}`, label: 'تسديد دين حريف', amount, date: todayISO() }, ...prev])
    pushActivity(`تم تسجيل دفعة من حريف بقيمة ${amount.toFixed(3)} د.ت`)
  }, [pushActivity])

  const addSupplier = useCallback((supplier) => {
    setSuppliers((prev) => [{ ...supplier, id: `s${Date.now()}`, debt: supplier.debt || 0 }, ...prev])
  }, [])

  const addPurchase = useCallback((purchase) => {
    const id = `pu${1000 + purchases.length + 1}`
    setPurchases((prev) => [{ ...purchase, id, date: todayISO() }, ...prev])
    setSuppliers((prev) => prev.map((s) => (s.id === purchase.supplierId ? { ...s, debt: s.debt + (purchase.status !== 'مدفوعة' ? purchase.amount : 0) } : s)))
    if (purchase.status === 'مدفوعة') {
      setCashbox((prev) => prev - purchase.amount)
      setExpenses((prev) => [{ id: `ex${Date.now()}`, label: `شراء من ${purchase.supplierName}`, amount: purchase.amount, date: todayISO() }, ...prev])
    }
    pushActivity(`تمت إضافة عملية شراء من ${purchase.supplierName}`)
  }, [purchases.length, pushActivity])

  const completeSale = useCallback(({ cart, customerId, method, paidAmount, discount }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const total = Math.max(0, subtotal - (discount || 0))
    const invoiceId = `F-${1049 + sales.length}`
    const customer = customerId && customerId !== 'walkin' ? customers.find((c) => c.id === customerId) : walkInCustomer

    setProducts((prev) => prev.map((p) => {
      const line = cart.find((c) => c.id === p.id)
      return line ? { ...p, stock: Math.max(0, +(p.stock - line.qty).toFixed(3)) } : p
    }))

    setSales((prev) => [{ id: invoiceId, customer: customer?.name || 'حريف عابر', amount: total, method, time: nowTime() }, ...prev])

    if (method === 'نقدًا' || method === 'بطاقة') {
      setCashbox((prev) => prev + total)
      setIncomes((prev) => [{ id: `in${Date.now()}`, label: `مبيعات - ${invoiceId}`, amount: total, date: todayISO() }, ...prev])
    } else if (method === 'بالدين' && customerId && customerId !== 'walkin') {
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, debt: c.debt + total, totalPurchases: c.totalPurchases + total, lastPurchase: todayISO() } : c)))
    }

    if (customerId && customerId !== 'walkin' && method !== 'بالدين') {
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, totalPurchases: c.totalPurchases + total, lastPurchase: todayISO() } : c)))
    }

    pushActivity(`تمت عملية بيع بقيمة ${total.toFixed(3)} د.ت`)
    return { invoiceId, total, change: method === 'نقدًا' ? Math.max(0, (paidAmount || 0) - total) : 0 }
  }, [customers, sales.length, pushActivity])

  const stats = useMemo(() => {
    const lowStockCount = products.filter((p) => stockStatus(p).key !== 'ok').length
    const customerDebt = customers.reduce((s, c) => s + c.debt, 0)
    const supplierDebt = suppliers.reduce((s, c) => s + c.debt, 0)
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
    return {
      todaySales: sales.reduce((s, sale) => s + sale.amount, 0),
      invoiceCount: sales.length,
      todayProfit: dashboardStats.todayProfit,
      cashboxBalance: cashbox,
      customerDebt,
      supplierDebt,
      lowStockCount,
      totalIncome,
      totalExpense,
    }
  }, [products, customers, suppliers, incomes, expenses, sales, cashbox])

  const value = {
    isAuthenticated, login, logout, currentUser: DUMMY_USER,
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer, updateCustomer, deleteCustomer, registerCustomerPayment,
    suppliers, addSupplier,
    purchases, addPurchase,
    sales, completeSale,
    activity, pushActivity,
    cashbox, incomes, expenses,
    stats,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
