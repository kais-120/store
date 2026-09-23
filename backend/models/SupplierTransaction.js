const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Supplier = require("./Supplier");

const SupplierTransaction = sequelize.define(
  "supplier_transactions",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    supplier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Supplier,
        key: "id",
      },
    },

    type: {
      type: DataTypes.ENUM(
        "purchase",
        "payment"
      ),
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "supplier_transactions",
    timestamps: true,
  }
);


module.exports = SupplierTransaction;