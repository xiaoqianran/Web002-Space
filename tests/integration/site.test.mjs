import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { after, before, test } from 'node:test'

const port = 4373
const origin = `http://127.0.0.1:${port}`
let server
let serverOutput = ''

async function waitForServer() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin)
      if (response.ok) return
    }
    catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Nuxt server did not start in time.\n${serverOutput}`)
}

async function fetchHtml(path) {
  return fetch(new URL(path, origin), {
    headers: { accept: 'text/html' },
  })
}

async function followHtmlRefresh(path) {
  let currentPath = path

  for (let redirectCount = 0; redirectCount < 3; redirectCount += 1) {
    const response = await fetchHtml(currentPath)
    const html = await response.text()
    const redirect = html.match(/<meta http-equiv="refresh" content="0; url=([^";]+)"/i)

    if (!redirect) return { response, html }
    currentPath = redirect[1]
  }

  throw new Error(`Too many HTML refresh redirects from ${path}`)
}

before(async () => {
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: String(port),
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', chunk => { serverOutput += chunk })
  server.stderr.on('data', chunk => { serverOutput += chunk })
  await waitForServer()
})

after(() => {
  server?.kill()
})

test('serves the Nuxt home page and public data snapshot', async () => {
  const home = await fetch(origin)
  assert.equal(home.status, 200)
  assert.match(await home.text(), /data-content-page="home"/)

  const router = await fetch(`${origin}/api/router.json`)
  assert.equal(router.status, 200)
  const data = await router.json()
  assert.deepEqual(Object.keys(data), ['cosmic-broth', 'checkerboard', 'fogbound-box', 'meta-room'])
})

test('renders all reported deep entry routes', async () => {
  const cases = [
    ['/cosmic-broth/records', 'records'],
    ['/cosmic-broth/portraits', 'portraits'],
    ['/cosmic-broth/images', 'images'],
    ['/checkerboard/records', 'records'],
    ['/checkerboard/portraits', 'portraits'],
    ['/checkerboard/images', 'images'],
    ['/fogbound-box/records', 'records'],
    ['/fogbound-box/portraits', 'portraits'],
    ['/fogbound-box/images', 'images'],
    ['/meta-room/records/goldfish', 'records'],
    ['/meta-room/records/guovssahas', 'records'],
    ['/meta-room/records/sickday', 'records'],
    ['/meta-room/portraits/', 'portraits'],
    ['/meta-room/images', 'images'],
  ]

  for (const [path, pageType] of cases) {
    const { response, html } = await followHtmlRefresh(path)
    assert.equal(response.status, 200, path)
    assert.match(html, new RegExp(`data-content-page="${pageType}"`), path)
  }
})

test('returns the Nuxt error page for an unknown archive node', async () => {
  const response = await fetchHtml('/unknown/records/missing/c1')
  assert.equal(response.status, 404)
  assert.match(await response.text(), /SIGNAL LOST/)
})
