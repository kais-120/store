import { Axios } from "../API/Api";

// Auth

export const Auth = (username,password) => Axios.post("/auth/login",{username,password})


// Product
export const getProducts = (params) => Axios.get("/product", { params })
export const createProduct = (data) => Axios.post("/product",data)
export const updateProduct = (id,data) => Axios.put(`/product/${id}`,data)
export const deleteProduct = (id) => Axios.delete(`/product/${id}`)

// Category
export const getCategories = () => Axios.get("/category")
export const createCategory = (data) => Axios.post("/category",data)
export const updateCategory = (id,data) => Axios.put(`/category/${id}`,data)
export const deleteCategory = (id) => Axios.delete(`/category/${id}`)

// Customers
export const getCustomers = (params) => Axios.get("/customer",{params})
export const createCustomer = (data) => Axios.post("/customer",data)
export const updateCustomer = (id,data) => Axios.put(`/customer/${id}`,data)
export const deleteCustomer = (id) => Axios.delete(`/customer/${id}`)
export const payCustomerDebt = (data) => Axios.post(`/customer/debt`,data)


// Sales
export const getSales = () => Axios.get("/sale")
export const createSale = (data) => Axios.post("/sale",data)
export const updateSale = (id,data) => Axios.put(`/sale/${id}`,data)
export const deleteSale = (id) => Axios.delete(`/sale/${id}`)

// Supplier
export const getSuppliers = (params) => Axios.get("/supplier",{params})
export const createSupplier = (data) => Axios.post("/supplier",data)
export const updateSupplier = (id,data) => Axios.put(`/supplier/${id}`,data)
export const deleteSupplier = (id) => Axios.delete(`/supplier/${id}`)
export const paySupplierDebt = (data) => Axios.post(`/supplier/debt`, data)

// Purchase
export const getPurchases = (params) => Axios.get("/purchase",{params})
export const createPurchase = (data) => Axios.post("/purchase",data)
export const updatePurchase = (id,data) => Axios.put(`/purchase/${id}`,data)
export const deletePurchase = (id) => Axios.delete(`/purchase/${id}`)

// App-setting
export const getAppSetting = () => Axios.get("/app-setting")
export const updateAppSetting = (id,data) => Axios.put(`/app-setting/${id}`,data)
export const getProfile = () => Axios.get(`/auth/profile`)
export const updateProfile = (id,data) => Axios.put(`/auth/profile`)



// Dashboard
export const getStats = () => Axios.get("/dashboard/stats")
export const getActivity = (limit) => Axios.get("/dashboard/activity", { params: limit ? { limit } : {} })
export const getSalesTrend = () => Axios.get(`/dashboard/sales-trend`)
export const getCategoryBreakdown = () => Axios.get(`/dashboard/category-breakdown`)
export const getLastSale = () => Axios.get(`/dashboard/last-sale`)
export const getLowStockProducts = () => Axios.get(`/dashboard/low-stock-products`)
export const getTopProducts = () => Axios.get(`/dashboard/top`)


// Account
export const getRevenues = () => Axios.get("/account/revenues")

// Report
export const getReport = (type,period) => Axios.get(`/report/${type}?${period}`, {responseType: 'blob'})
export const getReportStatus = (period,startDate,endDate) => Axios.get(`/report/dash/status?period=${period}&startDate=${startDate}&endDate=${endDate}`)
export const getReportSalesTrend = (period,startDate,endDate) => Axios.get(`/report/dash/sales-trend?period=${period}&startDate=${startDate}&endDate=${endDate}`)
export const getReportInfo = (type,period,startDate,endDate) => Axios.get(`/report/dash/report/${type}?period=${period}&startDate=${startDate}&endDate=${endDate}`)

// Expense
export const getExpenses = (params) => Axios.get('/expense', { params })
export const createExpense = (data) => Axios.post("/expense",data)
export const updateExpense = (id,data) => Axios.put(`/expense/${id}`,data)
export const deleteExpense = (id) => Axios.delete(`/expense/${id}`)






