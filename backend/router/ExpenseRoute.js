const express = require("express");

const router = express.Router();

const ExpenseController = require("../controller/ExpenseController");



router.get("/", ExpenseController.getExpenses);

router.get(
  "/:id",
  ExpenseController.getExpenseById
);

router.post(
  "/",
  ExpenseController.createExpense
);

router.put(
  "/:id",
  ExpenseController.updateExpense
);

router.delete(
  "/:id",
  ExpenseController.deleteExpense
);

module.exports = router;