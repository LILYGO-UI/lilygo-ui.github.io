---
title: Maps user guide
description: Browse and search maps, use GNSS or approximate IP location, and manage cached map tiles.
---

# Maps user guide

Maps displays OpenStreetMap with panning, zooming, address search, and current-location controls.
It prefers nRF9151 GNSS coordinates and falls back to approximate public-IP location when no fresh fix is available.

## Before you start

- Install Maps with curl, CA certificates, and its runtime libraries.
- New map tiles, address search, and IP location require internet access.
- GNSS requires an nRF9151 with compatible Nordic SLM firmware, an accessible serial port, and an antenna with a clear view of the sky.
- Indoor reception or an obstructed antenna may prevent a fix; satellite information alone does not establish a location.
- The launching user needs cache-directory write access and permission to open the modem serial port.

## Browse and search

1. Open **Maps** from the launcher, wait for the map, and check the location source in the status text.
2. Drag to browse and use **+ / −** to change zoom.
3. Tap **Search address**, enter a Chinese or English address, and submit the search.
4. A successful search centers on the first result; no results or a request error leave the map center unchanged.
5. Tap the location icon to return to a fresh GNSS fix or the most recent successful IP location from this session.

A physical keyboard supports text entry, arrow keys, Backspace, Enter to search, and Esc to leave editing.
Panning, zooming, or searching suspends automatic recentering; press the location button to resume it.
This application provides map browsing and place search, without a route planner or turn-by-turn navigation interface.

## Understand your location

- Fresh GNSS takes priority; expired fixes or an unavailable port cause a return to IP location.
- IP location is approximate. VPNs, proxies, and shared internet exits can place it far from the device.
- GNSS works offline, but displaying new map areas still needs cached tiles or internet access.
- The location button uses zoom level 16 for GNSS and level 11 for IP location.
- Without either source, Maps retains the current map or initial world view.

Maps and Cellular cannot directly own the same modem UART simultaneously.
If Cellular or another serial tool holds the port, Maps uses IP and retries the port in the background.

## Cache and offline use

Downloaded tiles are reused from disk. Offline coverage is limited to areas and zoom levels already viewed.
The app does not download whole regions in advance or provide offline address search.

Tap the trash icon to open **Clear map data?**, then choose **Clear** to remove downloaded tiles or **Cancel** to keep them.
Clearing also removes those areas' offline availability. Tiles can be downloaded again while online.

| Launch environment | Default cache folder |
| --- | --- |
| root user | `/root/maps/openstreetmap` |
| Other user with `XDG_CACHE_HOME` | `$XDG_CACHE_HOME/lilygo-ui-maps/maps/openstreetmap` |
| Other user without that setting | `$HOME/.cache/lilygo-ui-maps/maps/openstreetmap` |

An administrator can set `LILYGO_MAPS_CACHE_DIR` to a dedicated cache folder; its final component must be `openstreetmap` for in-app clearing.
`LILYGO_MAPS_DISABLE_NETWORK=1` disables network requests while retaining GNSS and cached tiles.
The default GNSS port is `/dev/ttyACM0`; override it with `LILYGO_MAPS_GNSS_PORT`, or use `LILYGO_MAPS_DISABLE_GNSS=1` for IP only.
These variables must be passed before launch; they are not on-screen settings.

## Data and troubleshooting

GNSS fixes are processed locally. IP lookup contacts location providers, search sends your query to Nominatim, and tile requests identify the map areas viewed.
The final IP fallback uses HTTP; other normal map and search requests use HTTPS.

| Symptom | What to check |
| --- | --- |
| Blank map or missing tiles | Check internet, curl, and certificates; offline, that area and zoom level must already be cached. |
| Location is far away | Check whether IP location is active, review VPN use, and wait for an outdoor GNSS fix. |
| GNSS never becomes available | Check antenna, firmware, serial permissions, and whether Cellular or another tool owns the port. |
| Address search fails | Check connectivity and query text, and remove an unintended network-disable setting. |
| Cache cannot be cleared | Check permissions and that the cache folder ends in `openstreetmap`. |

[Back to user guides](../user-guide) · [Documentation center](../docs)
