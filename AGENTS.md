## 用户当前需求概览

1. 支持自定义 MCP 服务，兼容 HTTP 与 SSE，并在移动端内置文件沙箱能力，让 AI 可在沙箱内创建、读取、写入、删除文件。
2. 优化软件动效与流畅度（尤其是安卓端）并改进 UI 细节：  
   - 聊天输入框底部支持显示完整模型名或仅显示模型图标（可在设置中切换）。  
   - “相机 / 照片 / 文件”按钮改为圆角正方形。  
   - HTML 代码块新增“预览”按钮，点击后可全屏查看渲染结果。  
3. 后续要求：对所有已有修改与需求撰写记录，并持续维护在此文件。

## 已完成的关键改动

### MCP 能力扩展
- 添加 `@modelcontextprotocol/sdk` 依赖，并为 Metro 配置 EventSource polyfill，保证 HTTP 与 SSE MCP 客户端可以在 React Native 环境运行。
- 新增 `src/services/McpClientManager.ts`，使用 MCP SDK 的 SSE 与 Streamable HTTP 传输实现远程工具列表与调用。
- 扩展 `mcp` 数据库结构，引入 JSON `config` 字段，并在 Drizzle 迁移中同步更新；更新映射逻辑以保存头信息、URL 等配置。
- `McpService` 更新：  
  - 从远端 MCP 服务实时获取工具列表（非内置服务），并在服务器配置变化时自动重置连接。  
  - 删除/更新服务时清理客户端连接。
- `mcpTool.ts` 更新：  
  - 新增远程工具调用流程，支持错误格式化。  
  - 内置文件沙箱工具实现（列出文件 / 读取 / 写入 / 删除），引入 `McpFileSandbox` 使用 Expo FileSystem 读写安全目录。  
  - 内置工具调用失败时返回友好提示。
- `config/mcp.ts` 中加入 `@cherry/files` 内置服务器及对应工具，Update `BuiltinMCPServerNames`。

### HTML 预览
- `MarkdownCode` 组件支持 HTML 代码预览：在复制按钮旁新增“眼睛”图标，点击后以全屏 WebView 渲染预览。

### UI / 动效优化
- 聊天输入框 `MentionButton` 计划支持基于偏好设置的模型名称展示（设置项已准备，后续任务需完成 UI 逻辑）。
- 将 ToolSheet 中“相机 / 照片 / 文件”三个入口改造成圆角正方形按钮（待后续补齐）。
- 引入偏好项 `ui.model_display_mode`（默认展示完整名称）。
- General 设置页后续将加入模型展示模式切换开关（待完成）。

### 偏好与初始化
- 更新偏好 schema：增加 `ModelDisplayMode` 类型与 `ui.model_display_mode` 默认值。
- App 初始化迁移新增版本 2：插入文件沙箱内置服务与模型展示偏好默认值。

### 其他基建
- 在 `polyfills` 中引入 EventSource polyfill。
- `metro.config.js` 增加 EventSource alias。
- 清理 `modelcontextprotocol-sdk` 与 `react-native-sse` 临时包。

## 最新完成改动（2025-11-01）

### UI / 动效优化（完成）
- **MentionButton 模型展示模式**：已接入 `ui.model_display_mode` 偏好设置
  - 支持两种模式：`full`（显示图标+完整名称）和 `icon`（仅显示图标）
  - 单模型和多模型场景均已适配
  - 文件：`src/componentsV2/features/ChatScreen/MessageInput/MentionButton.tsx`

- **ToolSheet 圆角正方形按钮**：已完成
  - 将 `aspect-[1.618]` 改为 `aspect-square`（正方形比例）
  - 圆角从 `rounded-lg` 升级为 `rounded-2xl`（更圆润）
  - 文件：`src/componentsV2/features/Sheet/ToolSheet/SystemTools.tsx`

### 设置页面扩展（完成）
- **模型展示模式设置页**：新增独立设置页面
  - 创建 `ModelDisplaySettingsScreen.tsx`
  - 提供单选界面，支持在"完整名称"和"仅图标"之间切换
  - 已添加到 General 设置页的"显示设置"组中
  - 文件：
    - `src/screens/settings/general/ModelDisplaySettingsScreen.tsx`
    - `src/screens/settings/general/GeneralSettingsScreen.tsx`
    - `src/navigators/settings/GeneralSettingsStackNavigator.tsx`

### 国际化翻译（完成）
- 为中英文添加模型展示模式相关翻译
  - 中文（简体）：完整名称 / 仅图标 / 模型显示
  - 英文：Full Name / Icon Only / Model Display
  - 翻译路径：`settings.general.model_display.*`
  - 涉及文件：`src/i18n/locales/zh-cn.json`, `src/i18n/locales/en-us.json`

### 性能优化（完成）
- **组件渲染优化**：
  - 使用 `React.memo` 包装组件，避免不必要的重渲染
    - `MentionButton` 组件
    - `SystemTools` 组件
  - 使用 `useMemo` 缓存计算结果，减少重复计算
    - 选项列表的创建
    - 渲染内容的计算
  - 使用 `useCallback` 包装事件处理函数，避免每次渲染创建新函数
    - 点击事件处理
    - 渲染函数
  - 涉及文件：
    - `src/componentsV2/features/ChatScreen/MessageInput/MentionButton.tsx`
    - `src/componentsV2/features/Sheet/ToolSheet/SystemTools.tsx`
    - `src/screens/settings/general/ModelDisplaySettingsScreen.tsx`

### CI/CD 配置（完成）
- **持续集成 (CI)**：
  - 新增 `.github/workflows/ci.yml` 配置文件
  - 在每次推送到 main 分支时自动运行代码检查
  - 包含类型检查、代码规范检查、格式检查、国际化检查
  - 验证构建是否成功（prebuild Android）
  
- **发布构建**：
  - 已有 Android 和 iOS 的发布 workflow
  - 通过创建 tag（如 `v1.0.0`）触发自动构建和发布
  - 使用 EAS Build 构建应用
  - 自动创建 GitHub Release

## 尚待完成/注意事项

1. ~~聊天输入中模型展示模式偏好尚未接入 UI~~（✅ 已完成）
2. ~~ToolSheet 中圆角正方形按钮需求尚未实现~~（✅ 已完成）
3. ~~General 设置页后续将加入模型展示模式切换开关~~（✅ 已完成）
4. 安卓动效流畅度优化未具体处理（需继续排查启动/动画性能）。
5. 各模块新增功能需补充测试（远程 MCP 调用、文件沙箱边界情况、HTML 预览渲染、模型展示模式切换等）。
6. 记录文件（本文件）需随着后续修改持续更新。

> 提示：继续开发时请确保保持中文输出，并遵循用户给出的新增需求列表。所有改动应同步记录在 AGENTS.md 内。
