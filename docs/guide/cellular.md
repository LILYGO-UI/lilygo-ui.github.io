---
title: Cellular user guide
description: Connect an nRF9151, inspect cellular status, configure APN, use GNSS, and review AT logs.
---

# Cellular user guide

Cellular displays cellular, SIM, signal, modem, and GNSS information.
The installed executable is `lilygo-ui-cellular`; its controls use English labels.

## Before you start

- Use an nRF9151 running compatible Nordic Serial LTE Modem (SLM) firmware, a working SIM, and suitable antennas.
- The system must provide modem power, UART pin configuration, drivers, and read/write access to the serial node.
- LTE-M / NB-IoT registration depends on your SIM and local network. Other modems may not support the Nordic commands used here.
- GNSS requires compatible firmware and a GNSS antenna with a clear view of the sky.

## Open the app and check the source

1. Open **Cellular** in Launcher.
2. Check the mode badge: `LIVE` uses a modem; `DEMO` uses local simulated values.
3. On **Cellular**, inspect the operator, SIM, registration, and RSRP / RSRQ.
4. Tap the refresh icon or **Refresh all information** to read the modem again.
5. On **Modem**, confirm that `Interface` is the intended serial port.

Linux AArch64 defaults to `/dev/ttyACM0` at 115200 baud, 8N1.
To select a different port, launch from a terminal on the device:

```sh
CELLULAR_DEMO=0 CELLULAR_PORT=/dev/ttyUSB0 lilygo-ui-cellular
```

Replace the path with the actual modem node. Close other users of that port.
Desktop simulation defaults to demo mode; `CELLULAR_DEMO=1` explicitly enables it without opening a serial port.

## Check the SIM and connect data

1. Open **Modem** and tap **Check SIM** to inspect SIM identity and readiness.
2. Tap **Run network check** to inspect registration and packet service.
3. Before changing APN, tap **Disconnect data**.
4. Enter the carrier-provided value in `Access point name`, then tap **Apply APN**.
5. Tap **Connect data** and check the session state and IP address.
6. Enter a target in `Ping host` and tap **Ping** to test connectivity.

Refresh and network checks read current status. **Connect data** explicitly requests a data session.

## Location and diagnostics

- **Location:** tap **Start location**, wait for a fix, and inspect coordinates, altitude, UTC, HDOP, satellites, and the sky plot. Tap **Stop location** when finished.
- **Debug:** inspect complete AT command/response transactions. Search commands or response text without case sensitivity; each page contains ten records.
- **Modem → Clear activity:** clear the activity display. The AT history page also offers clearing for the current session.
- Missing or unsupported hardware values remain unknown. Connection failures never silently switch to demo mode.

## Data and access

While connected and idle, the app monitors the modem every five seconds.
The signal chart retains the latest 60 RSRP samples.
AT history stays in the running process and is limited to 200 transactions or 128 KiB of text.
It is not a persistent diagnostic archive after the app closes.
Modem/SIM identifiers and locations can appear in logs; redact them when sharing if needed.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Modem cannot be opened | Port path, permissions, power, UART configuration, and competing serial programs. |
| SIM is ready but registration fails | Carrier support, antenna, SIM service, and the registration response. |
| No IP after setting APN | Disconnect data, reapply the carrier APN, reconnect, and read Debug errors. |
| GNSS has no fix | Firmware, GNSS antenna, and sky visibility; demo coordinates are not measurements. |
| A desktop shows signal without a modem | Check the `DEMO` badge and restart with real mode explicitly selected. |

Based on the local Cellular README, page controls, and AT log implementation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
