---
title: PicoClaw 使用说明
description: 配置模型和渠道，聊天，控制 Gateway 并更新运行时。
---

# PicoClaw 使用说明

PicoClaw 是聊天客户端和本地 Gateway 控制器。CM0 软件包包含原生运行时，macOS 模拟器默认用 Docker。

## 首次聊天

1. 打开 **PicoClaw → Models**。
2. 在服务商分组点击 **+**，输入名称、API 地址、Key 和 **Model**。
3. 支持时使用 **Test** 或 **Fetch**，然后 **Save**。
4. 回到 Chat，在 **Model** 选择保存的配置。
5. 模型验证后发送消息。

每个模型独立保存 Key。切换模型保留会话和草稿。**New chat** 保留旧会话，**History** 切换会话，
**Earlier messages** 显示最近 32 条之前的内容。

## Gateway、渠道和更新

在 **Settings** 使用 **Start gateway**、**Stop gateway** 和刷新，**Settings → Logs** 查看活动。
关闭 UI 后 Gateway 继续运行。CM0 不需要 Docker，macOS 需要配置好的 Docker 运行时。

在 **Channels** 选择集成，填写凭据，打开 **Enabled** 并 **Save**，重启 Gateway 应用普通渠道修改。
列表显示配置状态，不验证真实连通性。

微信选择 **Bind Weixin**，扫码并在微信确认，然后启用并 **Save**。二维码五分钟过期，可用
**New QR code** 或 **Cancel**；成功保存微信后，运行中的 Gateway 自动重启。

CM0 打开 **Settings → Updates → Check for updates**，选择版本并点击 **Install selected**。
下载会校验摘要并保存在用户版本目录；启动或健康检查失败恢复旧版本。

## 数据与限制

运行时/工作区：`$XDG_DATA_HOME/lilygo/ui/picoclaw/`；配置和密钥：
`$XDG_CONFIG_HOME/lilygo/ui/picoclaw/`；日志和 PID：`$XDG_STATE_HOME/lilygo/ui/picoclaw/`。
未设置这些 XDG 变量且没有额外 PicoClaw 路径覆盖时，默认使用启动用户的主目录：

| 数据 | 默认目录 |
| --- | --- |
| 运行时和工作区 | `$HOME/.local/share/lilygo/ui/picoclaw/` |
| 配置和密钥 | `$HOME/.config/lilygo/ui/picoclaw/` |
| 会话记录、日志和 PID | `$HOME/.local/state/lilygo/ui/picoclaw/` |

会话自动保存，API Key 使用权限 0600 的私有文件。设备无 Web 管理服务控件，
本地模型控件不能切换远程 Gateway 模型。

| 现象 | 检查 |
| --- | --- |
| Send 不可用 | 编辑后重新选择验证模型。 |
| Gateway 失败 | 运行时、`config.json`、`.security.yml` 和 Logs。 |
| 渠道未生效 | 保存并重启 Gateway。 |
| 二维码过期 | 点击 **New QR code**。 |
| 更新失败 | GitHub、摘要、磁盘和平台归档。 |

[返回使用文档](../user-guide) · [返回文档中心](../docs)
