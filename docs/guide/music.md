---
title: Music user guide
description: Add local music, find songs, control playback, and save favorites.
---

# Music user guide

Music plays local audio without an internet connection.
It scans audio files on the device and uses the system mpv executable for playback.

## Before you start

- Install Music and mpv, and confirm the default audio output works.
- Copy tracks into the launching user's `$HOME/Music`; files and folders must be readable.
- Other default locations include `/root/music`, `/mnt/sdcard/music`, `/mnt/music`, and `/media/music`.
- Recognized extensions are MP3, WAV, FLAC, M4A, AAC, OGG, Opus, AIFF/AIF, AC3, MP4, TS, and WMA; decoding depends on the installed mpv.

Scanning includes subfolders, to a maximum depth of 8 and a total of 2,048 tracks.
When no default location contains music, built-in sample tracks are used.

## Play your first track

1. Open **Music** from the launcher and wait for the library scan.
2. Open **Library** in portrait layout; wide layouts show the library and player together.
3. Tap a track to play it. In portrait layout, use **Now Playing** to view the player.
4. Use play/pause and previous/next to control playback.
5. Drag the timeline to seek, and use the volume slider to adjust loudness.

After copying new songs, tap the refresh icon beside the Library heading.
The list does not automatically update when files are copied.

## Search and favorites

Type into **Search songs or artists** to filter by title, artist, or album.
**All Songs** shows the complete library; **Favorites** shows saved favorites.
Tap the heart in the player to add or remove the current track from favorites.
Searching or filtering favorites does not replace the full playback queue with the visible results.

Track information mainly comes from filenames and folders, rather than an online music catalog.
A filename in the form `Artist - Title` can supply artist and title; the parent folder supplies the album.
WAV durations can be read during scanning; other formats generally obtain duration after playback begins.

## Shuffle and repeat

- Tap the shuffle icon to toggle random playback.
- Tap repeat to cycle through off, repeat-all, and repeat-one.
- These modes apply to the playback queue; filtering Library preserves that queue.
- Volume, shuffle, repeat, and favorites are saved between launches.

The app does not provide streaming-service login, song downloads, or audio editing.

## Files and preferences

An administrator can set `LILYGO_MUSIC_DIR` before launch to scan one explicit folder:

```sh
LILYGO_MUSIC_DIR="$HOME/Music" lilygo-ui-music
```

This is a launch environment setting; the app has no folder-selection menu.
An explicitly selected folder that is empty or missing leaves the library empty, without sample fallback.
For launcher use, pass the variable to the process launched by the launcher; setting it in an unrelated terminal has no effect.

Preferences are saved to `$XDG_CONFIG_HOME/lilygo-ui-music/preferences`,
or `$HOME/.config/lilygo-ui-music/preferences` when `XDG_CONFIG_HOME` is unset.
This configuration directory must be writable to retain favorites and playback preferences.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `No songs yet` or an empty library | Check the launching user, scan folder, file extensions, and read permissions, then refresh. |
| Only demo tracks appear | No music was found in the default folders; add tracks to Music and refresh. |
| `Playback unavailable` | Read the displayed error, check mpv availability, and verify the media file. |
| Progress advances without sound | Check application volume, system volume, and the default audio output. |
| Incorrect titles or albums | Check filenames and parent folder names; online metadata lookup is not provided. |
| Favorites disappear after restart | Check configuration permissions and that the same system user launches the app. |

[Back to user guides](../user-guide) · [Documentation center](../docs)
