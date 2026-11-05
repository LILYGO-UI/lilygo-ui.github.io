---
title: Sensors user guide
description: Inspect sensors and buses, record CSV, and diagnose the TCA8418 keyboard and ES8389 microphone.
---

# Sensors user guide

Sensors brings together measurements and input diagnostics exposed by system drivers.
Its executable is `lilygo-ui-sensors`, listed as **Sensors** in Launcher.

## Before you start

- Real measurements require the relevant Linux IIO, hwmon, ALSA, or evdev interface.
- Available sensors depend on devices actually exposed by the OS, not merely chips physically present.
- The app needs readable sensor nodes, read/write I2C access for probing, and appropriate input/audio device access.
- Startup and manual discovery include I2C inventory probes; connected devices must tolerate SMBus probing.

## Browse measurements

1. Open **Sensors** in Launcher and wait for discovery and the first readings.
2. Check the state: `Live`, `Demo`, `Paused`, or `Disconnected`.
3. On **Sensors**, filter with the bus dropdown or keep `All buses`.
4. Select a sensor to inspect values, units, history, statistics, and device information.
5. Select `100 ms`, `250 ms`, or `1000 ms` from the sampling interval dropdown.
6. Use the back icon to return to the list; open **Buses** for bus and address inventory.

`Valid`, `Partially valid`, and `Unavailable` distinguish complete, partial, and missing readings.
Failed measurements remain unavailable or erroneous instead of being replaced with zero.
An I2C response does not identify a sensor or guarantee readable measurement channels.

## Toolbar and CSV recording

| Icon / tooltip | Action |
| --- | --- |
| Pause / `Pause / resume` | Freeze visible measurements, history, and sensor CSV recording; tap again to resume. |
| Trash / `Clear history` | Clear history without closing an active CSV file. |
| Refresh / `Rescan devices` | Discover devices and buses again. |
| Save / `Start / stop CSV` | Start or stop a recording session. |

In sensor details, check **CSV** beside the desired channels, then tap the save icon.
Each recording session creates a new file and records only checked channels.
Watch the recording status and tap the save icon again to stop.

The default folder is `$XDG_DATA_HOME/lilygo-ui-sensors/recordings`, or
`$HOME/.local/share/lilygo-ui-sensors/recordings` when unset.
Set `LILYGO_SENSORS_RECORD_DIR` before launch to choose another writable folder.
Rows include UTC, relative time, device, bus, channel, value, unit, error, and device ID.

## Keyboard and microphone

- Open **TCA8418 / Keyboard** to inspect the latest key, code, action, and up to 100 recent events.
- Entering the keyboard page starts event monitoring; pausing or leaving closes its input node. Keyboard pause is independent of sensor pause.
- `HELD KEYS` shows currently held keys. Repeat events appear only when reported by the driver.
- ES8389 microphone details display RMS and a live waveform. RMS is in `dBFS`, not acoustic `dB SPL`.
- Keyboard history and raw microphone waveforms are excluded from sensor CSV files; selected measurement channels can be recorded.

Microphone capture temporarily uses +18 dB PGA gain by default and restores it when capture stops.
Busy or disconnected capture remains unavailable and is retried.

## Diagnostics without a display

```sh
lilygo-ui-sensors --probe --samples 3 --interval 250
lilygo-ui-sensors --keyboard-probe --samples 40 --interval 100
```

These commands emit NDJSON without opening a display. `LILYGO_SENSORS_DEMO=1` explicitly enables simulated values.
Real hardware failures never silently change to demonstration data.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Empty sensor list | Clear bus filters, rescan, and check IIO/hwmon drivers and access. |
| I2C address exists but no measurement | Address acknowledgement does not mean a driver or readable channels exist. |
| CSV has no new rows | Selected channels, recording state, pause state, and writable directory. |
| No keyboard events | Detected TCA8418 device, evdev access, and keyboard pause state. |
| Microphone unavailable | ES8389 sound card, capture access, and competing audio applications. |

Based on local Sensors operation documentation and the sensor and keyboard views.

[Back to user guides](../user-guide) · [Documentation center](../docs)
