// Panel humano: /admin?key=TU_CLAVE
const CLAVE = "cambia-esta-clave-123"; // <-- CAMBIALA antes de subir

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== CLAVE) return new Response("No autorizado", { status: 401 });
  if (!env.LOG) return new Response("Falta el binding KV llamado LOG (ver paso a paso).", { status: 500 });

  const lista = await env.LOG.list({ prefix: "ev:", limit: 200 });
  const filas = lista.keys.map((k) => k.metadata).filter(Boolean).reverse(); // más nuevo arriba
  const tr = filas.map((e, i) => `<tr><td>${filas.length - i}</td><td>${esc(e.t)}</td><td>${esc(e.m)}</td><td>${esc(e.p)}${esc(e.q)}</td><td>${esc(e.s)}</td><td>${esc(e.ip)} ${esc(e.pais)}</td><td>${esc(e.ua)}</td><td>${esc(e.ref)}</td></tr>`).join("");

  return new Response(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="refresh" content="5">
<title>Admin</title><style>body{font-family:monospace;background:#111;color:#ddd;padding:12px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:4px 6px;font-size:12px;vertical-align:top}th{background:#222}</style></head>
<body><h2>Eventos registrados por el servidor (${filas.length}) - se actualiza cada 5 s</h2>
<table><tr><th>#</th><th>Fecha/hora (UTC)</th><th>Método</th><th>Ruta + parámetros</th><th>Status</th><th>IP / país</th><th>User-Agent</th><th>Referer</th></tr>${tr}</table></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
