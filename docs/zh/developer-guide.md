---
title: 开发文档
description: LILYGO UI 开发环境、AppKit 接入、键盘适配、构建打包和硬件部署。
show_source: false
---

# 开发文档

这里介绍如何开发和维护 LILYGO UI 应用。已经安装应用、需要了解界面操作时，请查看[使用文档](./user-guide)。

## 推荐阅读顺序

1. [开发快速开始](./quick-start)：安装工具、创建项目、在主机运行应用。
2. [开发指南](./development)：了解 AppKit、应用清单、运行时接入和发布职责。
3. [键盘接入指南](./keyboard-input)：实现焦点导航、文本输入和弹窗交互。
4. [T-Display-CM0 硬件资料（官方 Wiki）](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/)：确认板卡参数与接口。系统镜像烧录请按[快速开始](./device-quick-start)操作。
5. [常见问题](./faq)：确认设备支持、sysroot 边界和问题反馈位置。

## 查找应用示例

从[应用目录](./applications)进入各应用源码仓库。[Template 使用说明](./guide/template)介绍模板计数器的界面操作；从模板创建自己的项目，请看[开发快速开始](./quick-start)。

[应用使用文档](./user-guide)还记录了应在设备上验证的行为，包括硬件要求、数据保存和功能限制。

## CM0 工作目录中的配套项目

以下项目提供开发工具、运行库或系统镜像支持，属于开发资料范围。

| 项目目录 | 用途 | 阅读入口 |
| --- | --- | --- |
| `lpm` | 创建项目、主机构建、测试、打包和部署 | [开发快速开始](./quick-start) |
| `lilygo-cm0-appkit` | 公共 UI 与运行时服务 | [开发指南](./development)、[键盘接入指南](./keyboard-input) |
| `CM0BspBuilder` | 应用 sysroot 与交叉编译工具链 | [开发快速开始](./quick-start) |
| `packages` | 应用和运行库的软件包注册表 | [开发指南](./development#构建路径) |
| `lilygo-ui-mesa-vc4` | 私有 Mesa VC4 运行库，没有 Launcher 操作界面 | 仓库 README 和 `docs/build.md` |
| `linux`、`lilygo-linux-dtoverlays` | 内核、硬件驱动与设备树 overlay | [T-Display-CM0 硬件资料（官方 Wiki）](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/)及对应仓库文档 |
| `pi-gen`、`rpi-image-gen`、`usbboot` | 系统镜像生成和设备部署工具 | [系统镜像烧录](./device-quick-start)及各工具 README |

[返回文档中心](./docs)
