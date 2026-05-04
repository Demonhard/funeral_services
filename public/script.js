const form = document.getElementById("form");
const posts = document.getElementById("posts");

// 🔒 sanitize
function sanitize(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 🎯 submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  const data = {
    username: fd.get("username").trim(),
    email: fd.get("email").trim(),
    comment: fd.get("comment").trim(),
  phone: fd.get("phone").trim() // 🔥 ДОДАЛИ
};

  // ❌ валідація
  if (!data.username || !data.email || !data.comment || !data.phone) {
    alert("Заповніть всі поля");
    return;
  }

  const phoneRegex = /^\+?\d{10,15}$/;

  if (!phoneRegex.test(data.phone)) {
    alert("Введіть коректний номер телефону");
    return;
  }

  // 🔒 sanitize
  data.username = sanitize(data.username);
  data.email = sanitize(data.email);
  data.comment = sanitize(data.comment);
  data.phone = sanitize(data.phone);
  await fetch("/posts", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

  form.reset();
  load(true); // 🔥 з анімацією
});

// 🚀 load
async function load(withAnimation = false) {
  const res = await fetch("/posts");
  const data = await res.json();

  posts.innerHTML = "";

  data.reverse().forEach((p, i) => {
    const div = document.createElement("div");
    div.classList.add("comment");

    div.innerHTML = `
      <b class="name__client">${p.username}</b>
      <p>${p.email}</p>
      <div class="comment__client">${p.comment}</div>
    `;

    posts.appendChild(div);

    if (withAnimation) {
      setTimeout(() => {
        div.classList.add("show");
      }, i * 100);
    } else {
      div.classList.add("show");
    }
  });
}

load();

// 🧹 clear
// document.getElementById("clearBtn").addEventListener("click", async () => {
//   if (!confirm("Точно видалити всі коментарі?")) return;

//   await fetch("/clear", { method: "DELETE" });
//   load();
  // posts.innerHTML = ""; // 🔥 миттєво очистити на фронті});