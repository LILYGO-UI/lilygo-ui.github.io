---
title: PicoClaw User Guide
description: Configure models and channels, chat, control Gateway, and update the runtime.
---

# PicoClaw User Guide

PicoClaw is a chat client and local Gateway controller. CM0 packages include a native
runtime; the macOS simulator uses Docker by default.

## First chat

1. Open **PicoClaw** and select **Models**.
2. Choose **+** in a provider group and enter provider name, API base, key, and **Model**.
3. Use **Test** or **Fetch** when supported, then **Save**.
4. Return to Chat and select the saved configuration from **Model**.
5. Send a message after the model is verified.

Each model keeps its own key. Switching preserves the conversation and unsent draft.
**New chat** preserves previous conversations; **History** switches between them.
**Earlier messages** reveals older content above the latest 32 messages.

## Gateway, channels, and updates

In **Settings**, use **Start gateway**, **Stop gateway**, and refresh. **Settings → Logs**
shows activity. Gateway survives closing the UI. CM0 does not need Docker; the macOS
simulator requires the configured Docker runtime.

In **Channels**, choose an integration, enter its credentials, switch **Enabled**, and
press **Save**. Restart Gateway to apply normal channel changes. The list shows configuration
state, not verified connectivity.

For Weixin, choose **Bind Weixin**, scan and confirm with WeChat, then enable and **Save**.
The QR expires after five minutes; **New QR code** and **Cancel** are available. A running
Gateway restarts automatically after successful Weixin saving.

On CM0, open **Settings → Updates → Check for updates**, select a version, and choose
**Install selected**. Downloads are checksum-verified and installed in the user's versions
directory. A failed startup or health check restores the previous selection.

## Data and limits

Runtime/workspace uses `$XDG_DATA_HOME/lilygo/ui/picoclaw/`; configuration and secrets use
`$XDG_CONFIG_HOME/lilygo/ui/picoclaw/`; logs and PID use `$XDG_STATE_HOME/lilygo/ui/picoclaw/`.
When these XDG variables are unset and no PicoClaw path override is configured,
the defaults under the launching user's home are:

| Data | Default directory |
| --- | --- |
| Runtime and workspace | `$HOME/.local/share/lilygo/ui/picoclaw/` |
| Configuration and secrets | `$HOME/.config/lilygo/ui/picoclaw/` |
| Conversation archive, logs, and PID | `$HOME/.local/state/lilygo/ui/picoclaw/` |

Conversation archives are saved automatically; API keys use private files with mode 0600.
The board has no Web management service controls. Remote Gateways cannot be switched
through local model controls.

| Symptom | Check |
| --- | --- |
| Send disabled | Reselect a verified model after editing it. |
| Gateway fails | Runtime, `config.json`, `.security.yml`, and Logs. |
| Channel changes inactive | Save, stop, and restart Gateway. |
| QR expired | Request **New QR code**. |
| Update fails | GitHub access, checksums, disk, and platform archive. |

[All user guides](../user-guide) · [Documentation center](../docs)
