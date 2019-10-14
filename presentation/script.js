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
    scrollIn,
    shuffleCarousel,
    sleep,
    slideToggle,
    smoothScroll,
    toggle,
    toggleOnce,
    transposeCarousel
} from "./utils.js";

window.onbeforeunload =
  function() {
    window.scrollTo(0, 0);
}

  document.getElementById("start-btn")
    .addEventListener("click", function(event) {
        let button = document.getElementById("start-btn");
        let carousel = document.getElementById("carousel");

        toggleOnce(button, function(el) {
            initCarousel(carousel);
            shuffleCarousel(carousel, 3);
        });

        let origin = document.getElementById("start-cards-container");
        let cards = document.getElementById("start-cards");

        let columns = 3;
        let delay = 50;
        let sx = 25;
        let sy = 15;

        toggle(origin,
               function(el) {
                   distributeCards(origin, cards, delay, sx, sy, columns, true);
               },
               function(el) {
                   distributeCards(origin,
                                   cards,
                                   delay,
                                   sx,
                                   sy,
                                   columns,
                                   false);
               });
    });

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
    if (dy >= min & dy <= max) {
        let c = 220 * (1 - v);
        let c2 = 255 * v;
        el.style.backgroundColor = `rgb(${c}, ${c}, ${c})`;
        el.style.color = `rgb(${c2}, ${c2}, ${c2})`;
        // el.style.borderColor = "white";
        Array.from(el.querySelectorAll(":scope > .content-cell"))
          .forEach((e, n) => {
              e.style.borderColor = "white";
              e.style.boxShadow = "6px 6px 6px 2px rgb(49, 49, 49)";
          });
        Array.from(el.querySelectorAll(":scope > .title-content-md"))
          .forEach((e, n) => { e.style.color = `rgb(${c2}, ${c2}, ${c2})`; });
    }
}

function scrollOpacity(el, v, dy, min, max)
{
    if (dy >= min && dy <= max) {
        v = Math.round(10 * v) / 10;
        el.style.opacity = v;
        el.style.transform = ` translateY(${5 * v} px) `;
    }
}

function scrollNavbar(color)
{
    return function _scrollNavbar(el, v, dy, min, max) {
        let bar = document.getElementById("navbar-body");
        if (dy >= min && dy <= max && bar.style.backgroundColor !== color) {
            bar.style.backgroundColor = color;
        }
    };
}

function scrollInFunctions()
{
    let wh = window.innerHeight;
    scrollIn(document.getElementById("me1"), scrollOpacity);
    scrollIn(document.getElementById("me2"), scrollOpacity);
    scrollIn(document.getElementById("me3"), scrollOpacity);

    scrollIn(document.getElementById("me11"), scrollOpacity);
    scrollIn(document.getElementById("me22"), scrollOpacity);
    scrollIn(document.getElementById("me33"), scrollOpacity);

    scrollIn(document.getElementById("area-3"), scrollDarken, -1000, -1000);

    scrollIn(document.getElementById("area-4"),
             scrollNavbar("red"),
             wh / 2,
             wh / 2);
    scrollIn(document.getElementById("area-3"),
             scrollNavbar("green"),
             wh / 2,
             wh / 2);
    scrollIn(document.getElementById("area-2"),
             scrollNavbar("blue"),
             wh / 2,
             wh / 2);

    scrollIn(document.getElementById("area-1"),
             scrollNavbar("black"),
             wh / 2,
             wh / 2);
}

scrollInFunctions();

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
    document.getElementById("area-2"),
    document.getElementById("area-3"),
    document.getElementById("area-4")
]);

let pos = 0;
let maxPos = coords.length - 1;
document.onkeydown = function(e) {
    if (e.keyCode == '39') {
        let p = coords[pos].top + coords[pos].height / 2 -
                window.innerHeight / 2 + 100;
        console.log(p)
        smoothScroll(window.scrollY, p, 2000, easeInBounce);
        pos = pos == maxPos ? 0 : pos + 1;
    }
};