---
title: 开发指南
show_source: false
---

# 开发指南

LILYGO UI 将 UI 工具包、launcher、应用项目和目标 sysroot 分开维护，使桌面模拟和 CM0 AArch64 构建可以使用同一套应用结构。

## 运行时分层

| 层 | 作用 | 参考 |
| --- | --- | --- |
| 应用 | 独立可执行文件、界面、状态和设备行为 | [template](https://github.com/LILYGO-UI/template) |
| Launcher | 通过 JSON manifest 发现应用并显示应用网格 | [launcher](https://github.com/LILYGO-UI/launcher) |
| AppKit | LVGL、字体、系统状态、状态栏和 runtime 服务 | [cm0-appkit](https://github.com/LILYGO-UI/cm0-appkit) |
| Sysroot/toolchain | AArch64 头文件、库、包 overlay 和 CMake 交叉编译配置 | [CM0BspBuilder](https://github.com/LILYGO-UI/CM0BspBuilder) |
| 项目工作流 | 初始化、主机测试、交叉编译、Debian 打包和 SSH 部署 | [lpm](https://github.com/LILYGO-UI/lpm) |

## AppKit 集成

AppKit README 记录了 CMake 集成方式：

```cmake
find_package(LilyGoUI CONFIG REQUIRED)
```

公开的 CMake target 包括 `LilyGoUI::LVGL`、`LilyGoUI::UIFonts`、`LilyGoUI::SystemStatus`、`LilyGoUI::StatusBar` 和 `LilyGoUI::Runtime`。主机使用 SDL2 和 FreeType，目标机使用 CM0 sysroot 提供的 DRM/FreeType 环境。

## 键盘接入

应用通过 `cm0_app_run()` 使用 `LilyGoUI::Runtime` 的默认输入组，由 AppKit 负责键盘发现、热插拔、按键映射、焦点导航和软键盘抑制。业务逻辑连接到控件事件，并按需标记弹窗焦点范围和滚动浏览区域。

[键盘接入指南](./keyboard-input)提供代码示例、按键行为速查、焦点样式说明，以及验证和发布检查清单。

## Launcher 布局

应用通过 JSON manifest 被 launcher 发现。上游 launcher README 描述的默认逻辑画布为竖屏 **568 × 1232**，状态栏 **96 px**，每页最多 **18 个应用**。这些是当前默认值，设计依赖精确尺寸时请以仓库最新内容为准。

## 构建路径

从 [template](https://github.com/LILYGO-UI/template) 开始，用 [lpm](https://github.com/LILYGO-UI/lpm) 进行主机验证，再使用 [CM0BspBuilder](https://github.com/LILYGO-UI/CM0BspBuilder) 提供的 sysroot 构建 Debian 构件，最后通过 [packages](https://github.com/LILYGO-UI/packages) 注册应用。
