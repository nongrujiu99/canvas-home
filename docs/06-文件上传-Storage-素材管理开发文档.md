# AI 无限画布网站 — 文件上传 / Storage / 素材管理开发文档

## 1. 存储方案

使用：

```text
Supabase Storage
```

Bucket：

```text
assets
```

推荐：

```text
Private
```

## 2. 路径

```text
users/{userId}/projects/{projectId}/
├── images/
├── videos/
├── files/
└── thumbnails/
```

## 3. 文件名

使用：

```text
UUID.ext
```

不要直接信任用户原始文件名。

## 4. 上传流程

```text
用户选择文件
↓
前端基础校验
↓
POST /api/assets
↓
服务端验证用户
↓
验证项目 owner
↓
验证 MIME
↓
验证文件大小
↓
生成 storage path
↓
上传 Storage
↓
写入 assets 表
↓
返回 asset
↓
Canvas 创建对应节点
```

## 5. 图片限制

```text
20MB
image/jpeg
image/png
image/webp
image/gif
```

## 6. 视频限制

```text
200MB
video/mp4
video/webm
video/quicktime
```

## 7. 普通文件

```text
50MB
```

## 8. 前端上传状态

```text
等待上传
上传中
上传成功
上传失败
```

## 9. 删除素材

流程：

```text
验证 owner
↓
删除 Storage object
↓
删除 assets 行
↓
Canvas 删除对应节点引用
```

## 10. Signed URL

Private Bucket 使用：

```text
Signed URL
```

不要把 service role key 暴露给客户端。

## 11. 缩略图

第一版可以不自动生成。

后续：

```text
Canvas 截图
↓
上传 thumbnails
↓
更新 projects.thumbnail_url
```
