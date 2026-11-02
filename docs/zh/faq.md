---
title: 常见问题
show_source: false
---

# 常见问题

## LILYGO UI 是硬件板卡吗？

不是。LILYGO UI 是面向 LILYGO 设备的开源软件平台，硬件参数请查看对应产品文档。

## 当前支持哪些设备？

上游组织 README 将 **T-DisplayCM0** 列为支持设备，将 **T-DisplayK230** 标记为暂未支持。其他设备请以组织和具体应用仓库的最新说明为准。

## CM0BspBuilder 会生成完整设备镜像吗？

不会。[CM0BspBuilder README](https://github.com/LILYGO-UI/CM0BspBuilder) 将其定位为应用 sysroot 和 toolchain 构建工具，不负责 bootloader、kernel、device tree、kernel module 或完整可启动镜像。

## 没有 CM0 设备可以测试吗？

可以。AppKit 和 template 提供基于 SDL2 的主机 profile，可以在桌面验证界面和交互；硬件相关行为仍需在目标机上验证。

## 应用注册表在哪里？

[packages](https://github.com/LILYGO-UI/packages) 是审核后的应用注册表来源，GitHub Releases 保存 Debian 构件，生成的 GitHub Pages 数据提供只读 AppStore 协议。
