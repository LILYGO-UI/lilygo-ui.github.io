---
title: NES user guide
description: Import local NES ROMs, play with touch or keyboard controls, save progress, and manage your library.
---

# NES user guide

NES runs user-provided `.nes` files using FCEUmm, with touch controls, player-one keyboard input, and local saves.
Games work offline. Commercial ROMs and game-download services are not included.

## Before you start

- Install NES and prepare uncompressed `.nes` files you are entitled to use.
- The launching user's `HOME` must be a nonempty absolute path with permission to create ROM and save directories.
- Device audio uses the ALSA default output and aplay from alsa-utils; the simulator uses SDL2 audio.
- Simultaneous touch controls require a readable multitouch input node; an ordinary mouse supplies only one contact.

## Import and launch a game

1. Open **NES** from the launcher. The app creates `$HOME/nes/rom` when needed.
2. Scroll to **Add ROM**, the final library item, to open the file browser.
3. Browse to and tap a `.nes` file. The app validates and copies it into the ROM folder, preserving the source.
4. Tap its game row to start, then use the D-pad, A, B, Select, and Start controls.
5. Tap **Stop** to end the game and return to the library; this does not pause the game.

You can also copy ROMs directly into `$HOME/nes/rom`, then tap **Refresh**.
Scanning is nonrecursive and limited to 128 entries. Import never overwrites an existing filename.
Older folders such as `$HOME/nes` are not migrated automatically; import or move those files yourself.
Renaming a ZIP archive to `.nes` does not turn it into a ROM.

## Keyboard controls

| Action | Default keys |
| --- | --- |
| Up / Down / Left / Right | W / S / A / D |
| A / B | K / J |
| Rapid-fire A / Rapid-fire B | I / U |
| Start / Select | 1 / 2 |

Open **Settings** in the library toolbar, tap an action, and press its replacement key.
Keys already assigned to another action are rejected. Changes are saved immediately.
Player two, physical gamepads, in-game pause, reset, and rewind are not supported.

## Save and restore progress

Tap **Save** during gameplay to capture the current moment, or **Load** to restore that game's last manual state.
Each ROM has one manual state; saving again replaces it. Starting a game does not automatically load it.
Check the game-page status strip for success or an error, and resolve file or permission problems as shown.

| Data | Default path for `game.nes` |
| --- | --- |
| ROM | `$HOME/nes/rom/game.nes` |
| Manual state | `$HOME/nes/states/game.nes.state` |
| Battery save | `$HOME/nes/states/game.nes.sav` |

Games that use battery-backed memory write it on a normal Stop; forced termination or power loss can lose recent progress.
Stop the game before backing up or replacing saves. Add ROM imports only the ROM, not its save files.
Manual states depend on this core integration and are not guaranteed compatible with other emulators or future versions.

## Delete games and locate data

Swipe a game row left to reveal **Delete**. Tapping it **permanently deletes the ROM immediately, without confirmation or trash**.
Swipe right to close the action. Deleting a ROM keeps its `.state` and `.sav` files.

**Help** in the bottom toolbar shows expanded ROM/save paths and instructions; **Back** returns to the library.
Key mappings use `$XDG_CONFIG_HOME/lilygo-ui-nes/keymap.conf`, falling back to `$HOME/.config/lilygo-ui-nes/keymap.conf`.
Each system user has separate ROMs, saves, and settings; root, for example, uses `/root/nes/rom`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The list contains only Add ROM | Check actual HOME, ROM folder, extensions, read permissions, and the 128-entry limit, then refresh. |
| Import fails | Check uncompressed format, valid iNES header, duplicate filename, and destination permissions. |
| Direction and A/B cannot be held together | Check multitouch device access; an administrator can adjust `NES_TOUCH_DEVICE` and AppKit's `--input`. |
| A game fails or shows a black screen | A valid header does not ensure compatibility; check ROM integrity and FCEUmm support. |
| No sound | Check system mixer, default ALSA output, and aplay; there is no in-app volume or audio-device selector. |
| Load fails | Check that the save exists, matches the ROM, and is undamaged; another core's state may be incompatible. |

[Back to user guides](../user-guide) · [Documentation center](../docs)
