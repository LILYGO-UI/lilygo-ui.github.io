---
title: Sensors 传感器使用说明
description: 查看传感器与总线、录制 CSV，并诊断 TCA8418 键盘和 ES8389 麦克风。
---

# Sensors 传感器使用说明

Sensors 集中显示系统驱动提供的传感器和输入设备数据。
安装后的程序名为 `lilygo-ui-sensors`，Launcher 中显示为 **Sensors**。

## 使用前准备

- 真实设备需要 Linux IIO、hwmon、ALSA 或 evdev 驱动提供相应接口。
- 传感器数量取决于系统实际暴露的设备，不能仅凭芯片已焊接就保证显示。
- 运行用户需要读取传感器节点；I2C 探测需要总线读写权限，键盘和麦克风需要对应设备访问权限。
- 启动和手动刷新会进行 I2C 地址清点；确认所连器件允许 SMBus 探测。

## 浏览传感器

1. 在 Launcher 打开 **Sensors**，等待设备发现和首批测量。
2. 检查状态是 `Live`、`Demo`、`Paused` 还是 `Disconnected`。
3. 在 **Sensors** 页用总线下拉框筛选，或保留 `All buses`。
4. 点击某个传感器，查看数值、单位、历史曲线、统计和设备信息。
5. 使用采样间隔下拉框选择 `100 ms`、`250 ms` 或 `1000 ms`。
6. 点击返回图标回到列表；进入 **Buses** 查看总线与地址清单。

`Valid`、`Partially valid`、`Unavailable` 分别表示全部有效、部分有效和无可用数据。
读数缺失会显示不可用或错误，不会用假零值代替。
I2C 响应地址不等于已识别传感器，也不保证存在可读取通道。

## 顶部工具与 CSV

| 图标 / 提示 | 用法 |
| --- | --- |
| 暂停 / `Pause / resume` | 冻结显示数值、历史和传感器 CSV 记录；再次点击恢复。 |
| 垃圾桶 / `Clear history` | 清理当前历史；不会关闭正在写入的 CSV。 |
| 刷新 / `Rescan devices` | 重新发现设备和总线。 |
| 保存 / `Start / stop CSV` | 开始或停止一轮记录。 |

在传感器详情中勾选所需通道旁的 **CSV**，再使用保存图标开始记录。
每次记录新建一个文件，只写入被勾选的通道。
状态区域显示记录信息；结束时再次点击保存图标停止。

默认目录为 `$XDG_DATA_HOME/lilygo-ui-sensors/recordings`，未设置时为
`$HOME/.local/share/lilygo-ui-sensors/recordings`。
可在启动前设置 `LILYGO_SENSORS_RECORD_DIR` 指定可写目录。
CSV 包含 UTC、相对时间、设备、总线、通道、值、单位、错误与设备 ID。

## 键盘与麦克风

- 点击列表中的 **TCA8418 / Keyboard** 查看最后按键、键码、按下状态和最近 100 条事件。
- 进入键盘页开始读取事件；暂停或离开页面时关闭输入节点。键盘暂停独立于传感器暂停。
- `HELD KEYS` 显示当前按住的键，重复事件只在驱动提供时出现。
- ES8389 麦克风详情显示 RMS 和实时波形；RMS 单位为 `dBFS`，不是声压级 `dB SPL`。
- 键盘历史和原始麦克风波形不写入传感器 CSV；CSV 可以记录选中的测量通道。

麦克风默认临时使用 +18 dB PGA 增益，采集停止后恢复；忙碌或失联会显示不可用并重试。

## 无显示诊断与演示

```sh
lilygo-ui-sensors --probe --samples 3 --interval 250
lilygo-ui-sensors --keyboard-probe --samples 40 --interval 100
```

以上命令输出 NDJSON，不打开界面。`LILYGO_SENSORS_DEMO=1` 明确启用演示值。
真实设备出错不会自动切换到演示数据。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 列表为空 | 清除总线筛选，刷新，并检查 IIO/hwmon 驱动与读取权限。 |
| 有 I2C 地址但没有读数 | 地址响应不代表驱动已注册或测量通道可读。 |
| CSV 没有新行 | 确认已勾选通道、记录已开始、没有暂停且目录可写。 |
| 键盘无事件 | 确认是已发现的 TCA8418、evdev 权限正确且键盘页未暂停。 |
| 麦克风不可用 | 检查 ES8389 声卡、采集权限，以及其他程序是否占用。 |

本文依据本地 Sensors 操作诊断文档及传感器、键盘页面实现整理。

[返回使用文档](../user-guide) · [返回文档中心](../docs)
