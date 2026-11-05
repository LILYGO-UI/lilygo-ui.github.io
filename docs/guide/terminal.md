---
title: Terminal User Guide
description: Use the local shell, touch keyboard, sessions, and terminal preferences.
---

# Terminal User Guide

Terminal opens a local `/bin/sh` session on a PTY. It is a local shell, not an SSH
client or a sandbox.

## Use a session

Open **Terminal** from Launcher and wait for the prompt. Type with the software or
hardware keyboard, then press **Enter**. **Clear** resets the displayed screen without
stopping the shell. **Restart** stops the process and creates a fresh session. Press
the header **Exit** button to leave. Directory changes and variables survive only
within the current session.

| Control | Behavior |
| --- | --- |
| Touch keyboard | Lowercase, uppercase, numbers, and symbols. |
| **Special keys** | Larger terminal-control key window. |
| **Ctrl** | One-shot control modifier. |
| **Esc**, **Tab**, **Enter** | Send terminal input. |
| Arrows | ANSI cursor-key sequences. |
| **BS** | Delete byte. |
| **Clear** | Local screen buffer only. |
| **Restart** | Recreate the shell. |
| **A-** / **A+** | Save 14, 18, or 22 px text. |

`Ctrl+C` normally interrupts the foreground program; `Ctrl+D` may end an empty
shell input; `Ctrl+L` clears the local screen. A hardware keyboard hides the software keyboard.

## Environment and permissions

The child inherits the UI environment and sets `TERM=ansi`. Initial home is selected
from `LILYGO_UI_TERMINAL_HOME`, `HOME`, the account home, then `/`. A non-empty
`LILYGO_UI_TERMINAL_PS1` overrides the prompt. Commands can access resources allowed
to the launching account. If the Terminal process runs as root, its shell also has
root privileges. Launcher normally starts applications as the signed-in Linux user.

## Preferences and limits

Font settings use `font_level=0/1/2` for 14/18/22 px. `LILYGO_UI_TERMINAL_CONFIG`
selects the settings file; `LILYGO_UI_TERMINAL_SHELL` replaces `/bin/sh`, and
`LILYGO_UI_TERMINAL_HOME` changes the initial directory.

There is no scrollback. ANSI colors and per-character attributes are not rendered;
xterm extensions and some full-screen programs may display incorrectly.

| Symptom | Check |
| --- | --- |
| **Shell exited** | Press **Restart** and check the shell path. |
| PTY failed | Check `/dev/ptmx`, devpts, and permissions. |
| Font not saved | Check the settings path and directory permissions. |
| Garbled full-screen app | Confirm compatibility with `TERM=ansi`. |

[All user guides](../user-guide) · [Documentation center](../docs)
