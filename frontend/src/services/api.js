import { Axios } from "../API/Api";

// Auth

export const Login = (data) => Axios.post("/auth/login",data)


// Product
export const getProducts = () => Axios.get("/product")
export const createProduct = (data) => Axios.post("/product",data)
export const updateProduct = (id,data) => Axios.put(`/product/${id}`,data)
export const deleteProduct = (id) => Axios.delete(`/product/${id}`)

// Customers
export const getCustomers = () => Axios.get("/Customer")
export const createCustomer = (data) => Axios.post("/Customer",data)
export const updateCustomer = (id,data) => Axios.put(`/Customer/${id}`,data)
export const deleteCustomer = (id) => Axios.delete(`/Customer/${id}`)

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

// App-setting
export const getAppSetting = () => Axios.get("/app-setting")
export const updateAppSetting = (id,data) => Axios.put(`/app-setting/${id}`,data)
