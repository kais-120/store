const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Supplier = sequelize.define(
  "suppliers",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },

    phone: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
  }
);

module.exports = Supplier;