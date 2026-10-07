const Customer = require("./Customer");
const CustomerPayment = require("./CustomerPayments");
const Product = require("./Product");
const PurchaseItem = require("./PurchaseItem");
const Purchase = require("./purchase");
const Sale = require("./Sale");
const Supplier = require("./Supplier");
const SupplierTransaction = require("./SupplierTransaction");
const SaleItem = require("./SaleItem");
const Category = require("./Category");

Supplier.hasMany(SupplierTransaction, {
  foreignKey: "supplier_id",
  as: "transactions",
});

SupplierTransaction.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "suppliers",
});

Customer.hasMany(CustomerPayment, {
  foreignKey: "customer_id",
  as: "payments",
});

CustomerPayment.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

Customer.hasMany(Sale, {
  foreignKey: "customer_id",
  as: "sales",
});

Sale.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

Supplier.hasMany(Purchase, {
  foreignKey: "supplier_id",
  as: "purchases",
});

Purchase.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

Purchase.hasMany(PurchaseItem, {
  foreignKey: "purchase_id",
  as: "items",
});

PurchaseItem.belongsTo(Purchase, {
  foreignKey: "purchase_id",
  as: "purchase",
});

Product.hasMany(PurchaseItem, {
  foreignKey: "product_id",
  as: "purchaseItems",
});

PurchaseItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "productCategory",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Sale.hasMany(SaleItem, {
  foreignKey: "sale_id",
  as: "saleItem",
});

SaleItem.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

Product.hasMany(SaleItem, {
  foreignKey: "product_id",
  as: "saleItems",
});

SaleItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "products",
});



module.exports = {SupplierTransaction,Supplier,Customer,CustomerPayment,Sale,Purchase,PurchaseItem,Product,SaleItem,Category};
