---
title: Cellular 蜂窝网络使用说明
description: 连接 nRF9151，查看蜂窝网络、配置 APN、启停 GNSS 和排查 AT 通信。
---

# Cellular 蜂窝网络使用说明

Cellular 用于查看蜂窝网络、SIM、信号、调制解调器和 GNSS 状态。
安装后的程序名为 `lilygo-ui-cellular`，界面保留英文标签。

## 使用前准备

- 准备运行 Nordic Serial LTE Modem（SLM）固件的 nRF9151、可用 SIM 和相应天线。
- 系统需要完成模块供电、UART 引脚配置和串口驱动，并授予运行用户串口读写权限。
- LTE-M / NB-IoT 注册需要当地网络与 SIM 支持；其他厂商模块不保证兼容 Nordic 扩展命令。
- GNSS 需要兼容固件和 GNSS 天线，宜在可见天空的开阔位置使用。

## 打开并确认数据来源

1. 在 Launcher 打开 **Cellular**。
2. 先检查右上角模式：`LIVE` 为真实模块，`DEMO` 为本地演示。
3. 查看 **Cellular** 页的运营商、SIM、注册状态与 RSRP / RSRQ。
4. 点击刷新图标或 **Refresh all information**，重新读取模块信息。
5. 在 **Modem** 页确认 `Interface` 显示的是实际串口。

Linux AArch64 默认使用 `/dev/ttyACM0`，串口参数为 115200、8N1。
需要指定其他接口时，在设备终端运行：

```sh
CELLULAR_DEMO=0 CELLULAR_PORT=/dev/ttyUSB0 lilygo-ui-cellular
```

将示例路径替换为实际模块节点。关闭同时占用该串口的其他程序。
桌面模拟器默认使用演示数据；`CELLULAR_DEMO=1` 明确启用演示且不打开串口。

## SIM、APN 和联网

1. 进入 **Modem**，点击 **Check SIM** 查看 SIM 身份与就绪状态。
2. 点击 **Run network check** 查看注册与分组业务状态。
3. 需要修改 APN 时，先点 **Disconnect data**。
4. 在 `Access point name` 中填入运营商提供的 APN，点击 **Apply APN**。
5. 点击 **Connect data**，检查数据会话与 IP 地址。
6. 在 `Ping host` 中填写目标，再点 **Ping** 检查连通性。

刷新和网络检查读取当前状态；需要手动点击 **Connect data** 才会请求启用数据会话。

## 定位与调试

- **Location**：点击 **Start location** 开始 GNSS，等待定位，查看经纬度、高度、UTC、HDOP、卫星和天空图；用 **Stop location** 停止。
- **Debug**：查看 AT 命令及完整多行响应，输入关键字搜索命令或响应内容；搜索不区分大小写，每页显示 10 条事务。
- **Modem → Clear activity**：清理活动显示。AT 历史页也可清理当前会话日志。
- 缺失或不支持的真实值保持未知，连接失败不会自动切换到演示数据。

## 数据与权限

连接且空闲时每 5 秒执行只读监测，信号图保留最近 60 个 RSRP 样本。
AT 历史仅保留在当前进程内，最多 200 条事务或 128 KiB 文本。
关闭应用后不能依靠该历史恢复之前的排障记录。
模块、SIM 标识和定位可能出现在日志中，分享截图时按需要遮挡。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 无法打开模块 | 检查串口路径、权限、模块供电、UART 配置和其他串口程序。 |
| SIM 正常但未注册 | 检查运营商支持、天线、SIM 服务和注册响应。 |
| APN 设置后仍无 IP | 断开数据后重新应用 APN，再连接数据，并查看 Debug 的错误响应。 |
| GNSS 一直无定位 | 检查固件、GNSS 天线和天空可见条件，不要将演示坐标当作实测。 |
| 桌面展示了信号但没有模块 | 检查是否为 `DEMO`；明确使用真实模式后重启。 |

本文依据本地 `lilygo-ui-cellular` 的 README、Cellular 页面及 AT 日志实现整理。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
