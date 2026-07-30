# cyl 的知识库

基于 Hugo 的三栏知识库博客，内容从原 Hexo + Butterfly 站点迁移而来。

线上地址：[https://cyl-love.github.io/](https://cyl-love.github.io/)

## 环境准备

需要 Node.js 22。项目已经在 `.tools/hugo/hugo.exe` 配置了便携版 Hugo；该目录不会提交到 GitHub，GitHub Actions 会自行安装 Hugo Extended 0.164.0。

首次下载项目后执行：

```powershell
npm ci
```

## 日常写作流程

### 1. 创建文章

```powershell
npm run new -- "文章标题" "分类" "标签1,标签2"
```

例如：

```powershell
npm run new -- "Hugo 博客使用记录" "博客搭建" "Hugo,GitHub Pages"
```

文章会创建在 `content/blog/<分类>/`。分类或标签可以省略：

```powershell
npm run new -- "随手笔记"
```

新文章默认包含：

```yaml
---
title: "文章标题"
date: "2026-07-30 12:34:56"
tags: ["标签1","标签2"]
categories: ["分类"]
url: "/posts/20260730123456.html"
abbrlink: "20260730123456"
draft: true
---
```

`draft: true` 表示草稿，不会出现在正式网站。写完后改成：

```yaml
draft: false
```

不要手工修改 `url` 和 `abbrlink`，它们负责保证文章永久链接稳定。

### 2. 写正文和添加图片

直接编辑文章 Markdown 文件。图片放入 `static/images/`，推荐每篇文章使用独立目录：

```text
static/images/hugo-guide/cover.png
```

在文章中引用：

```markdown
![封面](/images/hugo-guide/cover.png)
```

### 3. 本地预览

```powershell
npm run serve
```

浏览器打开 [http://127.0.0.1:1313/](http://127.0.0.1:1313/)。保存 Markdown、CSS 或模板后页面会自动刷新。按 `Ctrl+C` 停止服务器。

草稿默认不会显示；需要预览草稿时执行：

```powershell
npm run serve -- --buildDrafts
```

### 4. 发布

先把文章的 `draft` 改为 `false`，然后执行：

```powershell
npm run deploy
```

该命令会自动完成：

1. 运行全部测试和生产构建；
2. 检查文章链接、搜索索引和本地图片；
3. 显示待提交文件摘要；
4. 提交 Hugo 源码并推送 `main`；
5. 触发 GitHub Actions 发布 GitHub Pages。

可以自定义提交说明：

```powershell
npm run deploy -- "site: 发布 Hugo 使用记录"
```

推送后在仓库的 **Actions** 页面查看 `Deploy Hugo site to Pages`。任务成功后，线上网站通常会在几分钟内更新。

## 修改已有文章

1. 在 `content/blog/` 中找到对应的 `.md` 文件。
2. 修改正文、标题、分类或标签。
3. 不要修改原有的 `url` 和 `abbrlink`。
4. 运行 `npm run serve` 预览。
5. 运行 `npm run deploy` 发布。

需要临时隐藏文章时，将 `draft` 改为 `true` 后重新发布。需要永久删除时，删除 Markdown 文件和不再使用的图片，再运行 `npm run verify` 确认没有断链。

## 修改网站

常用位置：

| 内容 | 文件或目录 |
| --- | --- |
| 站点名称、作者、GitHub 地址 | `hugo.toml` |
| 文章 | `content/blog/` |
| 关于页 | `content/about/` |
| 友链页和友链数据 | `content/link/`、`data/` |
| 页面模板 | `layouts/` |
| 样式 | `assets/css/main.css` |
| 搜索、主题切换等交互 | `assets/js/main.js` |
| 图片、头像等静态文件 | `static/` |
| 自动部署 | `.github/workflows/hugo.yml` |

修改后始终先运行：

```powershell
npm run verify
```

## 常用命令

```powershell
# 创建草稿
npm run new -- "标题" "分类" "标签1,标签2"

# 本地预览正式内容
npm run serve

# 本地预览并包含草稿
npm run serve -- --buildDrafts

# 只构建网站
npm run build

# 完整测试、构建和审计
npm run verify

# 验证通过后提交并发布
npm run deploy
```

原来的命令不再使用：

```powershell
hexo clean
hexo g
hexo d
```

## 首次 GitHub Pages 设置

仓库只需设置一次：

1. 打开 `https://github.com/cyl-love/cyl-love.github.io/settings/pages`。
2. 在 **Build and deployment** 下将 **Source** 设为 **GitHub Actions**。
3. 推送 `main` 后等待 Actions 完成。

`.github/workflows/hugo.yml` 会在每次推送 `main` 后自动部署，也支持在 Actions 页面手工运行。

## 旧 Hexo 内容

旧 Hexo 文件保留在本机，用于迁移追溯，但不会提交到新的 Hugo 源码仓库。不要在日常写作中运行 `npm run migrate`；该命令只用于重新执行整站迁移，可能重写 `content/blog/` 和图片。

## 故障排查

- `npm run deploy` 提示不是 `main`：先执行 `git switch main`。
- 提示找不到 `origin`：检查 `git remote -v`。
- 图片检查失败：确认文件位于 `static/images/`，文章路径以 `/images/` 开头，并注意文件名大小写。
- 本地能看到、线上看不到：确认 `draft: false`，然后查看 GitHub Actions 是否成功。
- Actions 构建失败：先在本机运行 `npm ci` 和 `npm run verify`，修复错误后重新发布。
