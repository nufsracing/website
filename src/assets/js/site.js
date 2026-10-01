const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
if (reduce) {
    const car = document.querySelector(".car")
    if (car) {
        car.remove();
    }
}


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
  const names = season.querySelectorAll(".phase-names li");
  const now = Date.now();
  for (let i = 0; i < segs.length; i++) {
    const fill = Math.min(
      1,
      Math.max(0, (now - edges[i]) / (edges[i + 1] - edges[i])),
    );
    segs[i].style.setProperty("--fill", fill);

    const current = now >= edges[i] && now < edges[i + 1];
    segs[i].classList.toggle("now", current);
    names[i].classList.toggle("now", current);

    if (current) {
      names[i].setAttribute("aria-current", "step");
    } else {
      names[i].removeAttribute("aria-current");
    }
  }

  if (season) {
    const race = new Date(edges[3]);
    const today = new Date(now);
    const months =
      (race.getFullYear() - today.getFullYear()) * 12 +
      race.getMonth() -
      today.getMonth();
    const num = season.querySelector(".num");
    const what = season.querySelector("#monthsWhat");

    if (months > 1) {
        num.textContent = months;
        what.textContent = "months to go";
    } else if (months === 1) {
        num.textContent = "1";
        what.textContent = "month to go";
    } else {
        num.textContent = "July";
        what.textContent = "is race month";
    }
  }
