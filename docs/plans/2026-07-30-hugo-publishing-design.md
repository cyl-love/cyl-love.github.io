# Hugo 日常写作与 GitHub Actions 发布设计

## 目标

用 Hugo 替代原来的 Hexo 发布流程，让日常操作固定为“创建文章、预览、验证、发布”四步，并由 GitHub Actions 构建和部署 GitHub Pages。

## 已确认方案

- `main` 分支保存 Hugo 源码，而不是 `public/` 生成文件。
- 推送 `main` 后，由 `.github/workflows/hugo.yml` 构建并发布网站。
- 本地 `public/`、`.tools/`、依赖目录和旧 `.deploy_git` 缓存不进入 Git。
- 保留旧 Hexo 内容作为本地迁移备份，但旧主题、旧依赖和 `.github` 下的重复 Hexo 工程不进入新源码仓库。

## 日常命令

```powershell
npm run new -- "文章标题" "分类" "标签1,标签2"
npm run serve
npm run verify
npm run deploy
```

`new` 创建带有唯一旧式 `/posts/<id>.html` 地址的 Markdown 文件，保持现有文章 URL 规则一致。`deploy` 先运行完整验证，只在通过后提交并推送源码；没有文件变化时不创建空提交。

## 数据流

1. 新文章写入 `content/blog/<category>/`。
2. Hugo 本地服务器实时读取 Markdown、布局和静态资源。
3. `npm run verify` 运行单元测试、生产构建和站点完整性审计。
4. `npm run deploy` 将源码提交到 `main` 并推送到 GitHub。
5. GitHub Actions 重新验证、构建并发布 `public/` 制品到 GitHub Pages。

## 错误处理

- 缺少标题时拒绝创建文章。
- 分类和标签进行 YAML 安全序列化，文件名进行 Windows 路径字符清理。
- ID 与已有 `abbrlink` 冲突时递增选择下一个可用值。
- 验证失败、Git 未初始化、分支不正确或没有 `origin` 时，发布脚本停止且不推送。
- 推送前显示提交内容；真正部署由 GitHub Actions 状态决定。

## 验证

- 单元测试覆盖中文标题、分类、多个标签、唯一 ID 和重复文件保护。
- 站点完整性检查覆盖全部文章、旧 URL、搜索索引和本地图片。
- 使用临时 Git 仓库测试发布脚本的无变更和验证失败路径。
- 首次迁移前审计 Git 忽略规则和待提交文件清单。
