---
title: Clash Proxy User Guide
description: Control mihomo modes, subscriptions, providers, connections, rules, logs, and tests.
---

# Clash Proxy User Guide

Clash controls a separate mihomo process through its REST controller. The device default
is `http://127.0.0.1:9090`.

## Before you start

Install the full Clash package and start its mihomo service. Prepare an HTTP(S) subscription
or YAML file. If authentication is enabled, provide `CLASH_API_SECRET`. Network features
need internet; the simulator can use deterministic Demo data.

## Proxy and subscriptions

The home page displays usage, active node, connections, traffic, IP, and mihomo status.
In **代理**, choose a group or node and run latency checks. Modes are **规则** (rule),
**全局** (global), and **直连** (direct).

In **订阅**, enter a URL and press **导入**. Use **导入完整配置** for a full profile or
**导入 YAML 文件** for a local file. Open an entry to edit, **更新订阅**, enable, or delete.
Node lists become HTTP Providers; complete profiles become managed subscriptions; local
YAML node lists become File Providers. Quota information requires Provider API metadata or
the `Subscription-Userinfo` response header.

## Other controls

**连接** views and closes connections; **规则** browses rules; **日志** pauses or sorts logs;
**测试** runs website checks. **设置** toggles LAN access, TUN, and IPv6 and displays mixed
port, log level, and unified-delay status. With mihomo v1.19.30, unified delay is read-only.
System proxy takeover and desktop startup hooks are not included. Keep rule sets small on CM0.

## Configuration and troubleshooting

Overrides are `CLASH_API_URL`, `CLASH_API_SECRET`, `CLASH_CONFIG_PATH` (default
`/etc/mihomo/config.yaml`), `CLASH_CONTROLLER_CONFIG_PATH`, and `CLASH_SUBSCRIPTION_USER_AGENT`.

| Symptom | Check |
| --- | --- |
| Kernel connection fails | mihomo service, URL, and secret. |
| Import fails | URL/YAML syntax, disk, and network. |
| No usage | Provider did not supply quota metadata. |
| TUN fails | Permissions, kernel TUN, and package configuration. |
| Slow proxy | Test latency and reduce oversized rule sets. |



## External changes

The app does not replace mihomo's full configuration editor. Refresh or reload after
editing files outside the app. Subscription updates can remove old groups or nodes,
so select a node again when needed. Treat controller secrets as private Bearer credentials.

[All user guides](../user-guide) · [Documentation center](../docs)
