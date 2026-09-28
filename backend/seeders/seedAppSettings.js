// seeders/appSettingSeeder.js
require("dotenv").config()
const sequelize = require("../config/db");
const AppSetting = require("../models/AppSetting");

const defaultSettings = {
  shop_name: "سوبرات محمد علي",
  currency: "د.ت",
  low_stock_alert: 5,
  invoice_prefix: "F-",
};

const seedAppSettings = async () => {
  try {
    await sequelize.authenticate();
    await AppSetting.sync();

    const count = await AppSetting.count();

    if (count > 0) {
      console.log("ℹ️  app_settings already seeded, skipping.");
      return;
    }

    await AppSetting.create(defaultSettings);
    console.log("✅ app_settings seeded successfully.");
  } catch (error) {
    console.error("❌ Failed to seed app_settings:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedAppSettings();