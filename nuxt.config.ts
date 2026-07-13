import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { ContentRouter } from './app/types/content'
import { buildPrerenderRoutes } from './app/utils/routes'

const root = fileURLToPath(new URL('.', import.meta.url))
const baseURL = process.env.NUXT_APP_BASE_URL || '/'
const contentRouter = JSON.parse(
  readFileSync(fileURLToPath(new URL('./api/router.json', import.meta.url)), 'utf8'),
) as ContentRouter

export default defineNuxtConfig({
  compatibilityDate: '2026-07-13',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: '%s · COSMIC BROTH',
      meta: [
        { name: 'description', content: '宇宙汤原创世界观资料库：记录、人物肖像与图像档案。' },
        { name: 'theme-color', content: '#080b18' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: `${baseURL}meta/favicon_32.png` },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  nitro: {
    publicAssets: [
      { baseURL: '/assets', dir: `${root}assets`, maxAge: 60 * 60 * 24 * 30 },
      { baseURL: '/api', dir: `${root}api`, maxAge: 60 * 10 },
      { baseURL: '/meta', dir: `${root}meta`, maxAge: 60 * 60 * 24 * 30 },
    ],
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: buildPrerenderRoutes(contentRouter),
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
