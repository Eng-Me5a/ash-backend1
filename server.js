const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// قواعد بيانات وهمية
let bestproduct = [];
let allproducts = [];
let collections = [];
let bestseller = []; // ✅ القسم الجديد

// ✅ Endpoints لإدارة bestproduct
app.get("/bestproduct", (req, res) => res.json(bestproduct));
app.post("/bestproduct", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  bestproduct.push(newProduct);
  res.status(201).json(newProduct);
});
app.delete("/bestproduct/:id", (req, res) => {
  bestproduct = bestproduct.filter(p => p.id != req.params.id);
  res.sendStatus(204);
});

// ✅ Endpoints لإدارة allproducts
app.get("/allproducts", (req, res) => res.json(allproducts));
app.post("/allproducts", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  allproducts.push(newProduct);
  res.status(201).json(newProduct);
});
app.delete("/allproducts/:id", (req, res) => {
  allproducts = allproducts.filter(p => p.id != req.params.id);
  res.sendStatus(204);
});

// ✅ Endpoints لإدارة collections
app.get("/collections", (req, res) => res.json(collections));
app.post("/collections", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  collections.push(newProduct);
  res.status(201).json(newProduct);
});
app.delete("/collections/:id", (req, res) => {
  collections = collections.filter(p => p.id != req.params.id);
  res.sendStatus(204);
});

// ✅ Endpoints لإدارة bestseller
app.get("/bestseller", (req, res) => res.json(bestseller));
app.post("/bestseller", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  bestseller.push(newProduct);
  res.status(201).json(newProduct);
});
app.delete("/bestseller/:id", (req, res) => {
  bestseller = bestseller.filter(p => p.id != req.params.id);
  res.sendStatus(204);
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
