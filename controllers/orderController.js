const express = require("express");
const mongoDbInstant = require("../db/mongoDb");
const jwt = require("jsonwebtoken");

const Router = express();
const client = mongoDbInstant.getMongoClient();
const productsCollection = "products";
const ordersCollection = "orders";

// Middleware: ตรวจสอบ JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

// POST: สั่งซื้อสินค้า (เฉพาะผู้ใช้ที่มี Token)
Router.post("/placeorder", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Invalid productId" });
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const products = db.collection(productsCollection);
    const orders = db.collection(ordersCollection);

    // ตรวจสอบสินค้าว่ามีอยู่หรือไม่ และ stock เพียงพอหรือไม่
    const product = await products.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // ลดจำนวน stock ของสินค้า
    await products.updateOne(
      { _id: productId },
      { $inc: { stock: -quantity } }
    );

    // บันทึกคำสั่งซื้อ
    const order = {
      username: req.user.username,  // ใช้ username แทน userId
      productId,
      productName: product.name,
      quantity,
      totalAmount: product.price * quantity,
      orderDate: new Date(),
    };
    await orders.insertOne(order);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({
      message: "Failed to place order",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

// GET: แสดงคำสั่งซื้อของผู้ใช้ตาม token
Router.get("/myorders", verifyToken, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(mongoDbInstant.getDbName());
    const orders = db.collection(ordersCollection);

    // ดึงข้อมูลคำสั่งซื้อของผู้ใช้ตาม username จาก token
    const userOrders = await orders.find({ username: req.user.username }).toArray();

    if (userOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: userOrders,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve orders",
      error: err.message,
    });
  } finally {
    await client.close();
  }
});

module.exports = Router;
