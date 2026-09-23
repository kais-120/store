const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");
const Purchase = require("./purchase");

const PurchaseItem = sequelize.define(
  "purchase_items",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    purchase_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Purchase,
        key: "id",
      },
    },

    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },

    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    purchase_price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    total: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
  },
  {
    tableName: "purchase_items",
    timestamps: true,
  }
);



module.exports = PurchaseItem;