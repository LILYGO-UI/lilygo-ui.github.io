---
title: Files User Guide
description: Browse, search, preview, copy, move, organize, and compress files within a configured folder.
---

# Files User Guide

Files manages files and folders within one configured root. On the device,
the default root is the current user's home directory. Navigation stays inside it.

## Before you start

- Open **Files** from Launcher.
- Place files inside its root, normally your device account's home directory.
- The current user needs appropriate access to the source files and destination.
- The simulator instead defaults to the repository's `simulated-home/` folder.

## Browse, search, and preview

1. Tap a folder to enter it; use the navigation-bar back button for its parent.
2. Tap a supported text file to open a read-only preview.
3. Tap **Search** and type a name to filter the current folder.
4. Open the top-right More menu and choose **Icons** or **List**.
5. Use the same menu to sort by **Name**, **Kind**, **Date**, or **Size**.

Search does not scan subfolders. Text previews show up to approximately
8 KiB and cannot edit files. Unsupported types display a preview-unavailable
message while remaining in the folder.

## Copy, move, and organize

| Task | Steps |
| --- | --- |
| Create a folder | Choose **New Folder** from More and enter its name. |
| Copy | Long-press an item, choose **Copy**, open the destination, then choose **Paste** from More. |
| Move | Long-press, choose **Move**, select a destination folder, and complete the move. |
| Rename | Long-press, choose **Rename**, and enter the new name. |
| Inspect | Long-press and choose **Get Info**. |
| Make a copy | Long-press and choose **Duplicate**. |
| Create a ZIP | Long-press and choose **Compress**. |
| Delete | Long-press, choose **Delete**, and confirm permanent removal. |

Rename and Move do not overwrite an existing item with the same name.
Deletion has no trash or undo; check the selected items before confirming.

## Work with multiple items

1. Choose **Select** from More.
2. Tap items to select or clear them; **Select All** selects all visible items.
3. Use the bottom toolbar to duplicate, move, or delete. Its menu also copies items, puts them in a new folder, or compresses them into one ZIP.
4. Tap **Done** to finish selection.

Long-pressing search results or items in selection mode does not open the
ordinary single-item menu. Sharing, tags, and favorites are not provided.

## Keyboard and in-app help

- `Tab` moves between controls; arrow keys move within the file collection.
- Up/down move by a visual row in icon view and by an item in list view.
- Tap `Enter` to open an item; hold `Enter` to open its operations menu.
- `Esc` closes an open menu. Search accepts keyboard text and Backspace.
- Open **Help** from More for the in-app reference. Closing it preserves your folder, search, and scroll position.

## Change the root folder

An administrator can launch with an absolute path: `lilygo-ui-files --root=/path/to/folder`.
Alternatively set `LILYGO_UI_FILES_ROOT`, or put `files.root=/absolute/path`
in `$HOME/.config/lilygo/ui/files.conf`.
When `XDG_CONFIG_HOME` is set, the user configuration is its `lilygo/ui/files.conf`.
System defaults live in `/etc/lilygo/ui/files.conf`.

Precedence is command line, environment, user configuration, system
configuration, then the default root. Changing the root grants no additional
filesystem permissions.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| A received file is missing | Check the signed-in user's Downloads folder and whether the configured root includes it. |
| Search finds nothing | Enter the containing folder; search is not recursive. |
| Copy or Move fails | Check permissions, free space, and conflicting destination names. |
| Preview is unavailable | Use a supported text file; binary files and symbolic links have restrictions. |
| No restore action after deletion | The current application permanently deletes files and has no trash. |

[All user guides](../user-guide) · [Documentation center](../docs)
