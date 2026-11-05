# Device screenshot sources

Captured on November 4, 2026 (Asia/Shanghai) from a running T-Display-CM0
over SSH. These are actual application frames, captured with
`scripts/capture-drm.py` from the active DRM buffer on `/dev/dri/card0`.
The capture reads the buffer without acquiring DRM master or restarting the
application. The device was returned to Launcher after capture.

The raw buffer was 568 × 1232, linear XRGB8888 (`XR24`), with a 2272-byte
pitch. The applications were in landscape mode. Each image was rotated
90 degrees clockwise and saved losslessly as a 1232 × 568 RGB PNG.
The device's displayed clock and battery readings were left unchanged.

| File | Installed package | Version | View | Additional editing |
| --- | --- | --- | --- | --- |
| `launcher-home.png` | `lilygo-ui-launcher` | `0.1.2-rc2` | First application page | None |
| `launcher-quick-controls.png` | `lilygo-ui-launcher` | `0.1.2-rc2` | Quick controls | Opaque rectangle over the account name in the Sign out button |
| `calculator-landscape.png` | `lilygo-ui-calculator` | `0.1.1` | Scientific keypad | None |
| `settings-general.png` | `lilygo-ui-settings` | `0.1.1` | General category, About and Sharing entries | None |

The same images are used in the English and Chinese guides. The UI reflects
these installed versions; a newer release can have different controls.
No credentials, account names, or network addresses are included in this record.

For repeat captures and supported buffer formats, see `scripts/README.md`.
