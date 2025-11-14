## โปรเจคนี้เป็นส่วนหนึ่งของรายวิชา COE64-372 Back End Programming ##

# 🚀 ระบบตัวอย่าง Express_Backend (Node.js + Express + MongoDB)

โปรเจกต์นี้เป็นตัวอย่างระบบ Backend แบบครบชุดที่แสดงการทำงานของ REST API สำหรับจัดการผู้ใช้ สินค้า และคำสั่งซื้อ โดยใช้:

- **Node.js + Express** สำหรับสร้าง REST API  
- **MongoDB** สำหรับเก็บข้อมูล  
- **Passport + JWT** สำหรับ Authentication / Authorization  
-
ระบบนี้เหมาะสำหรับผู้ที่ต้องการศึกษาวิธีออกแบบระบบ Backend พร้อมระบบยืนยันตัวตนและการจัดการข้อมูลตามบทบาทผู้ใช้ (Role-Based Access Control)

---

## 📌 ภาพรวมโปรเจกต์ (Overview)

ระบบนี้มีเป้าหมายเพื่อสาธิตฟีเจอร์หลักดังนี้:

- ลงทะเบียนและเข้าสู่ระบบผู้ใช้  
- CRUD สินค้า  
- การสร้างคำสั่งซื้อพร้อมตรวจสอบ stock  
- ป้องกัน endpoint ด้วย JWT  
- การกำหนดสิทธิ์ด้วย role (`user`, `admin`)

---

## ✨ ฟีเจอร์สำคัญ (Features)

- ✔️ ลงทะเบียนผู้ใช้ พร้อมเก็บรหัสผ่านแบบ **bcrypt hash**  
- ✔️ เข้าสู่ระบบด้วย **JWT token**  
- ✔️ อ่านรายการสินค้า (public)  
- ✔️ เพิ่ม/แก้ไข/ลบสินค้า (เฉพาะผู้ใช้ role = `admin`)  
- ✔️ สร้างคำสั่งซื้อและลด stock อัตโนมัติ  
- ✔️ ดูคำสั่งซื้อของตัวเอง  
- ✔️ ตรวจสอบสิทธิ์ระดับ endpoint ด้วย middleware  

---

## 🧩 โครงสร้างโปรเจกต์ (Components)
📁 controllers/  
     ├─ authController.js       → จัดการเข้าสู่ระบบ (Login)  
     ├─ userController.js       → จัดการผู้ใช้ (Register / Admin only)  
     ├─ productsController.js   → CRUD สินค้า  
     └─ orderController.js      → คำสั่งซื้อ + ลด stock  

📁 middlewares/  
     └─ auth.js                 → Local strategy + JWT strategy  

📁 db/  
     └─ mongoDb.js              → เชื่อมต่อฐานข้อมูล MongoDB  

📁 validators/                 → ตรวจสอบข้อมูล input
server.js                     → จุดเริ่มต้นระบบ

---

## 🔄 ลำดับการทำงานของระบบ (System Flow)

### 1️⃣ ลงทะเบียนผู้ใช้ (`POST /users`)
- ระบบรับข้อมูลผู้ใช้  
- Hash รหัสผ่านด้วย bcrypt  
- บันทึกลงคอลเลกชัน `users`

---

### 2️⃣ ผู้ใช้เข้าสู่ระบบ (`POST /auth/login`)
- ระบบตรวจสอบ username / password  
- หากถูกต้อง → สร้าง JWT  
- ส่ง token กลับให้ผู้ใช้

---

### 3️⃣ Public Endpoint
เช่น:เรียกได้ทันที ไม่ต้องใช้ token

---

### 4️⃣ Protected Endpoint
ผู้ใช้ต้องแนบ header:

ขั้นตอน:
- ระบบตรวจ token  
- ถอดข้อมูล → แนบลงใน `req.user`  
- หาก endpoint จำกัดเฉพาะ role `admin`  
  → ระบบตรวจ `req.user.role`

---

### 5️⃣ การสั่งซื้อสินค้า (`POST /order/placeorder`)
ระบบจะ:

1. ตรวจสอบ token  
2. รับ productId + quantity  
3. ตรวจสอบ stock  
4. ลด stock ตามจำนวนที่สั่ง  
5. บันทึกคำสั่งซื้อ (username, totalAmount, orderDate ฯลฯ)

---

### 6️⃣ ดูคำสั่งซื้อของผู้ใช้ (`GET /order/myorders`)
- ระบบใช้ username จาก token เพื่อค้นในคอลเลกชัน `orders`

---

## 🔐 การกำหนดสิทธิ์ (Authorization)

| Role     | สิทธิ์ |
|----------|--------|
| `user`   | ดูสินค้า, สั่งซื้อ, ดูคำสั่งซื้อของตัวเอง |
| `admin`  | จัดการสินค้า, จัดการผู้ใช้, เข้าถึง endpoint เฉพาะผู้ดูแล |

ตัวอย่างการเช็ค role:

```js
if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
}

Client → ส่ง Request + Token  
 ↓
Server → ตรวจ JWT  
 ↓
Controller → ประมวลผล + อ่าน/เขียนฐานข้อมูล  
 ↓
Response → ส่งกลับให้ Client

---

## 🧪 การทดสอบ API ด้วย Postman

โปรเจ็กต์นี้มี Postman Collection สำหรับทดสอบ API ทุก endpoint เช่น:

-- User Register / Login
-- Products CRUD
-- Orders

Admin Protected Routes

---

📘 รายการ Request ที่มีใน Collection
Auth

-- POST /auth/login

Users

-- POST /users
-- GET /users (admin only)

Products

-- GET /products
-- POST /products (admin only)
-- PUT /products/:id (admin only)
-- DELETE /products/:id (admin only)

Orders

-- POST /order/placeorder
-- GET /order/myorder


----------------------------------------------------------------------------------------------------------------------------


# 🚀 Sample Backend System (Node.js + Express + MongoDB)

This project is a full-stack example backend demonstrating a REST API for managing users, products, and orders. It uses:

- **Node.js + Express** for REST API
- **MongoDB** for data storage
- **Passport + JWT** for authentication and authorization

This project is useful for learners who want to understand backend design with authentication and role-based access control.

---

## 📌 Project Overview

This system demonstrates the following main features:

- User registration and login
- Product CRUD
- Order placement with stock checks
- Protecting endpoints with JWT
- Role-based authorization (`user`, `admin`)

---

## ✨ Key Features

- ✔️ User registration with **bcrypt** password hashing
- ✔️ Login with **JWT token** issuance
- ✔️ Read product list (public)
- ✔️ Add / edit / delete products (admin only)
- ✔️ Create orders and automatically deduct product stock
- ✔️ View own orders
- ✔️ Endpoint-level authorization via middleware

---

## 🧩 Project Structure (Components)

controllers/
     ├─ authController.js       → Login handling
     ├─ userController.js       → User registration and admin user management
     ├─ productsController.js   → Product CRUD
     └─ orderController.js      → Order handling and stock updates

middlewares/
     └─ auth.js                 → Local strategy + JWT strategy

db/
     └─ mongoDb.js              → MongoDB connection helper

validators/                   → Request input validation
server.js                     → Application entry point

---

## 🔄 System Flow

### 1️⃣ Register (`POST /users`)
- Server accepts user data
- Hashes password with bcrypt
- Stores user in the `users` collection

---

### 2️⃣ Login (`POST /auth/login`)
- Server verifies username and password
- If valid → issues a JWT token
- Returns the token to the client

---

### 3️⃣ Public Endpoints
- Example: `GET /products` (accessible without a token)

---

### 4️⃣ Protected Endpoints
- Client must include header: `Authorization: Bearer <token>`
- Server verifies the token and attaches user data to `req.user`
- Some endpoints require `req.user.role === 'admin'`

---

### 5️⃣ Place Order (`POST /order/placeorder`)
Server will:
1. Verify token
2. Accept `productId` and `quantity`
3. Check product stock
4. Decrease stock by the ordered quantity
5. Save the order document (username, totalAmount, orderDate, etc.)

---

### 6️⃣ Get User Orders (`GET /order/myorders`)
- Server queries orders by `username` from the token

---

## 🔐 Authorization

| Role     | Permissions |
|----------|-------------|
| `user`   | View products, place orders, view own orders |
| `admin`  | Manage products, manage users, access admin endpoints |

Example role check:

```js
if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
}
```

Client → Send Request + Token
 ↓
Server → Verify JWT
 ↓
Controller → Business logic + DB read/write
 ↓
Response → Return result to client

--

## 🧪 API Testing with Postman

This project includes a Postman Collection for testing all API endpoints, such as:

-- User Register / Login
-- Products CRUD
-- Orders

Admin Protected Routes

---

## 📘 Request list available in Collection

Auth

-- POST /auth/login

Users

-- POST /users
-- GET /users (admin only)

Products

-- GET /products
-- POST /products (admin only)
-- PUT /products/:id (admin only)
-- DELETE /products/:id (admin only)

Orders

-- POST /order/placeorder
-- GET /order/myorders#   E x p r e s s _ B a c k e n d  
 