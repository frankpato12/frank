const roles = ["Data Analyst", "Power BI Developer", "Business Intelligence Analyst", "Excel Expert"];
let roleIndex = 0, charIndex = 0, deleting = false;

const typewriter = document.getElementById("typewriter");
if (typewriter) {
  function animate() {
    const current = roles[roleIndex];
    typewriter.textContent = deleting
      ? current.substring(0, charIndex--)
      : current.substring(0, charIndex++);

    if (!deleting && charIndex > current.length) {
      deleting = true;
      setTimeout(animate, 1400);
      return;
    }
    if (deleting && charIndex < 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      charIndex = 0;
    }
    setTimeout(animate, deleting ? 45 : 90);
  }
  animate();
}

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks?.classList.remove("open"));
});

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    projectCards.forEach(card => {
      const tags = (card.dataset.tags || "").split(",");
      card.hidden = filter !== "All" && !tags.includes(filter);
    });
  });
});

const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
function closeModal() {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  if (modalImage) modalImage.src = "";
  document.body.style.overflow = "";
}
document.querySelectorAll(".preview-btn").forEach(button => {
  button.addEventListener("click", () => {
    if (!modal || !modalImage) return;
    modalImage.src = button.dataset.image;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});
document.querySelector(".close-btn")?.addEventListener("click", closeModal);
modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const status = document.getElementById("message-status");
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    if (status) status.style.display = "block";
    window.location.href = `mailto:frankpatojnr@gmail.com?subject=${subject}&body=${body}`;
  });
}

// ======================================================
// SLOW LIVE FOREX BAR STREAM
// New bars appear one by one from the right.
// ======================================================

const barsContainer = document.querySelector(".bars");

if (barsContainer) {

  // Starting bars
  let barHeights = [32, 47, 39, 63, 55, 76, 67];

  // Clear the existing bars
  barsContainer.innerHTML = "";

  // Create a bar
  function createBar(height) {
    const bar = document.createElement("i");

    bar.style.height = `${height}%`;
    bar.classList.add("market-bar");

    barsContainer.appendChild(bar);

    // Small entrance animation
    requestAnimationFrame(() => {
      bar.classList.add("bar-visible");
    });
  }

  // Show the first bars slowly
  let startingIndex = 0;

  const initialBars = setInterval(() => {

    if (startingIndex < barHeights.length) {

      createBar(barHeights[startingIndex]);

      startingIndex++;

    } else {

      clearInterval(initialBars);

    }

  }, 1800); // one new bar every 1.8 seconds


  // After the first bars are displayed,
  // keep creating new bars slowly.
  setTimeout(() => {

    setInterval(() => {

      // Random but controlled market movement
      const lastBar =
        barHeights[barHeights.length - 1] || 50;

      let movement =
        lastBar + (Math.random() - 0.5) * 35;

      // Keep bars between 20% and 100%
      movement = Math.max(20, Math.min(100, movement));

      movement = Math.round(movement);

      barHeights.push(movement);

      createBar(movement);

      // Remove the oldest bar
      if (barsContainer.children.length > 10) {
        barsContainer.removeChild(
          barsContainer.children[0]
        );
      }

    }, 2500); // new bar every 2.5 seconds

  }, 1800 * barHeights.length);
}
// Animate progress bars on load
document.addEventListener("DOMContentLoaded", function () {
    const progressBars = document.querySelectorAll(".progress i");
    
    // Small delay so the page rendering finishes first
    setTimeout(() => {
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute("data-width");
            if (targetWidth) {
                bar.style.width = targetWidth;
            }
        });
    }, 200);
});