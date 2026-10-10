// sponsor page only

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// days to Silverstone
const spLive = document.querySelector("#spLive");

if (spLive) {
  const raceStart = Date.parse(spLive.dataset.start);
  const daysEl = document.querySelector("#spDays");

  const showDays = function () {
    // rounds down like the homepage countdown
    const daysLeft = Math.max(0, Math.floor((raceStart - Date.now()) / 86400000));
    daysEl.textContent = daysLeft;
  };

  showDays();
  // hidden in the HTML so it never shows without a number
  spLive.hidden = false;
  setInterval(showDays, 60000);
}

// enquiry builder, writes the email but never sends it
const enqForm = document.querySelector("#enqForm");

if (enqForm) {
  // email and season come from site.json
  const sponsorEmail = enqForm.dataset.email;
  const season = enqForm.dataset.season;
  const orgInput = document.querySelector("#enqOrg");
  const nameInput = document.querySelector("#enqName");
  const noteInput = document.querySelector("#enqNote");
  const subjectEl = document.querySelector("#enqSubject");
  const bodyEl = document.querySelector("#enqBody");
  const sendBtn = document.querySelector("#enqSend");
  const copyBtn = document.querySelector("#enqCopy");

  const buildEmail = function () {
    const tier = enqForm.querySelector("input[name=tier]:checked").value;
    // organisation is optional so individuals can use the form too
    const org = orgInput.value.trim();
    const name = nameInput.value.trim() || "[your name]";
    const note = noteInput.value.trim();
    const kit = Array.from(document.querySelectorAll("#kitPicker input:checked")).map(function (box) {
      return box.value.toLowerCase();
    });

    let ask;
    if (tier === "In kind support") {
      ask = "I'm interested in discussing a partnership with NUFS Racing through in kind support";
    } else if (tier) {
      ask = "I'm interested in discussing a partnership with NUFS Racing at the " + tier + " level for the " + season + " season";
    } else {
      ask = "I'm interested in discussing a partnership with NUFS Racing and would like to hear about the options";
    }

    // only mention the organisation when one is given
    const intro = org ? "I'm " + name + " from " + org : "I'm " + name;
    const subject = "NUFS " + (tier || "partnership") + " enquiry from " + (org || name);
    const lines = ["Hi NUFS Racing,", "", intro + ", and " + ask + "."];
    if (kit.length) lines.push("", "I could offer: " + kit.join(", ") + ".");
    if (note) lines.push("", note);
    lines.push("", "Could you send over more details on how it would work?", "", "Thanks,", name);
    const body = lines.join("\n");

    subjectEl.textContent = subject;
    bodyEl.textContent = body;
    sendBtn.href =
      "mailto:" + sponsorEmail +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    return { subject: subject, body: body };
  };

  enqForm.addEventListener("input", buildEmail);

  // ticking kit adds it to the email and picks In kind
  const kitPicker = document.querySelector("#kitPicker");
  const kitUses = document.querySelector("#kitUses");

  kitPicker.addEventListener("change", function () {
    kitUses.innerHTML = "";
    kitPicker.querySelectorAll("input:checked").forEach(function (box) {
      const row = document.createElement("li");
      row.textContent = box.value + " \u2192 " + box.dataset.team;
      kitUses.appendChild(row);
    });
    if (kitPicker.querySelector("input:checked")) {
      enqForm.querySelector('input[value="In kind support"]').checked = true;
    }
    buildEmail();
  });
  enqForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Enquire buttons preselect their tier
  document.querySelectorAll("[data-tier]").forEach(function (button) {
    button.addEventListener("click", function () {
      const radio = enqForm.querySelector('input[value="' + button.dataset.tier + '"]');
      if (radio) radio.checked = true;
      buildEmail();
    });
  });

  copyBtn.addEventListener("click", function () {
    const email = buildEmail();
    const text = "To: " + sponsorEmail + "\nSubject: " + email.subject + "\n\n" + email.body;
    const showCopied = function (label) {
      copyBtn.textContent = label;
      setTimeout(function () {
        copyBtn.textContent = "Copy email";
      }, 2000);
    };

    // select the text instead if the clipboard isn't available
    const selectInstead = function () {
      window.getSelection().selectAllChildren(bodyEl);
      showCopied("Press Ctrl+C to copy");
    };

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showCopied("Copied");
        })
        .catch(selectInstead);
    } else {
      selectInstead();
    }
  });

  buildEmail();
}

// rev bar fills with scroll and flashes at the bottom
const revBar = document.querySelector("#revBar");
const scrub = document.querySelector("#scrub");
const statementBand = document.querySelector("#statementBand");
let scrubWords = [];

// wrap each word so it can light up
if (scrub && !reduceMotion) {
  const parts = [];
  scrub.childNodes.forEach(function (node) {
    const isKey = node.nodeName === "EM";
    node.textContent.split(/(\s+)/).forEach(function (word) {
      if (!word.trim()) {
        parts.push(word);
        return;
      }
      parts.push('<span class="w' + (isKey ? " key" : "") + '">' + word + "</span>");
    });
  });
  scrub.innerHTML = parts.join("");
  scrubWords = scrub.querySelectorAll(".w");
  scrub.classList.add("scrubbing");
}

// the statement pins to the screen for a couple of screens of scrolling.
// the words fade in, then light one by one while the sim wheel clip plays
if (scrubWords.length) {
  const pin = document.createElement("div");
  pin.className = "statement-pin";
  statementBand.before(pin);
  pin.appendChild(statementBand);
  statementBand.classList.add("pinned");

  const still = statementBand.querySelector(".statement-photo");
  const clip = document.createElement("video");
  let clipReady = false;

  // only browsers that can play the mp4 get the clip, the rest keep the photo
  if (clip.canPlayType('video/mp4; codecs="avc1.64001f"')) {
    clip.className = "statement-photo statement-video";
    clip.poster = statementBand.dataset.poster;
    clip.muted = true;
    clip.playsInline = true;
    clip.setAttribute("muted", "");
    clip.setAttribute("playsinline", "");
    clip.setAttribute("aria-hidden", "true");
    still.after(clip);

    // load the whole clip first so every frame can be jumped to
    fetch(statementBand.dataset.clip)
      .then(function (res) { return res.blob(); })
      .then(function (blob) { clip.src = URL.createObjectURL(blob); })
      .catch(function () { clip.remove(); });

    clip.addEventListener("loadeddata", function () {
      // some phones only allow jumping around once the clip has played
      const warm = clip.play();
      if (warm) warm.then(function () { clip.pause(); }).catch(function () {});
      clipReady = true;
      statementBand.classList.add("has-video");
    });
  }

  const between = function (t, start, end) {
    return Math.min(1, Math.max(0, (t - start) / (end - start)));
  };

  let shown = 0;
  let onScreen = false;

  const placeStatement = function () {
    if (!onScreen) return;
    const range = pin.offsetHeight - window.innerHeight;
    const t = range > 0 ? between(-pin.getBoundingClientRect().top, 0, range) : 1;

    scrub.style.setProperty("--in", between(t, 0.02, 0.2).toFixed(3));
    const lit = Math.round(between(t, 0.2, 0.85) * scrubWords.length);
    scrubWords.forEach(function (word, i) {
      word.classList.toggle("lit", i < lit);
    });

    const p = between(t, 0.05, 0.9);
    statementBand.style.setProperty("--p", p.toFixed(3));
    if (clipReady && clip.duration) {
      // ease toward the scroll position so fast flicks don't jump
      shown += (p * (clip.duration - 0.05) - shown) * 0.25;
      if (Math.abs(clip.currentTime - shown) > 0.02) clip.currentTime = shown;
    }
    requestAnimationFrame(placeStatement);
  };

  // only runs while the scene is on screen
  new IntersectionObserver(function (entries) {
    const wasOn = onScreen;
    onScreen = entries[0].isIntersecting;
    if (onScreen && !wasOn) requestAnimationFrame(placeStatement);
  }).observe(pin);
}

if (revBar) {
  const revLights = revBar.querySelectorAll("i");
  let revQueued = false;

  const placeRev = function () {
    revQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    const lit = Math.round(progress * revLights.length);
    revLights.forEach(function (light, i) {
      light.classList.toggle("on", i < lit);
    });
    revBar.classList.toggle("limit", lit === revLights.length);
  };

  const queueRev = function () {
    if (!revQueued) {
      revQueued = true;
      requestAnimationFrame(placeRev);
    }
  };

  window.addEventListener("scroll", queueRev, { passive: true });
  window.addEventListener("resize", queueRev);
  placeRev();
}

// start lights reaction test, tapping before lights out is a jump start
const gantry = document.querySelector("#gantry");

if (gantry) {
  const pods = gantry.querySelectorAll(".pod");
  const gantryMsg = document.querySelector("#gantryMsg");
  const gantryBest = document.querySelector("#gantryBest");
  let gantryState = "idle";
  let gantryTimers = [];
  let lightsOutAt = 0;
  let bestTime = null;

  const resetLights = function () {
    gantryTimers.forEach(clearTimeout);
    gantryTimers = [];
    pods.forEach(function (pod) {
      pod.classList.remove("on");
    });
  };

  const runLights = function (isDemo) {
    resetLights();
    gantryState = isDemo ? "demo" : "arming";
    if (!isDemo) gantryMsg.textContent = "Wait for lights out…";

    pods.forEach(function (pod, i) {
      gantryTimers.push(setTimeout(function () {
        pod.classList.add("on");
      }, 600 * (i + 1)));
    });

    // random hold, like a real start
    const hold = 600 * pods.length + 400 + Math.random() * 1800;
    gantryTimers.push(setTimeout(function () {
      pods.forEach(function (pod) {
        pod.classList.remove("on");
      });
      // the demo is timed too, so a tap at lights out counts
      const wasDemo = gantryState === "demo";
      gantryState = "armed";
      lightsOutAt = performance.now();
      gantryMsg.textContent = "Go!";
      gantryTimers.push(setTimeout(function () {
        if (wasDemo) {
          gantryState = "idle";
          gantryMsg.textContent = "Tap the lights to start";
          return;
        }
        gantryState = "done";
        gantryMsg.textContent = "Too slow. Tap to try again";
      }, 3000));
    }, hold));
  };

  gantry.addEventListener("click", function () {
    // a tap during the demo turns it into a real start, so the lights keep going
    if (gantryState === "demo") {
      gantryState = "arming";
      gantryMsg.textContent = "Wait for lights out…";
    } else if (gantryState === "arming") {
      resetLights();
      gantryState = "done";
      gantryMsg.textContent = "Jump start. Tap to try again";
    } else if (gantryState === "armed") {
      const reaction = (performance.now() - lightsOutAt) / 1000;
      resetLights();
      gantryState = "done";
      gantryMsg.textContent = reaction.toFixed(3) + "s. Tap to go again";
      if (bestTime === null || reaction < bestTime) {
        bestTime = reaction;
        gantryBest.textContent = "Best " + bestTime.toFixed(3) + "s";
      }
    } else {
      runLights(false);
    }
  });

  // run once on load
  if (!reduceMotion) {
    setTimeout(function () {
      if (gantryState === "idle") runLights(true);
    }, 900);
  }
}
