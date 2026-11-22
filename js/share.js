// «Поделиться TanWin»: окно с хадисом и готовая картинка 1080×1350 для чата и историй.
// Картинка рисуется на холсте, чужих библиотек нет. Цвета берутся из css/app.css: какое оформление у ученика, такая и картинка.
// Арабский текст: шрифт «Мадина» (TW Hafs), сукун в нём ۡ. Арабский текст и номера хадисов сверены по sunnah.com 2026-11-22.
// Русский перевод изданный, не наш: «Сахих аль-Бухари» (5027) и «Сады праведных», хадис 174 (Муслим, 2674, первая половина), по isnad.link. Слова в скобках добавил переводчик.
// Телефон: «Поделиться» отдаёт картинку и подпись со ссылкой. Компьютер: «Сохранить».
import { h, keep, modal, toast, icon, plural } from "./ui.js";
import { store } from "./store.js";
import { track } from "./usage.js";

const W = 1080, H = 1350, PAD = 72;
const SITE = "tanwin.xasi88.ru";
const LINK = `https://${SITE}/`;

/** Хадис на картинке и хадис в окне перед кнопкой. */
export const HADITH = {
  pic: { ar: "خَيۡرُكُمۡ مَنۡ تَعَلَّمَ ٱلۡقُرۡءَانَ وَعَلَّمَهُ", ru: "Лучшим из вас является тот, кто изучает Коран и учит ему (других)", src: "аль-Бухари, 5027" },
  call: { ru: "Призывавший к правильному пути получит такую же награду, как и награды тех, кто последовал за ним, что не уменьшит их собственных наград ни на йоту…", src: "Муслим, 2674" },
};

// QR-код адреса https://tanwin.xasi88.ru/?utm_source=share (версия 3, уровень M): 29 строк по 29 точек, каждая строка числом.
const QR = "1fc3b27f|1053f241|1743065d|174a645d|175a235d|10413e41|1fd5557f|cce00|15409e12|1a9610c9|15435927|7a18e02|5698eeb|1ca494c9|a5c488b|1c1efeda|16478b4b|3bbddcd|1254c0b3|aa89cea|16d8b9f0|149d17|1fc5035b|104cc91b|175049f0|17471037|175101b9|10449fe2|1fd0e37b"
  .split("|").map((r) => parseInt(r, 16).toString(2).padStart(29, "0"));

/** Сколько уроков пройдено: это и есть результат на картинке. */
export const lessonsDone = () => Object.values(store.get().lessons || {}).filter((l) => l?.done).length;
const lessonsLine = (n) => plural(n, "урок пройден", "урока пройдено", "уроков пройдено");

/** Подпись к картинке: текст со ссылкой, которую можно нажать. */
export const shareText = (n) => `${n ? `Учусь читать Коран в TanWin: ${n} ${lessonsLine(n)}.` : "Учусь читать Коран в TanWin."} Приложение бесплатное.\nПопробуйте: ${LINK}`;

/** Текст по словам в строки не шире max. */
function wrap(ctx, text, max) {
  const out = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    const next = cur ? cur + " " + w : w;
    if (ctx.measureText(next).width <= max || !cur) cur = next; else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out;
}

function draw(ctx, { n, logo }) {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const display = (px) => `800 ${px}px "Unbounded", "Arial Black", system-ui, sans-serif`;
  const body = (px, w = 500) => `${w} ${px}px "Manrope", "Nunito", system-ui, sans-serif`;
  const edge = v("--edge"), shadow = v("--edge-sh");
  /** Наклейка: жёсткая тень, заливка, контур. */
  const sticker = (x, y, w, hh, r, fill, sh = 10) => {
    if (shadow && shadow !== "transparent") { ctx.fillStyle = shadow; ctx.beginPath(); ctx.roundRect(x + sh, y + sh, w, hh, r); ctx.fill(); }
    ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, hh, r); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 6; ctx.stroke();
  };

  // Фон в точку
  ctx.fillStyle = v("--bg"); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = v("--bg-2");
  for (let y = 22; y < H; y += 44) for (let x = 22; x < W; x += 44) { ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 7); ctx.fill(); }
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.direction = "ltr";

  // Значок и имя
  if (logo) ctx.drawImage(logo, PAD, 60, 124, 124);
  ctx.font = display(62); ctx.fillStyle = v("--on-bg"); ctx.fillText("TanWin", PAD + 152, 146);

  // Низ: «Бесплатно», призыв, адрес и QR-код
  const qr = 232, qx = W - PAD - qr, qy = H - 64 - qr;
  sticker(qx, qy, qr, qr, 28, v("--card-2"), 8);
  const qp = 28, cell = (qr - qp * 2) / QR.length; // поле вокруг кода: 4 точки кода, иначе камера читает хуже
  ctx.fillStyle = v("--ink");
  QR.forEach((row, y) => [...row].forEach((bit, x) => { if (bit === "1") ctx.fillRect(qx + qp + x * cell, qy + qp + y * cell, cell + 0.4, cell + 0.4); }));
  ctx.font = display(34);
  const fw = ctx.measureText("Бесплатно").width + 64;
  sticker(PAD, qy + 4, fw, 72, 36, v("--lime"), 6);
  ctx.fillStyle = v("--ink"); ctx.fillText("Бесплатно", PAD + 32, qy + 53);
  ctx.font = body(38); ctx.fillStyle = v("--on-bg-2"); ctx.fillText("Научитесь читать Коран", PAD, qy + 146);
  ctx.font = display(44); ctx.fillStyle = v("--on-bg"); ctx.fillText(SITE, PAD, qy + 212);

  // Результат ученика
  const top = 232, bottom = qy - 56;
  const resH = n ? 196 : 0;
  if (n) {
    const ry = bottom - resH;
    sticker(PAD, ry, W - PAD * 2, resH, 40, v("--yellow"));
    ctx.fillStyle = v("--ink");
    ctx.font = display(112); ctx.fillText(String(n), PAD + 44, ry + 138);
    const nx = PAD + 44 + ctx.measureText(String(n)).width + 36;
    ctx.font = display(38); ctx.fillText(lessonsLine(n), nx, ry + 88);
    ctx.font = body(36); ctx.fillText("Я учусь читать Коран", nx, ry + 142);
  }

  // Хадис: арабский текст, перевод, источник. Блок стоит по центру наклейки.
  const hh = bottom - top - (n ? resH + 44 : 0);
  sticker(PAD, top, W - PAD * 2, hh, 44, v("--card"));
  const inner = W - PAD * 2 - 112, cx = W / 2;
  const big = !n;
  let arPx = big ? 112 : 96;
  const arFont = (px) => `${px}px "TW Hafs", "Amiri Quran", serif`;
  ctx.font = arFont(arPx);
  const aw = ctx.measureText(HADITH.pic.ar).width;
  if (aw > inner) arPx = Math.floor((arPx * inner) / aw);
  // Перевод с результатом ученика: две строки. Не влезает: шрифт чуть меньше, но не мельче 40.
  let ruPx = big ? 54 : 46, lines;
  for (;;) { ctx.font = body(ruPx, 800); lines = wrap(ctx, `«${HADITH.pic.ru}»`, inner); if (big || lines.length <= 2 || ruPx <= 40) break; ruPx -= 2; }
  const ruGap = Math.round(ruPx * 1.32), srcPx = 32;
  const blockH = arPx * 1.5 + 36 + ruPx + (lines.length - 1) * ruGap + 28 + srcPx;
  let y = top + (hh - blockH) / 2 + arPx * 1.12;
  ctx.textAlign = "center";
  ctx.direction = "rtl"; ctx.font = arFont(arPx); ctx.fillStyle = v("--ink"); ctx.fillText(HADITH.pic.ar, cx, y);
  ctx.direction = "ltr";
  y += arPx * 0.38 + 36 + ruPx;
  ctx.font = body(ruPx, 800);
  for (const line of lines) { ctx.fillText(line, cx, y); y += ruGap; }
  ctx.font = body(srcPx); ctx.fillStyle = v("--ink-2"); ctx.fillText(HADITH.pic.src, cx, y - ruGap + 28 + srcPx);
  ctx.textAlign = "left";
}

const loadImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

/** Картинка PNG. n: число пройденных уроков, 0: картинка без результата. */
export async function renderCard(n) {
  const [logo] = await Promise.all([
    loadImg("icons/icon.svg"),
    document.fonts.load('96px "TW Hafs"', HADITH.pic.ar),
    document.fonts.load('800 60px "Unbounded"', "TanWin Бесплатно"),
    document.fonts.load('800 46px "Manrope"', HADITH.pic.ru),
    document.fonts.load('500 36px "Manrope"', HADITH.pic.ru),
  ].map((p) => Promise.resolve(p).catch(() => null)));
  const c = h("canvas", { width: W, height: H });
  draw(c.getContext("2d"), { n, logo });
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}

/** Окно «Поделитесь TanWin». from: откуда открыли, для статистики. */
export function openShare(from = "Ещё") {
  const total = lessonsDone();
  let withResult = total > 0, url = "", file = null;
  track("share_opened", { Откуда: from });
  const img = h("img.share-img", { alt: "Картинка TanWin: хадис о тех, кто учит Корану, и адрес приложения", width: W, height: H });
  const acts = h("div.row.gap.wrap.center");
  const how = (way) => track("shared", { Способ: way, Результат: withResult ? "показан" : "скрыт", Откуда: from });
  const share = async () => {
    try { await navigator.share({ files: [file], text: shareText(withResult ? total : 0) }); how("Поделиться"); }
    catch (e) { if (e?.name !== "AbortError") toast("Не получилось поделиться. Нажмите «Сохранить»"); }
  };
  async function paint() {
    const blob = await renderCard(withResult ? total : 0).catch(() => null);
    if (!blob) { toast("Не получилось создать картинку"); return; }
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    file = typeof File === "function" ? new File([blob], "tanwin.png", { type: "image/png" }) : null;
    img.src = url;
    const canShare = !!(file && navigator.canShare?.({ files: [file] }));
    acts.replaceChildren(
      canShare ? h("button.btn.primary", { type: "button", onclick: share }, "Поделиться") : null,
      h("a.btn", { class: canShare ? "secondary" : "primary", href: url, download: "tanwin.png", onclick: () => how("Сохранить") }, icon("down", { size: 18 }), "Сохранить"));
  }
  const toggle = total ? h("button.btn.ghost.small-btn", { type: "button", onclick: () => { withResult = !withResult; toggle.textContent = label(); paint(); } }) : null;
  const label = () => (withResult ? "Убрать мой результат" : "Показать мой результат");
  if (toggle) toggle.textContent = label();
  modal(h("div.share-view", null,
    h("h3", null, "Поделитесь TanWin"),
    h("blockquote.share-quote", null, keep(`«${HADITH.call.ru}»`), h("cite", null, keep(HADITH.call.src))), // keep: слова хадиса не переводятся на «ты»
    h("p.share-call", null, "Хотите быть среди тех, кто помогает людям читать Коран? Отправьте эту картинку близким. TanWin бесплатный."),
    img, toggle, acts),
  { onClose: () => setTimeout(() => url && URL.revokeObjectURL(url), 1000) });
  paint();
}

/** Карточка на итоге урока, который завершил этап: хадис и кнопка. */
export function shareInvite(from) {
  return h("div.share-invite", null,
    h("p", null, keep(`«${HADITH.pic.ru}»`), h("cite", null, keep(HADITH.pic.src))),
    h("button.btn.secondary.wide", { type: "button", onclick: () => openShare(from) }, icon("heart", { size: 18 }), "Поделиться TanWin"));
}
