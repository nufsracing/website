const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector("#navLinks");
// opens the menu up when the button is clikced
toggle.addEventListener("click", function () {
  const isOpen = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen);
});

// automatically closes the menu when you press a page
links.addEventListener("click", function (event) {
  if (event.target.closest("a")) {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

//Red line for the season tracker
const season = document.querySelector("#season");

if (season) {
  const edges = season.dataset.phases.split(" ").map(Date.parse);

  const segs = season.querySelectorAll(".seg");
  const now = Date.now();
  for (let i = 0; i < segs.length; i++) {
    const fill = Math.min(
      1,
      Math.max(0, (now - edges[i]) / (edges[i + 1] - edges[i])),
    );
    segs[i].style.setProperty("--fill", fill);
  }
}
