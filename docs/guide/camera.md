---
title: Camera user guide
description: Take photos, record silent video, choose capture profiles, and locate saved media on CM0.
---

# Camera user guide

Camera captures JPEG photos and H.264 MP4 video using the device camera.
This guide assumes the application is installed. The desktop simulator produces synthetic images and does not open your computer's camera.

## Before you start

- Use a T-DisplayCM0 image configured for its Sony IMX219 camera, with the camera cable connected correctly.
- The device needs matching libcamera and libcamera-ipa packages, FFmpeg, and the AppKit runtime.
- The launching user needs camera, display, and input-device access, plus write access to the capture directory.
- Close any other program using the camera and ensure enough storage is available.
- Local capture works without an internet connection.

## Take a photo

1. Open **Camera** from the launcher and wait for the viewfinder.
2. Select **Photo** mode.
3. Compose the image; optionally enable the grid or select **1× / 2×** digital crop.
4. Tap the central shutter button and wait for the save to finish.
5. Tap the recent thumbnail beside the shutter to inspect the latest capture preview and filename from this session.

The recent thumbnail is a low-resolution viewfinder image, not a full-resolution photo viewer.
Open [Gallery](./gallery) to view original photos or earlier captures.

## Record a video

1. Select **Video**.
2. Tap the shutter to start recording; a timer appears.
3. Tap the shutter again to stop, then wait for `Saving video…` to finish before leaving.
4. Open the saved MP4 in Gallery or another media player on the device.

Video recordings are **silent**. The recent-capture panel in Camera cannot play videos.

## Capture quality and framing

Tap the profile control at the top of the viewfinder to cycle through:

| Label | Landscape output size | Requested frame rate |
| --- | --- | --- |
| `720P · 30` | 1280 × 720 | 30 fps |
| `1080P · 30` | 1920 × 1080 | 30 fps |
| `720P · 60` | 1280 × 720 | 60 fps |

Portrait output swaps the width and height. Photos and videos share the selected profile.
Each launch starts at `720P · 30`. A failed change reports an error and attempts to restore the previous profile.
The 60 fps option is a request; actual performance depends on the sensor mode, system image, and encoder.
The 2× option crops both the preview and saved output digitally; it is not optical zoom.

## Saved files

Captures normally go to the launching user's `$HOME/Camera` and remain after the application closes.
An administrator can set `CAMERA_OUTPUT_DIR` before launch to use another writable directory.
This is a process environment setting; there is no capture-folder picker in the interface.

The recent-capture preview lasts for the current session only. Simulated filenames start with `SIM_IMG_` or `SIM_VID_`.
For a custom folder, launch Gallery with the same `CAMERA_OUTPUT_DIR` or set its `LILYGO_GALLERY_PHOTO_DIR`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `Camera unavailable` or no viewfinder | Check the cable, system camera configuration, device permissions, and other camera processes. |
| `Simulated preview` appears | A simulated backend is selected; on real hardware, ask the administrator to check `CAMERA_SIMULATE=0`. |
| Capture cannot be saved | Check directory permissions, free space, and FFmpeg availability. |
| 60 fps is slow or fails | Return to `720P · 30`; the requested rate is not supported by every camera pipeline. |
| Video has no audio | This version records silent video only. |
| Autofocus does not work | Autofocus requires the camera stack to expose `AfMode`; a lens motor alone is insufficient. |

Camera switching, flash, portrait effects, and audio recording are not currently provided.

[Back to user guides](../user-guide) · [Documentation center](../docs)
