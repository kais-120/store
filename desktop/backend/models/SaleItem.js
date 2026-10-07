const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Sale = require("./Sale");
const Product = require("./Product");

const SaleItem = sequelize.define(
  "sale_items",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    sale_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Sale,
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    purchase_price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
  },
  {
    tableName: "sale_items",
    timestamps: true,
  }
);

module.exports = SaleItem;