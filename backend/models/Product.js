const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement:true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    purchase_price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field: "purchase_price",
    },

    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stock: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },

    minStock: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
      field: "min_stock",
    },

    step: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;