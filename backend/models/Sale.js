const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Customer = require("./Customer");

const Sale = sequelize.define(
  "sales",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement:true
    },

    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: Customer,
        key: "id",
      },
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.ENUM(
        "cash",
        "debt"
      ),
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  }
);



module.exports = Sale;