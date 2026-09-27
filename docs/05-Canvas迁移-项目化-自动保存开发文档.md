# AI 无限画布网站 — Canvas 迁移 / 项目化 / 自动保存开发文档

## 1. 核心原则

现有 Canvas 已完成。

禁止：

```text
重做 Canvas
整体重构 Canvas
更换 Canvas 框架
破坏现有交互
```

只增加：

```text
projectId
加载
保存
权限
保存状态
```

## 2. 新路由

```text
/canvas/[projectId]
```

## 3. 页面初始化

流程：

```text
读取 projectId
↓
检查登录
↓
GET /api/projects/[projectId]
↓
GET /api/projects/[projectId]/canvas
↓
将 canvas_data 注入现有 Canvas
↓
完成初始化
```

## 4. 初始化状态

```typescript
type CanvasLoadStatus =
  | 'loading'
  | 'ready'
  | 'error'
```

## 5. 保存状态

```typescript
type SaveStatus =
  | 'saved'
  | 'saving'
  | 'unsaved'
  | 'error'
```

UI：

```text
未保存
正在保存...
已保存
保存失败
```

## 6. 自动保存

推荐：

```text
Canvas 发生变化
↓
标记 unsaved
↓
等待 1500ms
↓
如果期间没有新变化
↓
PUT /api/projects/[id]/canvas
```

## 7. Debounce

建议：

```typescript
const SAVE_DELAY = 1500
```

禁止：

```text
每次 mousemove 都请求 API
```

## 8. 防止重复保存

保存前比较：

```text
currentSerializedCanvas
lastSavedSerializedCanvas
```

相同则跳过。

## 9. 页面离开保护

如果状态：

```text
unsaved
saving
```

可在浏览器离开时提示：

```text
你有未保存的更改
```

## 10. 保存失败

失败后：

```text
状态 = error
显示 “保存失败”
显示 “重新保存”
```

不要丢掉内存中的最新 Canvas。

## 11. 网络恢复

可选增强：

```text
网络失败
↓
保留 dirty state
↓
网络恢复
↓
自动重试一次
```

## 12. Canvas 数据

优先沿用当前 Canvas 的原始序列化格式。

数据库：

```text
canvases.canvas_data JSONB
```

不要为了数据库改动 Canvas 核心结构。

## 13. 项目标题

Canvas 顶部建议显示：

```text
返回 Dashboard
项目名称
保存状态
```

## 14. 手动保存

可增加：

```text
Ctrl / Cmd + S
```

触发立即保存。

## 15. Canvas 验收

```text
打开项目
↓
加载历史内容
↓
编辑
↓
自动保存
↓
刷新
↓
内容恢复
↓
退出登录
↓
重新登录
↓
重新打开
↓
内容恢复
```
