import {
    affixer,
    debounce,
    distributeCards,
    easeInBounce,
    getOffset,
    initCarousel,
    lerp,
    listElementsCoords,
    rollCarousel,
    round,
    scrollIn,
    scrollInPreamble,
    shuffleCarousel,
    sleep,
    slideToggle,
    smoothScroll,
    toggle,
    toggleOnce,
    transposeCarousel
} from "./utils.js";

// window.onbeforeunload = function() {
//     window.scrollTo(0, 0);
// };

let carousel = document.getElementById("carousel");
initCarousel(carousel);
shuffleCarousel(carousel, 3);

document.getElementById("start-btn").addEventListener("click", function(event) {
    let origin = document.getElementById("start-cards-container");
    let cards = document.getElementById("start-cards");

    let columns = 1;
    let delay = 50;
    let sx = 25;
    let sy = 15;

    toggle(origin,
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, columns, true);
           },
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, columns, false);
           });
});

document.getElementById("start-container")
  .addEventListener("mouseenter", function(event) {
      document.getElementById("carousel").setAttribute("paused", true);
  });

document.getElementById("start-container")
  .addEventListener("mouseleave", function(event) {
      document.getElementById("carousel").setAttribute("paused", false);
  });

function rollingCarousel()
{
    setTimeout(() => {
        carousel = document.getElementById("carousel");

        if (carousel.getAttribute("paused") === "false") {
            rollCarousel(carousel);
        }
        requestAnimationFrame(rollingCarousel);
    }, 2000);
}

// requestAnimationFrame(rollingCarousel);

document.getElementById("rotate-btn")
  .addEventListener("mousedown", function(event) {
      let carousel = document.getElementById("carousel");
      rollCarousel(carousel);
  });

document.getElementById("transpose-btn")
  .addEventListener("mousedown", function(event) {
      let carousel = document.getElementById("carousel");
      transposeCarousel(carousel);
  });

document.getElementById("shuffle-btn")
  .addEventListener("mousedown", function(event) {
      let carousel = document.getElementById("carousel");
      shuffleCarousel(carousel, 3);
  });

document.getElementById("fun-btn").addEventListener("click", function(event) {
    let origin = document.getElementById("fun-cards-container");
    let cards = document.getElementById("fun-cards");

    let columns = 1;
    let delay = 50;
    let sx = 25;
    let sy = 10;

    toggle(origin,
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, columns, true);
           },
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, columns, false);
           });
});

document.getElementById("menu-icon")
  .addEventListener("mousedown", function(event) {
      this.classList.toggle("active");
      slideToggle(document.getElementById("navbar-body"));
      return false;
  });

function preAffixFunc(el, n)
{
    el.classList.add("navbar-affixed");
}

function postAffixFunc(el, n)
{
    el.classList.remove("navbar-affixed");
}

affixer(preAffixFunc, postAffixFunc);

function scrollDarken(el, v, dy, min, max)
{
    if (dy == -1 || dy >= min && dy <= max * 1.2) {
        v = round(v, 1, 2);
        let color0 = 220 * (1 - v);
        let color1 = 255 * v;

        el.style.backgroundColor = `rgb(${color0}, ${color0}, ${color0})`;
        el.style.color = `rgb(${color1}, ${color1}, ${color1})`;

        Array.from(el.querySelectorAll(":scope > .content-cell"))
          .forEach((e, n) => {
              e.style.borderColor = "white";
              e.style.boxShadow = "6px 6px 6px 2px rgb(49, 49, 49)";
          });
        Array.from(el.querySelectorAll(":scope > .title-content-md"))
          .forEach(
            (e,
             n) => { e.style.color = `rgb(${color1}, ${color1}, ${color1})`; });
    }
}

function scrollOpacity(el, v, dy, min, max)
{
    if (dy == -1 || dy >= min && dy <= max * 1.2) {
        v = round(v, 1, 2);
        el.style.opacity = v;
        el.style.transform = `translateY(${20 * v}px)`;
    } else {
        el.style.opacity = v;
    }
}

function scrollNavbar(color)
{
    return function _scrollNavbar(el, v, dy, min, max) {
        let bar = document.getElementById("navbar-body");
        if (dy == -1 ||
            dy >= min && dy <= max && bar.style.backgroundColor !== color) {
            bar.style.backgroundColor = color;
        }
    };
}

function scrollInFunctions(init = false)
{

    let wh = window.innerHeight;
    let dy = init == true ? -1 : window.pageYOffset + window.innerHeight / 2;

    scrollIn(dy, document.getElementById("me1"), scrollOpacity);
    scrollIn(dy, document.getElementById("me2"), scrollOpacity);
    scrollIn(dy, document.getElementById("me3"), scrollOpacity);

    scrollIn(dy, document.getElementById("me11"), scrollOpacity);
    scrollIn(dy, document.getElementById("me22"), scrollOpacity);
    scrollIn(dy, document.getElementById("me33"), scrollOpacity);

    scrollIn(dy, document.getElementById("area-3"), scrollDarken, -200, -200);

    scrollIn(dy, document.getElementById("area-5"), scrollDarken, -200, -200);

    scrollIn(dy,
             document.getElementById("area-4"),
             scrollNavbar("red"),
             wh / 2,
             wh / 2);
    scrollIn(dy,
             document.getElementById("area-3"),
             scrollNavbar("green"),
             wh / 2,
             wh / 2);
    scrollIn(dy,
             document.getElementById("area-2"),
             scrollNavbar("blue"),
             wh / 2,
             wh / 2);

    scrollIn(dy,
             document.getElementById("area-1"),
             scrollNavbar("black"),
             wh / 2,
             wh / 2);
}

scrollInFunctions(true);

window.addEventListener("scroll", scrollInFunctions);

let coords = listElementsCoords([
    document.getElementById("main-title"),
    document.getElementById("area-1"),
    document.getElementById("me1"),
    document.getElementById("me2"),
    document.getElementById("me3"),
    document.getElementById("me11"),
    document.getElementById("me22"),
    document.getElementById("me33"),
    document.getElementById("me40"),
    document.getElementById("me41"),
    document.getElementById("me50"),
    document.getElementById("me51"),
    document.getElementById("me52"),
    document.getElementById("me53"),

]);

let pos = 0;
let maxPos = coords.length - 1;
document.onkeydown = function(e) {
    if (e.keyCode == '39') {
        document.getElementById("carousel").setAttribute("paused", true);
        let p =
          coords[pos].top + coords[pos].height / 2 - window.innerHeight / 2;
        smoothScroll(window.scrollY, p, 3000, easeInBounce);
        pos = pos == maxPos ? 0 : pos + 1;
        document.getElementById("carousel").setAttribute("paused", false);
    }
};