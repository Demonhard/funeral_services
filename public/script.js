const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  await fetch("/posts", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: fd.get("username"),
      email: fd.get("email"),
      comment: fd.get("comment")
    })
  });

  form.reset(); //  очищає всі поля
  load();
});

async function load(){
  const res = await fetch("/posts");
  const data = await res.json();

  document.getElementById("posts").innerHTML =
    data.map(p => `
      <div>
        <b class="name__client">${p.username}</b>
        <p>${p.email}</p>
        <div class="comment__client">${p.comment}</div>
      </div>
    `).join("");
}

load();


const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", async () => {
  if (!confirm("Точно видалити всі коментарі?")) return;

  await fetch("/clear", {
    method: "DELETE"
  });

  load(); // оновити список
});