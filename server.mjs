import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf"
};

function safePath(pathname) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const absolute = join(root, relative);
  return absolute.startsWith(root) ? absolute : null;
}

async function serveFile(response, filePath) {
  const body = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  response.end(body);
}

async function serveClientApp(response, pathname) {
  let html = await readFile(join(root, "index.html"), "utf8");
  const appStart = html.indexOf('<div id="__nuxt">');
  const appEndMarker = '</div><div id="teleports">';
  const appEnd = html.lastIndexOf(appEndMarker);

  if (appStart >= 0 && appEnd > appStart) {
    html = `${html.slice(0, appStart)}<div id="__nuxt"></div><div id="teleports">${html.slice(appEnd + appEndMarker.length)}`;
  }

  const payload = `[["ShallowReactive",1],{"data":2,"state":4,"once":6,"_errors":7,"serverRendered":8,"path":9,"pinia":10},["ShallowReactive",3],{},["Reactive",5],{},["Set"],["ShallowReactive",3],false,${JSON.stringify(pathname)},["Reactive",5]]`;
  html = html
    .replace('data-ssr="true"', 'data-ssr="false"')
    .replace(/(<script[^>]+id="__NUXT_DATA__"[^>]*>)[\s\S]*?(<\/script>)/, `$1${payload}$2`);

  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache"
  });
  response.end(html);
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const apiMatch = url.pathname.match(/^\/api\/([a-zA-Z0-9_/-]+)$/);

    if (apiMatch) {
      const apiFile = safePath(`/api/${apiMatch[1]}.json`);
      if (!apiFile) {
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        response.end('{"error":"Invalid API path"}');
        return;
      }
      await serveFile(response, apiFile);
      return;
    }

    const requested = url.pathname === "/" ? join(root, "index.html") : safePath(url.pathname);
    if (requested) {
      try {
        const info = await stat(requested);
        if (info.isFile()) {
          await serveFile(response, requested);
          return;
        }
      } catch {
        // Nuxt client routes fall through to the app shell.
      }
    }

    await serveClientApp(response, url.pathname);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Internal server error\n${error.message}`);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Cosmic Broth replica running at http://127.0.0.1:${port}`);
});
