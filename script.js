import "./style.css";

const views = [...document.querySelectorAll(".view")];
const links = [...document.querySelectorAll(".dock-link")];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let scene;
let motionPaused = motionQuery.matches;
let toastTimer;
try {
  motionPaused =
    motionQuery.matches ||
    localStorage.getItem("luka-motion-paused") === "true";
} catch {
  /* Storage is optional. */
}

function currentView() {
  const name = location.hash.slice(1);
  return views.some((view) => view.id === name) ? name : "home";
}
function navigate({ focus = true } = {}) {
  const name = currentView();
  for (const view of views) view.hidden = view.id !== name;
  for (const link of links) {
    const active = link.hash === `#${name}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.body.dataset.view = name;
  document.title = `${name === "home" ? "Developer & Creative Thinker" : name[0].toUpperCase() + name.slice(1)} — Luka Jokhadze`;
  scene?.setVisible(name === "home" && !document.hidden);
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focus) {
    const heading = document.getElementById(name).querySelector("h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
window.addEventListener("hashchange", () => navigate());
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("main").focus();
});
navigate({ focus: false });

const motionButton = document.getElementById("motion-toggle");
function updateMotion() {
  document.body.classList.toggle("motion-paused", motionPaused);
  motionButton.setAttribute("aria-pressed", String(motionPaused));
  motionButton.setAttribute(
    "aria-label",
    motionPaused ? "Play animation" : "Pause animation",
  );
  motionButton.title = motionPaused ? "Play animation" : "Pause animation";
  motionButton.textContent = motionPaused ? "▷" : "Ⅱ";
  scene?.setPaused(motionPaused);
}
motionButton.addEventListener("click", () => {
  motionPaused = !motionPaused;
  try {
    localStorage.setItem("luka-motion-paused", String(motionPaused));
  } catch {
    /* Optional preference. */
  }
  updateMotion();
});
motionQuery.addEventListener("change", (event) => {
  motionPaused = event.matches;
  updateMotion();
});
updateMotion();
function updateClock() {
  document.getElementById("local-time").textContent = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Tbilisi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(new Date());
}
updateClock();
setInterval(updateClock, 60_000);
document.getElementById("year").textContent = new Date().getFullYear();

function toast(message) {
  clearTimeout(toastTimer);
  const element = document.querySelector(".toast");
  element.textContent = message;
  element.classList.add("is-visible");
  toastTimer = setTimeout(() => element.classList.remove("is-visible"), 3000);
}
document.getElementById("copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("lukadadu@gmail.com");
    toast("Email copied. Say hello!");
  } catch {
    toast("Email: lukadadu@gmail.com");
  }
});

const projects = {
  aurora: {
    title: "AuroraScan",
    category: "01 / DEVELOPER TOOLS",
    description:
      "A browser-based network diagnostics workspace that brings infrastructure lookups and security checks into one interface.",
    stack: ["React", "JavaScript", "Vite", "Tailwind CSS"],
    features: [
      "IP, ASN, and DNS record lookups",
      "HTTP, CORS, and security header inspection",
      "Domain and certificate information through public APIs",
      "Client-side architecture with no dedicated backend",
    ],
    url: "https://github.com/LukaJokha/AuroraScan",
  },
  partizan: {
    title: "Partizan Barber",
    category: "02 / WEB EXPERIENCE",
    description:
      "A grooming website built around a distinctive visual identity, editorial typography, and animated interactions.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP"],
    features: [
      "A strong typographic identity and warm visual palette",
      "Responsive layouts for small and large screens",
      "Scroll-triggered animation and interactive elements",
      "An exploration of brand-led web design",
    ],
    url: "https://github.com/LukaJokha/partizan-barber",
  },
  reference: {
    title: "Code Reference",
    category: "03 / LEARNING TOOLS",
    description:
      "An interactive reference for C# and SQL concepts. A practical place to revisit syntax, find a snippet, and get back to building.",
    stack: ["React", "Vite", "C#", "SQL"],
    features: [
      "C# syntax, object-oriented programming, LINQ, and async concepts",
      "SQL queries, joins, and indexing references",
      "A searchable interface for finding relevant snippets",
      "Responsive reading and navigation",
    ],
    url: "https://github.com/LukaJokha/CheatSheetForLanguages",
  },
};
const dialog = document.getElementById("project-dialog");
let dialogOpener;
document.querySelectorAll("[data-detail]").forEach((button) =>
  button.addEventListener("click", () => {
    const project = projects[button.dataset.detail];
    dialogOpener = button;
    document.getElementById("dialog-category").textContent = project.category;
    document.getElementById("dialog-title").textContent = project.title;
    document.getElementById("dialog-description").textContent =
      project.description;
    document.getElementById("dialog-source").href = project.url;
    document.getElementById("dialog-tags").replaceChildren(
      ...project.stack.map((name) => {
        const span = document.createElement("span");
        span.textContent = name;
        return span;
      }),
    );
    document.getElementById("dialog-features").replaceChildren(
      ...project.features.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }),
    );
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }),
);
dialog
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom)
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  dialogOpener?.focus({ preventScroll: true });
});
document.addEventListener("visibilitychange", () =>
  scene?.setVisible(!document.hidden && currentView() === "home"),
);

async function initScene() {
  try {
    const { createScene } = await import("./scene.js");
    scene = createScene(document.getElementById("scene"), {
      paused: motionPaused,
    });
    scene.setVisible(currentView() === "home" && !document.hidden);
    document.getElementById("playground").classList.add("scene-ready");
    document.getElementById("remix").addEventListener("click", () => {
      const form = scene.remix();
      document.getElementById("form-number").textContent = form;
      toast(`Form 0${form} — a different perspective.`);
    });
  } catch (error) {
    console.warn("3D unavailable; showing the static sculpture.", error);
    document.getElementById("scene").hidden = true;
    document.querySelector(".drag-hint").textContent = "A study in form";
    document.getElementById("remix").hidden = true;
    motionButton.hidden = true;
  }
}
initScene();
