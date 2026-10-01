const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) {
  const car = document.querySelector(".car");
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
}

const path = document.querySelector("#rl");
const dot = document.querySelector("#rlDot");

if (!reduce && path && dot) {
  const total = path.getTotalLength();
  let queued = false;

  const place = function () {
    queued = false;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max < 200) {
      dot.classList.remove("on");
      return;
    }

    const p = Math.min(1, Math.max(0, window.scrollY / max));
    const pt = path.getPointAtLength((0.05 + p * 0.9) * total);
    dot.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
    dot.classList.add("on");
  };

  const queue = function () {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(place);
    }
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);

  place();
}

if (document.documentElement.classList.contains("js-reveal")) {
  const groups = [
    ".hero-copy > *",
    ".season",
    ".fig",
    ".photo-grid",
    ".venue-copy",
    ".venue-art",
    "#about .head",
    ".about-body > p",
    ".ev-group",
    "#plan .head",
    ".phase",
    ".partner-band",
    ".partner-head",
    ".tier",
    ".join",
    ".pitch",
  ];

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  groups.forEach(function (sel) {
    let n = 0;
    let lastParent = null;
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.parentNode !== lastParent) {
        n = 0;
        lastParent = el.parentNode;
      }
      el.style.setProperty("--i", Math.min(n++, 4));
      el.classList.add("reveal");
      io.observe(el);
    });
  });
}
