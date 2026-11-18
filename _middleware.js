// Se ejecuta en CADA pedido al sitio (páginas incluidas) y lo guarda en KV.
export async function onRequest(context) {
  const { request, env, next, waitUntil } = context;
  const url = new URL(request.url);
  const response = await next();

  if (!url.pathname.startsWith("/admin") && env.LOG) {
    const ahora = Date.now();
    const evento = {
      t: new Date(ahora).toISOString(),
      m: request.method,
      p: url.pathname,
      q: url.search.slice(0, 250),
      s: response.status,
      ua: (request.headers.get("user-agent") || "").slice(0, 200),
      ip: request.headers.get("cf-connecting-ip") || "",
      pais: request.cf && request.cf.country ? request.cf.country : "",
      ref: (request.headers.get("referer") || "").slice(0, 120),
    };
    // La clave incluye la hora, así se ordena sola.
    const clave = "ev:" + String(ahora).padStart(15, "0") + "-" + Math.random().toString(36).slice(2, 6);
    waitUntil(env.LOG.put(clave, "1", { metadata: evento, expirationTtl: 60 * 60 * 24 * 7 }));
  }
  return response;
}
