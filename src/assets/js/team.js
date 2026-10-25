(() => {
  document.querySelectorAll(".member[data-photo]").forEach((card) => {
    const box = card.querySelector(".member-card");
    if (!box || box.querySelector(".member-photo")) return;
    const img = document.createElement("img");
    img.className = "member-photo";
    img.src = card.dataset.photo;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
  
    img.addEventListener("error", () => img.remove());
    box.insertBefore(img, box.querySelector(".member-open"));
  });
})();
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js-reveal");


  const groups = [
    ["main .hero-copy > *", "rise"],
    ["#leads .head > *, #committee .head > *, #sub-teams .head > *", "rise"],
    [".member", "rise"],
    ["#work-with-us .head > *", "rise"],
    [".ww-item", "rise"],
    [".ww-right > *", "rise"],
    ["main .rule-top", "rule"],
  ];

 
  function splitWords(heading) {
    let w = 0;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((text) => {
      const frag = document.createDocumentFragment();
      text.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const outer = document.createElement("span");
        const inner = document.createElement("span");
        outer.className = "w";
        outer.style.setProperty("--w", w++);
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      text.replaceWith(frag);
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  groups.forEach(([selector, effect]) => {
    let n = 0;
    let lastParent = null;
    document.querySelectorAll(selector).forEach((el) => {
      if (el.classList.contains("reveal")) return; // already set up
      if (el.parentNode !== lastParent) {
        n = 0;
        lastParent = el.parentNode;
      }
      el.style.setProperty("--i", Math.min(n++, 9));
      if (effect === "rise" && el.matches("h1, h2")) {
        splitWords(el);
        el.dataset.reveal = "words";
      } else {
        el.dataset.reveal = effect;
      }
      el.classList.add("reveal");
      io.observe(el);
    });
  });
})();

(() => {
  const dialog = document.getElementById("memberDialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const bg = dialog.querySelector(".md-bg");
  const info = dialog.querySelector(".md-info");
  const face = document.getElementById("mdFace");
  const role = document.getElementById("mdRole");
  const name = document.getElementById("mdName");
  const link = document.getElementById("mdLink");
  const body = document.getElementById("mdBody");
  const closeBtn = document.getElementById("mdClose");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "cubic-bezier(0.2, 0.7, 0.2, 1)";

  let current = null;
  let closing = false;

  const fontOf = (el) => parseFloat(getComputedStyle(el).fontSize);

  function fly(from, to, fontFrom, fontTo, duration) {
    const ghost = face.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.classList.add("md-ghost");
    dialog.appendChild(ghost);
    const box = (r, f) => ({
      top: r.top + "px",
      left: r.left + "px",
      width: r.width + "px",
      height: r.height + "px",
      fontSize: f + "px",
    });
    const move = ghost.animate([box(from, fontFrom), box(to, fontTo)], {
      duration,
      easing: ease,
      fill: "forwards",
    });
    return move.finished.then(() => ghost.remove());
  }

  function openFor(card) {
    if (dialog.open) return;
    current = card;

    const fullName = card.querySelector(".member-name").textContent.trim();
    name.textContent = fullName;
    role.textContent = card.querySelector(".member-role").textContent.trim();

    const photo = card.querySelector(".member-photo");
    if (photo) {
      const img = photo.cloneNode();
      img.removeAttribute("loading");
      face.replaceChildren(img);
    } else {
      face.textContent = card.querySelector(".member-face").textContent.trim();
    }

    const bio = card.querySelector(".member-bio");
    const hasText =
      bio && [...bio.querySelectorAll("p:not(.label)")].some((p) => p.textContent.trim() !== "");
    if (hasText) {
      body.replaceChildren(...bio.cloneNode(true).childNodes);
    } else {
      const soon = document.createElement("p");
      soon.className = "md-empty";
      soon.textContent = /^to be announced/i.test(fullName)
        ? "We’ll announce who’s taking this role soon."
        : fullName.split(" ")[0] + "’s story of why they joined NUFS is on its way.";
      body.replaceChildren(soon);
    }

    const url = card.dataset.linkedin;
    link.hidden = !url;
    if (url) link.href = url;

    const from = card.querySelector(".member-card").getBoundingClientRect();
    const fontFrom = fontOf(card.querySelector(".member-face"));

    dialog.showModal();
    info.scrollTop = 0;
    if (reduceMotion) return;

    card.classList.add("is-open");
    dialog.classList.add("opening");
    const to = face.getBoundingClientRect();

    bg.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 400, delay: 120, easing: ease, fill: "backwards",
    });
    [info, closeBtn].forEach((el) =>
      el.animate(
        [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
        { duration: 500, delay: 260, easing: ease, fill: "backwards" },
      ),
    );
    fly(from, to, fontFrom, fontOf(face), 650).then(() => dialog.classList.remove("opening"));
  }

  function closeDialog() {
    if (!dialog.open || closing) return;
    if (reduceMotion || !current) {
      dialog.close();
      return;
    }
    closing = true;
    dialog.classList.remove("opening");
    dialog.classList.add("closing");

    const from = face.getBoundingClientRect();
    const to = current.querySelector(".member-card").getBoundingClientRect();
    const fontTo = fontOf(current.querySelector(".member-face"));

    Promise.all([
      fly(from, to, fontOf(face), fontTo, 450),
      info.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: ease, fill: "forwards" }).finished,
      closeBtn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: ease, fill: "forwards" }).finished,
      bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: ease, fill: "forwards" }).finished,
    ]).then(() => dialog.close());
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".member");
    if (!card || e.target.closest("a")) return;
    openFor(card);
  });

  closeBtn.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeDialog();
  });

  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("close", () => {
    [bg, info, closeBtn].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    dialog.querySelectorAll(".md-ghost").forEach((g) => g.remove());
    dialog.classList.remove("opening", "closing");
    closing = false;
    if (current) {
      current.classList.remove("is-open");
      const opener = current.querySelector(".member-open");
      if (opener) opener.focus({ preventScroll: true });
      current = null;
    }
  });
})();