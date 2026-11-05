---
title: YouTube user guide
description: Search public videos, browse recommendations, choose a quality ceiling, and control local playback.
---

# YouTube user guide

YouTube resolves public videos through YouTube endpoints and CDNs without Node, yt-dlp, or a companion computer. It supports only direct public H.264/AAC streams.

## Before you start

- Provide internet access, CA certificates, curl, FFmpeg, libmpv, and the AppKit runtime.
- Playback needs YouTube, `i.ytimg.com`, and `*.googlevideo.com` access.
- Login, age-restricted or paid content, DRM, live manifests, and dynamic signature challenges are unsupported.
- Playback uses the default ALSA output and may show video without sound when no audio device exists.

## Search and recommendations

1. Open **YouTube**; the home page shows public topic recommendations.
2. Tap search, enter a term in **Search YouTube**, and submit.
3. Up to 12 recent terms are kept for this run; tap a history row to search again.
4. Tap a result to play, and use **Load more** for more recommendations.
5. Closing the player returns to the previous list.

Recommendations rotate public topics rather than using account history or subscriptions. Thumbnails load in the background.

## Player and quality

Use play/pause, retry, the timeline, ten-second skips, volume, and expanded playback. Status text can show `Opening video...`, `Buffering...`, `Finished`, or an error.
Choose `1080p`, `720p`, `480p`, `360p`, or `240p` in the player header. The default ceiling is 720p; the available stream may be lower.

## Network and data

Search, recommendations, thumbnails, and stream resolution use the network; videos are not downloaded for offline use. libmpv's runtime buffer is not a Gallery file. Search terms go to YouTube, thumbnails use `i.ytimg.com`, and streams normally come from `googlevideo.com`.

Set `LILYGO_YOUTUBE_DEBUG=1` for diagnostics, or `LILYGO_YOUTUBE_TEST_MEDIA=/path/to/video.mp4` for an offline local-media check. These are launch variables, not in-app settings.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Search or recommendations fail | Check network, DNS, certificates, and YouTube/CDN access. |
| Unsupported playback | Try a public, non-live, non-age-restricted, non-DRM H.264/AAC video. |
| Stuttering | Lower the quality ceiling, allow buffering, and check bandwidth/decoder capacity. |
| Missing thumbnails | Thumbnail access can fail without blocking playback. |
| No sound | Check default ALSA output, system volume, and audio device. |

Accounts, subscriptions, comments, favorites, downloads, live streams, and DRM content are not implemented.

[Back to user guides](../user-guide) · [Documentation center](../docs)
