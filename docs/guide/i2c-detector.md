---
title: I2C Detector user guide
description: Scan Linux I2C buses, select adapters, and interpret the seven-bit address map.
---

# I2C Detector user guide

I2C Detector displays the I2C adapters found on Linux and their detected addresses.
The installed executable is `lilygo-ui-i2cdetector`.

## Before you start

- Use Linux with the required I2C controller and pin configuration enabled.
- The kernel must expose `i2c-dev` nodes named `/dev/i2c-*`.
- The application user needs read/write access to those nodes.
- Follow the board requirements for supply voltage, common ground, signal levels, and pull-ups.

Opening the app immediately scans every discovered adapter.
Probes use SMBus Quick writes or Byte reads, which can affect some devices; confirm that connected hardware tolerates probing first.
Selecting a bus changes the displayed result, not the scan scope.

## Run a scan

1. Open **I2C Detector** in Launcher.
2. Wait for the automatic scan. The status shows the total address count and unavailable buses.
3. Select `/dev/i2c-N` to inspect its address matrix, count, or error.
4. After changing wiring or permissions, tap **Scan** to rediscover and scan all adapters.
5. While scanning, **Scan** is disabled and the previous results remain selectable.

The complete report replaces the previous one at the end; there is no per-address progress display.
The selected bus is retained if it still exists.
Scanning is not periodic; tap **Scan** when results need refreshing.

## Read the address map

| Appearance | Meaning |
| --- | --- |
| Green address | A probe succeeded, or a kernel driver already owns the address. |
| Unhighlighted address | No response was detected; unsupported transactions or an unavailable bus can also cause this. |
| Muted address | `0x00`–`0x02` and `0x78`–`0x7F` are excluded from probing. |

The matrix covers `0x00`–`0x7F`; probes cover `0x03`–`0x77`.
For example, `3C` means seven-bit address `0x3C`, without a read/write bit.
The “devices” count is a count of detected addresses, not identified chip models.
Green cells do not distinguish a response from a kernel-owned address with a separate `UU` marker.
Address cells do not open a register editor, and the scanner cannot distinguish devices sharing one address.

## Access and platform behavior

Inspect device access from a terminal:

```sh
ls -l /dev/i2c-*
id
```

An administrator should grant access using the actual device group or system udev policy.
Installing the application does not enable controllers or install a permission rule.
The Linux desktop simulator also scans real hardware; an SDL window is not a demo mode.
macOS and other non-Linux systems display `I2C scanning is only available on Linux devices` without simulated buses.

## Data and limitations

Reports exist only in the current session; there is no history storage or export control.
There is no bus allowlist, address-range setting, or automatic scan interval.
An address response does not establish sensor measurements or device functionality.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `No I2C buses found` | Controller configuration, driver, and `/dev/i2c-*`, then tap Scan. |
| `Bus unavailable: Permission denied` | Node read/write access and the account's group membership. |
| Zero addresses | Bus selection, power, wiring, seven-bit address, and supported SMBus transactions. |
| Status includes `unavailable` | Select the affected bus to read its error; other buses may work normally. |
| Scanning or closing is slow | A kernel transaction may still be waiting; inspect the adapter and driver. |

Based on the local scanning guide, scanner, and I2C Detector page implementation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
