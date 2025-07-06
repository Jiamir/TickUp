const pool = require("../db");

// Add a task
const addTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, userId } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, dueDate, priority, status, userId]
    );

    res.status(201).json({ message: "Task added", task: result.rows[0] });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get tasks by user
const getTasksByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC`,
      [userId]
    );
    res.status(200).json({ tasks: result.rows });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    category,
    isCompleted,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1,
           description = $2,
           due_date = $3,
           priority = $4,
           status = $5,
           category = $6,
           is_completed = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, description, dueDate, priority, status, category, isCompleted, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task updated", task: result.rows[0] });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Export both functions
module.exports = { addTask, getTasksByUser, updateTask, deleteTask };
