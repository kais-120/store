const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Customer = require("./Customer");

const CustomerPayment = sequelize.define(
  "customer_payments",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
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
    tableName: "customer_payments",
    timestamps: true,
  }
);



module.exports = CustomerPayment;