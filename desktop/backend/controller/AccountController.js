const { where } = require("sequelize");
const { Sale, CustomerPayment } = require("../models");

exports.getRevenues = async (req,res) => {
    try{
        const cashbox = await Sale.sum("total_amount",{where: {payment_method:"cash"}});
        const payedDebt = await CustomerPayment.sum("amount");
        return res.json({cashbox,payedDebt})

    }catch(error){
        console.error("Error fetching low stock products:", error);
        return res.status(500).json({
        success: false,
        message: "error server",
        });
    }
}