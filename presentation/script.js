import {
    affixer,
    debounce,
    distributeCards,
    easeInBounce,
    easeInQuad,
    getOffset,
    initCarousel,
    listElementsCoords,
    rollCarousel,
    round,
    scrollIn,
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
shuffleCarousel(carousel, 1);

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
    }, 5000);
}

requestAnimationFrame(rollingCarousel);

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
        el.style.transform = `translateY(${10 * v}px)`;
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

 
    let dy = init == true ? -1 : window.pageYOffset + window.innerHeight / 2;

    scrollIn(dy, document.getElementById("a20"), scrollOpacity);
    scrollIn(dy, document.getElementById("a21"), scrollOpacity);
    scrollIn(dy, document.getElementById("a22"), scrollOpacity);

    scrollIn(dy, document.getElementById("a30"), scrollOpacity);
    scrollIn(dy, document.getElementById("a31"), scrollOpacity);
    scrollIn(dy, document.getElementById("a32"), scrollOpacity);

    scrollIn(dy, document.getElementById("area-3"), scrollDarken, -500, -500);
    scrollIn(dy, document.getElementById("area-5"), scrollDarken, -1500, -1500);

    // scrollIn(dy, document.getElementById("a50"), scrollOpacity);
    // scrollIn(dy, document.getElementById("a51"), scrollOpacity);
    // scrollIn(dy, document.getElementById("a52"), scrollOpacity);
    // scrollIn(dy, document.getElementById("a53"), scrollOpacity);
    // scrollIn(dy, document.getElementById("a54"), scrollOpacity);
    scrollIn(dy, document.getElementById("a55"), scrollOpacity);

    scrollIn(dy, document.getElementById("a60"), scrollOpacity);
    scrollIn(dy, document.getElementById("a61"), scrollOpacity);

    // scrollIn(dy,
    //          document.getElementById("area-4"),
    //          scrollNavbar("red"),
    //          wh / 2,
    //          wh / 2);
    // scrollIn(dy,
    //          document.getElementById("area-3"),
    //          scrollNavbar("green"),
    //          wh / 2,
    //          wh / 2);
    // scrollIn(dy,
    //          document.getElementById("area-2"),
    //          scrollNavbar("blue"),
    //          wh / 2,
    //          wh / 2);

    // scrollIn(dy,
    //          document.getElementById("area-1"),
    //          scrollNavbar("black"),
    //          wh / 2,
    //          wh / 2);
}

scrollInFunctions(true);

window.addEventListener("scroll", scrollInFunctions);

let coords = listElementsCoords([
    document.getElementById("main-title"),
    document.getElementById("area-1"),
    document.getElementById("a20"),
    document.getElementById("a21"),
    document.getElementById("a22"),
    document.getElementById("a30"),
    document.getElementById("a31"),
    document.getElementById("a32"),
    document.getElementById("a40"),
    document.getElementById("a50"),
    document.getElementById("a53"),
    document.getElementById("a60"),
    document.getElementById("a61"),

]);

let pos = 0;
let maxPos = coords.length - 1;
document.onkeydown = function(e) {
    if (e.keyCode == '13') {
        document.getElementById("carousel").setAttribute("paused", true);
        let p =
          coords[pos].top + coords[pos].height / 2 - window.innerHeight / 2;
        smoothScroll(window.scrollY, p, 3000, easeInBounce);
        pos = pos == maxPos ? 0 : pos + 1;
    }
};