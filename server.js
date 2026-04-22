const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 🔌 MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/mydb") 
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
app.listen(3000, () => {
  console.log("http://localhost:3000");
});

