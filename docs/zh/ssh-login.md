---
title: 开启 SSH 远程登录
description: 在 Settings 中开启 Remote Login、查看设备 IP，并从电脑通过 SSH 登录 LILYGO UI 设备。
---

# 开启 SSH 远程登录

SSH 可以让你从电脑登录设备，在终端中运行命令。设备上的开关位于
**Settings → General → Sharing → Remote Login**。

## 使用前准备

- 完成设备的[首次设置](./guide/launcher#首次开机与登录)，准备好设备的 Linux 用户名和密码。
- 将电脑和设备连接到同一局域网，可使用 Wi-Fi 或有线网络。
- 电脑需要可用的 SSH 客户端；下面的命令在电脑上执行。

设备使用你实际创建或配置的账号，没有通用的默认密码。Settings 的开关负责启停 SSH 服务，
不会创建账号、修改密码或更改现有的密码／密钥认证设置。

## 1. 在 Settings 中打开开关

1. 在设备桌面打开 **Settings**。
2. 进入 **General**，点击 **Sharing**。
3. 打开 **Remote Login** 开关。
4. 等待 **Turning On Remote Login...** 结束，确认页面显示 **Remote Login: On**。

开启成功后即可连接，无须重启设备；重启后 SSH 也会自动启动。操作期间开关暂时不可用，
请等待状态更新。Sharing 中的 **Serial Console** 用于串口登录，使用 SSH 无须开启它。

<DeviceScreenshot
  src="/screenshots/settings-general.png"
  alt="Settings 的 General 页面，包含进入 Sharing 的条目"
  caption="实际设备截图：Settings 0.1.1。点击 General 中的 Sharing，再打开 Remote Login。"
  :width="1232"
  :height="568"
/>

## 2. 查看设备 IP 地址

根据设备当前使用的网络，在 Settings 中查看：

| 连接方式 | 查看位置 |
| --- | --- |
| Wi-Fi | 打开 **Wi-Fi**，进入当前已连接网络的详情，在 **TCP/IP** 中查看 IPv4 地址。 |
| 有线网络 | 打开 **Ethernet**，查看 **IP Address**。 |

记下设备地址，例如 `192.168.1.100`。这是示例地址，请使用自己设备页面显示的地址，
不要填写网关或电脑的地址。更换网络或重新连接后，设备 IP 可能变化。

## 3. 从电脑登录

在电脑上打开终端；Windows 可以使用 PowerShell。将下面的 `username` 替换为设备的 Linux
用户名，将 `192.168.1.100` 替换为上一步查到的设备 IP，再执行：

```sh
ssh username@192.168.1.100
```

第一次连接时，客户端可能显示主机密钥指纹并询问是否继续连接。核对设备指纹后，输入
`yes` 并回车；可请设备管理员提供指纹用于核对。

出现密码提示时，输入该设备账号的密码并回车。输入时通常不会显示字符或星号，属于正常现象。
如果设备已配置密钥登录，则按现有密钥配置完成认证；开启 Remote Login 不会同时开启密码认证。

出现远程命令提示符后，表示登录成功。可以执行 `whoami` 查看当前登录账号。此时输入的命令
在设备上运行。操作完成后输入以下命令，退出本次连接：

```sh
exit
```

退出连接后，设备的 SSH 服务仍然开启。

## 4. 关闭 SSH 登录

在设备上重新进入 **Settings → General → Sharing**，关闭 **Remote Login**，等待状态显示
**Remote Login: Off**。关闭成功后，设备停止接受新的 SSH 登录，并取消 SSH 的开机自动启动。

## 常见问题

| 现象或提示 | 处理方法 |
| --- | --- |
| **SSH Server Is Not Installed** | 设备缺少 SSH 服务端，请让管理员安装 OpenSSH server 后重新打开 Sharing。 |
| **Administrator Permission Is Required to Change Remote Login.** | 当前用户缺少切换服务的权限，请让管理员检查 Settings 软件包及系统授权配置。Settings 不会弹出管理员密码输入框。 |
| **SSH Is Disabled by System Policy** | SSH 被系统策略禁用，请联系设备管理员处理。 |
| **Remote Login Change Was Not Fully Applied** 或切换超时 | 本次变更没有完整生效；重新进入 Sharing 核对状态，若仍报错，让管理员检查系统服务和应用日志。 |
| 电脑提示找不到 `ssh` 命令 | 在电脑上安装或启用 OpenSSH 客户端后再执行连接命令。 |
| `Connection timed out` 或 `No route to host` | 核对设备当前 IP、两端网络连接，以及路由器客户端隔离或防火墙设置。 |
| `Connection refused` | 核对地址并确认 **Remote Login: On**；如果管理员修改过 SSH 端口，按实际端口使用 `ssh -p 端口 用户名@设备IP`。 |
| `Permission denied` | 检查设备用户名、密码或密钥，以及系统允许的认证方式。Remote Login 开启不代表账号认证一定成功。 |

本文的操作路径和状态文案依据 **2026 年 11 月 4 日**核对的 Settings 0.1.1 源码整理。

[Settings 系统设置指南](./guide/settings) · [返回使用文档](./user-guide) · [返回文档中心](./docs)
