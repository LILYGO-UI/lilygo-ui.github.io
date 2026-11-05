---
title: IMU user guide
description: View QMI8658 motion, adjust sensitivity, and distinguish live, demo, and offline input.
---

# IMU user guide

IMU visualizes board attitude and transient acceleration from a six-axis sensor.
The installed executable is `lilygo-ui-imu`; the interface uses English labels.

## Before you start

- The T-DisplayCM0 QMI8658B must be exposed by a working Linux IIO driver.
- Automatic discovery accepts the names `qmi8658c`, `qmi8658b`, and `qmi8658`.
- The user needs read access to all six raw channels and their scale attributes under `/sys/bus/iio/devices`.
- Internet access is unnecessary. The app reads IIO rather than changing I2C registers directly.

## View motion

1. Open **IMU** in Launcher.
2. Check the footer: `Live` means real sensor input, `Demo` means simulation, and `Offline` means unavailable input.
3. Slowly tilt the board and watch the ball move within the circular area.
4. Hold the angle: the ball should settle at a stable position. It does not represent distance traveled.
5. Inspect all six values in `Acceleration` and `Angular rate`.
6. Adjust **Sensitivity** in the footer to change the movement response.

Compact windows shorten the readout titles to `Accel.` and `Gyro`.
Acceleration is in `m/s²` and includes gravity; angular rate is in `rad/s`.
Sudden acceleration briefly enlarges the ball before it returns to normal.
The white marker responds to sensor Z rotation; it is not an absolute compass heading.

## Sensitivity and mounting direction

**Sensitivity** ranges from 25% to 200%, with a default of 100%.
Drag the slider to change position response without changing telemetry units.
↑/→ increases sensitivity by 1%; ↓/← decreases it. Press Tab to restore slider focus.

If mounting orientation gives an unexpected movement direction, launch with:

```sh
LILYGO_IMU_ROTATION=90 lilygo-ui-imu
```

This angle is added to display rotation and affects the ball mapping only; telemetry retains the sensor coordinate system.
The page has no pause, reset, or calibration buttons.

## Select live or demo input

Linux defaults to IIO. Non-Linux hosts such as macOS default to simulation.
For multiple sensors, choose the exact IIO directory:

```sh
LILYGO_IMU_DEMO=0 \
LILYGO_IMU_DEVICE=/sys/bus/iio/devices/iio:device0 \
lilygo-ui-imu
```

Replace the path with the actual device. `LILYGO_IMU_DEMO=1` explicitly selects demo input and overrides a device path.
Missing hardware never silently changes to simulated values.

## Data and disconnection

The page displays live data and has no recording or export control.
Sensitivity and internal calibration are not saved across application restarts.
On disconnected or stale input, the ball retains its last position and size and values become unavailable.
The footer displays `QMI8658: waiting for connection` while the app retries automatically.
Motion resumes when fresh samples return; no manual refresh is required.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Always Offline | Board overlay, IIO driver, device name, and readable six-axis attributes. |
| Ball is offset on a level board | Mounting orientation and sensor bias; this page has no calibration entry. |
| Demo works but live motion does not | Simulation verifies the interface only; check actual IIO readings. |
| Marker does not point north | It is a Z-axis rotation cue, not a magnetometer heading. |
| Sensitivity resets after exit | This setting is not persistent; adjust the slider again. |

Based on the local IMU README, sensor guide, and page implementation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
