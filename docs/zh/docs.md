---
title: 文档中心
description: LILYGO UI 快速开始、开发文档与应用使用文档。
layout: doc
sidebar: false
aside: false
show_source: false
---

# 文档中心

文档分为「快速开始」「开发文档」和「使用文档」三类，按你的目标选择入口。

## 快速开始

面向第一次使用或需要重装系统的设备使用者，介绍准备系统镜像、USB 烧录镜像和 TF 卡烧录镜像两种方式，以及烧录后的首次启动。

**[进入快速开始 →](./device-quick-start)**

- [下载系统镜像](./device-quick-start#download-image) — 下载本教程使用的 T-Display-CM0 镜像，USB 与 TF 烧录共用。
- [USB 烧录镜像](./device-quick-start#usb-flashing) — 使用 USB 数据线连接电脑与设备，完成镜像写入。
- [TF 卡烧录镜像](./device-quick-start#tf-flashing) — 通过读卡器将镜像写入 TF 卡，再插入设备启动。

连接完成后，按两种方式共用的 [Raspberry Pi Imager 图文步骤](./device-quick-start#imager-flashing)选择镜像、写入并校验。

## 开发文档

面向应用开发者和贡献者，介绍开发环境、AppKit 接入、键盘适配、构建打包和硬件部署。

**[进入开发文档 →](./developer-guide)**

- [开发快速开始](./quick-start) — 准备工具、创建项目、运行模拟器、打包和部署。
- [开发指南](./development) — AppKit、应用清单、运行时分层和发布流程。
- [键盘接入指南](./keyboard-input) — 焦点导航、文本编辑和弹窗处理。
- [T-Display-CM0 硬件资料（官方 Wiki）](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/) · [系统镜像烧录](./device-quick-start) · [常见问题](./faq)

## 使用文档

面向设备使用者，介绍准备条件、安装和打开应用、界面操作、文件保存位置与常见问题。覆盖 CM0 工作目录中的全部应用和 Template 示例，共 27 篇指南。

**[进入使用文档，查看全部应用指南 →](./user-guide)**

- **系统与日常工具：** Launcher、Store、Settings、Files、Calculator、Monitor、Terminal。
- **影音与游戏：** Camera、Gallery、Music、Radio、YouTube、NES。
- **网络与助手：** Maps、Clash、LilyChat（Telegram）、PicoClaw、小智。
- **硬件与通信：** Cellular、Meshtastic、I2C Detector、IMU、Sensors、Serial。
- **示例：** Template。

首次使用可以从 [Launcher 启动器](./guide/launcher)、[Settings 系统设置](./guide/settings)和 [Store 应用商店](./guide/store)开始。需要从电脑传文件时，打开[浏览器文件共享](./file-share)。需要从电脑终端操作设备时，查看 [SSH 远程登录](./ssh-login)。

[浏览应用目录](./applications) · [返回项目中心](./)
