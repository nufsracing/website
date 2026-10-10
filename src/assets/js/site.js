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

//race day countdown, it ticks once per second
const race = document.querySelector("#raceDay");

if (race) {
  const start = Date.parse(race.dataset.start);
  const units = [];
  race.querySelectorAll("[data-unit]").forEach(function (el) {
    units[el.dataset.unit] = el;
  });
  const summary = document.querySelector("#raceSummary");
  const pad = function (n) {
    return String(n).padStart(2, "0");
  };

  const tick = function () {
    const left = Math.max(0, start - Date.now());
    const days = Math.floor(left / 86400000);
    const hours = Math.floor(left / 3600000) % 24;
    const mins = Math.floor(left / 60000) % 60;
    const secs = Math.floor(left / 1000) % 60;

    units.days.textContent = days;
    units.hours.textContent = pad(hours);
    units.mins.textContent = pad(mins);
    units.secs.textContent = pad(secs);
    summary.textContent = days + " days to race day";

    //once the events start don't count into the negatives
    if (left === 0) {
      race.classList.add("race-on");
      race.querySelector(".race-live").lastChild.textContent = "Race Week";
      clearInterval(timer);
    }
  };

  const timer = setInterval(tick, 1000);
  tick();
}

const path = document.querySelector("#rl");
const dot = document.querySelector("#rlDot");
const core = document.querySelector("#rlCore");

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
    core.style.strokeDashoffset = 1 - (0.05 + p * 0.9);
    placePin();
    placeNav();
  };

  // the car laps silverstone on its own
  const lap = document.querySelector("#lap");
  const car = document.querySelector(".car");
  const venueArt = document.querySelector(".venue-art");

  if (!reduce && lap && car && venueArt) {
    const lapLength = lap.getTotalLength();
    const lapTime = 9000;
    let lapPos = 0;
    let lastTime = null;
    let lapFrame = null;

    const moveCar = function () {
      const pt = lap.getPointAtLength(lapPos * lapLength);
      car.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
    };

    const drive = function (now) {
      if (lastTime !== null) {
        lapPos = (lapPos + (now - lastTime) / lapTime) % 1;
      }

      lastTime = now;
      moveCar();
      lapFrame = requestAnimationFrame(drive);
    };

    const lapWatch = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (lapFrame === null) lapFrame = requestAnimationFrame(drive);
      } else if (lapFrame !== null) {
        cancelAnimationFrame(lapFrame);
        lapFrame = null;
        lastTime = null;
      }
    });

    moveCar();
    lapWatch.observe(venueArt);
  }

  // the plan pins for three screens, scroll position picks the lit phase
  const pin = document.querySelector("#planPin");
  const pinMedia = window.matchMedia(
    "(min-width: 861px) and (min-height: 640px)",
  );
  const phases = document.querySelectorAll(".phase");
  const planSegs = document.querySelectorAll(".plan-track .seg");
  const monthsEl = document.querySelector("#monthsLeft");
  const totalMonths = 10;
  const placePin = function () {
    if (!pin || !pinMedia.matches) {
      document.documentElement.classList.remove("js-pin");
      return;
    }
    document.documentElement.classList.add("js-pin");
    const inner = pin.firstElementChild;
    const top = pin.getBoundingClientRect().top + window.scrollY;
    const range = pin.offsetHeight - inner.offsetHeight;
    const p = Math.min(1, Math.max(0, (window.scrollY - top) / range));
    monthsEl.textContent = Math.round(totalMonths * (1 - p));
    const active = Math.min(phases.length - 1, Math.floor(p * phases.length));
    phases.forEach(function (phase, i) {
      phase.classList.toggle("active", i === active);
    });
    planSegs.forEach(function (seg, i) {
      seg.style.setProperty(
        "--fill",
        Math.min(1, Math.max(0, p * planSegs.length - i)),
      );
    });
  };

  // nav slides away on the way down and back on the way up
  const nav = document.querySelector(".nav");
  let lastY = window.scrollY;
  const placeNav = function () {
    const y = window.scrollY;
    const menuOpen = links.classList.contains("open");
    if (!menuOpen && y > lastY + 4 && y > 160) {
      nav.classList.add("nav-hidden");
    } else if (y < lastY - 4 || y <= 160) {
      nav.classList.remove("nav-hidden");
    }
    lastY = y;
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
  // selector, then which reveal it gets
  const groups = [
    [".hero-copy > *", "rise"],
    [".season", "rise"],
    [".fig", "rise"],
    [".photo-grid", "wipe"],
    [".venue-copy", "rise"],
    [".venue-art", "rise"],
    ["#about .head", "rise"],
    [".about-body > p", "rise"],
    [".score-head", "rise"],
    [".score-seg", "grow"],
    [".ev-group .label", "rise"],
    [".ev-row", "slide"],
    ["#plan .head", "rise"],
    [".phase", "line"],
    [".partner-band", "band"],
    [".partner-head", "rise"],
    [".tier", "rise"],
    [".join", "rise"],
    [".pitch", "rise"],
    // sponsor page
    [".gantry-wrap", "rise"],
    [".split-inner", "rise"],
    ["#enquire .head", "rise"],
    [".enquiry > *", "rise"],
    ["#tiers .head", "rise"],
    [".pkg", "rise"],
    [".strip", "rise"],
    [".tier-note", "rise"],
    [".flagship", "rise"],
    ["#why .head", "rise"],
    [".why-item", "rise"],
    [".rule-top", "rule"],
    [".foot", "rule"],
  ];

  // numbers run up from zero over 1.4s, waiting for their own stagger first
  const countUp = function (el) {
    const target = Number(el.dataset.count);
    const owner = el.closest(".reveal");
    const wait = owner
      ? Number(owner.style.getPropertyValue("--i") || 0) * 80
      : 0;
    const start = performance.now() + wait;
    const step = function (now) {
      const t = Math.min(1, Math.max(0, (now - start) / 1400));
      const eased = 1 - (1 - t) * (1 - t);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          e.target.querySelectorAll("[data-count]").forEach(countUp);
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  groups.forEach(function (group) {
    const selector = group[0];
    const effect = group[1];
    let n = 0;
    let lastParent = null;
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.parentNode !== lastParent) {
        n = 0;
        lastParent = el.parentNode;
      }
      el.style.setProperty("--i", Math.min(n++, 9));
      el.dataset.reveal = effect;
      el.classList.add("reveal");
      el.querySelectorAll("[data-count]").forEach(function (number) {
        number.textContent = "0";
      });
      io.observe(el);
    });
  });
}

// footer switch for analytics, the choice is remembered in this browser
const analyticsToggle = document.querySelector("#analyticsToggle");

if (analyticsToggle) {
  const gaId = analyticsToggle.dataset.ga;
  let isOff = false;
  try {
    isOff = localStorage.getItem("analytics-off") === "1";
  } catch (e) {}

  const showState = function () {
    analyticsToggle.textContent = isOff ? "Turn back on" : "Turn off";
  };

  analyticsToggle.addEventListener("click", function () {
    isOff = !isOff;
    try {
      localStorage.setItem("analytics-off", isOff ? "1" : "0");
    } catch (e) {}

    if (isOff) {
      // stop tracking straight away and clear the cookies GA already set
      window["ga-disable-" + gaId] = true;
      document.cookie.split(";").forEach(function (cookie) {
        const name = cookie.split("=")[0].trim();
        if (name.startsWith("_ga")) {
          document.cookie =
            name + "=; Max-Age=0; path=/; domain=.nufsracing.co.uk";
        }
      });
    }
    showState();
  });

  showState();
}
