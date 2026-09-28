const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");

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

    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references:{
        key:"id",
        model:Category
      }
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

    min_stock: {
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
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    }
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;