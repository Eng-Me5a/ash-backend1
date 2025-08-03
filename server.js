const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ تعريف Schemas
const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  image: String,
  description: String,
  collection: String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    address: String,
    phone: String,
  },
  cart: [
    {
      title: String,
      price: String,
      quantity: Number,
      image: String,
    }
  ],
  total: Number,
  status: { type: String, default: "جديد" } 
}, { timestamps: true });

const BestProduct = mongoose.model("BestProduct", productSchema);
const AllProduct = mongoose.model("AllProduct", productSchema);
const Collection = mongoose.model("Collection", productSchema);
const BestSeller = mongoose.model("BestSeller", productSchema);
const Order = mongoose.model("Order", orderSchema);

// ✅ Endpoints لكل قسم

// BestProduct
app.get("/bestproduct", async (req, res) => {
  const data = await BestProduct.find();
  res.json(data);
});
app.post("/bestproduct", async (req, res) => {
  const product = new BestProduct(req.body);
  await product.save();
  res.status(201).json(product);
});
app.delete("/bestproduct/:id", async (req, res) => {
  await BestProduct.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// AllProducts
app.get("/allproducts", async (req, res) => {
  const data = await AllProduct.find();
  res.json(data);
});
app.post("/allproducts", async (req, res) => {
  const product = new AllProduct(req.body);
  await product.save();
  res.status(201).json(product);
});
app.delete("/allproducts/:id", async (req, res) => {
  await AllProduct.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Orders
app.get("/orders", async (req, res) => {
  const data = await Order.find();
  res.json(data);
});
app.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(order);
});
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});
// تحديث حالة الطلب
app.patch("/orders/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.patch("/orders/:id", async (req, res) => {
  const { status } = req.body;
  
  if (!["جديد", "قيد التجهيز", "مكتمل"].includes(status)) {
    return res.status(400).json({ message: "حالة الطلب غير صالحة" });
  }
});
// Collections
app.get("/collections", async (req, res) => {
  const data = await Collection.find();
  res.json(data);
});
app.post("/collections", async (req, res) => {
  const product = new Collection(req.body);
  await product.save();
  res.status(201).json(product);
});
app.delete("/collections/:id", async (req, res) => {
  await Collection.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// BestSeller
app.get("/bestseller", async (req, res) => {
  const data = await BestSeller.find();
  res.json(data);
});
app.post("/bestseller", async (req, res) => {
  const product = new BestSeller(req.body);
  await product.save();
  res.status(201).json(product);
});
app.delete("/bestseller/:id", async (req, res) => {
  await BestSeller.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// ✅ Endpoint لاختبار السيرفر
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
