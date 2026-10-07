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
    username:{
         type:DataTypes.STRING,
    },
    password:{
         type:DataTypes.STRING,
    },
    role:{
     type:DataTypes.STRING
    },
    status:{
         type:DataTypes.ENUM("active","delete"),
         defaultValue:"active"

    }
})
module.exports = User