import {
    affixer,
    debounce,
    easeInBounce,
    getOffset,
    listElementsCoords,
    scrollIn,
    sleep,
    slideToggle,
    smoothScroll,
    toggle,
    toggleOnce,
} from "./utils.js";

let cellStyle = getComputedStyle(document.getElementById("main-cell"));
let CELL_WIDTH = parseInt(cellStyle.width.replace("px", "")) + 100;
let CELL_HEIGHT = parseInt(cellStyle.height.replace("px", "")) + 100;

const SHUFFLE_COUNT = 3;
var index = 0;
var axis = "Y";
var cellAxis = CELL_WIDTH;

function rollCarousel()
{
    let mainCell = document.getElementById("main-cell");
    let carousel = document.getElementById("carousel");

    let cellCount = carousel.children.length;
    let alpha = (2 * Math.PI) / cellCount;
    let radius = ~~((cellAxis / 2) * (1 / Math.tan(Math.PI / cellCount)));

    for (let i = 0; i < carousel.children.length; i++) {
        let alpha_i = alpha * (i - index);
        let child = carousel.children[i];
        child.style.transform =
          `rotate${axis}(${alpha_i}rad) translateZ(${radius}px)`;
        if (i === index % cellCount) {
            child.setAttribute("id", "main-cell");
            child.style.opacity = `1`;
        } else {
            child.setAttribute("id", "");
            child.style.opacity = `${~~(1 / Math.cos(alpha_i))}%`;
        }
    }
    index++;
}

function transposeCarousel()
{
    let carousel = document.getElementById("carousel");
    let cellCount = carousel.children.length;
    let radius = (cellAxis / 2) * (1 / Math.tan(Math.PI / cellCount));

    if (axis == "X") {
        cellAxis = CELL_WIDTH;
        axis = "Y";
    } else {
        cellAxis = CELL_HEIGHT;
        axis = "X";
    }
    radius = (cellAxis / 2) * (1 / Math.tan(Math.PI / cellCount));
    rollCarousel();
    carousel.style.transform = `translateZ(${- radius}px)`;
}

async function shuffleCells()
{
    for (let i = 0; i < SHUFFLE_COUNT; i++) {
        transposeCarousel();
        await sleep(250);
    }
    transposeCarousel();
}

function distributeCards(origin, cards, delay, sx, sy, columns, deal = false)
{
    let originOffset = getOffset(origin);
    let cardOffset = getOffset(cards.children[0]);

    let x_inc = cardOffset.width + sx;
    let y_inc = cardOffset.height + sy;

    let x_0 = -x_inc;
    let y_0 = y_inc;

    let y = deal ? y_0 : 0;
    let x = deal ? x_0 : 0;

    let j = 0;

    for (let i = 0; i < cards.children.length; i++) {
        let child = cards.children[i];
        child.style.transitionDelay = `${delay * i}ms`;
        child.style.transform = `translate(${x}px, ${y}px)`;
    }
    // for (let i = 0; i < cards.children.length; i++) {
    //     let child = cards.children[i];
    //     child.style.transitionDelay = `${delay * i}ms`;
    //     child.style.transform = `translate(${x}px, ${y}px)`;
    //     j++;
    //     if (deal) {
    //         if (j > wrapAt - 1) {
    //             j = 0;
    //             y += y_inc;
    //             x = x_0;
    //         } else {
    //             x += x_inc;
    //         }
    //     } else {
    //         x = 0;
    //         y = 0;
    //     }
    // }
}

document.getElementById("start-btn").addEventListener("click", function(event) {
    let button = document.getElementById("start-btn");
    toggleOnce(button, function(el) { shuffleCells(); });

    let origin = document.getElementById("start-cards-container");
    let cards = document.getElementById("start-cards");

    let wrapAt = 3;
    let delay = 50;
    let sx = 25;
    let sy = 25;

    toggle(origin,
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, wrapAt, true);
           },
           function(el) {
               distributeCards(origin, cards, delay, sx, sy, wrapAt, false);
           });
});

document.getElementById("rotate-btn")
  .addEventListener("mousedown", function(event) { rollCarousel(); });

document.getElementById("transpose-btn")
  .addEventListener("mousedown", function(event) { transposeCarousel(); });

document.getElementById("shuffle-btn")
  .addEventListener("mousedown", function(event) { shuffleCells(); });

document.getElementById("fun-btn").addEventListener("click", function(event) {
    let origin = document.getElementById("fun-cards-container");
    let cards = document.getElementById("fun-cards");

    let wrapAt = 3;
    let delay = 50;
    let sx = 25;
    let sy = 50;

    toggle(origin,
           function(
             el) { distributeCards(cards, delay, sx, sy, wrapAt, true); },
           function(
             el) { distributeCards(cards, delay, sx, sy, wrapAt, false); });
});

document.getElementById("menu-icon")
  .addEventListener("mousedown", function(event) {
      this.classList.toggle("active");
      slideToggle("navbar-body");
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

function scrollDarken(el, v, inRange)
{
    let c = 220 * (1 - v);
    let c2 = 255 * v;
    if (inRange) {
        el.style.backgroundColor = `rgb(${c}, ${c}, ${c})`;
        el.style.color = `rgb(${c2}, ${c2}, ${c2})`;
        Array.from(el.querySelectorAll(":scope > p")).forEach((e, n) => {
            e.style.borderColor = "white";
            e.style.boxShadow = "6px 6px 6px 2px rgb(49, 49, 49)";
        });
    } else {
    }
}

window.addEventListener("scroll", function(event) {
    let scrollFunc = function(el, v, inRange) {
        if (inRange) {
            el.style.opacity = v;
            el.style.transform = ` translateY(${5 * v} px) `;
        } else {
            el.style.opacity = v;
        }
    };
    scrollIn(document.getElementById("me1"), scrollFunc);
    scrollIn(document.getElementById("me2"), scrollFunc);
    scrollIn(document.getElementById("me3"), scrollFunc, -100, -100);
    scrollIn(document.getElementById("me11"), scrollFunc);
    scrollIn(document.getElementById("me22"), scrollFunc);
    scrollIn(document.getElementById("me33"), scrollFunc);
    scrollIn(document.getElementById("area-3"), scrollDarken);
});

let coords = listElementsCoords([
    document.getElementById("me1"),
    document.getElementById("me2"),
    document.getElementById("me3"),
    document.getElementById("me11"),
    document.getElementById("me22"),
    document.getElementById("me33"),
    document.getElementById("area-1"),
    document.getElementById("area-2"),
    document.getElementById("area-3")
]);
let pos = 0;
let maxPos = coords.length - 1;
console.log(coords);
document.onkeydown = function(e) {
    if (e.keyCode == '39') {
        let p =
          coords[pos].top + coords[pos].height / 2 - window.innerHeight / 2;
        console.log(pos, p);
        smoothScroll(window.scrollY, p, 2000, easeInBounce);
        pos = pos == maxPos ? 0 : pos + 1;
    }
};