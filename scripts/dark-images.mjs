/**
 * Generates dark-theme variants of light screenshots and logos.
 *
 *   pnpm images:dark
 *
 * Each listed image gets a `<name>.dark.png` next to it, and
 * src/data/dark-images.json maps the light path to the dark one so
 * components can swap them on the `.dark` class.
 *
 * Lightness is inverted in OKLab, so white turns into the site's dark
 * background and dark text turns light, while hue and chroma are kept.
 * In screenshots, mid-to-light saturated colours (buttons, highlights,
 * avatars) keep most of their own lightness so they don't turn muddy.
 * Logos are inverted fully, so dark brand wordmarks become light ones.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Light images that need a dark twin. Paths are relative to public/. */
const IMAGES = [
  // Work logos: dark wordmarks on white tiles.
  { src: "/nory.png", kind: "logo" },
  { src: "/qonto.png", kind: "logo" },
  { src: "/kyso.png", kind: "logo" },
  { src: "/kantox.png", kind: "logo" },
  // Case study and project covers: light UI screenshots.
  { src: "/nory-cover.png", kind: "screenshot" },
  { src: "/nory-scheduling-cover.png", kind: "screenshot" },
  { src: "/nory-pay-cover.png", kind: "screenshot" },
  { src: "/qonto-cover.png", kind: "screenshot" },
  { src: "/case-studies/premium-pay-rates/rule-panel.png", kind: "screenshot" },
];

/** OKLab lightness that white and black land on: about the dark theme's card and foreground. */
const DARKEST = 0.2;
const LIGHTEST = 0.94;
/** In screenshots, colours above this chroma start keeping their own lightness... */
const CHROMA_FLOOR = 0.03;
/** ...fully so this much higher... */
const CHROMA_RANGE = 0.1;
/** ...unless they are darker than this, like near-black brand text, which still inverts. */
const DARK_KEEP_BELOW = 0.35;

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const publicDir = path.join(root, "public");

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function darken(r8, g8, b8, kind) {
  const r = toLinear(r8 / 255);
  const g = toLinear(g8 / 255);
  const b = toLinear(b8 / 255);

  // sRGB → OKLab (Björn Ottosson).
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const inverted = DARKEST + (1 - L) * (LIGHTEST - DARKEST);
  const keep =
    kind === "logo"
      ? 0
      : clamp01((Math.hypot(A, B) - CHROMA_FLOOR) / CHROMA_RANGE) * clamp01((L - DARK_KEEP_BELOW) / 0.2);
  const L2 = inverted + (L - inverted) * keep;

  // OKLab → sRGB.
  const l2 = (L2 + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m2 = (L2 - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s2 = (L2 - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2,
    -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2,
    -0.0041960863 * l2 - 0.7034186147 * m2 + 1.707614701 * s2,
  ].map((c) => Math.round(clamp01(toSrgb(clamp01(c))) * 255));
}

const manifest = {};
for (const { src, kind } of IMAGES) {
  const input = path.join(publicDir, src);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = darken(data[i], data[i + 1], data[i + 2], kind);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  const out = src.replace(/\.(png|jpe?g)$/i, ".dark.png");
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(path.join(publicDir, out));
  manifest[src] = out;
  console.log(`${src} → ${out}`);
}

await writeFile(path.join(root, "src/data/dark-images.json"), `${JSON.stringify(manifest, null, 2)}\n`);
