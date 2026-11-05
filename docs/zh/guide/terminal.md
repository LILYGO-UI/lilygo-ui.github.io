---
title: Terminal 终端使用说明
description: 使用本机 Shell、触摸键盘、会话控制和终端偏好设置。
---

# Terminal 终端使用说明

Terminal 在 PTY 中启动本机 `/bin/sh`。它是本机 Shell，不是 SSH 客户端或沙箱。

## 会话流程

从 Launcher 打开 **Terminal**，等待提示符。使用软件或实体键盘输入并按 **Enter**。
**Clear** 清空显示但不停止 Shell；**Restart** 停止进程并新建会话；标题栏 **Exit** 离开。
目录和变量只在当前会话保留。

| 控件 | 用法 |
| --- | --- |
| 触摸键盘 | 小写、大写、数字和符号。 |
| **Special keys** | 打开终端控制键窗口。 |
| **Ctrl** | 一次性控制修饰键。 |
| **Esc**、**Tab**、**Enter** | 发送终端输入。 |
| 方向键 | ANSI 光标序列。 |
| **BS** | 删除字节。 |
| **Clear** | 只清空本地屏幕缓冲。 |
| **Restart** | 重新创建 Shell。 |
| **A-** / **A+** | 保存 14、18 或 22 px 字体。 |

`Ctrl+C` 通常中断前台程序；空输入行的 `Ctrl+D` 可能结束 Shell；`Ctrl+L` 清空屏幕。
连接实体键盘后软件键盘会隐藏。

## 环境与权限

子进程继承环境并设置 `TERM=ansi`。初始目录依次取 `LILYGO_UI_TERMINAL_HOME`、
`HOME`、账号主目录和 `/`。`LILYGO_UI_TERMINAL_PS1` 可覆盖提示符。命令只能访问启动账号
有权限的资源。Terminal 进程以 root 身份运行时，其 Shell 也具有 root 权限。
Launcher 通常以已登录的 Linux 用户身份启动应用。

## 偏好与限制

字体以 `font_level=0/1/2` 保存 14/18/22 px。`LILYGO_UI_TERMINAL_CONFIG` 指定配置路径，
`LILYGO_UI_TERMINAL_SHELL` 替换 `/bin/sh`，`LILYGO_UI_TERMINAL_HOME` 设置初始目录。
当前无滚屏历史；不会渲染 ANSI 颜色和字符属性，xterm 扩展及部分全屏程序可能异常。

| 现象 | 检查 |
| --- | --- |
| **Shell exited** | 点击 **Restart** 并检查 Shell 路径。 |
| PTY 失败 | 检查 `/dev/ptmx`、devpts 和权限。 |
| 字体未保存 | 检查配置路径和目录权限。 |
| 全屏程序异常 | 确认支持 `TERM=ansi`。 |

[返回使用文档](../user-guide) · [返回文档中心](../docs)
