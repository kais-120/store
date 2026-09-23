const Customer = require("./Customer");
const CustomerPayment = require("./CustomerPayments");
const Product = require("./Product");
const PurchaseItem = require("./PurchaseItem");
const Purchase = require("./purchase");
const Sale = require("./Sale");
const Supplier = require("./Supplier");
const SupplierTransaction = require("./SupplierTransaction");

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



module.exports = {SupplierTransaction,Supplier,Customer,CustomerPayment,Sale,Purchase,PurchaseItem,Product};
