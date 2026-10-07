const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
    username:process.env.USERNAMEDB,
    password:process.env.PASSWORDDB,
    port:process.env.PORTDB,
    database:process.env.DATABASE,
    host:process.env.HOSTDB,
    dialect:"postgres",
    logging:false
    }
);
module.exports = sequelize;