export {
    affixer,
    debounce,
    distributeCards,
    easeInBounce,
    easeInQuad,
    getOffset,
    initCarousel,
    interpColor,
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
};

if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range
     * of characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to
     *   remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return (this.slice(0, start) + newSubStr +
                this.slice(start + Math.abs(delCount)));
    };
}

function initCarousel(carousel)
{
    if (!carousel.getAttribute("cell-height")) {
        let cellStyle = getComputedStyle(carousel.children[0]);
        let cellWidth = parseInt(cellStyle.width.replace("px", "")) + 100;
        let cellHeight = parseInt(cellStyle.height.replace("px", "")) + 100;
        carousel.setAttribute("cell-height", cellHeight);
        carousel.setAttribute("cell-width", cellWidth);
        carousel.setAttribute("index", 0);
        carousel.setAttribute("cell-axis", cellHeight);
        carousel.setAttribute("axis", "y");
        carousel.setAttribute("paused", false);
    }
}

function rollCarousel(carousel)
{
    let cellCount = carousel.children.length;

    let index = parseInt(carousel.getAttribute("index"));
    let cellAxis = parseInt(carousel.getAttribute("cell-axis"));
    let axis = carousel.getAttribute("axis");

    let radius =
      Math.floor((cellAxis / 2) * (1 / Math.tan(Math.PI / cellCount)));
    let alpha = (2 * Math.PI) / cellCount;

    for (let i = 0; i < carousel.children.length; i++) {
        let alpha_i = alpha * (index - i);

        let child = carousel.children[i];
        child.style.transform =
          `rotate${axis}(${alpha_i}rad) translateZ(${radius}px)`;

        if (i === index % cellCount) {
            child.setAttribute("id", "main-cell");
            child.style.opacity = `1`;
        } else {
            child.setAttribute("id", "");
            child.style.opacity = `${1 / Math.cos(alpha_i)}%`;
        }
    }
    carousel.setAttribute("index", `${++index}`);
}

function transposeCarousel(carousel)
{
    let cellCount = carousel.children.length;
    let cellHeight = carousel.getAttribute("cell-height");
    let cellWidth = carousel.getAttribute("cell-width");
    let cellAxis = carousel.getAttribute("cell-axis");
    let axis = carousel.getAttribute("axis");

    if (axis == "x") {
        cellAxis = cellWidth;
        axis = "y";
    } else {
        cellAxis = cellHeight;
        axis = "x";
    }

    carousel.setAttribute("cell-axis", cellAxis);
    carousel.setAttribute("axis", axis);

    let radius = Math.floor((parseInt(cellAxis) / 2) *
                            (1 / Math.tan(Math.PI / cellCount)));

    rollCarousel(carousel);

    carousel.style.transform = `translateZ(${- radius}px)`;
}

async function shuffleCarousel(carousel, shuffleCount)
{
    for (let i = 0; i < shuffleCount; i++) {
        transposeCarousel(carousel);
        await sleep(250);
    }
    transposeCarousel(carousel);
}

function sleep(ms)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function toggle(el, firstCallback, secondCallback)
{
    let toggled = el.getAttribute("toggled") === "true";
    if (!toggled) {
        firstCallback(el);
    } else {
        secondCallback(el);
    }
    el.setAttribute("toggled", !toggled);
    return;
}

function toggleOnce(el, firstCallback)
{
    let toggled = el.getAttribute("toggled") === "true";
    if (!toggled) {
        firstCallback(el);
        el.setAttribute("toggled", true);
    }
    return;
}

function slideToggle(el)
{
    let slideHeight;
    if (!el.getAttribute("slide-height")) {
        el.style.height = "100%";
        slideHeight = getOffset(el).height;
        el.setAttribute("slide-height", slideHeight);
        el.style.height = `${slideHeight}px`;

        return;
    } else {
        slideHeight = el.getAttribute("slide-height");
    }

    if (el.style.height === "0px") {
        requestAnimationFrame(() => { el.style.height = `${slideHeight}px`; });
        el.style.overflow = "visible";

    } else {
        requestAnimationFrame(() => {
            el.style.height = 0;
            el.style.overflow = "hidden";
        });
    }
}

function DeCasteljau(t, points)
{
    let dp = new Map();

    function _DeCasteljau(t, points, ix1, ix2, n)
    {
        let k = `${n}${ix1}${ix2}`;

        if (dp.has(k)) {
            return dp.get(k);
        }

        let b0, b1;

        if (n == 1) {
            b0 = points[ix1];
            b1 = points[ix2];
        } else {
            n--;
            b0 = _DeCasteljau(t, points, ix1, ix2, n);
            b1 = _DeCasteljau(t, points, ix2, ix2 + 1, n);
        }
        let v = (1 - t) * b0 + t * b1;
        dp.set(k, v);

        return v;
    }
    return _DeCasteljau(t, points, 0, 1, points.length - 1);
}

function cubicBezier(t, x1, y1, x2, y2)
{
    return [
        DeCasteljau(t, [ 0, x1, x2, 1 ]),
        DeCasteljau(t, [ 0, y1, y2, 1 ])
    ];
}

function wrap(toWrap, wrapper)
{
    let wrapped = toWrap.parentNode.insertBefore(wrapper, toWrap);
    return wrapped.appendChild(toWrap);
}

function affixer(preAffixFunc, postAffixFunc)
{
    const offsets = [];

    document.querySelectorAll(".affix").forEach((el, n) => {
        let offset = getOffset(el);
        offsets.push(offset);
        let wrapped = document.createElement("div");

        wrapped.style.height = `${offset.height}px`;
        wrapped.style.width = `${offset.width}px`;
        // wrapped.style.marginTop = `${offset.top}px`;

        wrap(el, wrapped);
    });

    window.addEventListener("resize", function(e) { scrollAffix(); });

    window.addEventListener("scroll", scrollAffix);
    function scrollAffix()
    {
        document.querySelectorAll(".affix").forEach((el, n) => {
            let affixY = offsets[n].top;

            if (self.pageYOffset > affixY) {
                preAffixFunc(el, n);
                el.style.zIndex = 999;
                el.style.position = "fixed";
                el.style.top = `${0}px`;
                el.style.width = `${window.innerWidth - 2 * offsets[n].left}px`;

            } else {
                postAffixFunc(el, n);
                el.style.top = `${0}px`;
                el.style.position = "relative";
                el.style.width = `${window.innerWidth - 2 * offsets[n].left}px`;
            }
        });
    }
}

function distributeCards(origin,
                         cards,
                         delay,
                         sx,
                         sy,
                         columns,
                         deal = false,
                         spacing = "auto")
{
    let maxWidth = 0;
    let maxHeight = 0;

    Array.from(cards.children).forEach((child, n) => {
        let offset = getOffset(child);
        maxWidth = offset.width > maxWidth ? offset.width : maxWidth;
        maxHeight = offset.height > maxHeight ? offset.height : maxHeight;
    });

    let originOffset = getOffset(origin);
    let ds = (originOffset.width - maxWidth) / 2;

    let dx = maxWidth + sx;
    let dy = maxHeight + sy;
    let x0 = -dx * (columns - 1) / 2 + ds;
    let y0 = originOffset.height + sy;

    let x = x0;
    let y = y0;
    if (!deal) {
        x = ds;
        y = 0;
    }

    let i = 1;

    Array.from(cards.children).forEach((child, n) => {
        child.style.transitionDelay = `${delay * n}ms`;
        child.style.transform = `translate(${x}px, ${y}px)`;

        if (deal) {
            child.style.opacity = 1;

            if (i > columns - 1) {
                x = x0;
                y += spacing === "auto" ? getOffset(child).height + sy : dy;
                i = 0;
            } else {
                x += spacing === "auto" ? getOffset(child).width + sx : dx;
            }
        } else {
            child.style.opacity = 0;
        }
        i++;
    });
}

function debounce(func, wait, immediate)
{
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}

function easeInBounce(t, b, c, d)
{
    t = cubicBezier(t / d, 0.09, 0.91, 0.5, 1.5)[1];
    return c * t + b;
}

function bounceInEase(t, b, c, d)
{
    t = cubicBezier(t / d, 0.19, -0.53, 0.83, 0.67)[1];
    return c * t + b;
}

function easeInQuad(t, b, c, d)
{
    return c * (t /= d) * t + b;
}

function easeOutQuad(t, b, c, d)
{
    return -c * (t /= d) * (t - 2) + b;
}

function easeInOutQuad(t, b, c, d)
{
    if ((t /= d / 2) < 1)

        return (c / 2) * t * t + b;
    return (-c / 2) * (--t * (t - 2) - 1) + b;
}

function easeInCubic(t, b, c, d)
{
    return c * (t /= d) * t * t + b;
}

function easeOutCubic(t, b, c, d)
{
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function easeInOutCubic(t, b, c, d)
{
    if ((t /= d / 2) < 1)
        return (c / 2) * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
}

function smoothStep3(t, b, c, d)
{
    t /= d;
    return c * Math.pow(t, 2) * (3 - 2 * t) + b;
}

function lerp(v0, v1, t)
{
    return (1 - t) * v0 + t * v1;
}

function logerp(v0, v1, t)
{
    v0 = v0 === 0 ? 1e-9 : v0;
    let tt = v0 * Math.pow(v1 / v0, t);
    return tt;
}

function clamp(x, lowerLimit, upperLimit)
{
    if (x < lowerLimit) {
        return lowerLimit;
    } else if (x > upperLimit) {
        return upperLimit;
    }
    return x;
}

function toBase(num, base)
{
    let digits = [];
    while (num !== 0) {
        num = (num / base) >> 0;
        digits.push(num % base);
    }
    if (base === 10) {
        let based = 0;
        digits.forEach(
          (value, index) => { based += value * Math.pow(10, index); });
        return based;
    } else {
        let based = "";
        digits.reverse().forEach((value, index) => { based += value; });
        return based;
    }
}

function hexToRGB(num, alpha = 1)
{
    let rgbInt = parseInt(num, 16);
    let r = (rgbInt >> 16) & 255;
    let g = (rgbInt >> 8) & 255;
    let b = rgbInt & 255;
    return [ r, g, b, alpha ];
}

function RGBAToHex(num)
{
    let [r, g, b, a] = num;
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function colorToRGBA(color)
{
    let canvas = document.createElement("canvas");
    canvas.height = 1;
    canvas.width = 1;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
}

function parseColor(color)
{
    let pcolor;
    if (typeof color === "string") {
        if (color[0] === "#") {
            color = color.slice(1);

            if (color.length == 3) {
                let len = color.length;
                let i = 0;
                do {
                    let c = color[i];
                    color = color.splice(i, 0, c);
                    i += 2;
                } while (++len < 6);
            }
            pcolor = hexToRGB(color);
        } else if (color.indexOf("rgb") !== -1) {
            let num = color.split("(")[1].split(")")[0];
            let pnum = num.split(",");
            if (pnum.length === undefined || 0) {
                pnum = num.split(" ");
                if (pnum.length === undefined || 0) {
                    throw new Error("Color is of an undefined type.");
                }
            }
            pcolor = pnum.map((value, index) => {
                value = parseInt(value);
                return value;
            });
        } else {
            pcolor = colorToRGBA(color);
        }
    } else {
        pcolor = color;
    }
    if (pcolor instanceof Array) {
        let len = pcolor.length;
        let diff = 4 - len;
        if (diff > 0) {
            pcolor = pcolor.concat(new Array(diff).fill(1));
        } else if (diff < 0) {
            pcolor.length = 4;
        }
    } else {
        throw new Error("Color is of an undefined type.");
    }
    return pcolor;
}

function interpColor(colors, steps = 2, endPoints = true, interpFunc = lerp)
{
    let palettes = new Array((colors.length - 1) * steps).fill(0);
    colors.forEach((value, index) => { colors[index] = parseColor(value); });
    let i = 0;
    for (let [n, color] of colors.entries()) {
        if (n < colors.length - 1) {
            let [r1, g1, b1, a1] = color;
            let [r2, g2, b2, a2] = colors[n + 1];

            for (let m = endPoints & (n === 0) ? 0 : 1; m <= steps; m++) {
                if (m === steps && n === colors.length - 2 && !endPoints)
                    break;
                let t = m / steps;
                let ri = Math.ceil(interpFunc(r1, r2, t));
                let gi = Math.ceil(interpFunc(g1, g2, t));
                let bi = Math.ceil(interpFunc(b1, b2, t));
                let ai = interpFunc(a1, a2, t);
                ai = ai > 1 ? Math.ceil(ai) : ai;

                let colorString = ` rgba(${ri}, ${gi}, ${bi}, ${ai}) `;
                palettes[i++] = RGBAToHex(parseColor(colorString));
            }
        } else {
            break;
        }
    }
    return palettes;
}

function averageColorDelta(colors)
{
    let len = colors.length;
    let r_avg = 0;
    let g_avg = 0;
    let b_avg = 0;
    let a_avg = 0;

    for (let [i, j] of colors) {
        let [rd, gd, bd, ad] = operateColor(parseColor(i),
                                            parseColor(j),
                                            (x, y) => { return y - x; });
        r_avg += rd;
        g_avg += gd;
        b_avg += bd;
        a_avg += ad;
    }
    r_avg = ~~(r_avg / len);
    g_avg = ~~(g_avg / len);
    b_avg = ~~(b_avg / len);
    a_avg = ~~(a_avg / len);
    return [ r_avg, g_avg, b_avg, 0 ];
}

function operateColor(c1, c2, op = (x, y) => { return x + y; })
{
    color1 = parseColor(c1);
    color2 = parseColor(c2);
    color3 = [ 0, 0, 0, 0 ];

    for (let i = 0; i < color1.length; i++) {
        color3[i] = op(color1[i], color2[i]);
    }
    return color3;
}

function colorDeltaFromData(color, data)
{
    avg = averageColorDelta(data);
    altColor = operateColor(avg, color);
    return altColor;
}

function RGBAToString(color)
{
    return ` rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]}) `;
}

class Clock
{
    constructor(autoStart = true, timeStep = 1000 / 60)
    {
        this.autoStart = autoStart;
        this.timeStep = Math.floor(timeStep);
    }
    start()
    {
        this.startTime =
          (typeof performance === "undefined" ? Date : performance).now();
        this.prevTime = this.startTime;
        this.elapsedTime = 0;
        this.elapsedTicks = 0;
        this.running = true;
        this.delta = 0;
    }
    stop() { this.running = false; }
    reset() { this.start(); }
    tick()
    {
        this.delta = 0;
        if (this.autoStart && !this.running) {
            this.start();
        } else if (this.running) {
            let currentTime =
              (typeof performance === "undefined" ? Date : performance).now();
            this.delta = currentTime - this.prevTime;
            this.prevTime = currentTime;
            this.elapsedTime += this.delta;
            this.elapsedTicks += this.timeStep;
        }
        return this.delta;
    }
}

function smoothScroll(from, target, duration, timingFunction = smoothStep3)
{
    duration = Math.ceil(duration);

    if (duration <= 0) {
        return;
    }

    let bodyOffset = getOffset(document.body);
    let minHeight = 0;
    let maxHeight = bodyOffset.height;

    let to = Math.ceil(target);
    from = Math.ceil(from);
    let distance = to - from;

    var clock = new Clock();

    function update() {}

    function draw()
    {
        let v = Math.floor(
          timingFunction(clock.elapsedTicks, from, distance, duration));
        window.scroll(0, v);
        if (v <= 0 || v >= maxHeight) {
            return true;
        }
        return false;
    }

    function animationLoop()
    {
        clock.tick();

        let delta = clock.delta;
        let updateSteps = 0;
        let force = false;

        while (delta >= clock.timeStep) {
            delta -= clock.timeStep;
            clock.tick();

            update();
            if (updateSteps++ >= 120) {
                break;
            }
        }
        force = draw();
        if (force || clock.elapsedTicks / duration > 1) {
            return true;
        } else {
            requestAnimationFrame(animationLoop);
        }
    }
    clock.start();
    requestAnimationFrame(animationLoop);
}

function getOffset(el)
{
    const rect = el.getBoundingClientRect();
    return {
        left : rect.left + window.scrollX,
        top : rect.top + window.scrollY,
        width : rect.width,
        height : rect.height
    };
}

function round(n, d, mode = 0)
{
    let ten = Math.pow(10, d);
    let v = 0;
    if (mode === 0) {
        v = Math.round(n * ten);
    } else if (mode === 1) {
        v = Math.ceil(n * ten);
    } else if (mode === 2) {
        v = Math.floor(n * ten);
    }
    return v / ten;
}

function scrollInPreamble(elementNode, offsetMin, offsetMax, force = false)
{
    if ((!elementNode.hasAttribute("scroll-in-min") && !force) &&
        (!elementNode.getAttribute("scroll-in-max") && !force)) {
        let elementOffset = getOffset(elementNode);
        let min = elementOffset.top + offsetMin;
        let max = elementOffset.top + elementOffset.height / 2 + offsetMax;
        elementNode.setAttribute("scroll-in-min", round(min, 2));
        elementNode.setAttribute("scroll-in-max", round(max, 2));
        return true;
    }
    return false;
}

function scrollIn(dy,
                  elementNode,
                  scrollFunc,
                  offsetMin = 0,
                  offsetMax = 0,
                  limitingNode = null)
{
    if (dy == -1) {
        scrollInPreamble(elementNode, offsetMin, offsetMax);
        requestAnimationFrame(
          function() { scrollFunc(elementNode, 0, dy, 0, 100000); });

        return false;
    }

    let min = parseFloat(elementNode.getAttribute("scroll-in-min"));
    let max = parseFloat(elementNode.getAttribute("scroll-in-max"));

    let limitingOffset = getOffset(limitingNode || document.body);
    let tMax =
      limitingOffset.top + limitingOffset.height - window.innerHeight / 2;

    if (max >= tMax) {
        let delta = max - tMax;
        min -= delta;
        max = tMax;
    }

    if (dy <= min) {
        requestAnimationFrame(
          function() { scrollFunc(elementNode, 0, dy, min, max); });
        return true;
    } else {

        let v = (dy >= min) ? (clamp(dy, min, max) - min) / (max - min) : 0;

        requestAnimationFrame(
          function() { scrollFunc(elementNode, v, dy, min, max); });
        return false;
    }
}

function listElementsCoords(elements)
{
    let coords = [];
    for (let i of elements) {
        coords.push(getOffset(i));
    }
    return coords;
}
