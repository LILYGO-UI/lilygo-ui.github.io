---
title: Clash 代理管理使用说明
description: 管理 mihomo 模式、订阅、Provider、连接、规则、日志和测试。
---

# Clash 代理管理使用说明

Clash 通过 REST controller 控制独立 mihomo 进程，设备默认地址是
`http://127.0.0.1:9090`。

## 使用前准备

安装完整软件包并启动 mihomo 服务，准备 HTTP(S) 订阅或 YAML 文件。启用认证时设置
`CLASH_API_SECRET`。网络功能需要联网，模拟器可以使用 Demo 数据。

## 代理和订阅

首页显示用量、当前节点、连接、流量、IP 和内核状态。在 **代理** 中选择代理组或节点，
执行延迟测试。代理模式包括 **规则**、**全局** 和 **直连**。

在 **订阅** 输入地址后点击 **导入**，完整配置点击 **导入完整配置**，本地文件点击
**导入 YAML 文件**。打开条目可编辑、**更新订阅**、启用或删除。节点列表成为 HTTP Provider，
完整配置成为受管理订阅，本地节点列表成为 File Provider。配额需要服务提供 Provider API
元数据或 `Subscription-Userinfo` 响应头。

## 其他控件

**连接** 查看并关闭连接；**规则** 浏览规则；**日志** 暂停或排序；**测试** 检查网站。
**设置** 可切换局域网访问、TUN 和 IPv6，显示混合端口、日志级别和统一延迟。
mihomo v1.19.30 的统一延迟只读。未包含系统代理接管或桌面自启动，CM0 应控制规则集规模。

## 配置与排障

可覆盖 `CLASH_API_URL`、`CLASH_API_SECRET`、`CLASH_CONFIG_PATH`（默认
`/etc/mihomo/config.yaml`）、`CLASH_CONTROLLER_CONFIG_PATH` 和 `CLASH_SUBSCRIPTION_USER_AGENT`。

| 现象 | 检查 |
| --- | --- |
| 无法连接内核 | mihomo 服务、地址和密钥。 |
| 导入失败 | URL/YAML、磁盘和网络。 |
| 无用量 | Provider 未提供配额信息。 |
| TUN 失败 | 权限、内核 TUN 和配置。 |
| 代理缓慢 | 测试延迟并减少规则集。 |



## 外部修改

应用不替代 mihomo 的完整配置编辑器。外部修改后使用刷新或重新加载查看结果。
订阅更新可能移除旧代理组或节点，需要重新选择。控制器密钥属于私有 Bearer 凭据。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
