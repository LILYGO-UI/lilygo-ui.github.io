---
title: 使用文档
description: CM0 全部应用的准备条件、操作步骤、文件保存位置和常见问题。
show_source: false
---

# 使用文档

这里介绍设备上的应用如何使用，覆盖 CM0 工作目录中的 Launcher、独立应用，以及 Template 示例，共 27 篇指南。每篇说明准备条件、实际界面操作和常见问题。

## 第一次使用

1. 准备已安装兼容 LILYGO UI 系统和 Launcher 的设备；尚未准备好时，先看[快速开始](./device-quick-start)，选择 USB 或 TF 卡方式烧录镜像。
2. 打开 [Settings 系统设置](./guide/settings)，连接 Wi-Fi 并检查设备设置。
3. 打开 [Store 应用商店](./guide/store)，查找并安装可用应用，再回到 [Launcher 启动器](./guide/launcher)点击应用图标。
4. 在下方找到对应指南。在线服务可能需要账户或 API 凭据；硬件工具需要相应模块和驱动，各篇指南会说明具体条件。
5. 从电脑传入文件可以使用[浏览器文件共享](./file-share)，再通过 [Files 文件管理](./guide/files)查找。
6. 需要从电脑终端操作设备时，按照 [SSH 远程登录](./ssh-login)在 Settings 中开启 **Remote Login** 并建立连接。

Template 示例是独立项目，不一定出现在 Store 或你的系统镜像中，请按对应指南进入。文档保留应用界面的实际按钮名称，部分按钮为英文。

## 系统与日常工具

| 应用 | 使用内容 |
| --- | --- |
| [Launcher 启动器](./guide/launcher) | 打开应用、翻页、快捷控制和文件共享。 |
| [Store 应用商店](./guide/store) | 浏览、安装、更新和卸载应用。 |
| [Settings 系统设置](./guide/settings) | Wi-Fi、蓝牙、SSH 远程登录、通用设置和键盘振动。 |
| [Files 文件管理](./guide/files) | 浏览存储、整理文件和预览文本。 |
| [Calculator 计算器](./guide/calculator) | 表达式计算、科学计算布局和记忆功能。 |
| [Monitor 系统监控](./guide/monitor) | 设备资源、网络活动和测量历史。 |
| [Terminal 终端](./guide/terminal) | 运行本机 Shell 命令和使用触摸键盘。 |

## 影音与游戏

| 应用 | 使用内容 |
| --- | --- |
| [Camera 相机](./guide/camera) | 相机预览、拍照、录像和查找拍摄文件。 |
| [Gallery 图库](./guide/gallery) | 相册分类、图片浏览和文件信息。 |
| [Music 音乐](./guide/music) | 添加本地音乐、管理队列和播放控制。 |
| [Radio 网络电台](./guide/radio) | 搜索电台、收藏和设置睡眠定时器。 |
| [YouTube](./guide/youtube) | 浏览、搜索和播放受支持的公开视频。 |
| [NES 模拟器](./guide/nes) | 导入 ROM、游戏操作和读写存档。 |

## 网络与助手

| 应用 | 使用内容 |
| --- | --- |
| [Maps 地图](./guide/maps) | 搜索地址、移动地图和管理瓦片缓存。 |
| [Clash 代理管理](./guide/clash) | 导入配置、管理代理服务和查看连接。 |
| [LilyChat（Telegram）](./guide/telegram) | 配置凭据、登录和收发文字消息。 |
| [PicoClaw 助手](./guide/picoclaw) | 配置模型、对话和管理后台网关。 |
| [Xiaozhi 小智](./guide/xiaozhi) | 设备激活、语音对话和字幕查看。 |

## 硬件与通信

| 应用 | 使用内容 |
| --- | --- |
| [Cellular 蜂窝网络](./guide/cellular) | 查看蜂窝网络状态、连接移动网络、使用 GNSS 和查看 AT 诊断。 |
| [Meshtastic](./guide/meshtastic) | 连接节点、查看网状网络和发送消息。 |
| [I2C Detector 扫描器](./guide/i2c-detector) | 扫描总线并识别 I2C 地址。 |
| [IMU 运动传感器](./guide/imu) | 查看运动读数和调整显示灵敏度。 |
| [Sensors 传感器](./guide/sensors) | 检查传感器、键盘事件和记录 CSV。 |
| [Serial 串口工具](./guide/serial) | 配置串口并收发 ASCII/HEX 数据。 |

## 示例

| 程序 | 使用内容 |
| --- | --- |
| [Template 模板示例](./guide/template) | 操作入门项目中的计数器。 |

## 文档范围

这些说明依据 **2026 年 11 月 3 日**核对的本地应用源码整理。已发布软件包与设备镜像可能存在版本差异；界面缺少某个控件时，请结合已安装版本及对应指南的功能限制检查。

`lpm`、AppKit、sysroot 构建器、Mesa VC4 等工具和运行库收录在[开发文档](./developer-guide)。查询可安装的软件包和应用源码，请打开[应用目录](./applications)。

[返回文档中心](./docs)
