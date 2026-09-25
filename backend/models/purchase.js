const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Supplier = require("./Supplier");

const Purchase = sequelize.define(
  "purchases",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement:true
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
        "paid",
        "debt"
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