/**
 * QR helper — uses vendored qrcode-generator (Kazuhiko Arase), loaded via
 * <script> before this module on pages that need QR.
 */

export function drawQr(el, text) {
  el.innerHTML = "";
  const qrcode = globalThis.qrcode;
  if (typeof qrcode !== "function") {
    const pre = document.createElement("div");
    pre.style.cssText =
      "font-size:0.65rem;line-height:1.35;color:#111;word-break:break-all;padding:0.35rem";
    pre.textContent = text;
    el.appendChild(pre);
    return;
  }

  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const n = qr.getModuleCount();
  const scale = Math.max(2, Math.floor(176 / n));
  const canvas = document.createElement("canvas");
  canvas.width = n * scale;
  canvas.height = n * scale;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "QR code");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }
  }
  el.appendChild(canvas);
}
