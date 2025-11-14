const express = require("express");
const mongoDbInstant = require("../db/mongoDb");
const jwt = require("jsonwebtoken");

const Router = express();
const client = mongoDbInstant.getMongoClient();
const collectionName = "products";

// Middleware: ตรวจสอบ JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({ message: "Token expired" });
      }
      return res.status(403).send({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

// GET: อ่านข้อมูลสินค้าทั้งหมด (ไม่ต้องใช้ Token)
Router.get("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);
    const products = await collection.find({}).toArray();

    res.status(200).json({
      message: "Products retrieved successfully",
      data: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock || 0, // แสดงจำนวนคงเหลือ (ถ้าไม่มี stock จะเป็น 0)
      })),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve products",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

// POST: เพิ่มสินค้าใหม่ (เฉพาะ admin เท่านั้น)
Router.post("/addproduct", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const { id, name, price, stock } = req.body;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    const existingProduct = await collection.findOne({ _id: id });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    await collection.insertOne({ _id: id, name, price, stock: stock || 0 });

    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add product",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

// PUT: แก้ไขข้อมูลสินค้า (เฉพาะ admin เท่านั้น)
Router.put("/editproduct/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const id = req.params.id;
  const { name, price, stock } = req.body;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update product",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

// DELETE: ลบสินค้า (เฉพาะ admin เท่านั้น)
Router.delete("/deleteproduct/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  const id = req.params.id;

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

module.exports = Router;
