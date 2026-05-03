require("dotenv").config();
console.log("DB URL:", process.env.MONGO_URI ? "Знайдено ✅" : "Не знайдено ❌");

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 🔌 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB OK"))
  .catch(err => console.log(err));

// 📦 Модель
const Post = mongoose.model("Post", {
  username: String,
  email: String,
  comment: String,
});

// =======================
// ✅ REST API
// =======================

app.use(express.static("public"));

// 📥 GET всі пости
app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// 📥 GET один пост
app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// ➕ POST створити
app.post("/posts", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

// ✏️ PUT оновити
app.put("/posts/:id", async (req, res) => {
  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// ❌ DELETE
app.delete("/posts/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Видалено" });
});

app.delete("/clear", async (req, res) => {
  console.log("CLEAR CALLED");
  await Post.deleteMany({});
  res.json({ message: "Всі коментарі видалені" });
});


// 🚀 запуск
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});


app.post("/posts", async (req, res) => {
  let { username, email, comment } = req.body;

  if (!username || !email || !comment) {
    return res.status(400).send("Empty fields");
  }

  const clean = (str) =>
    str.replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;");

  const post = new Post({
    username: clean(username),
    email: clean(email),
    comment: clean(comment),
  });

  await post.save();
  res.json(post);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB OK"))
  .catch(err => console.log(err));

