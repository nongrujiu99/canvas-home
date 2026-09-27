---
trigger: always_on
---
# 安全规则
- SUPABASE_SERVICE_ROLE_KEY 和 AI Secret Key 永远不得进入客户端。
- 服务端不得信任客户端 user_id，必须从真实 Session 获取用户。
- Project / Canvas / Asset 的读取、修改、删除必须验证 owner。
- 所有用户数据表开启 RLS。
- Storage 路径基于真实 user.id 与 projectId。
- 上传文件验证 MIME、大小、项目归属。
- Production 不返回敏感 stack trace 或 Secret。
- .env.local 等 Secret 文件不得提交 Git 或打印到日志。
