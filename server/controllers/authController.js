const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [full_name, email, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user: newUser.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getUserById = async (req, res) =>{
  try {
    const userId = req.params.id;
    const result = await pool.query("SELECT  id, full_name, email FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
