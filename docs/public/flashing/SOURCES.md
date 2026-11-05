# Flashing screenshot sources

All screenshots were supplied by the user on November 5, 2026. Original filenames are listed below.

The six `imager-*.png` screenshots show Raspberry Pi Imager v2.0.10 on macOS, using the Chinese interface. These steps are shared by both USB and TF-card flashing.

`usb-rpiboot.png` shows the required USB-only preparation step: `sudo ./rpiboot -d mass-storage-gadget`. This step does not apply to a TF card connected through a card reader.

| Asset | Original filename | Original and output dimensions |
| --- | --- | --- |
| `usb-rpiboot.png` | `Snipaste_2026-11-05_14-21-42.png` | 1170 × 742 |
| `imager-device.png` | `Snipaste_2026-11-05_14-22-23.png` | 1360 × 956 |
| `imager-image.png` | `Snipaste_2026-11-05_14-22-38.png` | 1360 × 956 |
| `imager-storage.png` | `Snipaste_2026-11-05_14-22-53.png` | 1360 × 956 |
| `imager-review.png` | `Snipaste_2026-11-05_14-23-03.png` | 1360 × 956 |
| `imager-verify.png` | `Snipaste_2026-11-05_14-29-19.png` | 1360 × 956 |
| `imager-complete.png` | `Snipaste_2026-11-05_14-29-53.png` | 1360 × 956 |

## Image processing

- All images retain their original pixel dimensions. No image was resized or cropped.
- The six Raspberry Pi Imager screenshots are byte-for-byte copies of their source files.
- In `usb-rpiboot.png`, an opaque white rectangle over coordinates `(0, 86)` through `(716, 117)` removes the first-line shell prompt containing the username and hostname. The command beginning with `sudo` remains visible. No other content was changed.
