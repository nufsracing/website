const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector("#navLinks");

toggle.addEventListener("click", function () {
  const isOpen = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen);
});
