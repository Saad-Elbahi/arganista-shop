// Real product photos → single-product studio shots on seamless white.
// 1) Apple Vision gives the foreground mask of the whole group (full/pN_all.png)
// 2) a traced outline of the front product keeps only that one item
// 3) colour correction, then white seamless backdrop + contact shadow + reflection
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname; // expects full/ (uncropped masks) and cut/ (cropped cut-outs)
const OUT = path.join(__dirname, '..', '..', 'public', 'images', 'catalog');
fs.mkdirSync(OUT, { recursive: true });
const W = 1200, H = 1500;

const dropper = ({ bulb: [bx0, bx1, bt, bb], collar: [cx0, cx1, ct, cb], neck: [nx0, nx1], shoulderY: sY, body: [x0, x1, bottom] }) => {
  const r = (bx1 - bx0) / 2, k = sY - cb;
  return `<rect x="${bx0}" y="${bt}" width="${bx1 - bx0}" height="${bb - bt + 20}" rx="${r}" ry="${r}"/>
    <rect x="${cx0}" y="${ct}" width="${cx1 - cx0}" height="${cb - ct}" rx="4"/>
    <path d="M${nx0} ${cb - 2} C${nx0} ${cb + k * 0.55} ${x0} ${cb + k * 0.35} ${x0} ${sY} L${x0} ${bottom - 14} Q${x0} ${bottom} ${x0 + 14} ${bottom} L${x1 - 14} ${bottom} Q${x1} ${bottom} ${x1} ${bottom - 14} L${x1} ${sY} C${x1} ${cb + k * 0.35} ${nx1} ${cb + k * 0.55} ${nx1} ${cb - 2} Z"/>`;
};
const pump = ({ head: [hx0, hx1, hy0, hy1], stem: [sx0, sx1, sy0, sy1], collar: [cx0, cx1, cy0, cy1], body: [x0, x1, top, bottom] }) =>
  `<rect x="${hx0}" y="${hy0}" width="${hx1 - hx0}" height="${hy1 - hy0}" rx="12"/>
   <rect x="${sx0}" y="${sy0}" width="${sx1 - sx0}" height="${sy1 - sy0}"/>
   <rect x="${cx0}" y="${cy0}" width="${cx1 - cx0}" height="${cy1 - cy0}" rx="6"/>
   <rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bottom - top}" rx="26"/>`;

// single = traced front product; group = whole cut-out (already cropped) from cut/
const jobs = [
  { out: 'argan-100ml', src: 14, shape: dropper({ bulb: [443, 515, 165, 305], collar: [398, 552, 300, 432], neck: [404, 548], shoulderY: 566, body: [314, 594, 1140] }), h: 0.7 },
  { out: 'serum-anti-age', src: 13, shape: dropper({ bulb: [388, 458, 320, 450], collar: [352, 490, 445, 550], neck: [360, 497], shoulderY: 650, body: [300, 557, 1170] }), h: 0.66 },
  { out: 'figue-30ml', src: 10, shape: dropper({ bulb: [422, 512, 285, 480], collar: [380, 574, 475, 625], neck: [390, 565], shoulderY: 730, body: [327, 632, 1280] }), h: 0.66 },
  { out: 'figue-15ml', src: 11, shape: dropper({ bulb: [437, 528, 440, 605], collar: [390, 576, 600, 765], neck: [400, 570], shoulderY: 840, body: [358, 610, 1262] }), h: 0.56 },
  { out: 'serum-anti-rides', src: 16, shape: dropper({ bulb: [610, 680, 388, 522], collar: [575, 718, 518, 628], neck: [584, 710], shoulderY: 730, body: [527, 780, 1270] }), h: 0.66 },
  { out: 'gel-nettoyant', src: 20, shape: pump({ head: [268, 548, 135, 228], stem: [398, 458, 215, 300], collar: [352, 522, 290, 445], body: [315, 555, 445, 1272] }), h: 0.74 },
  { out: 'shampoing', src: 19, shape: pump({ head: [32, 308, 240, 302], stem: [190, 262, 295, 368], collar: [148, 298, 362, 502], body: [98, 330, 495, 1275] }), h: 0.74, contrast: 1.18 },
  // real groups (product range shots)
  { out: 'argan-gamme', group: 'p14_all', h: 0.68 },
  { out: 'figue-gamme', group: 'p10_all', h: 0.64, w: 0.8 },
  { out: 'serum-anti-rides-gamme', group: 'p16_all', h: 0.64, w: 0.8 },
  { out: 'serum-anti-age-gamme', group: 'p13_all', h: 0.64, w: 0.8 },
  { out: 'gel-nettoyant-gamme', group: 'p20_all', h: 0.68, w: 0.8 },
  { out: 'shampoing-gamme', group: 'p19_all', h: 0.68, w: 0.8, contrast: 1.18 },
  { out: 'creme-visage-rose', group: 'p4_all', h: 0.6, w: 0.84 },
  { out: 'ghassoul-rose', group: 'p17_all', h: 0.6, w: 0.8 },
  { out: 'ghassoul-fleur-oranger', group: 'p18_all', h: 0.6, w: 0.8 },
  { out: 'huile-alimentaire-gamme', group: 'oil_all', h: 0.66, w: 0.8, warm: true },
  { out: 'huile-alimentaire-1l', group: 'oil_1', h: 0.72, warm: true },
  { out: 'huile-alimentaire-500ml', group: 'oil_2', h: 0.64, warm: true },
  { out: 'huile-alimentaire-250ml', group: 'oil_3', h: 0.54, warm: true },
  { out: 'amlou-beldi', group: 'amlou_all', h: 0.4, w: 0.8, warm: true },
];

async function isolate(j) {
  const file = path.join(ROOT, 'full', `p${j.src}_all.png`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}"><rect width="100%" height="100%" fill="#000"/><g fill="#fff">${j.shape}</g></svg>`;
  const mask = await sharp(Buffer.from(svg)).blur(1.2).greyscale().raw().toBuffer();
  for (let i = 0, px = info.width * info.height; i < px; i++) data[i * 4 + 3] = Math.round((data[i * 4 + 3] * mask[i]) / 255);
  return sharp(data, { raw: info }).png().toBuffer();
}

async function correct(buf, j) {
  let img = sharp(buf).trim({ threshold: 1 });
  if (j.warm) img = img.recomb([[1.12, 0.02, 0], [0.02, 1.04, 0], [0, 0.02, 0.84]]);
  // gentle global tone: lift exposure, a touch of contrast and saturation
  const c = j.contrast ?? 1.06;
  img = img.linear(c, -(128 * c - 128) + 6).modulate({ brightness: 1.03, saturation: 1.06 });
  return img.png().toBuffer();
}

const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx=".5" cy=".46" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f7f6f3"/><stop offset="1" stop-color="#eeebe6"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);

(async () => {
  for (const j of jobs) {
    const raw = j.group ? fs.readFileSync(path.join(ROOT, 'cut', j.group + '.png')) : await isolate(j);
    const buf = await correct(raw, j);
    const m = await sharp(buf).metadata();
    const s = Math.min((W * (j.w ?? 0.62)) / m.width, (H * j.h) / m.height);
    const pw = Math.round(m.width * s), ph = Math.round(m.height * s);
    const product = await sharp(buf).resize(pw, ph, { kernel: 'lanczos3' }).sharpen({ sigma: s > 1.6 ? 1.2 : 0.7 }).png().toBuffer();
    const base = 1250, left = Math.round((W - pw) / 2), top = base - ph;

    // reflection: flipped, faded
    const rh = Math.round(ph * 0.22);
    const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${rh}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="${pw}" height="${rh}" fill="url(#f)"/></svg>`);
    const reflection = await sharp(await sharp(product).flip().extract({ left: 0, top: 0, width: pw, height: rh }).blur(1.5).png().toBuffer())
      .composite([{ input: fade, blend: 'dest-in' }]).png().toBuffer();

    const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="160"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter><filter id="b2"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <ellipse cx="${W / 2}" cy="80" rx="${pw * 0.55}" ry="20" fill="#2b2118" opacity=".22" filter="url(#b)"/>
      <ellipse cx="${W / 2}" cy="78" rx="${pw * 0.46}" ry="5" fill="#2b2118" opacity=".35" filter="url(#b2)"/></svg>`);

    await sharp(backdrop)
      .composite([
        { input: reflection, left, top: base + 2 },
        { input: shadow, left: 0, top: base - 80 },
        { input: product, left, top },
      ])
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(OUT, j.out + '.jpg'));
    console.log(j.out, `${pw}x${ph}`);
  }
})();
