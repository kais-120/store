import { Axios } from "../API/Api";

// Auth

export const Login = (data) => Axios.post("/auth/login",data)


// Product
export const getProducts = () => Axios.get("/product")
export const createProduct = (data) => Axios.post("/product",data)
export const updateProduct = (id,data) => Axios.put(`/product/${id}`,data)
export const deleteProduct = (id) => Axios.delete(`/product/${id}`)

// Customers
export const getCustomers = () => Axios.get("/customer")
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
export const getSuppliers = () => Axios.get("/supplier")
export const createSupplier = (data) => Axios.post("/supplier",data)
export const updateSupplier = (id,data) => Axios.put(`/supplier/${id}`,data)
export const deleteSupplier = (id) => Axios.delete(`/supplier/${id}`)
export const paySupplierDebt = (data) => Axios.post(`/supplier/debt`, data)

// Purchase
export const getPurchases = () => Axios.get("/purchase")
export const createPurchase = (data) => Axios.post("/purchase",data)
export const updatePurchase = (id,data) => Axios.put(`/purchase/${id}`,data)
export const deletePurchase = (id) => Axios.delete(`/purchase/${id}`)

// App-setting
export const getAppSetting = () => Axios.get("/app-setting")
export const updateAppSetting = (id,data) => Axios.put(`/app-setting/${id}`,data)

// Dashboard
export const getStats = () => Axios.get("/dashboard/stats")
export const getActivity = (limit) => Axios.get("/dashboard/activity", { params: limit ? { limit } : {} })
export const getSalesTrend = () => Axios.get(`/dashboard/sales-trend`)
export const getCategoryBreakdown = () => Axios.get(`/dashboard/category-breakdown`)
export const getLastSale = () => Axios.get(`/dashboard/last-sale`)
export const getLowStockProducts = () => Axios.get(`/dashboard/low-stock-products`)

// Account
export const getRevenues = () => Axios.get("/account/revenues")

// Report
export const getReport = (type,period) => Axios.get(`/report/${type}?${period}`, {responseType: 'blob'})
export const getReportStatus = (period,startDate,endDate) => Axios.get(`/report/dash/status?period=${period}&startDate=${startDate}&endDate=${endDate}`)
export const getReportSalesTrend = (period,startDate,endDate) => Axios.get(`/report/dash/sales-trend?period=${period}&startDate=${startDate}&endDate=${endDate}`)
export const getReportInfo = (type,period,startDate,endDate) => Axios.get(`/report/dash/report/${type}?period=${period}&startDate=${startDate}&endDate=${endDate}`)

// Supplier
export const getExpense = () => Axios.get("/expense")
export const createExpense = (data) => Axios.post("/expense",data)
// export const updateSupplier = (id,data) => Axios.put(`/supplier/${id}`,data)
// export const deleteSupplier = (id) => Axios.delete(`/supplier/${id}`)
// export const paySupplierDebt = (data) => Axios.post(`/supplier/debt`, data)





