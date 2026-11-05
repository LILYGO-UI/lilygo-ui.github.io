---
title: 开发快速开始
show_source: false
---

# 开发快速开始

本页整理上游 LILYGO-UI 仓库描述的应用开发流程，面向应用开发者和贡献者。需要为设备烧录系统镜像时，请先阅读[快速开始：USB 与 TF 卡烧录](./device-quick-start)。

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

请确保目标系统、sysroot 和编译工具链的架构一致、版本兼容。系统镜像与烧录步骤请参阅[快速开始](./device-quick-start)。

> CM0BspBuilder 是应用构建所需的 sysroot/toolchain 工具，不是 bootloader、kernel、device tree、kernel module 或完整设备镜像生成器。

## 硬件准备

板卡参数与接口请参阅 [T-Display-CM0 官方 Wiki](https://wiki.lilygo.cc/zh/products/t-display-series/t-display-cm0/)。安装 LILYGO UI 系统镜像时，请按[快速开始：USB 与 TF 卡烧录](./device-quick-start)操作。

## 下一步

- 查看[应用目录](./applications)寻找示例。
- 阅读[开发指南](./development)了解 AppKit、manifest 和运行时。
- 查看[常见问题](./faq)确认硬件支持范围。
