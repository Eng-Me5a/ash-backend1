const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ الاتصال بقاعدة البيانات مع تحسينات
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Schemas مع تحسينات
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
}, { timestamps: true });

const cartItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  cart: [cartItemSchema],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, default: "pending", enum: ["pending", "processing", "completed", "cancelled"] },
  date: { type: Date, default: Date.now }
});

const BestProduct = mongoose.model("BestProduct", productSchema);
const AllProduct = mongoose.model("AllProduct", productSchema);
const Collection = mongoose.model("Collection", productSchema);
const BestSeller = mongoose.model("BestSeller", productSchema);
const Order = mongoose.model("Order", orderSchema);

// ✅ Middleware للتحقق من الصلاحيات (يمكن تطويره)
const authenticate = (req, res, next) => {
  // هنا يمكن إضافة منطق المصادقة
  next();
};

// ✅ Middleware للتحقق من صحة البيانات
const validateProduct = (req, res, next) => {
  const { name, price, imageUrl, category } = req.body;
  if (!name || !price || !imageUrl || !category) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }
  if (isNaN(price)) {
    return res.status(400).json({ error: "السعر يجب أن يكون رقماً" });
  }
  next();
};

// ✅ دالة مساعدة لمعالجة الأخطاء
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "حدث خطأ في الخادم" });
};

// ✅ إنشاء نقاط النهاية بطريقة أكثر تنظيماً
const createProductEndpoints = (model, route) => {
  // الحصول على جميع المنتجات
  app.get(`/${route}`, async (req, res) => {
    try {
      const data = await model.find();
      res.json(data);
    } catch (error) {
      handleErrors(res, error);
    }
  });

  // إضافة منتج جديد
  app.post(`/${route}`, authenticate, validateProduct, async (req, res) => {
    try {
      const product = new model(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      handleErrors(res, error);
    }
  });

  // حذف منتج
  app.delete(`/${route}/:id`, authenticate, async (req, res) => {
    try {
      const deleted = await model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }
      res.sendStatus(204);
    } catch (error) {
      handleErrors(res, error);
    }
  });
};

// إنشاء نقاط النهاية لكل نوع منتج
createProductEndpoints(BestProduct, "bestproduct");
createProductEndpoints(AllProduct, "allproducts");
createProductEndpoints(Collection, "collections");
createProductEndpoints(BestSeller, "bestseller");

// ✅ Endpoints للطلبات (Orders) مع تحسينات

// عرض كل الطلبات مع مصادقة
app.get("/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    handleErrors(res, error);
  }
});

// إنشاء طلب جديد مع تحقق من البيانات
app.post("/orders", async (req, res) => {
  try {
    const { customer, cart, total } = req.body;
    
    if (!customer || !customer.name || !customer.address || !customer.phone) {
      return res.status(400).json({ error: "بيانات العميل مطلوبة" });
    }
    
    if (!cart || !cart.length) {
      return res.status(400).json({ error: "سلة الشراء فارغة" });
    }
    
    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: "المجموع غير صالح" });
    }

    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    handleErrors(res, error);
  }
});

// تحديث حالة الطلب مع مصادقة وتحقق
app.put("/orders/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "حالة الطلب غير صالحة" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }
    
    res.json(updated);
  } catch (error) {
    handleErrors(res, error);
  }
});

// حذف طلب مع مصادقة
app.delete("/orders/:id", authenticate, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }
    res.sendStatus(204);
  } catch (error) {
    handleErrors(res, error);
  }
});

// ✅ تشغيل السيرفر
app.get("/", (req, res) => {
  res.send("🔥 ASH API is running!");
});

// معالجة المسارات غير المعرفة
app.use((req, res) => {
  res.status(404).json({ error: "مسار غير موجود" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
