---
trigger: always_on
---
# 测试与验收规则
完成每个阶段前：
1. 读取 package.json 确认脚本。
2. 运行存在的 build、typecheck、lint、tests。
3. 检查 git diff。
4. 确认没有意外修改 Canvas 核心代码。
5. 确认没有 Secret 泄露和明显权限漏洞。
6. 只修复当前阶段引入或明确暴露的问题，不顺便大规模重构。
若命令不存在，明确说明，不得虚构成功结果。
