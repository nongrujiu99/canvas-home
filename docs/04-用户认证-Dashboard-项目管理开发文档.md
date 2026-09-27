# AI 无限画布网站 — 用户认证 / Dashboard / 项目管理开发文档

## 1. Auth 技术

使用：

```text
Supabase Auth
```

第一版：

```text
Email + Password
```

后续可增加：

```text
Google
GitHub
```

## 2. 注册

路由：

```text
/signup
```

字段：

```text
Email
Password
Confirm Password
```

校验：

```text
Email 合法
Password >= 8
两次密码一致
```

成功后：

```text
注册
↓
创建 auth.users
↓
触发创建 profiles
↓
登录或等待邮箱验证
↓
进入 /dashboard
```

## 3. 登录

```text
/login
```

字段：

```text
Email
Password
```

成功：

```text
/dashboard
```

## 4. 退出

调用：

```text
supabase.auth.signOut()
```

然后：

```text
/
```

## 5. 忘记密码

```text
/forgot-password
```

流程：

```text
输入 Email
↓
发送 reset 邮件
↓
用户点击邮件
↓
设置新密码
```

## 6. 页面权限

公开：

```text
/
/login
/signup
/forgot-password
```

需要登录：

```text
/dashboard
/settings
/canvas/*
```

未登录访问保护页面：

```text
redirect('/login')
```

## 7. Dashboard 页面

```text
/dashboard
```

布局：

```text
顶部导航
├── Logo
├── Projects
└── User Menu

页面内容
├── 标题：我的项目
├── + 新建画布
└── Project Grid
```

## 8. Project Card

显示：

```text
thumbnail
name
updated_at
```

操作：

```text
打开
重命名
删除
```

## 9. 新建项目

点击：

```text
+ 新建画布
```

流程：

```text
POST /api/projects
↓
获取 project.id
↓
router.push(`/canvas/${id}`)
```

## 10. 重命名

推荐：

```text
菜单
↓
重命名
↓
弹窗 / 内联编辑
↓
PATCH /api/projects/[id]
```

## 11. 删除

必须二次确认：

```text
确认删除此项目？
此操作不可恢复。
```

确认后：

```text
DELETE /api/projects/[id]
```

## 12. 空状态

没有项目：

```text
还没有项目
创建你的第一张 AI 无限画布
[新建画布]
```

## 13. Loading

```text
正在加载项目...
```

## 14. Error

```text
项目加载失败
[重新加载]
```

## 15. 用户菜单

建议：

```text
头像
邮箱
设置
退出登录
```

## 16. Dashboard 验收

必须：

```text
注册成功
登录成功
创建项目
项目立即出现
刷新后仍存在
重命名后仍存在
删除后消失
退出后无法访问 dashboard
```
