---
title: LilyChat Telegram 使用说明
description: 登录 Telegram，浏览聊天，发送文本，查看媒体并管理账号设置。
---

# LilyChat Telegram 使用说明

LilyChat 是使用 Telegram API 和 TDLib 的非官方客户端，与 Telegram 没有隶属或背书关系。

## 使用前准备与登录

打开 **LilyChat**（软件包 `lilygo-ui-telegram`）。真实模式需要网络、API ID、API hash 和 TDLib；
Demo 只用于界面预览。选择 QR 或手机号登录；手机号流程可能要求邮箱验证码或两步密码。
QR 登录用已登录设备扫描确认，成功后进入 **Chats**。

### 提供应用凭据

应用内没有 API ID/hash 编辑入口。设备软件包可能已包含应用凭据；未包含时，
在启动 LilyChat 的环境中设置以下变量，再重新启动应用：

| 环境变量 | 填写内容 |
| --- | --- |
| `TELEGRAM_DEMO` | `0`，选择真实 TDLib 后端。 |
| `TELEGRAM_API_ID` | Telegram 为你的应用分配的 API ID，必须是正整数。 |
| `TELEGRAM_API_HASH` | 与该 API ID 配套的应用 API hash。 |
| `LILYGO_UI_TDJSON_LIBRARY` | 可选；找不到 TDLib 时填写 `libtdjson.so` 或 `libtdjson.dylib` 的绝对路径。 |

填写的是 Telegram 应用凭据，不是手机号、登录验证码或 Bot Token。
非空运行环境值会覆盖软件包中预置的凭据。经 Launcher 打开时，需要管理员把这些变量配置到
应用启动环境；在另一个终端修改环境不会改变已运行的应用或 Launcher。请妥善保管 API hash。

## Chats、Contacts 与消息

**Chats** 浏览会话并加载旧消息；搜索只覆盖缓存聊天名称和最后消息预览。
**Contacts** 搜索已加载联系人，可按手机号添加并打开私聊。应用发送纯文本，下载 JPEG/PNG，
Linux 可播放 Ogg Opus 语音。打开用户、群组或频道查看资料；**Settings** 有 **Saved Messages**。
切换聊天和标签时草稿保留。

## 账号与数据

在 **Settings** 编辑姓名、用户名和简介，设置通知，打开 **Privacy and Security**、**Devices**、
**Storage Usage**。**Clear Media Cache** 只删除本地媒体。默认目录为
`$HOME/.local/share/lilygo-ui-telegram/`，设置 `XDG_DATA_HOME` 时为其下的
`lilygo-ui-telegram/`，包含 `database/`、`files/`、`ui-preferences.json`。同一数据库只能由一个进程使用。

## 当前限制

不支持视频、动画、普通音频、文件预览、录制或发送语音/照片/文件、注册、Premium、编辑/回复/转发、
服务器搜索、通话、秘密聊天、群管理、代理、推送和删除账号。聊天搜索最多 100 个缓存聊天，联系人
最多 500 个；会话最多 80 条消息，照片最多 3 张且合计 6 MiB。草稿在注销或退出后清除。

| 现象 | 检查 |
| --- | --- |
| 收不到验证码 | 网络、手机号/邮箱、两步验证和系统时间。 |
| 图片为占位符 | 自动下载、网络、磁盘和 JPEG/PNG 解码。 |
| 语音无法播放 | ALSA、libopusfile、输出设备和权限。 |
| 找不到旧聊天 | 本地搜索只覆盖缓存。 |
| 要删除账号 | 使用 Telegram 官方客户端或网页。 |

发送消息旁的单个勾号不表示对方已读。媒体下载使用本地空间，
**Clear Media Cache** 不会删除云端消息。磁盘不足时文字可能仍可用，但媒体会失败。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
