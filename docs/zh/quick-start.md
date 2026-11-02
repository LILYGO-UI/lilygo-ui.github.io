---
title: 快速开始
show_source: false
---

# 快速开始

本页整理上游 LILYGO-UI 仓库描述的应用开发流程，面向应用开发者和贡献者。设备系统镜像写入、恢复等操作仍应遵循对应硬件的官方说明。

## 准备工具

根据 [lpm README](https://github.com/LILYGO-UI/lpm)，开发环境需要 Python 3.11+、CMake 3.21+、Git、C/C++ 编译器和 SDL2 主机依赖；创建 Debian 包时还需要 `dpkg-deb`，通过网络部署时需要 SSH/SCP。具体安装命令以仓库 README 为准。上游文档给出的安装方式之一是：

```sh
python3 -m pip install "git+https://github.com/LILYGO-UI/lpm.git"
lpm --version
```

上游也推荐在符合你的 Python 工作流时使用 `uv tool install`。

## 创建和构建应用

[template](https://github.com/LILYGO-UI/template) 是完整的 starter 项目，展示响应式 LVGL 界面、C++ MVVM 结构、launcher 发现机制、元数据和 Debian 打包。[lpm](https://github.com/LILYGO-UI/lpm) 负责从模板初始化、主机模拟、AArch64 交叉编译、打包和 SSH 部署。空目录可以这样初始化：

```sh
mkdir weather-station
cd weather-station
lpm init
```

上游 README 还记录了 `lpm start`（主机模拟）、`lpm test --report build/test-results.xml`（测试）、`lpm pack --output dist`（Debian 打包）和 `lpm deploy --host cm0.local --user pi`（SSH 部署）。具体选项和 target 名称请以最新 README 为准。

AppKit 提供 SDL2 主机 profile，可先在桌面验证界面和交互，再部署到 CM0。LILYGO-UI 软件仓库记录的是 AArch64 Linux 目标机构建流程，使用 [CM0BspBuilder](https://github.com/LILYGO-UI/CM0BspBuilder) 生成 sysroot 和 CMake toolchain。

[T-Display-CM0 硬件仓库](https://github.com/Xinyuan-LilyGO/T-Display-CM0) 当前记录的是另一套 Raspberry Pi OS 32-bit armhf 镜像部署流程。不能仅凭这些文档假设镜像、编译器和 LILYGO-UI 的 AArch64 流程可以互换；部署前请在上游仓库确认支持的组合。

> CM0BspBuilder 是应用构建所需的 sysroot/toolchain 工具，不是 bootloader、kernel、device tree、kernel module 或完整设备镜像生成器。

## 硬件准备

如果你正在准备实体板卡，请先阅读 [T-Display-CM0 硬件](./hardware)。板卡仓库单独记录 Raspberry Pi OS 镜像和首次启动部署流程，和 LILYGO UI 应用构建流程分开。

## 下一步

- 查看[应用目录](./applications)寻找示例。
- 阅读[开发指南](./development)了解 AppKit、manifest 和运行时。
- 查看[常见问题](./faq)确认硬件支持范围。
