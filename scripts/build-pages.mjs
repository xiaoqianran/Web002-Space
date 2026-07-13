import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, ".pages");
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "Web002-Space";
const fallbackBasePath = repositoryName.endsWith(".github.io") ? "" : `/${repositoryName}`;
const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH ?? fallbackBasePath);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".svg"]);

function normalizeBasePath(value) {
  const normalized = String(value || "").replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}` : "";
}

function rewriteRootPaths(text) {
  if (!basePath) return text;
  return text.replace(
    /(?<![A-Za-z0-9:])\/(?=(?:(?:_nuxt|assets|meta)\/|api(?:\/|["'`])))/g,
    `${basePath}/`
  );
}

function rewriteRuntimeConfig(html) {
  const appBase = `${basePath}/` || "/";
  return html.replace(
    /baseURL:"[^"]*",buildId:"([^"]+)",buildAssetsDir:"[^"]*"/,
    `baseURL:${JSON.stringify(appBase)},buildId:"$1",buildAssetsDir:"/_nuxt/"`
  );
}

function addStaticApiExtensions(code) {
  return code
    .replace(
      /(`\$\{[^}]+\}\/(?:introduces|overview|router))`/g,
      "$1.json`"
    )
    .replace(
      /(`\$\{[^}]+\.base_url\}\/(?:images|outline|portraits|records|unknownWorlds)(?:\/[^`]*)?)`/g,
      "$1.json`"
    );
}

async function rewritePublishedFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewritePublishedFiles(path);
      continue;
    }
    if (!textExtensions.has(extname(entry.name).toLowerCase())) continue;

    let contents = await readFile(path, "utf8");
    contents = rewriteRootPaths(contents);
    if (entry.name.endsWith(".js")) contents = addStaticApiExtensions(contents);
    if (entry.name.endsWith(".html")) contents = rewriteRuntimeConfig(contents);
    await writeFile(path, contents);
  }
}

function createClientShell(html, pathname) {
  const appStart = html.indexOf('<div id="__nuxt">');
  const appEndMarker = '</div><div id="teleports">';
  const appEnd = html.lastIndexOf(appEndMarker);
  let shell = html;

  if (appStart >= 0 && appEnd > appStart) {
    shell = `${html.slice(0, appStart)}<div id="__nuxt"></div><div id="teleports">${html.slice(appEnd + appEndMarker.length)}`;
  }

  const payload = `[["ShallowReactive",1],{"data":2,"state":4,"once":6,"_errors":7,"serverRendered":8,"path":9,"pinia":10},["ShallowReactive",3],{},["Reactive",5],{},["Set"],["ShallowReactive",3],false,${JSON.stringify(pathname)},["Reactive",5]]`;
  return shell
    .replace('data-ssr="true"', 'data-ssr="false"')
    .replace(/(<script[^>]+id="__NUXT_DATA__"[^>]*>)[\s\S]*?(<\/script>)/, `$1${payload}$2`);
}

function createFallbackShell(html) {
  const shell = createClientShell(html, "/");
  const marker = "</script><script>window.__NUXT__";
  const fallbackScript = `<script>(()=>{const element=document.getElementById("__NUXT_DATA__");if(!element)return;const data=JSON.parse(element.textContent);const base=${JSON.stringify(basePath)};let path=location.pathname;if(base&&path.startsWith(base))path=path.slice(base.length)||"/";data[9]=path;element.textContent=JSON.stringify(data)})()</script>`;
  return shell.replace(marker, `</script>${fallbackScript}<script>window.__NUXT__`);
}

function createRedirectPage(targetPath) {
  const target = `${basePath}${targetPath}`;
  const escapedTarget = target.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${escapedTarget}">
  <title>Redirecting…</title>
</head>
<body>
  <script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script>
  <a href="${escapedTarget}">继续访问内容页</a>
</body>
</html>
`;
}

async function writeRoute(pathname, contents) {
  const directory = join(output, ...pathname.split("/").filter(Boolean));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), contents);
}

async function generateRoutes(indexHtml, router) {
  let shellCount = 0;
  let redirectCount = 0;

  for (const [world, categories] of Object.entries(router)) {
    for (const [recordId, chapters] of Object.entries(categories.records || {})) {
      const firstChapter = chapters[0];
      if (firstChapter) {
        await writeRoute(
          `/${world}/records/${recordId}`,
          createRedirectPage(`/${world}/records/${recordId}/${firstChapter}`)
        );
        redirectCount += 1;
      }

      for (const chapter of chapters) {
        const pathname = `/${world}/records/${recordId}/${chapter}`;
        await writeRoute(pathname, createClientShell(indexHtml, pathname));
        shellCount += 1;
      }
    }

    for (const category of ["portraits", "images"]) {
      for (const id of categories[category] || []) {
        const pathname = `/${world}/${category}/${id}`;
        await writeRoute(pathname, createClientShell(indexHtml, pathname));
        shellCount += 1;
      }
    }

    for (const category of ["records", "portraits", "images"]) {
      const entries = categories[category];
      const firstId = category === "records" ? Object.keys(entries || {})[0] : entries?.[0];
      if (!firstId) continue;

      const target = category === "records"
        ? `/${world}/${category}/${firstId}/${entries[firstId][0]}`
        : `/${world}/${category}/${firstId}`;
      await writeRoute(`/${world}/${category}`, createRedirectPage(target));
      redirectCount += 1;
    }
  }

  return { redirectCount, shellCount };
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const directory of ["_nuxt", "api", "assets", "meta"]) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}
await cp(join(root, "index.html"), join(output, "index.html"));
await writeFile(join(output, ".nojekyll"), "");

await rewritePublishedFiles(output);
const publishedIndex = await readFile(join(output, "index.html"), "utf8");
const router = JSON.parse(await readFile(join(output, "api", "router.json"), "utf8"));
const counts = await generateRoutes(publishedIndex, router);
await writeFile(join(output, "404.html"), createFallbackShell(publishedIndex));

console.log(`GitHub Pages artifact built at ${output}`);
console.log(`Base path: ${basePath || "/"}`);
console.log(`Generated ${counts.shellCount} content shells and ${counts.redirectCount} redirects`);
