const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define("category",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    name:{
         type:DataTypes.STRING,
    },
    status:{
         type:DataTypes.ENUM("active","delete"),
         defaultValue:"active"


    }
})
module.exports = Category