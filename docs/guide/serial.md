---
title: Serial user guide
description: Discover ports, configure a connection, exchange ASCII/HEX data, and control RTS, DTR, and BREAK.
---

# Serial user guide

Serial works with serial devices attached to the computer running `lilygo-ui-serial`.
The desktop simulator also opens real host ports. Communication does not need internet access.

## Before you start

- Attach the device or USB adapter and ensure its driver creates a serial node.
- Match the target's voltage levels, common ground, and transmit/receive wiring.
- The running account needs read/write access; close other serial monitors.
- Obtain the required baud rate, data bits, parity, stop bits, and flow control from the device documentation.

## Connect

1. Open **Serial** in Launcher and tap **Settings** at the top.
2. Tap **Scan** and choose a device in **Connection**.
3. Set the serial parameters; defaults are **115200 / 8N1 / no flow control**.
4. Tap **Connect** and confirm **Connected**.
5. Tap **Back** to return to the receive/send console.
6. Before changing the port or settings, return to Settings and tap **Disconnect**.

Settings navigation preserves the connection, receive history, and unsent draft.
Hot-plug discovery and reconnection are manual: use Scan / Connect as needed.

## Receive data

- **ASCII / HEX:** change how retained bytes are displayed.
- **Time:** show local timestamps for receive chunks; enabled by default.
- **Auto:** scroll to new data; disable it to inspect earlier content.
- **Clear:** remove history and reset RX/TX counters while keeping the connection and queued output.

Receive shows incoming bytes only; sending does not add a local echo.
ASCII renders non-ASCII bytes as escapes instead of decoding UTF-8 text.
Records follow OS read chunks, which need not match protocol messages.

## Send data

1. Choose **ASCII** or **HEX** in the send pane, independently of the receive format.
2. Enter data such as ASCII `AT` or HEX `41 54`.
3. Choose `No ending`, `LF`, `CR`, or `CRLF` to match the protocol.
4. Tap **Send**, inspect feedback and TX count, then wait for the device's actual response.

ASCII `AT` with CRLF sends `41 54 0D 0A`.
HEX requires complete byte pairs: `0041ff` and `00 41 FF` work; `0x` prefixes and commas do not.
ASCII does not interpret the literal text `\r`; use an ending or HEX for control bytes.
Choose `No ending` if the HEX payload already contains its terminator.
A TX increase means the OS accepted bytes, not that the receiver acknowledged them.

Drag the divider to resize the receive and send panes; landscape uses side-by-side panes.
The input field opens a software keyboard. **Hide keyboard** restores space and retains the text.

## Line control

Open **Settings → Line control** for RTS, DTR, and BREAK.
An active connection and driver support are required. Manual RTS is disabled under RTS/CTS flow control.
BREAK remains asserted until switched off or disconnected; it is not a timed pulse.

## Data and permissions

Logs, settings, and input do not survive restarts. There is no log export or periodic send feature.
Raw history is limited to 256 KiB / 512 records; formatted display is capped at 32 KiB.
Disconnect drops unwritten queued output. Clear does not flush driver buffers.
Common Linux nodes include `/dev/ttyUSB*` and `/dev/ttyACM*`; macOS uses `/dev/cu.*`.
The picker intentionally hides `/dev/ttyS0` and `/dev/serial0` and has no custom-path field.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| No ports | Cable, driver, supported node naming, then Scan. |
| Permission denied | Node ownership and account access; apply system access policy and sign in again if needed. |
| Connected but unreadable data | Matching endpoint parameters, wiring, and ASCII/HEX display mode. |
| TX increases without RX | There is no local echo; verify that the other device should reply. |
| Line control fails | Adapter/driver support; working byte transfer does not guarantee modem-line support. |

Based on the local Serial usage guide and receive/send interface implementation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
