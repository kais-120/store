const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AppSetting = sequelize.define(
  "app_settings",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "مغازة البركة",
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "د.ت",
    },

    low_stock_alert: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 5,
    },

    invoice_prefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "F-",
    },
  },
  {
    tableName: "app_settings",
    timestamps: true,
  }
);

module.exports = AppSetting;