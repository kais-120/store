const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ActivityLog = sequelize.define(
  "activity_logs",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    action: {
      type: DataTypes.ENUM(
        "create",
        "update",
        "delete",
        "sale",
        "payment",
        "purchase"
      ),
      allowNull: false,
    },

    entity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entity_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    entity_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ActivityLog;