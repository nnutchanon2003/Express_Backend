require("dotenv").config();
require("./middlewares/auth");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Controller list
const authController = require("./controllers/authController");
const productsController = require("./controllers/productsController");
const userController = require("./controllers/userController");
const orderController = require("./controllers/orderController");

const port = 3000;

// กำหนด Route สำหรับแต่ละ Controller
app.use("/auth", authController);
app.use("/products", productsController);
app.use("/users", userController);
app.use("/order", orderController);

// Root Route
app.get("/", (req, res) => {
  res.send({
    message: "server is running",
    version: 1.2,
    secret: process.env.jwt_secret,
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
