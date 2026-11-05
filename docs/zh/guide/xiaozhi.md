---
title: XiaoZhi 语音助手使用说明
description: 绑定 XiaoZhi，使用按住说话、连续对话、历史、重连和音频控制。
---

# XiaoZhi 语音助手使用说明

XiaoZhi 通过 WebSocket 连接兼容服务，提供绑定、字幕、历史、按住说话、连续对话和播放。

## 绑定

联网后打开 **XiaoZhi**。在 xiaozhi.me 选择 **Add device**，输入应用显示的 6 位验证码并等待激活。
应用会保存 WebSocket 地址和令牌，后续启动复用；绑定页的 **Refresh code** 可重新获取验证码。

## 对话控件

| 控件 | 用法 |
| --- | --- |
| **Hold to talk** | 按住至 **Release to send** 后松开。 |
| **Continuous chat** | 本地 VAD 在停顿后发送，播放后继续收听。 |
| **Stop** | 中断回复或录音。 |
| **History** | 查看会话转写。 |
| **New chat** | 清空显示记录并新建协议会话。 |
| **Reconnect** | 重试 helper 和 WebSocket。 |

录音开始前松开会取消待录音。录音或连接错误会关闭连续对话，恢复后需重新开启。
键盘可用 `Tab`、方向键、`Enter`、`M` 和 `Esc`。

## 音频、身份与限制

重连等待从 2 秒增加到最多 20 秒。真实会话需要 DNS、TLS 证书和服务可用。音频为 16 kHz 单声道 Opus，
采用半双工，播放结束后才恢复录音。唤醒词需要兼容 helper 和模型，CM0 不含 K230 唤醒栈或全双工 AEC。

身份和连接数据位于模拟器 `.xiaozhi/`；设备使用
`$XDG_DATA_HOME/lilygo-ui-xiaozhi/`、`$HOME/.local/share/lilygo-ui-xiaozhi/` 或
`/tmp/lilygo-ui-xiaozhi/`。`device.conf` 保存 ID，`connection.conf` 保存地址和令牌；目录 0700，文件 0600。
不要把绑定目录复制到另一台设备。历史只在内存中保留最多 80 条，**New chat** 或退出后清空。

| 现象 | 检查 |
| --- | --- |
| 没有验证码 | DNS、网络、系统时间、CA、**Reconnect** 或 **Refresh code**。 |
| 每次都要求绑定 | 确认同一用户、可写目录和身份未变。 |
| 录音失败 | 麦克风权限、输入设备、音量和占用程序。 |
| 没有播放 | 扬声器、输出设备和 `XIAOZHI_PLAYBACK`。 |
| 一直重连 | 网络和服务状态。 |
| 没有唤醒词 | 安装兼容 KWS helper/model；仍可按住说话。 |



录音会发送给服务，转写和音频保留取决于服务政策。helper 使用保存的令牌，正常界面不会显示。
每台物理设备应保持独立数据目录；更换目录会更换后续会话使用的身份。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
