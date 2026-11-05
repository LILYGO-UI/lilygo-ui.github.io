---
title: Template counter demo user guide
description: Use the template counter to check button actions, value updates, and adaptive layout.
---

# Template counter demo user guide

Template is the counter demonstration included with the application starter project.
It demonstrates a minimal interactive app rather than managing device hardware.
The unchanged example executable is `lilygo-ui-template`.

## Before you start

- Install the Template example and its shared font dependency.
- Use a display environment with touch or pointer input.
- No sensors, serial devices, account, or network connection are required.

Applications derived from the template may have a different name and entirely different controls.
This guide covers the unchanged Template counter only.

## Open and use the counter

1. Open **Template** in Launcher when the example is installed.
2. Find the central **Counter** card.
3. The initial value is `0`; tap **+** to change it to `1`.
4. Each subsequent **+** tap adds `1`.
5. Tap **-** to subtract `1`.
6. Tap **Reset** to return immediately to `0`.

| Control | Effect |
| --- | --- |
| `+` | Adds one, up to 999. |
| `-` | Subtracts one, down to 0. |
| `Reset` | Sets the value to zero. |

Values do not wrap at the boundaries: 0 cannot become negative and 999 cannot increase further.
Reset has no confirmation step and affects only the current demonstration value.

## Try different screen sizes

Resize the desktop window or change orientation on a supported device.
The card and control spacing adapt to the available width.
There is no portrait, landscape, or compact-mode selector.
A layout change alone does not reset the running counter.

## A short interaction check

1. Launch the example and confirm `0`.
2. Tap **+** three times and confirm `3`.
3. Tap **-** once and confirm `2`.
4. Resize the window and confirm the value remains `2` and the controls are usable.
5. Tap **Reset** and confirm `0`.
6. Tap **-** again and confirm it remains `0`.

This checks counter behavior and interface response, not physical device functionality.

## Data and exit

The counter is stored only in this application instance's memory.
There is no save or export function, and restarting begins again at `0`.
The example has no login, settings page, history, or background timer.
Close the desktop window or use the system's application exit control to finish.

## Troubleshooting

| Symptom | Explanation |
| --- | --- |
| Template is absent from Launcher | It is a development example and may not be included in a production image. |
| The name or interface differs | A developer may have replaced the template; these steps no longer describe that app. |
| The value stops at 999 | This is the example's defined upper limit. |
| The count disappears after reopening | The current example does not persist the count. |

Based on the local Template Counter view, Model, and ViewModel implementation.
For creating an application from this starter project, use the development documentation.

[Back to user guides](../user-guide) · [Documentation center](../docs)
