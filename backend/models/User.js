const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("user",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    full_name:{
         type:DataTypes.STRING,
    },
    email:{
         type:DataTypes.STRING,
    },
    password:{
         type:DataTypes.STRING,
    },
    status:{
         type:DataTypes.ENUM("active","delete"),

    }
})
module.exports = User