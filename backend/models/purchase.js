const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Supplier = require("./Supplier");

const Purchase = sequelize.define(
  "purchases",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    supplier_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Supplier,
        key: "id",
      },
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "partially_paid",
        "paid"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "purchases",
    timestamps: true,
  }
);



module.exports = Purchase;