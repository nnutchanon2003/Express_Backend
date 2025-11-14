const express = require("express");
const passport = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const mongoDbInstant = require("../db/mongoDb");
const { ObjectId } = require("mongodb");
const { validateUser } = require("../validators/userValidator");
const { validationResult } = require("express-validator");

const router = express.Router();
const client = mongoDbInstant.getMongoClient();
const collectionName = "users";

// Middleware ตรวจสอบ JWT เฉพาะ Route ที่ต้องการ
const checkAuth = passport.authenticate("jwt-verify", { session: false });

// GET: ดึงข้อมูลผู้ใช้ทั้งหมด (ต้องใช้ Token และต้องเป็น admin)
router.get("/", checkAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied for non-admin users" });
  }

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const users = await db.collection(collectionName).find().toArray();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error: error.message });
  } finally {
    await client.close();
  }
});

// POST: เพิ่มผู้ใช้ใหม่ (ไม่ต้องใช้ Token)
router.post("/", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, full_name, role } = req.body;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const existingUser = await db.collection(collectionName).findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    await db.collection(collectionName).insertOne({
      username,
      password_hash: passwordHash,
      full_name,
      role,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error: error.message });
  } finally {
    await client.close();
  }
});

// PUT: แก้ไขข้อมูลผู้ใช้ด้วย user id (ต้องใช้ Token และต้องเป็น admin)
router.put("/:id", checkAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied for non-admin users" });
  }

  const userId = req.params.id;
  const { username, full_name, role } = req.body;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const updateData = {};

    if (username) updateData.username = username;
    if (full_name) updateData.full_name = full_name;
    if (role) updateData.role = role;

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error: error.message });
  } finally {
    await client.close();
  }
});

// DELETE: ลบผู้ใช้ด้วย user id (ต้องใช้ Token และต้องเป็น admin)
router.delete("/:id", checkAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied for non-admin users" });
  }

  const userId = req.params.id;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;
