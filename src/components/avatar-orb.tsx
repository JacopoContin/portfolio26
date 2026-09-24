"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * The portfolio hero orb (OrbSun / OrbDark), redrawn in the language of the
 * page's FlickeringGrid: soft blobs orbit the avatar edge and flares travel
 * outward, but the result is only ever shown as 2px squares on the grid's
 * 4px lattice, each flickering on its own. Plain WebGL, one full-canvas quad.
 */

// Width of the avatar's ring-2 border, which the glow starts outside of.
const RING_PX = 2;
// Matches the hero FlickeringGrid (squareSize 2, gridGap 2).
const SQUARE_PX = 2;
const PITCH_PX = 4;

const PALETTES = {
  // OrbSun: amber, burnt orange, golden yellow, pale gold, cream gold
  light: ["#e8900a", "#f06f18", "#f0b030", "#f8d060", "#fce890"],
  // OrbDark: warm, coral, violet, azure, yellow
  dark: ["#e8a358", "#d9564a", "#7a5cc9", "#4a7bc9", "#f5c94a"],
} as const;

const VERT = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;

  uniform vec2  uRes;      // canvas size, device px
  uniform float uDpr;
  uniform vec2  uOffset;   // canvas top-left in page coordinates, CSS px
  uniform float uTime;
  uniform float uR;        // avatar edge radius, CSS px
  uniform float uStrength; // peak square opacity
  uniform float uSquare;   // square size, CSS px
  uniform float uPitch;    // square + gap, CSS px
  uniform vec3  uC0;
  uniform vec3  uC1;
  uniform vec3  uC2;
  uniform vec3  uC3;
  uniform vec3  uC4;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // The hero's blob: an ellipse aligned to its orbit angle, stretched radially.
  float blob(vec2 p, vec2 center, float radius, float stretch, float angle) {
    vec2 d = p - center;
    float c = cos(-angle);
    float s = sin(-angle);
    vec2 dr = vec2(c * d.x - s * d.y, s * d.x + c * d.y);
    float perp = mix(1.0, 0.45, smoothstep(1.0, 4.0, stretch));
    dr.x /= stretch;
    dr.y /= perp;
    return 1.0 - smoothstep(0.0, radius, length(dr));
  }

  vec2 dir(float a) { return vec2(cos(a), sin(a)); }

  void main() {
    // Page-space CSS px, so squares sit on the same lattice as the hero grid.
    vec2 local = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
    vec2 page = local + uOffset;
    vec2 cell = floor(page / uPitch);
    vec2 inCell = page - cell * uPitch;
    if (inCell.x >= uSquare || inCell.y >= uSquare) discard;

    // Evaluate the orb once per square, at its centre, so each square is flat.
    vec2 halfSize = uRes / (2.0 * uDpr);
    vec2 p = (cell * uPitch + uSquare * 0.5 - uOffset) - halfSize;
    float d = length(p);
    if (d < uR) discard;

    float t = uTime * 0.35;
    vec3 col = vec3(0.0);
    float total = 0.0;
    float glow = 0.0;

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      // Orbit speeds and phases from the hero.
      float speed = i == 0 ? 0.20 : i == 1 ? 0.18 : i == 2 ? 0.22 : i == 3 ? 0.16 : i == 4 ? 0.24 : 0.19;
      float a = t * speed + fi * 1.05;
      vec3 c = i == 0 ? uC0 : i == 1 ? uC1 : i == 2 ? uC2 : i == 3 ? uC3 : i == 4 ? uC4 : uC1;

      // Resting mass: large overlapping blobs on the edge, as in the hero.
      float size = uR * (0.75 + 0.1 * sin(t * (0.6 + fi * 0.05) + fi));
      float g = blob(p, dir(a) * uR, size, 1.0, a);

      // Flare: each blob emits a burst that leaves the edge and travels
      // outward while it thins and fades. Staggered so one fires every ~2s.
      float prog = fract(uTime * 0.08 + fi / 6.0);
      float life = smoothstep(0.0, 0.08, prog) * pow(1.0 - prog, 1.5);
      vec2 bc = dir(a) * uR * (1.05 + prog * 0.75);
      float b = blob(p, bc, uR * 0.3, 2.2, a) * life;

      col += c * (g + b);
      total += g + b;
      glow += g * 0.55 + b;
    }
    if (total < 0.001) discard;
    col /= total;

    float fade = 1.0 - smoothstep(uR * 1.05, uR * 1.85, d);
    float coverage = min(glow, 1.0) * fade;

    // Each square flickers on its own schedule, like the FlickeringGrid.
    float tick = floor(uTime * 0.6 + hash(cell) * 7.0);
    float flicker = mix(0.25, 1.0, hash(cell + tick * 17.0));

    float alpha = coverage * flicker * uStrength;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function AvatarOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  // Lets the render loop pick up theme changes without restarting WebGL.
  const themeRef = useRef(isDark);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    themeRef.current = isDark;
    redrawRef.current();
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!canvas || !gl) return;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vert || !frag || !program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes");
    const uDpr = u("uDpr");
    const uOffset = u("uOffset");
    const uTime = u("uTime");
    const uR = u("uR");
    const uStrength = u("uStrength");
    const uColors = ["uC0", "uC1", "uC2", "uC3", "uC4"].map(u);
    gl.uniform1f(u("uSquare"), SQUARE_PX);
    gl.uniform1f(u("uPitch"), PITCH_PX);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, canvas.width / rect.width);
      // The avatar fills the parent box; the canvas overhangs it on every side.
      const avatarRadius = (canvas.parentElement?.parentElement?.clientWidth ?? 0) / 2;
      gl.uniform1f(uR, avatarRadius + RING_PX);
    };

    const start = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      // Measured every frame: the hero's entrance animation moves the avatar
      // without resizing it, and the squares must stay on the page grid.
      const rect = canvas.getBoundingClientRect();
      gl.uniform2f(uOffset, rect.left + window.scrollX, rect.top + window.scrollY);
      const dark = themeRef.current;
      PALETTES[dark ? "dark" : "light"].forEach((hex, i) => gl.uniform3fv(uColors[i], hexToRgb(hex)));
      gl.uniform1f(uStrength, dark ? 0.7 : 0.6);
      // A still frame under reduced motion.
      gl.uniform1f(uTime, reducedMotion ? 30 : (performance.now() - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    redrawRef.current = draw;

    let frame = 0;
    let visible = true;
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion) draw();
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const relayout = () => {
      resize();
      draw();
    };

    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(canvas);
    // The canvas can move without resizing (centred layout), which shifts the
    // grid alignment, so re-measure on window resize too.
    window.addEventListener("resize", relayout);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", play);

    resize();
    play();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", relayout);
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", play);
      redrawRef.current = () => {};
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute -inset-16" aria-hidden>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
