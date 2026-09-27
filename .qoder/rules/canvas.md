---
trigger: model_decision
description: 当任务涉及 Canvas、无限画布、节点、连线、viewport、项目加载、保存、自动保存、序列化或 /canvas 路由时应用。
---
# Canvas 保护规则
修改前先识别 Canvas 入口、框架、状态管理、节点/边/viewport 数据、序列化方式、当前持久化和路由。
禁止重做 Canvas、替换 Canvas 框架、无必要修改节点结构、无必要改变 UI/快捷键/拖拽交互。
项目化仅增加 /canvas/[projectId]、Load、Save、约 1500ms debounce Autosave、保存状态、刷新恢复和 owner 权限校验。
数据库优先保存现有 Canvas 可序列化数据。
