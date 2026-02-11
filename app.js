(function () {
  const body = document.body;
  const page = body.dataset.page || "";

  function setActiveNav() {
    const map = {
      home: "home",
      profile: "home",
      post: "home",
      chatList: "chats",
      chat: "chats",
      ai: "ai",
      settings: "settings",
      security: "settings",
      notifications: "settings",
      languageTheme: "settings",
      payments: "settings",
      documents: "settings"
    };

    const active = map[page];
    if (!active) return;

    document.querySelectorAll(".bottom-nav a").forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === active);
    });
  }

  function wireToggles() {
    document.querySelectorAll(".toggle").forEach((group) => {
      group.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        group.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  function wireChips() {
    document.querySelectorAll(".chips").forEach((group) => {
      group.addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        group.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      });
    });
  }

  function wireOtp() {
    const otpInputs = Array.from(document.querySelectorAll(".otp-grid input"));
    if (!otpInputs.length) return;

    otpInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^\d]/g, "");
        if (input.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }

  const overlay = document.querySelector(".overlay");
  const sideSheet = document.querySelector(".side-sheet");
  const historySheet = document.querySelector(".history-sheet");

  function closeLayers() {
    if (sideSheet) sideSheet.classList.remove("show");
    if (historySheet) historySheet.classList.remove("show");
    if (overlay) overlay.classList.remove("show");
  }

  function openSideMenu() {
    if (!sideSheet || !overlay) return;
    sideSheet.classList.add("show");
    overlay.classList.add("show");
  }

  function toggleHistory() {
    if (!historySheet || !overlay) return;
    historySheet.classList.toggle("show");
    overlay.classList.toggle("show", historySheet.classList.contains("show"));
  }

  document.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    if (action === "open-menu") openSideMenu();
    if (action === "close-layers") closeLayers();
    if (action === "toggle-history") toggleHistory();
    if (action === "toast") showToast(actionEl.dataset.message || "تمت العملية بنجاح");
  });

  if (overlay) {
    overlay.addEventListener("click", closeLayers);
  }

  function showToast(message, state) {
    const toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = state === "danger" ? "var(--danger)" : "#23343e";
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function getJson(url, fallback) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("network");
      return await response.json();
    } catch (_) {
      return fallback;
    }
  }

  async function loadLawyers() {
    const host = document.getElementById("lawyers-list");
    if (!host) return;

    const fallback = [
      { name: "المحامي أحمد نواف", specialty: "استشارات تجارية", rating: 4 },
      { name: "المحامية دانا خطاب", specialty: "احوال شخصية", rating: 5 },
      { name: "المحامي ليث الرواشدة", specialty: "تنفيذ ومدني", rating: 3 }
    ];

    const lawyers = await getJson("/api/lawyers", fallback);
    host.innerHTML = "";

    lawyers.forEach((lawyer) => {
      const stars = "★".repeat(lawyer.rating || 4) + "☆".repeat(Math.max(0, 5 - (lawyer.rating || 4)));
      const item = document.createElement("a");
      item.href = "./profile.html";
      item.className = "list-card";
      item.innerHTML = [
        '<span class="arrow">›</span>',
        "<div>",
        `<strong>${lawyer.name}</strong>`,
        `<div class="small">${lawyer.specialty || "استشارات قانونية"}</div>`,
        `<div class="stars">${stars}</div>`,
        "</div>",
        '<div class="avatar">👤</div>'
      ].join("");
      host.appendChild(item);
    });
  }

  async function loadChats() {
    const host = document.getElementById("chat-list-data");
    if (!host) return;

    const fallback = [
      { name: "lawyer 1", lastMessage: "Hello", time: "11:01", rating: 5 },
      { name: "lawyer 2", lastMessage: "موعد الجلسة", time: "10:44", rating: 4 },
      { name: "lawyer 3", lastMessage: "تم الاستلام", time: "09:20", rating: 5 }
    ];

    const chats = await getJson("/api/chats", fallback);
    host.innerHTML = "";

    chats.forEach((chat) => {
      const stars = "★".repeat(chat.rating || 4) + "☆".repeat(Math.max(0, 5 - (chat.rating || 4)));
      const item = document.createElement("a");
      item.href = "./chat.html";
      item.className = "list-card";
      item.innerHTML = [
        '<div class="avatar">👤</div>',
        "<div>",
        `<strong>${chat.name}</strong>`,
        `<div class="small">${chat.lastMessage || "رسالة"}</div>`,
        "</div>",
        `<div><div class="small">${chat.time || "11:01"}</div><div class="stars">${stars}</div></div>`
      ].join("");
      host.appendChild(item);
    });
  }

  async function loadDocuments() {
    const host = document.getElementById("docs-list");
    const search = document.getElementById("doc-search");
    if (!host) return;

    const fallback = [
      { title: "file Class A", type: "Doex" },
      { title: "file Class B", type: "PDF" },
      { title: "file Class A", type: "Doex" },
      { title: "file Class B", type: "PDF" }
    ];

    const docs = await getJson("/api/documents", fallback);

    function render(items) {
      host.innerHTML = "";
      items.forEach((doc) => {
        const item = document.createElement("article");
        item.className = "doc-item";
        item.innerHTML = `<div class="file-icon">📄</div><div><strong>${doc.title}</strong><div class="meta">${doc.type}</div></div>`;
        host.appendChild(item);
      });
    }

    render(docs);

    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        const filtered = docs.filter((doc) => `${doc.title} ${doc.type}`.toLowerCase().includes(q));
        render(filtered);
      });
    }
  }

  setActiveNav();
  wireToggles();
  wireChips();
  wireOtp();
  loadLawyers();
  loadChats();
  loadDocuments();
})();
