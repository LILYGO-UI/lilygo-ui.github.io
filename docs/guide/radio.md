---
title: Radio user guide
description: Find internet stations, save favorites, play custom streams, and set a sleep timer.
---

# Radio user guide

Radio discovers internet stations through Radio Browser and plays custom HTTP/HTTPS audio streams.
Favorites and artwork can be stored locally, but station audio still requires a live network connection.

## Before you start

- Install Radio and ensure the device can reach the internet and broadcasters' audio servers.
- Linux/CM0 requires curl, FFmpeg, aplay from alsa-utils, and a working default ALSA output.
- The macOS simulator uses FFmpeg and ffplay; ffmpeg alone does not provide audio output.
- Configuration and cache folders must be writable to retain favorites and artwork.

## Choose a station

1. Open **Radio** from the launcher and select **Stations**.
2. Wait for popular stations, or enter a station name in **Search stations** and submit it.
3. Tap a station to start playback, then open **Playing** for the full player.
4. Use the play, pause, resume, and stop controls.
5. On Stations or other tabs, the mini player remains available for the selected station.

Directory requests use pages of 50 records; **Load more stations** appends later results.
Refreshing, searching, or browsing the directory does not interrupt current playback.
Before the first successful directory load, built-in SomaFM stations may appear; these also require internet access.

## Favorites

Use the player's favorite control to save or remove the selected station, then access saved stations through **Favorites**.
Up to 256 complete station records persist across restarts.
If the directory is unavailable, saved addresses remain usable as long as their audio hosts are reachable.
Artwork is usually the station logo, not the current song's album cover.

## Play a custom address

1. Open **Settings** and select **Add a stream**.
2. Enter a complete `http://` or `https://` audio-stream URL.
3. Tap **Play**; correct any validation error shown in the dialog.
4. Use **Cancel** to dismiss the dialog without submitting.

Use an address that returns audio FFmpeg can decode, rather than an ordinary web page.
The last validated address is saved and prefilled next time, but it does not start automatically.

## Sleep timer

Open the timer from **Playing** or **Settings → Sleep Timer** and choose 15, 30, 45, 60, or 90 minutes.
Playback stops when the countdown finishes. Selecting a new duration restarts the countdown from that moment.
Pausing, resuming, or switching stations keeps the existing deadline; canceling the timer leaves audio playing.
Manually stopping playback cancels the timer. The timer does not persist after the app closes.

## Local data and network requests

| Data | Default location |
| --- | --- |
| Custom URL | `$HOME/.config/lilygo/ui/radio.conf` |
| Favorites | The same configuration path with `.favorites` appended |
| Artwork cache | `$HOME/.cache/lilygo/ui/radio-artwork` |
| Playback diagnostics | `/tmp/lilygo-ui-radio.log` |

Configured XDG configuration/cache directories replace the corresponding home-based roots.
Administrators can set `LILYGO_UI_RADIO_CONFIG` for the configuration file and `LILYGO_UI_RADIO_ARTWORK_CACHE` for artwork.
An empty artwork-cache variable disables disk caching. There is no cache-clearing button.
Search terms go to Radio Browser; audio and artwork requests go to servers supplied by each station.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Directory does not load | Check internet, curl, and certificates; try saved favorites or a custom audio URL. |
| Playing is shown but there is no sound | This status reflects a running process; check system volume, default output, and the playback log. |
| A custom stream fails | Check that it returns audio, its host is reachable, and FFmpeg supports its format. |
| Favorites cannot be saved | Read the storage error and check configuration permissions and free space. |
| Artwork is missing | Failed or absent artwork uses a default icon without blocking audio; check FFmpeg and the artwork host. |

The app does not cache programmes for offline listening or provide an offline radio mode.

[Back to user guides](../user-guide) · [Documentation center](../docs)
