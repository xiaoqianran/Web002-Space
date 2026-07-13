# COSMIC BROTH 全流程复刻记录

> 目标站点：<https://www.cosmicbroth.com/>  
> 本地项目：`D:\a_programming_list\Ai-application\Aweb101\cosmicbroth`  
> 实施日期：2026-07-13  
> 本地地址：<http://127.0.0.1:4173/>

本文记录从空目录开始，到完成首页、深层资料页、交互、移动端布局、静态资源和 API 数据本地化的完整过程。它既是操作日志，也是后续模型继续排查和维护时的上下文文档。

## 1. 最终结果概览

最终项目约 82.9 MB，包含：

- 1 份原站首页应用外壳：`index.html`
- 42 个 `_nuxt` 运行时、异步页面模块、CSS、字体和内置媒体文件
- 72 份本地 API JSON
  - 4 份全局 JSON
  - 60 份 records JSON
  - 4 份 portraits JSON
  - 4 份 images JSON
- 157 个本地图片、GIF 等内容资源
- 1 个无第三方依赖的 Node 静态服务器：`server.mjs`
- `package.json`、`README.md` 和本文档

已验证的页面/状态：

- 首页星空和底部控制台
- 随机星点 Canvas 动画
- 背景拖拽
- 星球点击和信息/世界导航层
- “Check Instruction” 帮助说明层及关闭行为
- 桌面端布局
- 390 × 844 移动端模拟布局
- records 章节页
- portraits 肖像数据库
- images 无限图像浏览页
- 任意深层 URL 直接打开时的客户端启动

除 Bilibili、微博、番茄小说等原站外部社交链接外，站点自身页面所需的 API、CDN 图片、字体和前端模块均已本地化。

## 2. 约束和工具选择

任务开始时，工作目录完全为空，并且不是 Git 仓库。

使用过的主要能力：

- `chrome-devtools-mcp`
  - `list_pages`
  - `take_screenshot`
  - `take_snapshot`
  - `evaluate_script`
  - `list_network_requests`
  - `list_console_messages`
  - `get_console_message`
  - `navigate_page`
  - `new_page`
  - `select_page`
  - `emulate`
- `browser-use` / Browser Harness
  - 用于确认真实 Chrome/CDP 连接状态和浏览器页面信息
- `agent-reach`
  - 使用 Jina Reader 读取页面公开文本和图片线索
- PowerShell
  - 文件盘点、资源下载、JSON 快照、完整性验证、启动本地服务器
- Node.js
  - 本地静态服务器和 JavaScript 语法检查

没有使用子代理。没有创建 Git 提交，因为目录不是 Git 仓库。

安全处理：原站生产前端包里包含一个公开可见的 API Bearer 值。操作过程中只通过正则在内存中提取它以下载公开数据，没有把实际值打印进日志或本文档；所有本地 JavaScript 中的生产值均替换成 `Bearer local-replica`。

## 3. 从空目录开始的盘点

首先检查工作区：

```powershell
rg --files -g '!node_modules' -g '!dist'
Get-ChildItem -Force
git status --short
```

结果：

- `rg` 没有返回文件
- `Get-ChildItem` 显示目录为空
- `git status` 报错：当前目录不是 Git 仓库

由此确定可以从零构建，不存在需要保留或绕开的用户源文件。

## 4. 原站浏览器取证

### 4.1 列出已打开页面

通过 `chrome-devtools-mcp.list_pages` 得到：

```text
1: COSMIC BROTH (https://www.cosmicbroth.com/) [selected]
```

### 4.2 获取原站全页截图和无障碍树

调用：

- `take_screenshot(fullPage: true)`
- `take_snapshot(verbose: true)`

临时生成：

- `reference-full.png`
- `reference-snapshot.txt`

这些只用于取证，最终已删除。

截图确认首页是固定满屏的科幻 UI：

- 3840 × 2160 星空/黑洞背景
- 多颗可点击星球
- 未知小星体
- Canvas 随机星点
- 左右 `DRAG` 提示
- 底部能量状态、时钟、圆形控制台、社交链接、帮助区
- 页面本身没有纵向滚动

### 4.3 用页面 JavaScript 提取结构

通过 `evaluate_script` 收集：

- viewport：最初约 `1707 × 842`
- DPR：`1.5`
- document scrollWidth/scrollHeight
- `document.body.innerText`
- 所有 `<a>`、`<img>`、`<video>`、`<source>`
- CSS 和 JavaScript URL
- 前 20,000 字符的 body HTML

重要发现：

- 页面是 Nuxt 单页应用
- `<html lang="zh_CN">`
- 使用 `zpix` 字体
- 主要 CSS：
  - `entry.DRleNcrB.css`
  - `return_button.ConMloZa.css`
  - `codeline.CVCllsMf.css`
  - `arrow.umyK3M4C.css`
  - `index.DpmfheOh.css`
- 入口模块：`Bx70QQQb.js`
- 主要首页资源来自 `cdn.cosmicbroth.com`
- 首页会请求 `api.cosmicbroth.com/api/*`

### 4.4 通过 Jina Reader 补充文本取证

执行：

```powershell
curl.exe -s "https://r.jina.ai/https://www.cosmicbroth.com/"
```

读取到以下公开内容线索：

- `GRAND-STARRS-RAY`
- `[LOADING]`
- `→ ACCESS`
- `SYSTEM...`
- `飞船实时状态监测反馈`
- `执行已授权操作`
- `CLICK` / `DRAG`
- `宇宙汤:`
- `CONSLOE`（原站就是这个拼写）
- `External Links`
- `Need Help?`
- `Check Instruction`

同时确认主要背景和星球图片 URL。

### 4.5 刷新页面并记录完整网络请求

第一次连接 DevTools 时只看到 2 个后续请求。为获取完整依赖，执行忽略缓存的 reload。reload 在 10 秒处报告超时，但页面实际上已经继续加载，因此随后再次读取 Network。

最终得到 62 条请求，包括：

- 根 HTML
- 入口 CSS/JS
- 6 个初始 JS chunk
- build manifest
- 背景、星球、说明图和 GIF/JPG
- `zpix` 字体
- API：
  - `/api/overview`
  - `/api/introduces`
  - `/api/router`
  - `/api/unknownWorlds`

Chrome 扩展注入的 `chrome-extension://...` 请求不属于目标站，不做复制。

## 5. 决定采用“运行时镜像 + API 快照”策略

没有手工重写成一个相似页面，而是采用以下方案：

1. 下载公开 HTML
2. 下载原站 Nuxt 运行时、CSS、字体和媒体资源
3. 把 CDN URL 改成本地 `/assets/`
4. 把 API 根地址改成本地 `/api`
5. 下载公开 API 响应为 JSON 快照
6. 编写一个本地 Node 服务返回静态文件和 API JSON
7. 深层路由使用无 SSR 的 Nuxt 客户端应用壳启动

这样可以最大程度保留原站：

- GSAP/Lottie 动画
- Canvas 星点
- 拖拽和点击交互
- Nuxt 路由
- 原始排版和响应式规则
- records、portraits、images 三类页面

## 6. 下载首页 HTML 和首批资源

创建：

```text
_nuxt/
_nuxt/builds/meta/
meta/
```

下载内容包括：

- `index.html`
- 初始 CSS
- 初始 JS chunk
- `web.*.svg`
- `wave.*.svg`
- `outer.*.svg`
- `guide.*.png`
- 7 个 GIF/JPG
- `zpix.*.ttf`
- build meta JSON
- favicon

使用的核心 PowerShell 结构：

```powershell
$client = New-Object System.Net.WebClient
$client.DownloadFile('https://www.cosmicbroth.com/', 'index.html')

foreach ($file in $files) {
  $client.DownloadFile(
    "https://www.cosmicbroth.com/_nuxt/$file",
    (Join-Path '_nuxt' $file)
  )
}
```

## 7. 首批 API 快照

从原站入口 bundle 中通过正则读取 API 地址和公开 Bearer 值，然后请求四个全局接口：

```text
overview
introduces
router
unknownWorlds
```

关键逻辑：

```powershell
$remoteBundle = (New-Object System.Net.WebClient).DownloadString(
  'https://www.cosmicbroth.com/_nuxt/Bx70QQQb.js'
)

$token = [regex]::Match(
  $remoteBundle,
  'Bearer [a-f0-9]+'
).Value

$headers = @{ Authorization = $token }
$data = Invoke-RestMethod -Uri $url -Headers $headers
$json = $data | ConvertTo-Json -Depth 100 -Compress
```

首批文件大小约为：

- `overview.json`：221 KB
- `introduces.json`：7.5 KB
- `router.json`：659 B
- `unknownWorlds.json`：151 B

`overview` 中包含大量 Lottie 动画数据，因此明显大于其他文件。

## 8. 下载 CDN 图片并改写引用

从所有 JSON 中提取 `https://cdn.cosmicbroth.com/...`，再加上首页硬编码背景，下载到 `assets/`。

然后在 HTML、JS、JSON 中执行机械替换：

```text
https://cdn.cosmicbroth.com/  -> /assets/
https://api.cosmicbroth.com/api -> /api
Bearer <生产值> -> Bearer local-replica
```

这里使用批量机械改写是为了避免手工编辑压缩后的大型 bundle。

## 9. 第一次严重踩坑：PowerShell 嵌套数组导致 bundle 被串接

### 9.1 错误原因

曾使用：

```powershell
$targets = @(
  (Get-Item 'index.html'),
  (Get-ChildItem '_nuxt' -Filter '*.js'),
  (Get-ChildItem 'api' -Filter '*.json')
)
```

这个写法形成了嵌套数组。循环里 `$file.FullName` 对某一项返回多个路径，`Get-Content -Raw` 将多份 JS 串接起来，随后又把串接内容写回每个 JS。结果是多个 bundle 变成了同一份拼接文件。

### 9.2 浏览器症状

本地页面控制台出现：

```text
Uncaught SyntaxError: Identifier 's' has already been declared
```

页面只显示 SSR 结构，客户端交互没有正常接管。

### 9.3 如何定位

逐个运行：

```powershell
foreach ($file in Get-ChildItem '_nuxt' -Filter '*.js') {
  node --check $file.FullName
}
```

多个 JS 都在第二个模块开头报告重复标识符，确认是文件被拼接，而不是 URL 改写导致。

### 9.4 修复

重新从原站逐个下载全部 JS，并在“每个文件自己的循环”中改写：

```powershell
foreach ($name in $files) {
  $path = Join-Path '_nuxt' $name
  $client.DownloadFile("https://www.cosmicbroth.com/_nuxt/$name", $path)
  $content = Get-Content -Raw -LiteralPath $path
  # 三项 replace/regex replace
  Set-Content -LiteralPath $path -Value $content -Encoding utf8NoBOM
}
```

随后所有 JS 通过 `node --check`。

## 10. 第二个相关踩坑：API JSON 也被串接

同一个嵌套数组问题也导致 4 个 API JSON 互相串接。

浏览器症状：

```text
加载 JSON 失败: SyntaxError:
Unexpected non-whitespace character after JSON ...
```

修复方式：重新请求每个 API，逐个写入对应文件，并用以下命令逐个解析：

```powershell
foreach ($file in Get-ChildItem 'api' -Filter '*.json') {
  Get-Content -Raw $file.FullName | ConvertFrom-Json | Out-Null
}
```

## 11. 编写本地服务器

创建 `package.json`：

```json
{
  "name": "cosmic-broth-replica",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.mjs",
    "check": "node --check server.mjs"
  }
}
```

`server.mjs` 仅依赖 Node 内置模块：

- `node:http`
- `node:fs/promises`
- `node:path`
- `node:url`

它负责：

- 静态文件 MIME
- `/api/**` 到本地 JSON 的映射
- 根路径返回原始 SSR 首页
- 深层路径返回客户端应用壳
- 目录穿越防护
- 默认端口 `4173`
- `PORT` 环境变量覆盖

启动：

```powershell
npm start
```

开发过程中用隐藏后台进程启动：

```powershell
Start-Process `
  -FilePath 'node' `
  -ArgumentList 'server.mjs' `
  -WorkingDirectory (Get-Location) `
  -WindowStyle Hidden
```

## 12. 本地首页第一次完整验证

打开：

```text
http://127.0.0.1:4173/
```

Network 确认以下内容均返回 200：

- HTML
- 入口 CSS/JS
- 背景和星球图片
- SVG
- GIF/JPG
- 字体
- favicon
- API JSON

全页截图和原站一致，背景位置会因为拖拽状态、视口和随机动画而不同，这是预期行为。

控制台仍会出现类似：

```text
Error: <path> attribute transform:
Expected transform function, "null".
```

这是原始 Lottie/SVG 数据在当前 Chromium 下的运行时提示；原站也使用同一数据路径。它不阻止页面显示、路由或交互，因此未修改上游动画数据。

## 13. 交互验证

### 13.1 帮助层

先定位 `Check Instruction` 对应的 DOM 和矩形，再触发 `.uibox_instructionbox_info` 的点击事件。

验证结果：

- 页面背景变暗
- 中心显示 `OPERATING INSTRUCTIONS`
- 中英文说明图完整
- 左下出现 `[返回]::close()`
- 关闭按钮可恢复首页

### 13.2 星球点击

获取 `.windowview_stars_star_clickable` 的矩形，触发第二颗星球点击。

验证结果：

- 世界/资料导航层正确出现
- 页面展示 `RECORDS`、`PORTRAITS`、`IMAGES` 等导航图形
- 动画和半透明叠层正常

### 13.3 移动端

`resize_page` 没有改变最大化 Chrome 的实际 innerWidth，因此改用 DevTools viewport 模拟：

```text
390x844x1,mobile,touch
```

验证结果：

- 背景使用竖向构图
- 星球仍按比例定位
- 左右拖拽提示保留
- 底部 UI 缩放并贴合窄屏
- 帮助、社交和控制台仍可见

## 14. 深层路由的发现

从入口 bundle 中抽取 Nuxt 路由：

```text
/
/:worlds()
/:worlds()/images/:id()
/:worlds()/portraits/:id()
/:worlds()/records/:id()/c:chapter()
```

`api/router.json` 中记录 4 个世界：

- `cosmic-broth`
- `checkerboard`
- `fogbound-box`
- `meta-room`

以及 records、portraits、images 的合法 ID 和章节。

测试深层地址：

```text
/cosmic-broth/records/yuzhoutang/c1
/cosmic-broth/portraits/database
/cosmic-broth/images/vlog
```

## 15. 第三个踩坑：只下载首页 chunk 不足以支持深层路由

原始 Network 只反映了当时首页加载到的模块。入口 bundle 的动态 import 还引用：

- `7wabMjxb.js`
- `BIgn3gRP.js`
- `BOiTifj-.js`
- `BvqDcBFr.js`
- 以及这些页面依赖的共享 JS/CSS

最初直接打开深层路由时得到 404/错误页。

修复方式：从 `Bx70QQQb.js` 中正则提取所有 `./*.js`、`./*.css`、SVG、PNG、GIF、JPG、TTF 依赖，下载所有缺失文件，再逐个执行 `node --check`。

最终 `_nuxt` 共 42 个文件。

还从 bundle 中发现错误页引用：

```text
/assets/404_73d8eb17c3.gif
```

该资源也已本地化。

## 16. 第四个踩坑：SSR 首页不能直接作为任意路由的 fallback

### 16.1 症状

服务器最初对所有未知路径直接返回完整的首页 `index.html`。浏览器地址虽然是深层 URL，但 Nuxt 把 SSR 首页当作已渲染页面进行 hydration，导致：

- hydration mismatch
- URL 是章节路由，显示内容仍是首页
- 路由页面不能正确直接打开

### 16.2 修复策略

根路径仍返回完整 SSR 首页；深层路径返回“客户端应用壳”：

1. 读取 `index.html`
2. 清空 `<div id="__nuxt">...</div>` 中的 SSR 首页 DOM
3. 把 `data-ssr="true"` 改为 `data-ssr="false"`
4. 用最小 Nuxt payload 替换 `__NUXT_DATA__`
5. payload 的 `path` 使用当前请求 pathname
6. 保留 head 内的全局 CSS 和 module preload

这样 Nuxt 会从空容器按当前 URL 客户端启动，而不是尝试 hydrate 首页。

实现函数为 `serveClientApp(response, pathname)`，位于 `server.mjs`。

修复后，直接打开章节页时标题变为：

```text
章节1 - 宇宙汤 - 宇宙汤资料库 - COSMIC BROTH
```

## 17. 第五个踩坑：深层页面还有大量二级 API

章节页首次成功加载模块后，控制台出现：

```text
加载 JSON 失败: Unexpected token '<'
```

Network 显示页面还会请求：

```text
/api/records/yuzhoutang
/api/records/yuzhoutang/c1
```

因为服务器当时只支持 4 个全局 API，这些请求落入 HTML fallback，所以 JSON 解析读到了 `<!DOCTYPE html>`。

### 17.1 批量生成所有 API 路径

读取 `api/router.json`：

- records：为每个作品下载索引和所有章节
- portraits：为每个 ID 下载数据
- images：为每个 ID 下载数据

总共新增 68 个二级接口快照，加上 4 个全局接口，共 72 份 JSON。

### 17.2 泛化本地 API 路由

服务器从固定 4 个 endpoint 改成：

```js
const apiMatch = url.pathname.match(/^\/api\/([a-zA-Z0-9_/-]+)$/);
```

并映射为：

```text
/api/records/yuzhoutang/c1
-> api/records/yuzhoutang/c1.json
```

仍通过 `safePath` 防止目录穿越。

## 18. 批量本地化深层页面内容资源

72 份 JSON 共引用 155 个 `/assets/...` 文件。扫描所有 JSON 后下载缺失项，最终 `assets/` 共 157 个文件，约 65.5 MB。

内容包括：

- 背景和星球 PNG/JPG
- 章节插图
- 人物肖像
- GIF 动图
- 图像浏览页面作品
- 404 动图

验证 portraits 页面时，浏览器中本地图片示例：

```text
/assets/3_567004c371.png
/assets/2_0d58256650.png
/assets/RAYA_1_c239cdb0b0.png
/assets/_63e11c8cf4.gif
```

验证 images 页面时，所有采样图片的 `naturalWidth > 0`。

## 19. 三类深层页面验证结果

### 19.1 records

测试：

```text
http://127.0.0.1:4173/cosmic-broth/records/yuzhoutang/c1
```

结果：

- 正确标题
- 顶部角色/章节资料卡
- 长篇中文正文
- 页面可正常纵向滚动
- 插图来自本地 `/assets/`
- 无 JSON 请求失败

### 19.2 portraits

测试：

```text
http://127.0.0.1:4173/cosmic-broth/portraits/database
```

结果：

- 标题：`database - 宇宙汤肖像库 - COSMIC BROTH`
- 显示 `DATA SYSTEM`
- 显示角色索引 000、001、002……
- 多张本地人物图加载成功
- 页面 scrollHeight 约 3649（视口条件不同会变化）

### 19.3 images

测试：

```text
http://127.0.0.1:4173/cosmic-broth/images/vlog
```

结果：

- 标题：`Travel log - 宇宙汤图形库 - COSMIC BROTH`
- 显示 `DRAG SCREEN TO BROWSE IMAGES`
- 显示无限滚动状态
- 抽样图片全部 `complete === true && naturalWidth > 0`

## 20. 最终自动验证

### 20.1 Node 语法

```powershell
npm run check
```

实际执行：

```text
node --check server.mjs
```

通过。

### 20.2 所有 Nuxt JS 语法

```powershell
foreach ($file in Get-ChildItem '_nuxt' -Filter '*.js') {
  node --check $file.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

通过。

### 20.3 资源引用完整性

扫描 `index.html`、所有 JS 和所有 JSON 中的 `/assets/...` 引用，并检查文件是否存在。

结果：

```text
MissingAssets    : 0
MissingNuxtFiles : 0
ApiFiles         : 72
AssetFiles       : 157
NuxtFiles        : 42
```

### 20.4 远程依赖和生产值清理

执行：

```powershell
rg -n "https://(api|cdn)\.cosmicbroth\.com|Bearer [a-f0-9]{64,}" `
  index.html _nuxt api
```

结果：

```text
No remote API/CDN references or production bearer tokens remain.
```

### 20.5 HTTP 冒烟检查

以下地址返回 200：

```text
/
/api/records/yuzhoutang
/api/records/yuzhoutang/c1
/cosmic-broth/records/yuzhoutang/c1
```

## 21. 诊断文件清理

开发过程中生成过：

- `reference-full.png`
- `reference-mobile.png`
- `reference-snapshot.txt`
- `local-full.png`
- `local-mobile.png`
- `local-instruction.png`
- `local-star-info.png`
- `local-detail.png`
- `server.stdout.log`
- `server.stderr.log`

这些都是临时取证/对照文件，最终已经删除。根目录只保留交付文件。

## 22. 当前目录结构

```text
cosmicbroth/
├─ _nuxt/                 # Nuxt 运行时、页面 chunk、CSS、字体、内置媒体
│  └─ builds/meta/        # Nuxt build manifest
├─ api/
│  ├─ images/             # 4 份 JSON
│  ├─ portraits/          # 4 份 JSON
│  ├─ records/            # 60 份 JSON（含作品索引和章节）
│  ├─ introduces.json
│  ├─ overview.json
│  ├─ router.json
│  └─ unknownWorlds.json
├─ assets/                # 157 个内容图片/GIF
├─ meta/
│  └─ favicon_32.png
├─ index.html
├─ package.json
├─ README.md
├─ REPLICATION_LOG.md
└─ server.mjs
```

## 23. 后续模型维护指南

### 23.1 正常启动

```powershell
cd D:\a_programming_list\Ai-application\Aweb101\cosmicbroth
npm start
```

访问：

```text
http://127.0.0.1:4173/
```

若 4173 被占用：

```powershell
$env:PORT = '4174'
npm start
```

### 23.2 修改服务器后检查

```powershell
npm run check
```

### 23.3 判断是不是缺 API

浏览器若报：

```text
Unexpected token '<'
```

通常说明某个 `/api/...` 请求落入 HTML fallback。查看 Network 中失败的 API URL，并检查是否存在对应：

```text
api/<路径>.json
```

### 23.4 判断是不是缺异步 chunk

若深层页面空白或出现 module parse error：

1. 查看 Network 是否有 `_nuxt/*.js` 或 `_nuxt/*.css` 返回 HTML
2. 搜索 `Bx70QQQb.js` 中的动态 import
3. 下载缺失 chunk
4. 对所有 JS 执行 `node --check`

### 23.5 判断是不是缺内容图片

扫描：

```powershell
rg -o '/assets/[^"'')`]+' index.html _nuxt api
```

再确认每个文件位于 `assets/`。

### 23.6 不要再次使用会形成嵌套数组的 `$targets`

避免：

```powershell
$targets = @((Get-Item ...), (Get-ChildItem ...), (Get-ChildItem ...))
```

更安全的扁平写法：

```powershell
$targets = @()
$targets += Get-Item index.html
$targets += Get-ChildItem _nuxt -Filter '*.js'
$targets += Get-ChildItem api -Recurse -Filter '*.json'
```

或者直接分别循环不同文件组。

### 23.7 不要把深层路由改回完整 SSR 首页 fallback

`serveClientApp` 是深层 URL 能直接打开的关键。若直接返回完整 `index.html`，会重新出现 hydration mismatch 和“地址是详情页但内容仍是首页”的问题。

### 23.8 原站更新时的同步建议

原站重新部署后，hash 文件名、API 内容和路由都可能变化。建议按这个顺序同步：

1. 下载最新首页 HTML
2. 从最新入口 bundle 提取所有 import
3. 下载缺失 `_nuxt` 文件
4. 下载全局 API
5. 从 router 生成所有二级 API 路径
6. 扫描所有 JSON 的 CDN URL
7. 下载缺失 assets
8. 统一替换 API/CDN 根地址和生产 Bearer
9. 运行全部语法与完整性检查
10. 用真实 Chrome 验证首页、帮助、星球、三类深层页面和移动端

不要把生产 Bearer 值提交进新日志或输出给用户。

## 24. 已知但不阻塞的问题

- 某些 Lottie SVG path 会在 Chromium 控制台产生 `transform="null"` 提示。
- 星空 Canvas 使用随机数，因此逐像素截图不会稳定一致。
- 背景和星球容器可以拖动，因此原站和本地站在不同时间截图时位置可能不同。
- 时钟会实时更新。
- API 是 2026-07-13 的本地快照；未来原站新增内容不会自动同步。
- 外部社交链接仍需要网络。

这些不会影响当前复刻页面的视觉、主要交互和本地深层内容访问。

## 25. 一句话总结

本项目不是一张静态截图，而是把原站公开 Nuxt 应用运行时、响应式样式、动画模块、路由数据、72 份 API 和 157 个内容资源整体镜像到本地，再通过自定义 Node 服务解决深层路由的 SSR/CSR 启动和本地 API 映射问题。
