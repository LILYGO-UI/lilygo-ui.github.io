---
title: XiaoZhi Voice Assistant User Guide
description: Pair XiaoZhi, use push-to-talk, continuous chat, history, reconnect, and audio controls.
---

# XiaoZhi Voice Assistant User Guide

XiaoZhi connects to compatible services over WebSocket and provides pairing, captions,
history, push-to-talk, optional continuous conversation, and playback.

## Pairing

Connect the device to the internet and open **XiaoZhi**. In the xiaozhi.me console choose
**Add device**, enter the six-digit code shown by the app, and wait for activation. The app
saves the returned WebSocket address and token; future launches reuse them. **Refresh code**
obtains another code while pairing.

## Conversation controls

| Control | Action |
| --- | --- |
| **Hold to talk** | Hold until **Release to send**, then release. |
| **Continuous chat** | Local VAD sends after pauses and listens after playback. |
| **Stop** | Interrupt reply or recording. |
| **History** | Read the session transcript. |
| **New chat** | Clear visible history and create a new protocol session. |
| **Reconnect** | Retry the helper and WebSocket session. |

Releasing before recording starts cancels the pending recording. Recording or connection
errors disable continuous conversation; enable it again after recovery. Keyboard users can
use `Tab`, arrows, `Enter`, `M`, and `Esc`.

## Audio, identity, and limits

Retries wait from 2 to 20 seconds. Real sessions need DNS, valid TLS certificates, and the
service. Audio is 16 kHz mono Opus and half-duplex: recording resumes after playback drains.
Wake-word support requires a compatible helper and model; the CM0 package has no K230 wake-word
stack or full-duplex echo cancellation.

Identity and connection data are in simulator `.xiaozhi/`; on a device under
`$XDG_DATA_HOME/lilygo-ui-xiaozhi/`, `$HOME/.local/share/lilygo-ui-xiaozhi/`, or
`/tmp/lilygo-ui-xiaozhi/`. `device.conf` stores IDs and `connection.conf` stores URL/token;
directories are 0700 and files 0600. Do not copy a paired directory to another device.
Conversation history is memory-only, up to 80 messages, and clears on **New chat** or exit.

| Symptom | Check |
| --- | --- |
| No pairing code | DNS, internet, system time, CA certificates, **Reconnect**, or **Refresh code**. |
| Pairing repeats | Same user, writable data directory, and unchanged identity. |
| Recording fails | Microphone permission, input device, volume, and competing apps. |
| No playback | Speaker, output device, and `XIAOZHI_PLAYBACK`. |
| Reconnect loop | Network and service status. |
| No wake-word control | Install a compatible KWS helper/model; push-to-talk still works. |



The service receives recorded audio and may retain transcripts according to its policy.
The helper uses the saved token without showing it in normal UI. Keep one data directory
per physical device because changing it changes the identity used for the next session.

[All user guides](../user-guide) · [Documentation center](../docs)
