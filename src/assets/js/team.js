// team page popup. the scroll reveals are in site.js with the other pages
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