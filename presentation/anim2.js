import {Color, Mat3, Renderer, Transform, Vec3} from "./src/Core.js";
import {Polyline} from "./src/Extras.js";
import {fromRotation} from "./src/Math/functions/Mat3Func.js";
import {transformMat3} from './src/Math/functions/Vec3Func.js';
import {easeInBounce, interpColor, lerp as lerper} from "./utils.js";

const vertex = `
            precision highp float;

            attribute vec3 position;
            attribute vec3 next;
            attribute vec3 prev;
            attribute vec2 uv;
            attribute float side;

            uniform vec2 uResolution;
            uniform float uDPR;
            uniform float uThickness;

            vec4 getPosition() {
                vec4 current = vec4(position, 1);

                vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
                vec2 nextScreen = next.xy * aspect;
                vec2 prevScreen = prev.xy * aspect;
            
                // Calculate the tangent direction
                vec2 tangent = normalize(nextScreen - prevScreen);
            
                // Rotate 90 degrees to get the normal
                vec2 normal = vec2(-tangent.y, tangent.x);
                normal /= aspect;

                // Taper the line to be fatter in the middle, and skinny at the ends using the uv.y
                normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0) );

                // When the points are on top of each other, shrink the line to avoid artifacts.
                float dist = length(nextScreen - prevScreen);
                normal *= smoothstep(0.0, 0.02, dist);

                float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
                float pixelWidth = current.w * pixelWidthRatio;
                normal *= pixelWidth * uThickness;
                current.xy -= normal * side;
            
                return current;
            }

            void main() {
                gl_Position = getPosition();
            }
        `;

const renderer = new Renderer({dpr : 2});
const gl = renderer.gl;
document.getElementById("logo").appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 0);

const scene = new Transform();

const lines = [];

function resize()
{
    renderer.setSize(16 * 15, 16 * 15);

    // We call resize on the polylines to update their resolution uniforms
    lines.forEach((line) => line.polyline.resize());
}
window.addEventListener("resize", resize, false);

// Just a helper function to make the code neater
function random(a, b)
{
    const alpha = Math.random();
    return a * (1.0 - alpha) + b * alpha;
}

// If you're interested in learning about drawing lines with geometry,
// go through this detailed article by Matt DesLauriers
// https://mattdesl.svbtle.com/drawing-lines-is-hard
// It's an excellent breakdown of the approaches and their pitfalls.

// In this example, we're making screen-space polylines. Basically it
// involves creating a geometry of vertices along a path - with two vertices
// at each point. Then in the vertex shader, we push each pair apart to
// give the line some width.

// We're going to make a number of different coloured lines for fun.
interpColor([ "#c00", "white" ], 10, true, lerper).forEach((color, n) => {
    // Store a few values for each lines' spring movement
    const line = {
        spring : 0.03,
        friction : random(0.7, 0.95),
        mouseVelocity : new Vec3(),
        mouseOffset : new Vec3(n / 2)
    };

    // Create an array of Vec3s (eg [[0, 0, 0], ...])
    // Note: Only pass in one for each point on the line - the class will
    // handle the doubling of vertices for the polyline effect.
    const count = 50;
    const s = 10;
    const points = (line.points = []);
    for (let i = 0; i < count; i++)
        points.push(new Vec3(i * s, i * s, 1));

    // Pass in the points, and any custom elements - for example here
    // we've made custom shaders, and accompanying uniforms.
    line.polyline = new Polyline(gl, {
        points,
        vertex,
        uniforms :
          {uColor : {value : new Color(color)}, uThickness : {value : n * 3}}
    });

    line.polyline.mesh.setParent(scene);

    lines.push(line);
});

// Call initial resize after creating the polylines
resize();

// Add handlers to get mouse position
const mouse = new Vec3();
mouse.set((50 / gl.renderer.width) * 2 - 1,
          (50 / gl.renderer.height) * -2 + 1,
          0);

const tmp = new Vec3();

function bezierLerp(out, v1, v2, t)
{
    for (let i = 0; i < 3; i++) {
        out[i] = easeInBounce(t, v1[i], v2[i] - v1[i], 1);
    }
    return out;
}

requestAnimationFrame(update);
function update(t)
{

    requestAnimationFrame(update);

    lines.forEach((line, n) => {
        // Update polyline input points
        let r = (lines.length - (n + 1)) / 3;
        for (let i = line.points.length - 1; i >= 0; i--) {
            if (!i) {
                tmp.copy(mouse)
                  .add(line.mouseOffset)
                  .sub(line.points[i])
                  .multiply(line.spring);

                let tsr = fromRotation(new Mat3(), Math.PI * t / 180 / 4 * r);

                let rot = transformMat3(new Vec3(), tmp, tsr);

                // line.mouseVelocity.add();
                // line.points[i].add(line.mouseVelocity);
                line.points[i] = rot.multiply(new Vec3(4));

            } else {
                // The rest of the points ease to the point in front of
                // them, making a line
                line.points[i].lerp(line.points[i - 1], 0.9);
            }
        }
        line.polyline.updateGeometry();
    });
    renderer.render({scene});
}
