---
title: Meshtastic 使用说明
description: 连接 meshtasticd，收发网状消息，查看节点地图、遥测、频道和设备设置。
---

# Meshtastic 使用说明

Meshtastic 是通过 TCP Client API 连接 `meshtasticd` 的网状电台客户端。
程序名为 `lilygo-ui-meshtastic`，导航包含 **Messages**、**Nodes**、**Map** 和 **Status**。

## 使用前准备

- 准备已连接 Meshtastic radio 的 `meshtasticd`，并启用 TCP Client API。
- 默认连接 `127.0.0.1:4403`；远程主机需允许该 TCP 端口访问。
- 地图新瓦片和地址搜索需要网络、curl 与 CA certificates；消息本身不依赖地图网络。
- 首次连接前确认设备配置可被修改，破坏性操作会要求确认。

## 连接电台

默认启动会尝试本机 `127.0.0.1:4403`。本机 `meshtasticd.service` 未运行时，应用会请求启动服务并继续重连。
远程端点或自定义端口不会启动本机服务。需要指定端点时，从终端运行：

```sh
lilygo-ui-meshtastic --host 192.168.8.222 --port 4403
```

也可通过 LPM 传入 `--host` 和 `--port`。打开 **Status**，确认连接状态、设备名、固件、在线节点、LoRa 频段和会话计数。
服务不可用时会显示同步超时并自动重连；请先修复服务或网络。

## 收发消息

1. 在 **Messages** 浏览频道和私聊会话。
2. 点击会话进入聊天；连接前会提示 `Connect to receive mesh messages.`。
3. 在 `Message` 输入文本并发送，草稿会在导航和旋转时保留。
4. 根据状态区分 queued、sent-to-radio、ACK、rejected、timeout 或 failure。
5. 失败消息使用 **Retry message** 明确重试，不会自动重复发送。
6. 使用搜索和分页加载较旧消息；点击 **Channels** 编辑频道列表。

## 节点、遥测与地图

- **Nodes**：浏览节点、位置、遥测、最后活动与路由信息。
- 节点详情的 **Request telemetry** 请求最新遥测，**Trace route** 请求路由。
- **Message** 可直接发起私聊；**Share waypoint** 创建或分享可编辑航点。
- **Show on Map** 打开地图并选中节点；**Follow node** 跟随其位置，手动拖动地图会暂停跟随。
- **Map** 支持平移、缩放、Fit、地址搜索、节点详情和 **Clear cache**。

地图优先使用连接电台的位置；没有本机位置时可使用已知节点。
清理地图缓存只删除底图，不删除聊天、设置、节点历史或轨迹。

## 频道与设备设置

- **Channels**：编辑频道槽位、密钥、上行/下行开关；可预览并导入/导出标准 ChannelSet URL。
- **Status → Settings**：修改设备与模块配置。保存单项或整个类别后，应用会回读验证。
- **Save radio and device configuration** 保存完整设置；**Save selected category** 保存当前类别。
- 设备工具中的重启、关机和 **Reset node database** 属于破坏性操作，确认前检查对象。
- 未暴露在界面的字段会保留，避免保存时意外清空。

## 本地数据、隐私与离线

SQLite 保存消息、频道、节点、配置、位置、遥测、航点和轨迹，按 TCP endpoint 与 radio 身份隔离。
默认数据库在 XDG 数据目录或用户 home 下，也可用 `LILYGO_MESHTASTIC_DB_PATH` 指定。
数据库含聊天与频道密钥；备份前退出应用，并限制文件访问。
地图缓存可用 `LILYGO_MESHTASTIC_MAP_CACHE_DIR` 指定，`LILYGO_MESHTASTIC_MAP_DISABLE_NETWORK=1` 禁止在线请求但保留已有缓存。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 无法连接 | 检查 meshtasticd、主机、TCP 端口和 radio 连接，默认是 127.0.0.1:4403。 |
| 消息一直超时 | 查看 Status 的同步状态、radio 在线状态和链路质量；Retry 需要手动点击。 |
| 地图空白 | 检查网络、curl、CA certificates；离线时只有已缓存瓦片。 |
| 清理缓存后聊天消失 | 正常情况下不会发生；地图 Clear cache 只处理底图。 |
| 设置保存后不一致 | 等待回读完成，检查 radio 权限和设备是否在线。 |

本文依据本地 Meshtastic README、消息/节点/地图/设置页面及存储说明整理。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
