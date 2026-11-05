---
title: System Monitor user guide
description: Inspect CPU, memory, storage, temperature, network traffic, and the latest 60 samples.
---

# System Monitor user guide

System Monitor shows the running device's system state and refreshes every second.
The installed executable is `lilygo-ui-monitor`.

## Before you start

- The app primarily reads Linux `/proc`, `/sys`, and system identity files.
- It needs no separate monitoring service or internet connection.
- Temperature depends on kernel thermal nodes; missing hardware cannot provide real measurements.
- Network rates come from local interface counters, not an internet speed-test service.

## Read the dashboard

1. Open **System Monitor** in Launcher.
2. Allow a few refresh cycles for CPU and network rate samples to accumulate.
3. Inspect the CPU, Memory, Storage, and Temperature cards.
4. Scroll to network interfaces, system version, hostname, and uptime.
5. The layout adapts to portrait and landscape automatically.

| Item | Meaning |
| --- | --- |
| CPU | Usage, online core count, and one-minute load average. |
| Memory | Used/total RAM and usage percentage. |
| Storage | Used/total space on `/`, not every mounted disk. |
| Temperature | Kernel-reported CPU temperature and high-temperature status. |
| Network interface | Link state, IPv4 address, and live receive/transmit rates. |
| Uptime | Time elapsed since the operating system started. |

Network cards are created dynamically, excluding loopback and Docker-related interfaces.
An interface without an IPv4 address may still exist; inspect its link state too.

## Inspect trends

1. Tap a CPU, memory, storage, temperature, network, or Uptime card.
2. The dialog shows the latest 60 samples and current, minimum, average, and maximum values.
3. Network dialogs show both RX and TX curves.
4. Tap the upper-right close button or outside the dialog to return to the dashboard.

History starts with this application launch, so a newly opened app has a short chart.
Invalid values appear as `--`, are excluded from statistics, and remain gaps in charts.

## Sources and retention

| Data | System source |
| --- | --- |
| CPU, RAM, load, uptime | `/proc/stat`, `/proc/meminfo`, `/proc/loadavg`, `/proc/uptime` |
| Interfaces and traffic | `/proc/net`, `/sys/class/net`, and system interface queries |
| Temperature | `/sys/class/thermal/thermal_zone*/temp` |
| Storage | Filesystem statistics for `/` |
| System identity | `/etc/os-release` and kernel information |

Only the latest 60 samples from this run are retained; there is no long-term history database or export control.
Reopening starts a new history. This dashboard cannot configure networking, clean disks, or terminate processes.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| A value is `--` | Check the relevant readable system source and driver; unavailable does not mean zero. |
| Network rate is zero | An idle interface may carry no traffic; check the link and observe normal network activity. |
| An interface is absent | Check whether it exists in the OS; loopback and Docker-related interfaces are excluded. |
| USB storage does not change Storage | The card measures the root filesystem, not another mount point. |
| Chart history disappears after reopening | Samples are kept only for the current run. |

Based on the local Monitor README, system data source, and statistics dialog implementation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
