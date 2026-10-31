// Shared interactions for the portfolio.
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));
}

// Rotating role text. The page remains readable if JavaScript is disabled.
const typewriter = document.getElementById("typewriter");
if (typewriter) {
  const roles = ["a Data Analyst", "a Power BI Developer", "a BI Analyst", "an Excel Specialist"];
  let role = 0, position = roles[0].length, deleting = true;
  function typeRole() {
    const word = roles[role];
    position += deleting ? -1 : 1;
    typewriter.textContent = word.slice(0, position);
    let delay = deleting ? 42 : 78;
    if (!deleting && position === word.length) { deleting = true; delay = 1500; }
    else if (deleting && position === 0) { deleting = false; role = (role + 1) % roles.length; delay = 350; }
    window.setTimeout(typeRole, delay);
  }
  window.setTimeout(typeRole, 1700);
}

// Project category filters support multiple tags per project.
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
filterButtons.forEach(button => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  projectCards.forEach(card => {
    const tags = (card.dataset.tags || "").split(" ");
    card.hidden = filter !== "All" && !tags.includes(filter);
  });
}));

// Accessible image preview modal.
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeButton = document.querySelector(".close-btn");
function closeModal() {
  if (!modal || !modalImage) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
  document.body.classList.remove("modal-open");
}
document.querySelectorAll(".preview-btn").forEach(button => button.addEventListener("click", () => {
  if (!modal || !modalImage) return;
  modalImage.src = button.dataset.image || "";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeButton?.focus();
}));
closeButton?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

// Contact form opens the visitor's email app; it does not silently claim to send.
const form = document.getElementById("contactForm");
if (form) form.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
  const status = document.getElementById("message-status");
  if (status) status.style.display = "block";
  window.location.href = `mailto:frankpatojnr@gmail.com?subject=${subject}&body=${body}`;
});

// Reveal skill bars once the page has loaded.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.2 });
  document.querySelectorAll(".skill-track").forEach(track => observer.observe(track));
} else {
  document.querySelectorAll(".skill-track").forEach(track => track.classList.add("in-view"));
}
