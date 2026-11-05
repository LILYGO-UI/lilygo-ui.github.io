---
title: Meshtastic user guide
description: Connect to meshtasticd, exchange mesh messages, inspect nodes and maps, and manage channels and device settings.
---

# Meshtastic user guide

Meshtastic is a mesh-radio client using the TCP Client API exposed by `meshtasticd`.
Its navigation contains **Messages**, **Nodes**, **Map**, and **Status**.

## Before you start

- Run `meshtasticd` with a connected Meshtastic radio and its TCP Client API enabled.
- The default endpoint is `127.0.0.1:4403`; remote hosts must allow the TCP port.
- New map tiles and address search need network access, curl, and CA certificates. Mesh messaging does not require map access.
- Review device settings before saving; destructive operations ask for confirmation.

## Connect the radio

At startup the app tries `127.0.0.1:4403`. If the local `meshtasticd.service` is inactive, it requests a service start and continues reconnecting.
Remote endpoints and custom ports do not start a local service. Select another endpoint from a terminal:

```sh
lilygo-ui-meshtastic --host 192.168.8.222 --port 4403
```

LPM can forward the same `--host` and `--port` options.
Open **Status** and check connection state, device name, firmware, online nodes, LoRa band, and session counters.
Unavailable services show a configuration-sync timeout and reconnect; fix the service or network first.

## Messages

1. Browse channel and private conversations in **Messages**.
2. Open a conversation; disconnected sessions show `Connect to receive mesh messages.`.
3. Enter text in `Message` and send. Drafts survive navigation and rotation.
4. Distinguish queued, sent-to-radio, routing ACK, rejected, timeout, and failure states.
5. Use **Retry message** for an explicit retry; failed messages are not resent automatically.
6. Search conversations or load older pages. Tap **Channels** to edit channel entries.

## Nodes, telemetry, and maps

- **Nodes:** inspect nodes, positions, telemetry, activity, and route information.
- In node details, **Request telemetry** asks for current telemetry and **Trace route** asks for a route reply.
- **Message** starts a private conversation; **Share waypoint** creates or shares an editable waypoint.
- **Show on Map** selects the node; **Follow node** tracks it until a manual map drag pauses following.
- **Map** supports pan, zoom, Fit, address search, node details, and **Clear cache**.

The map prefers the connected radio's position and can use known nodes when local position is absent.
Clearing the map cache removes basemap tiles only; it does not delete conversations, settings, node history, or traces.

## Channels and device settings

- **Channels:** edit channel slots, keys, and uplink/downlink flags; preview and import/export standard ChannelSet URLs.
- **Status → Settings:** edit device and module configuration. Save operations read values back for verification.
- **Save radio and device configuration** saves the complete configuration; **Save selected category** saves one category.
- Restart, shutdown, and **Reset node database** are destructive device actions; review the confirmation target.
- Fields not exposed by the UI are preserved instead of being cleared during a save.

## Local data, privacy, and offline use

SQLite stores messages, channels, nodes, configuration, positions, telemetry, waypoints, and traces, isolated by TCP endpoint and radio identity.
The database defaults to an XDG data or home directory; `LILYGO_MESHTASTIC_DB_PATH` selects an exact path.
It contains chat and channel keys; exit the app before copying a backup and protect the file.
Set `LILYGO_MESHTASTIC_MAP_CACHE_DIR` for map tiles. `LILYGO_MESHTASTIC_MAP_DISABLE_NETWORK=1` disables online requests while retaining cached tiles.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Cannot connect | `meshtasticd`, host, TCP port, and radio; the default is 127.0.0.1:4403. |
| Messages time out | Status sync, radio presence, and link quality; Retry is explicit. |
| Blank map | Network, curl, and CA certificates; offline mode shows cached tiles only. |
| Chat disappeared after clearing cache | Normal cache clearing removes basemap tiles only. |
| Saved settings do not match | Wait for read-back, and check radio access and online state. |

Based on the local Meshtastic README, message/node/map/settings views, and storage guide.

[Back to user guides](../user-guide) · [Documentation center](../docs)
