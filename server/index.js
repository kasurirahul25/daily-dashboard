require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Task = require("./models/Task");
const Practice = require("./models/Practice");

const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(400).json({ error: err.message });
  });

// ---------- Tasks ----------
app.get("/api/tasks", wrap(async (req, res) => {
  res.json(await Task.find().sort({ createdAt: 1 }));
}));

app.post("/api/tasks", wrap(async (req, res) => {
  res.status(201).json(await Task.create(req.body));
}));

app.patch("/api/tasks/:id", wrap(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
}));

app.delete("/api/tasks/:id", wrap(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// Remove everything that is already done in a bucket
app.delete("/api/tasks", wrap(async (req, res) => {
  await Task.deleteMany({ done: true, ...(req.query.bucket && { bucket: req.query.bucket }) });
  res.json({ ok: true });
}));

// ---------- Practice log ----------
app.get("/api/practice", wrap(async (req, res) => {
  res.json(await Practice.find().sort({ createdAt: -1 }));
}));

app.post("/api/practice", wrap(async (req, res) => {
  res.status(201).json(await Practice.create(req.body));
}));

app.delete("/api/practice/:id", wrap(async (req, res) => {
  await Practice.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- Start ----------
const { MONGO_URI, PORT = 5000 } = process.env;
if (!MONGO_URI) {
  console.error("MONGO_URI is missing. Add it to server/.env");
  process.exit(1);
}
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
