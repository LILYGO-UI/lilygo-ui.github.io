---
title: Gallery user guide
description: Browse local photos and videos, inspect file details, zoom images, and manage camera captures.
---

# Gallery user guide

Gallery browses local photos, camera MP4 recordings, and screenshots without a network connection.
Use it to view [Camera](./camera) captures or files copied into the device's picture folders.

## Before you start

- Install Gallery with its image-decoding libraries; video playback also needs libmpv.
- The launching user needs read access to media. Deletion and video thumbnail creation also need directory write access.
- Put files directly in the folders below; scanning does not descend into subfolders.

| Source | Default folder |
| --- | --- |
| Camera | `$HOME/Camera`, or the folder selected by `CAMERA_OUTPUT_DIR` |
| Pictures | `$HOME/Pictures` |
| Screenshots | `$HOME/screenshots` |

Supported files are JPEG, PNG, P6 PPM, and camera H.264 MP4. GIF files are not listed.
Sources are merged by filesystem modification time, with **only the newest 24 items retained across the library**.
Album counts describe that retained set, not every file on disk.

## Open and browse

1. Open **Gallery** from the launcher and wait for the media grid.
2. Tap a thumbnail in **Library** to open a photo or video.
3. Use previous/next arrows, the thumbnail filmstrip, or horizontal swipes to move within the collection.
4. Swipe down or tap Back to return to the grid.
5. After adding files, tap the refresh icon at the top to scan again.

**Albums** includes `All Photos`, `Camera`, `Screenshots`, and `Samples`.
Opening an album keeps subsequent viewer navigation within that collection.

## Photos and videos

- The photo viewer fits the complete picture. Square grid thumbnails do not crop the original file.
- Tap **+ / −** to zoom photos in 25% steps, then drag to inspect different regions.
- While zoomed in, swipes pan the photo. Zoom out before using swipe navigation or dismissal.
- Videos start automatically. Use pause/resume, the draggable timeline, and 0–100% playback volume.
- Video fullscreen hides the Gallery header, detail actions, and filmstrip; system bars remain visible.
- Leaving the video viewer stops playback. Camera records silent video, so raising playback volume cannot add sound.

## Details and deletion

Swipe up or tap the details icon to see filename, format, dimensions, modification time, size, source, and path.
Videos also show duration, codecs, and container information. The details panel can scroll.

Tap the trash icon, then **Delete Item** in the confirmation sheet to permanently remove the original file; **Cancel** dismisses it.
Deletion does not use a trash folder. Gallery also attempts to remove the related camera or video thumbnail.
Read-only `Samples` cannot be deleted. Examples copied into Pictures by the package are ordinary deletable files.

## Custom folders

Administrators can set these variables before launching the app; there is no folder picker:

| Variable | Source replaced |
| --- | --- |
| `LILYGO_GALLERY_PHOTO_DIR` | Camera |
| `LILYGO_GALLERY_PICTURES_DIR` | Pictures |
| `LILYGO_GALLERY_SCREENSHOT_DIR` | Screenshots |
| `LILYGO_GALLERY_SAMPLE_DIR` | Read-only Samples |

Restart after changing environment settings. Video thumbnails may create `.thumb.rgb565` sidecars beside recordings.
Unfinished `.part.mp4` recordings stay hidden until Camera finishes saving them.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| A new photo is missing | Refresh and check the launching user, folder, file format, and 24-item limit. |
| Only sample images appear | An empty desktop library uses bundled samples; add real media and refresh. |
| A video shows only an icon or fails | Check that saving has finished, its codec is supported, and libmpv is available. |
| Deletion fails | Read the confirmation-sheet error and check directory permissions; Samples are read-only. |
| Dates differ from capture dates | Gallery uses filesystem modification times, not EXIF capture dates. |

[Back to user guides](../user-guide) · [Documentation center](../docs)
