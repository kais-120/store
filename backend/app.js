const express = require("express")
const router = express.Router()

const AuthRouter = require("./router/AuthRouter")
const ProductRoutes = require("./router/ProductRoutes")
const CustomerRoute = require("./router/CustomerRoute")
const PurchaseRoute = require("./router/PurchaseRoute")
const SaleRoute = require("./router/SaleRoute")
const SupplierRoute = require("./router/SupplierRoute")
const AppSettingRoute = require("./router/AppSettingRoute")
const DashboardRoute = require("./router/DashboardRoute")
const AccountRoute = require("./router/AccountRoute")
const ReportRoutes = require("./router/ReportRoutes")
const ExpenseRoute = require("./router/ExpenseRoute")






router.use("/auth",AuthRouter)
router.use("/product",ProductRoutes)
router.use("/customer",CustomerRoute)
router.use("/purchase",PurchaseRoute)
router.use("/sale",SaleRoute)
router.use("/supplier",SupplierRoute)
router.use("/app-setting",AppSettingRoute)
router.use("/dashboard",DashboardRoute)
router.use("/account",AccountRoute)
router.use("/report",ReportRoutes)
router.use("/expense",ExpenseRoute)






module.exports = router;