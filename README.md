# COSMIC BROTH Replica

基于 Nuxt 4 的 COSMIC BROTH 世界观资料库复刻。记录、人物肖像、图像档案和公开 API 快照均由仓库内数据生成，并支持服务端渲染与 GitHub Pages 静态部署。

## 环境

- Node.js 22.12 或更高版本
- npm 11

## 本地开发

```powershell
npm ci
npm run dev
```

默认访问 `http://localhost:3000`。

## 质量检查

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run build
```

集成测试会构建并启动 Nitro 服务，验证首页 HUD、公开数据、14 个历史深层入口、说明图资源及 404 页面。

静态部署预检：

```powershell
$env:NUXT_APP_BASE_URL='/Web002-Space/'
npm run generate
```

确认产物包含：

- `.output/public/index.html`（含 `/Web002-Space/_nuxt/`）
- `.output/public/api/router.json`
- 深层入口如 `.output/public/cosmic-broth/records/yuzhoutang/c1/index.html`

## GitHub Pages

Pages 工作流会根据仓库路径设置 Nuxt `baseURL`，执行静态生成并部署 `.output/public`：

```powershell
$env:NUXT_APP_BASE_URL='/Web002-Space/'
npm run generate
```

## 数据与实施记录

- `api/`：路由、记录、肖像及图像数据快照
- `assets/`：本地化媒体与 HUD 资源（logo / guide / web 装饰）
- `app/data/labels.ts`：与原站一致的 MENU 展示名
- [`REPLICATION_LOG.md`](./REPLICATION_LOG.md)：原始运行时镜像复刻过程记录
