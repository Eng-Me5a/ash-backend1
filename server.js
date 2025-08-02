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

const BestProduct = mongoose.model("BestProduct", productSchema);
const AllProduct = mongoose.model("AllProduct", productSchema);
const Collection = mongoose.model("Collection", productSchema);
const BestSeller = mongoose.model("BestSeller", productSchema);

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
