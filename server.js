require("dotenv").config();
console.log("DB URL:", process.env.MONGO_URI ? "Знайдено ✅" : "Не знайдено ❌");

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
  let { username, email, comment, phone } = req.body;

  if (!username || !comment || !phone) {
    return res.status(400).send("Empty fields");
  }

  const clean = (str) =>
    str.replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;");

  const safeData = {
    username: clean(username),
    email: clean(email || ""),
    comment: clean(comment),
    phone: clean(phone)
  };

  // 🔥 ЗБЕРІГАЄМО БЕЗ ТЕЛЕФОНУ
  const post = new Post({
    username: safeData.username,
    email: safeData.email,
    comment: safeData.comment
  });

  await post.save();

  // 📧 ВІДПРАВКА ПОШТИ (з телефоном)
  await transporter.sendMail({
    from: "mutro2003@gmail.com",
    to: "biliak.dmytro@chnu.edu.ua",
    subject: "Новий відгук",
    html: `
      <b>Ім'я:</b> ${safeData.username} <br>
      <b>Телефон:</b> ${safeData.phone} <br>
      <b>Email:</b> ${safeData.email} <br>
      <b>Коментар:</b> ${safeData.comment}
    `
  });

  res.json(post);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB OK"))
  .catch(err => console.log(err));



