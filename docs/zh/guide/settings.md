---
title: Settings 系统设置使用说明
description: 配置网络、蜂窝网络、蓝牙、电池、键盘震动、SSH 远程登录和设备信息。
---

# Settings 系统设置使用说明

Settings 管理 LILYGO UI 设备提供的系统服务和硬件功能。

## 使用前准备

- 从 Launcher 打开 **Settings**。
- 网络写入依赖 NetworkManager 和设备授权策略。
- 蜂窝网络通常需要访问 `/dev/ttyACM0`。
- 电池和震动功能需要对应驱动。
- 实体键盘可用 `Tab`、`Shift+Tab`、方向键和 `Enter`。

## 首页与网络

首页提供 **Wi-Fi**、**Bluetooth**、**Ethernet**、**Cellular**、**Battery**、
**General** 和 **Keyboard**。横屏从侧栏选分类，竖屏点击条目后返回。

在 **Wi-Fi** 中启用开关，选择 **OTHER NETWORKS**，在 **Join Network** 输入密码并点击
**Join**。点击已知网络可重连或查看 IP、DNS 和硬件信息。密码由 NetworkManager 配置保存，
Settings 不另存一份。

在 **Ethernet** 查看链路、IP、网关、DNS、MAC、速率、双工和 MTU。选择 **DHCP** 或
**Manual**；手动模式填写 **IP Address**、**Subnet Mask**、**Gateway**、**DNS** 后点击
**Save**。保存前会校验输入。

## Bluetooth 与 Cellular

在 **Bluetooth** 开启射频并等待发现。已配对设备在 **MY DEVICES**，新设备在
**OTHER DEVICES**，可连接或断开。

在 **Cellular** 查看 SIM、注册、运营商、制式、信号和计数。页面直接以 115200 8N1
访问 nRF9151 SLM，不使用 ModemManager；打开前关闭其他串口工具。

## Battery、Keyboard、Sharing

**Battery** 读取电量计，驱动支持时提供容量校准和充电控制。**Keyboard** 在 **Off** 与
**Strong** 间调节震动；可写时写入 `keyboard_feedback_strength`。

打开 **General → Sharing** 管理 **Remote Login** 和 **Serial Console**。串口设置会显示
**Restart Required**，选择 **Restart Now** 或 **Restart Later**。

开启 **Remote Login** 并等待 **Remote Login: On**，即可从电脑通过 SSH 连接设备。
开启成功后立即生效，重启后也会自动启动。查看[开启 SSH 远程登录](../ssh-login)，了解
查看 IP、电脑连接、账号认证、关闭服务和常见问题的完整步骤。

<DeviceScreenshot
  src="/screenshots/settings-general.png"
  alt="Settings 分类侧栏与 General 页面中的 About 和 Sharing 入口"
  caption="实际设备截图：Settings 0.1.1，展示分类侧栏及 General 中的 About、Sharing 入口。"
  :width="1232"
  :height="568"
/>

Settings 使用 NetworkManager、BlueZ、`/sys/class/power_supply` 和板级串口/sysfs。
授权规则在 `/etc/sudoers.d/`，默认蜂窝锁文件是 `/tmp/lilygo_nrf9151_uart.lock`。

| 现象 | 检查 |
| --- | --- |
| Wi-Fi 为空 | Wi-Fi 开关、NetworkManager 和射频。 |
| Ethernet 保存失败 | 网线、连接配置和 IPv4。 |
| Bluetooth 不可用 | BlueZ 和蓝牙硬件。 |
| Cellular 不可用 | `/dev/ttyACM0` 权限及串口占用。 |
| Battery 无数据 | `/sys/class/power_supply` 和驱动。 |
| 串口设置未生效 | 重启设备。 |

[返回使用文档](../user-guide) · [返回文档中心](../docs)
