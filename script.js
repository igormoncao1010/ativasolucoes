const canvas = document.querySelector("#network-canvas");
const ctx = canvas.getContext("2d");
const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".count-up");

let points = [];
let width = 0;
let height = 0;
let animationFrame = 0;
function resizeCanvas() {
  const density = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * density);
  canvas.height = Math.floor(height * density);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(density, 0, 0, density, 0, 0);

  const total = Math.max(42, Math.min(110, Math.floor((width * height) / 18000)));
  points = Array.from({ length: total }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    r: 1 + Math.random() * 1.8,
  }));
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (const point of points) {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > width) point.vx *= -1;
    if (point.y < 0 || point.y > height) point.vy *= -1;
  }

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    ctx.beginPath();
    ctx.fillStyle = "rgba(64, 240, 223, 0.62)";
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < points.length; j += 1) {
      const b = points[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 138) {
        const alpha = (1 - distance / 138) * 0.2;
        ctx.strokeStyle = `rgba(64, 240, 223, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  animationFrame = requestAnimationFrame(drawNetwork);
}

function closeMenu() {
  topbar?.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menu");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = topbar?.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

function formatCounter(value, counter) {
  if (counter.dataset.format === "compact") {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1,
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  }

  return `${new Intl.NumberFormat("pt-BR").format(Math.round(value))}${counter.dataset.suffix || ""}`;
}

function animateCounter(counter) {
  if (counter.dataset.done === "true") return;

  counter.dataset.done = "true";
  const target = Number(counter.dataset.target || 0);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    counter.textContent = formatCounter(value, counter);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    counter.textContent = formatCounter(target, counter);
  }

  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll(".count-up").forEach(animateCounter);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

counters.forEach((counter) => {
  if (counter.closest(".reveal")) return;
  animateCounter(counter);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawNetwork();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  drawNetwork();
});
