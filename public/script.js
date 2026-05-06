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

// ======================
// 🔥 МОДАЛКИ
// ======================


function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.remove('active');
  });
  document.querySelector('.overlay').classList.remove('active');
}

function openModal(id) {
  closeAllModals();
  document.querySelector('.overlay').classList.add('active');
  document.getElementById(id).classList.add('active');
}

// відкриття consultation
document.querySelectorAll('[data-modal="consultation"]').forEach(btn => {
  btn.addEventListener('click', () => {

    openModal('consultation');
  });
});

// закриття всіх
document.querySelectorAll('.modal__close').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
}); 

document.querySelector('.overlay').addEventListener('click', (e) => {
  if (e.target.classList.contains('overlay')) {
    closeAllModals();
  }
});

// кнопки товарів
const buttons = document.querySelectorAll('.button_mini');
const subtitles = document.querySelectorAll('.goods__item__text');

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    document.querySelector('#order .modal__descr').textContent =
      subtitles[i].textContent;

    openModal('order');
  });
});

// ======================
// 🔥 ВАЛІДАЦІЯ
// ======================

function validateForm(form) {
  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');

  let valid = true;

  // очистка помилок
  form.querySelectorAll('.error').forEach(e => e.remove());

  function showError(input, message) {
    const err = document.createElement('div');
    err.className = 'error';
    err.style.color = 'red';
    err.style.fontSize = '12px';
    err.textContent = message;
    input.after(err);
  }

  if (!name.value.trim()) {
    showError(name, "Введіть своє ім'я");
    valid = false;
  }

  if (!phone.value.trim()) {
    showError(phone, "Введіть свій номер телефону");
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.value.trim()) {
    showError(email, "Введіть свою пошту");
    valid = false;
  } else if (!emailRegex.test(email.value)) {
    showError(email, "Ваша пошта має бути вигляду name@domain.com");
    valid = false;
  }

  return valid;
}

// ======================
// 🔥 ПІДКЛЮЧЕННЯ ДО ФОРМИ
// ======================

const modalForm = document.querySelector('#form');

if (modalForm) {
  modalForm.addEventListener('submit', (e) => {
    if (!validateForm(modalForm)) {
      e.preventDefault();
    }
  });
}

// ======================
// 🚀 ВІДПРАВКА МОДАЛЬНИХ ФОРМ
// ======================

document.querySelectorAll('.feed-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const btn = form.querySelector('button');
    const originalText = btn.textContent;

    // 🔥 LOADING START
    btn.disabled = true;
    btn.innerHTML = 'Відправка <span class="loader"></span>';

    const fd = new FormData(form);

    const data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      product: document.querySelector('#order .modal__descr')?.textContent || ''
    };

    try {
      await fetch('/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      form.reset();

      // показати THANKS
      openModal('thanks');

    } catch (err) {
      alert('Помилка відправки');
      console.error(err);
    } finally {
      // 🔥 LOADING END
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

load();



// 🧹 clear
// document.getElementById("clearBtn").addEventListener("click", async () => {
//   if (!confirm("Точно видалити всі коментарі?")) return;

//   await fetch("/clear", { method: "DELETE" });
//   load();
  // posts.innerHTML = ""; // 🔥 миттєво очистити на фронті});