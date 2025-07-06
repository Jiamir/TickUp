// routes/tasks.js
const express = require("express");
const router = express.Router();
const {
  addTask,
  getTasksByUser,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
router.post("/add", addTask);
router.get("/user/:userId", getTasksByUser);
router.put("/update/:id", updateTask);
router.delete("/delete/:id", deleteTask);

module.exports = router;
