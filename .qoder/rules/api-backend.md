---
trigger: glob
glob:
  - "src/app/api/**/*"
  - "app/api/**/*"
  - "src/lib/supabase/**/*"
  - "lib/supabase/**/*"
---
# 后端 / API 规则
- 先认证，再执行业务逻辑。
- Project API 必须验证当前用户拥有项目。
- 不接受客户端 user_id 作为可信身份。
- 统一处理常见 HTTP 错误码。
- Production 不返回内部 stack trace。
- 输入做基础校验；上传 API 校验大小和 MIME。
- 数据库结构修改优先通过 migration 管理。
