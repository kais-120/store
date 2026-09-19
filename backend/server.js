const express = require("express")
require("dotenv").config()
const cors = require("cors");
const sequelize = require("./config/db");
const app = express();
const appStart = require("./app");
require("./models/index")

const port = process.env.PORT || 5000;

sequelize.authenticate()
 sequelize.sync({ alter: true });

app.use(express.json());
app.use(cors());

app.use("/api/v1", appStart);


app.listen(port, async () => {

  console.log(`Server started on port ${port}`);
});