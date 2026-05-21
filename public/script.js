const form = document.getElementById("form");
const posts = document.getElementById("posts");

// 🔒 sanitize
function sanitize(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ======================
// 🔥 ДОДАВАННЯ КОМЕНТАРЯ В DOM
// ======================

function addPost(p, withAnimation = true) {

  const div = document.createElement("div");

  div.classList.add("comment");

  div.innerHTML = `
    <b class="name__client">${p.username}</b>
    <p>${p.email}</p>
    <div class="comment__client">${p.comment}</div>
  `;

  posts.prepend(div);

  if (withAnimation) {
    setTimeout(() => {
      div.classList.add("show");
    }, 50);
  } else {
    div.classList.add("show");
  }
}

// ======================
// 🎯 SUBMIT
// ======================

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const fd = new FormData(form);

  const data = {
    username: fd.get("username").trim(),
    email: fd.get("email").trim(),
    comment: fd.get("comment").trim(),
    phone: fd.get("phone").trim()
  };

  // ❌ ВАЛІДАЦІЯ
  if (!data.username || !data.email || !data.comment || !data.phone) {
    alert("Заповніть всі поля");
    return;
  }

  const phoneRegex = /^\+?\d{10,15}$/;

  if (!phoneRegex.test(data.phone)) {
    alert("Введіть коректний номер телефону");
    return;
  }

  // 🔒 SANITIZE
  data.username = sanitize(data.username);
  data.email = sanitize(data.email);
  data.comment = sanitize(data.comment);
  data.phone = sanitize(data.phone);

  try {

    const res = await fetch("https://api.skorbota-ritual.com.ua/posts", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error("Помилка сервера");
    }

    const result = await res.json();

    // 🔥 МИТТЄВО ДОДАЄМО КОМЕНТАР
    addPost(result.post);

    // очистка форми
    form.reset();

  } catch(err) {

    console.error(err);
    alert("Помилка відправки");
  }
});

// 🚀 load
async function load(withAnimation = false) {
  const res = await fetch("https://api.skorbota-ritual.com.ua/posts");
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

  const name =
    form.querySelector('[name="name"]') ||
    form.querySelector('[name="username"]');

  const email = form.querySelector('[name="email"]');

  const phone = form.querySelector('[name="phone"]');

  const comment = form.querySelector('[name="comment"]');

  let valid = true;

  // очистка помилок
  form.querySelectorAll('.error').forEach(e => e.remove());

  function showError(input, message) {

    if (!input) return;

    const err = document.createElement('div');

    err.className = 'error';
    err.style.color = 'red';
    err.style.fontSize = '12px';
    err.textContent = message;

    input.after(err);
  }

  // name
  if (name && !name.value.trim()) {
    showError(name, "Введіть ім'я");
    valid = false;
  }

  // phone
  if (phone && !phone.value.trim()) {
    showError(phone, "Введіть телефон");
    valid = false;
  }

  // comment
  if (comment && !comment.value.trim()) {
    showError(comment, "Введіть коментар");
    valid = false;
  }

  // email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email) {

    if (!email.value.trim()) {

      showError(email, "Введіть email");
      valid = false;

    } else if (!emailRegex.test(email.value)) {

      showError(email, "Некоректний email");
      valid = false;
    }
  }

  return valid;
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
      await fetch('https://api.skorbota-ritual.com.ua/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });

      form.reset();

      console.log(result);

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

const tabs = document.querySelectorAll('.goods__tab');
const contents = document.querySelectorAll('.goods__grid');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {

    // якщо вже активний — нічого не робимо
    if (tab.classList.contains('goods__tab_active')) return;

    // прибираємо active у всіх tabs
    tabs.forEach(item => {
      item.classList.remove('goods__tab_active');
    });

    // прибираємо active у всіх content
    contents.forEach(content => {
      content.classList.remove('goods__grid_active');
    });

    // додаємо active поточному tab
    tab.classList.add('goods__tab_active');

    // показуємо потрібний content
    contents[index].classList.add('goods__grid_active');
  });
});

// ======================
// 🔥 ПОЯВА SECTION ПРИ СКРОЛІ
// ======================

const sections = document.querySelectorAll('section');

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('show');
				observer.unobserve(entry.target);
			}
		});
	},
	{
		rootMargin: '0px 0px -20% 0px'
	}
);

sections.forEach(section => {
	observer.observe(section);
});

load();



// 🧹 clear
// document.getElementById("clearBtn").addEventListener("click", async () => {
//   if (!confirm("Точно видалити всі коментарі?")) return;

//   await fetch("/clear", { method: "DELETE" });
//   load();
  // posts.innerHTML = ""; // 🔥 миттєво очистити на фронті});